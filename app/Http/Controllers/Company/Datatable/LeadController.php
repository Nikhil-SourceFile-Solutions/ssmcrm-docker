<?php

namespace App\Http\Controllers\Company\Datatable;

use App\Http\Controllers\Controller;
use App\Models\Company\Settings\Dropdown;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class     LeadController extends Controller
{
    public function index(Request $request)
    {
        $Selectedbranch = getSelectedBranch($request);

        $pageSize = $request->get('pageSize', 10);
        $currentPage = $request->get('page', 1);
        $offset = ($currentPage - 1) * $pageSize;
        if (auth()->user()->id != 1) $filterOwner = auth()->user()->id;
        else $filterOwner = $request->get('filterOwner', 0);
        $filterStatus = $request->get('filterStatus', 0);
        $filterState = $request->get('filterState', 0);
        $search = $request->get('search', 0);
        $dateRange = $request->get('dateRange', 0);


        $query = DB::table('leads')->join('users', 'users.id', 'leads.user_id');

        if ($Selectedbranch) $query->where('leads.branch_id', $Selectedbranch);

        if ($search) $query->where('leads.phone', 'LIKE', '%' . $request->search . '%');
        if ($dateRange) {
            $daterange = json_decode($dateRange);
            $query->whereBetween('moved_at', [$daterange[0], $daterange[1]]);
        }
        $query->select('leads.*', 'users.first_name as owner');
        if ($filterOwner)  $query->where('user_id', $filterOwner);
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

            $response['allLeadStatus'] = Cache::rememberForever('active-lead-status', function () {
                return  $this->getLeadStatus();
            });


            $response['leadSources'] = Cache::rememberForever('active-lead-sources', function () {
                return  $this->allLeadSources();
            });

            $response['allLeadOwners'] = Cache::rememberForever('active-lead-owners', function () use ($Selectedbranch) {
                return  $this->getAllLeadOwners($Selectedbranch);
            });

            $response['allLeadStates'] = Cache::rememberForever('active-states', function () use ($Selectedbranch) {
                return  $this->getAllLeadStates();
            });

            $response['allLeadProducts'] = Cache::rememberForever('active-products', function () use ($Selectedbranch) {
                return  $this->getAllLeadProducts();
            });
        }
        return response()->json($response);
    }


    protected function allLeadSources()
    {
        return Dropdown::where([['type', 'Lead Source'], ['status', true]])->get();
    }


    protected function getAllLeadOwners($Selectedbranch)
    {


        $query = DB::table('users');

        if ($Selectedbranch) $query->where('branch_id', $Selectedbranch)->orWhere('id', 1);

        $users = $query->where('status', true)->whereIn('user_type', ['Admin', 'BDE', 'Manager','Analyst', 'Team Leader', 'Branch Admin'])
            ->select('users.id as value', DB::raw("CONCAT(users.first_name, IF(users.last_name IS NOT NULL, CONCAT(' ', users.last_name), '')) as label"))
            ->get();

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

    protected function getLeadStatus()
    {

        $uniqueStatus =  Dropdown::where([['type', 'Lead Status'], ['status', true]])->pluck('value');

        return $uniqueStatus;
    }

    protected function getAllLeadStates()
    {
        $states = Dropdown::where([['type', 'state'], ['status', true]])->pluck('value');
        return $states;
    }

    protected function getAllLeadProducts()
    {
        return Dropdown::where([['type', 'Lead Products'], ['status', true]])->select('id', 'type', 'value as value', 'value as label')->get();
    }



  
      public function freeTrialLeads(Request $request)
    {
        $pageSize = $request->get('pageSize', 10);
        $currentPage = $request->get('page', 1);
        $offset = ($currentPage - 1) * $pageSize;

        $filterByProducts = $request->get('filterByProducts', 0);

        if ($filterByProducts) $filterByProducts = json_decode($filterByProducts);
        $filterState = $request->get('filterState', 0);

        $search = $request->get('search', 0);


        // $query = DB::table('leads')->where('status', 'Free Trial');

        $query = DB::table('leads')
    ->join('users', 'users.id', '=', 'leads.user_id')
    ->where('leads.status', 'Free Trial')
    ->select('leads.*', 'users.first_name as owner_Name', 'users.email as owner_email','users.phone_number as owner_phone'); // Adjust the fields as needed

        if ($search) $query->where('phone', 'LIKE', '%' . $search . '%');


        if (count($filterByProducts)) {
            $query->where(function ($q) use ($filterByProducts) {
                foreach ($filterByProducts as $product) {
                    $q->orWhereRaw("JSON_CONTAINS(products, '\"$product\"')");
                }
            });
        }

        if ($filterState)  $query->where('state', $filterState);




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

        // filterByProducts: ["Nifty","Bank Nifty","Fin Nifty"]


        return response()->json([
            'status' => 'success',
            'data' => $data,
            'products' => Dropdown::where([['type', 'Lead Products'], ['status', true]])->get()
        ]);
    }
}
