<?php

namespace App\Http\Controllers\Company\Datatable;

use App\Http\Controllers\Controller;
use App\Models\Company\Settings\Dropdown;
use App\Models\Company\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeamLeadController extends Controller
{
    public function index(Request $request)
    {

        if (auth()->user()->user_type == "Manager") $teamIds = User::whereIn('user_type', ['Team Leader', 'BDE'])->where('manager_id', auth()->user()->id)->pluck('id')->toArray();
        else if (auth()->user()->user_type == "Team Leader") $teamIds = User::where('user_type',  'BDE')->where('team_leader_id', auth()->user()->id)->pluck('id')->toArray();
        else abort('555');


        $pageSize = $request->get('pageSize', 10);
        $currentPage = $request->get('page', 1);
        $offset = ($currentPage - 1) * $pageSize;



        if ($request->filterOwner) $teamIds = [$request->filterOwner];


        $filterStatus = $request->get('filterStatus', 0);

        $filterState = $request->get('filterState', 0);

        $query = DB::table('leads')->join('users', 'users.id', 'leads.user_id')->whereIn('user_id', $teamIds);

        $query->select('leads.*', 'users.first_name as owner');



        if ($filterState) $query->where('leads.state', $filterState);

        if ($filterStatus) {
            if ($filterStatus == "today-free-trial") $query->whereDate('free_trial', now()->today());
            else if ($filterStatus == "today-follow-up") $query->whereDate('followup', now()->today());
            else  $query->where('leads.status', $filterStatus);
        }


        $totalItems = $query->count();

        // $query->offset($offset)->limit($pageSize);
        $query->latest('leads.id')->offset($offset)->limit($pageSize);




        $from = $offset + 1;
        $to = min($offset + $pageSize, $totalItems);



        $data = [
            'data' => $query->GET(),
            'currentPage' => $currentPage,
            'pageSize' => $pageSize,
            'totalItems' => $totalItems,
            'from' => $from,
            'to' => $to
        ];


        $response = [
            'status' => 'success',
            'data' => $data,
        ];

        if ($request->firstTime) {

            $response['allLeadStatus'] = $this->getLeadStatus();


            // $response['leadSources'] = $this->allLeadSources();

            $response['allLeadOwners'] = $this->getAllLeadOwners();


            $response['allLeadStates'] = $this->getAllLeadStates();
        }
        return response()->json($response);
    }



    protected function getLeadStatus()
    {

        $uniqueStatus =  Dropdown::where([['type', 'Lead Status'], ['status', true]])->pluck('value');
        return $uniqueStatus;
    }

    protected function getAllLeadOwners()
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
                'label' => 'All Leads',
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


    protected function getAllLeadStates()
    {
        $states = Dropdown::where([['type', 'state'], ['status', true]])->pluck('value');
        return $states;
    }
}
