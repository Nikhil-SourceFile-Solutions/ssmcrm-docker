<?php

namespace App\Http\Controllers\Company\Datatable;

use App\Http\Controllers\Controller;
use App\Models\Company\Sale;
use App\Models\Company\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeamSaleController extends Controller
{
    public function index(Request $request)
    {

        if (auth()->user()->user_type == "Manager") $teamIds = User::whereIn('user_type', ['Team Leader', 'BDE'])->where('manager_id', auth()->user()->id)->pluck('id')->toArray();
        else if (auth()->user()->user_type == "Team Leader") $teamIds = User::where('user_type',  'BDE')->where('team_leader_id', auth()->user()->id)->pluck('id')->toArray();
        else abort('555');

        $pageSize = $request->get('pageSize', 10);
        $currentPage = $request->get('page', 1);

        $offset = ($currentPage - 1) * $pageSize;



        $filterStatus = $request->get('filterStatus', 0);

        if ($request->filterOwner) $teamIds = [$request->filterOwner];

        $query = Sale::Join('users', 'sales.user_id', 'users.id')
            ->Join('leads', 'sales.lead_id', 'leads.id')
            ->join('banks', 'banks.id', 'sales.bank')
            ->whereIn('sales.user_id', $teamIds);

        $allSaleOwners = [];

        if ($request->firstTime) {
            $allSaleOwners = $this->getallSaleOwners($query);
        }



        if ($filterStatus != 0) $query->where('sales.status', $filterStatus);


        $totalItems = $query->count();

        $query->select(
            'sales.*',
            'banks.bank_name',
            'banks.upi',
            'banks.is_bank_upi',
            'leads.first_name',
            'leads.last_name',
            'leads.email',
            'leads.phone',
            'leads.second_phone',
            DB::raw("CONCAT(users.first_name, ' ', COALESCE(users.last_name, '')) AS owner"),
        )
            ->orderBy('sales.created_at', 'desc');

        $itemsForCurrentPage = $query->offset($offset)->limit($pageSize)->get();


        $from = $offset + 1;
        $to = min($offset + $pageSize, $totalItems);


        $data = [
            'data' => $itemsForCurrentPage,
            'currentPage' => $currentPage,
            'pageSize' => $pageSize,
            'totalItems' => $totalItems,
            'from' => $from,
            'to' => $to
        ];

        $response = [
            'status' => 'success',
            'data' => $data,
            // 'allLeadStatus' =>  $allLeadStatus,
        ];

        if ($request->firstTime) {
            $response['allSaleOwners'] = $allSaleOwners;
            // $response['createSaleData'] = $this->createSaleData();
            // $response['leadStatus']  = $this->allLeadStatus();
            // $response['leadSources'] = $this->allLeadSources();
            // $response['complateOwners'] = User::where('status', true)->whereIn('user_type', ['BDE', 'Manager', 'Team Leaer', 'Admin'])->select('id', 'first_name', 'last_name')->get();
        }
        return response()->json($response);
    }


    protected function getallSaleOwners($query)
    {

        if (auth()->user()->user_type == "Manager") {

            $users = DB::table('users')->whereIn('user_type', ['BDE', 'Team Leader'])
                ->where([['status', true], ['manager_id', auth()->user()->id]])
                ->select('users.id as value', DB::raw("CONCAT(users.first_name, IF(users.last_name IS NOT NULL, CONCAT(' ', users.last_name), '')) as label"))
                ->get();
        } else if (auth()->user()->user_type == "Team Leader") {

            $users = DB::table('users')->whereIn('user_type', ['BDE'])
                ->where([['status', true], ['team_leader_id', auth()->user()->id]])
                ->select('users.id as value', DB::raw("CONCAT(users.first_name, IF(users.last_name IS NOT NULL, CONCAT(' ', users.last_name), '')) as label"))
                ->get();
        }



        $allOption = collect([
            (object) [
                'value' => 0,
                'label' => 'All Sales',
            ]
        ]);

        $userId1Option = $users->firstWhere('value', 1);
        $remainingUsers = $users->filter(function ($user) {
            return $user->value != 1;
        });
        $result = $allOption;
        if ($userId1Option) {
            $result = $result->push($userId1Option);
        }
        return $result->merge($remainingUsers);
    }
}
