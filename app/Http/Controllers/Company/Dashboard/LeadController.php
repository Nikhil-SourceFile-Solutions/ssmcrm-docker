<?php

namespace App\Http\Controllers\Company\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Company\Broadcast;
use App\Models\Company\Lead;
use App\Models\Company\Sale;
use App\Models\Company\Settings\Setting;
use App\Models\Company\User;
use App\Models\Console\Company;
use App\Traits\Company\HomeTrait;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class LeadController extends Controller  // Admin Main Dashboard
{
    use HomeTrait;

    public function index(Request $request)
    {
        $Selectedbranch = getSelectedBranch($request);

        $data = [];


        $filter = json_decode($request->filter);

        if ($filter->isFirstLoading || $filter->cardReload) {
            $data['cardData'] = $this->getCardData($Selectedbranch, $filter->cardReload);
            $data['serviceData'] = $this->getServiceData($Selectedbranch, $filter->cardReload);
        }




        switch ($filter->tab) {
            case 'todaySale':
                $data['todaySaleData'] = $this->todaySaleData($Selectedbranch, $filter->todaySalesFilter);
                break;
            case 'monthSale':
                $data['monthSaleData'] = $this->monthSaleData($Selectedbranch, $filter->monthSalesFilter);
                break;
            case 'todayCall':
                $data['todayCallData'] = $this->todayCallData($Selectedbranch, $filter->todayCallFilter);
                break;
            case 'monthCall':
                $data['monthCallData'] = $this->monthCallData($Selectedbranch, $filter->monthCallFilter);
                break;
            case 'leadCount':
                $data['leadData'] = $this->leadData($Selectedbranch, $filter->LoadCoundFilter);
                break;
        }
        // return $data;
        // if ($request->reloadCard || $request->fourceReload) {
        //     $data['cardData'] = $this->getCardData($Selectedbranch);
        // }

        // if ($request->reloadLBUD || $request->fourceReload) {
        //     $data['leadByUserData'] = $this->leadByUserData($request, $Selectedbranch);
        // }

        // if ($request->reloadLBSD || $request->fourceReload) {
        //     $data['leadByStatusData'] = $this->leadByStatusData($request, $Selectedbranch);
        // }



        // $data['specificData'] = $this->getSpecificData();

        return response()->json(['status' => 'success', 'data' => $data]);
    }


    protected function getCardData($Selectedbranch, $hardLoading)
    {

        if ($Selectedbranch) $data =  Cache::get("lead-dashboard-card-data");

        else  $data =  Cache::get("lead-dashboard-card-data-" . $Selectedbranch);


        if (!$data || $hardLoading) {

            $query = Lead::query();
            if ($Selectedbranch) {
                $query->where('branch_id', $Selectedbranch);
            }


            $counts = $query->selectRaw("
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Closed Won' THEN 1 ELSE 0 END) as closedWon,
        SUM(CASE WHEN status = 'Free Trial' THEN 1 ELSE 0 END) as freeTrail,
        SUM(CASE WHEN status = 'Follow Up' THEN 1 ELSE 0 END) as followup,
        SUM(CASE WHEN user_id = 1 THEN 1 ELSE 0 END) as admin
    ")
                ->first();


            $data = [
                'total' => number_format($counts->total),
                'closedWon' => number_format($counts->closedWon),
                'freeTrail' => number_format($counts->freeTrail),
                'followup' => number_format($counts->followup),
                'admin' => number_format($counts->admin),
            ];

            if ($Selectedbranch) Cache::forever("lead-dashboard-card-data-" . $Selectedbranch,  $data);
            else  Cache::forever("lead-dashboard-card-data",  $data);
        }

        return $data;
    }


    protected function getServiceData($selectedBranch, $hardLoading)
    {
        $cacheKey = $selectedBranch
            ? "lead-dashboard-service-data-$selectedBranch"
            : "lead-dashboard-service-data";

        $data = Cache::get($cacheKey);

        if (!$data || $hardLoading) {
            // Date Helpers
            $today = Carbon::today();
            $tomorrow = Carbon::tomorrow();
            $endOfMonth = Carbon::now()->endOfMonth();
            // Queries
            $activeServices = Sale::where('is_service_activated', true)
                ->where('sales.due_date', '>=', $today)
                ->count();

            $expiredToday = Sale::where('is_service_activated', false)
                ->where('sales.due_date', '=', $today)
                ->count();

            $expiringTomorrow = Sale::where('is_service_activated', true)
                ->where('sales.due_date', '=', $tomorrow)
                ->count();

            $expiringThisWeek = Sale::where('is_service_activated', true)
                ->whereBetween('sales.due_date', [
                    Carbon::tomorrow(),
                    Carbon::now()->endOfWeek()
                ])
                ->count();

            $expiringThisMonth =  Sale::where('is_service_activated', true)
                ->whereBetween('sales.due_date', [$today, $endOfMonth])
                ->count();

            // Prepare Data
            $data = [
                'activeservices' => number_format($activeServices),
                'expiredtoday' => number_format($expiredToday),
                'expiringtomorrow' => number_format($expiringTomorrow),
                'expiringthisweek' => number_format($expiringThisWeek),
                'expiringthismonth' => number_format($expiringThisMonth),
            ];

            // Cache Data
            Cache::forever($cacheKey, $data);
        }

        return $data;
    }


    public function serviceDetails(Request $request)
    {
        $data = [];
        $today = Carbon::today();
        $tomorrow = Carbon::tomorrow();
        $endOfWeek = Carbon::now()->endOfWeek();
        $endOfMonth = Carbon::now()->endOfMonth();

        // Common query builder
        $query = Sale::join('leads', 'leads.id', '=', 'sales.lead_id')
            ->select('sales.id', 'first_name', 'last_name', 'phone', 'product', 'start_date', 'due_date');

        // Handle different actions
        switch ($request->action) {
            case 'activeservices':
                $data = $query->where('sales.due_date', '>=', $today)
                    ->where('sales.is_service_activated', true)
                    ->orderBy('sales.due_date', 'asc')
                    ->get();
                break;

            case 'expiredtoday':
                $data = $query->where('sales.due_date', '=', $today)
                    ->where('sales.is_service_activated', false)
                    ->get();
                break;

            case 'expiringtomorrow':
                $data = $query->where('sales.due_date', '=', $tomorrow)
                    ->where('sales.is_service_activated', true)
                    ->get();
                break;

            case 'expiringthisweek':
                $data = $query->whereBetween('sales.due_date', [$tomorrow, $endOfWeek])
                    ->where('sales.is_service_activated', true)
                    ->orderBy('sales.due_date', 'asc')
                    ->get();
                break;

            case 'expiringthismonth':
                $data = $query->whereBetween('sales.due_date', [$today, $endOfMonth])
                    ->where('sales.is_service_activated', true)
                    ->orderBy('sales.due_date', 'asc')
                    ->get();
                break;

            default:
                return response()->json(['status' => 'error', 'message' => 'Invalid action provided.']);
        }

        // Return the response
        return response()->json(['status' => 'success', 'data' => $data]);
    }
    protected function leadByUserData($request, $Selectedbranch)
    {
        $status = $request->LUfilter === "inactive" ? 0 : ($request->LUfilter === "active" ? 1 : null);

        $userQuery = User::query();

        if ($status !== null) {
            $userQuery->where('status', $status);

            if ($Selectedbranch) {
                $userQuery->where('branch_id', $Selectedbranch);
            }
        }

        $users_ids = $userQuery->pluck('id')->toArray();


        $leadQuery = DB::table('leads')
            ->whereIn('user_id', $users_ids);

        if ($Selectedbranch) {
            $leadQuery->where('branch_id', $Selectedbranch);
        }

        $leads = $leadQuery->select(
            'user_id',
            DB::raw('COUNT(*) as total_leads'),
            DB::raw('SUM(CASE WHEN status = "Closed Won" THEN 1 ELSE 0 END) as closedwon_leads')
        )
            ->groupBy('user_id')
            ->get();


        $users = User::whereIn('id', $leads->pluck('user_id')->toArray())
            ->when($Selectedbranch, function ($query) use ($Selectedbranch) {
                return $query->where('branch_id', $Selectedbranch);
            })
            ->select('id', 'first_name', 'last_name')
            ->get()
            ->keyBy('id');


        foreach ($leads as $lead) {
            $user = $users->get($lead->user_id);
            if ($user) {
                $lead->name = $user->first_name . ' ' . $user->last_name;
            } else {
                $lead->name = 'Unknown';
            }
        }

        return $leads;
    }


    protected function leadByStatusData($Selectedbranch)
    {
        $query = Lead::query();


        if ($Selectedbranch) {
            $query->where('branch_id', $Selectedbranch);
        }


        $distinctFields = $query->select('status', 'state', 'source')
            ->groupBy('status', 'state', 'source')
            ->get();


        $statuses = $distinctFields->pluck('status')->unique();
        $states = $distinctFields->pluck('state')->unique();
        $sources = $distinctFields->pluck('source')->unique();


        $counts = $query->selectRaw('
        status, state, source, 
        COUNT(*) as count
    ')
            ->groupBy('status', 'state', 'source')
            ->get();


        $statusLeadCounts = [];
        $stateLeadCounts = [];
        $sourceLeadCounts = [];


        foreach ($counts as $count) {
            $statusLeadCounts[$count->status] = $count->count;
            $stateLeadCounts[$count->state] = $count->count;
            $sourceLeadCounts[$count->source] = $count->count;
        }

        return [
            'status' => $statuses->values()->toArray(),
            'states' => $states->values()->toArray(),
            'source' => $sources->values()->toArray(),
            'statusLead' => $statusLeadCounts,
            'stateLead' => $stateLeadCounts,
            'sourceLead' => $sourceLeadCounts,
        ];
    }


    public function todaySaleData($Selectedbranch, $filter)
    {

        $settings = Setting::first();
        $sumColumn = $settings->gst_enabled ? 'inclusive_gst' : 'client_paid';


        $userQuery = User::query();

        if (!empty($filter->manager)) {
            $users = User::where('manager_id', $filter->manager)->pluck('id')->toArray();
            $userQuery->whereIn('id', [...$users, $filter->manager]);

            if (!empty($filter->leader)) {
                $teamUsers = User::where([
                    ['manager_id', $filter->manager],
                    ['team_leader_id', $filter->leader]
                ])->pluck('id')->toArray();

                $userQuery->whereIn('id', [...$teamUsers, $filter->manager, $filter->leader]);
            }
        } else {
            $userQuery->whereIn('user_type', ['BDE', 'Team Leader', 'Manager', 'Admin']);
        }


        if ($filter->isActiveUsers == "inactive") {
            $userQuery->where('status', 0);
        } else if ($filter->isActiveUsers == "active") {
            $userQuery->where('status', 1);
        }

        if ($Selectedbranch) {
            $userQuery->where('branch_id', $Selectedbranch);
        }

        $users_ids = $userQuery->pluck('id')->toArray();


        $salesQuery = DB::table('sales')
            ->whereIn('user_id', $users_ids)
            ->whereDate('sale_date', now()->today());

        if ($Selectedbranch) {
            $salesQuery->where('branch_id', $Selectedbranch);
        }

        $sales = $salesQuery->select(
            'user_id',
            DB::raw('COUNT(*) as total_sales'),
            DB::raw("SUM($sumColumn) as sales")
        )
            ->groupBy('user_id')
            ->get();

        $users = User::whereIn('id', $sales->pluck('user_id')->toArray())
            ->select('id', 'first_name', 'last_name')
            ->when($Selectedbranch, function ($query) use ($Selectedbranch) {
                return $query->where('branch_id', $Selectedbranch);
            })
            ->get()
            ->keyBy('id');


        foreach ($sales as $sale) {
            $user = $users->get($sale->user_id);
            $sale->name = $user ? $user->first_name . ' ' . $user->last_name : 'Unknown'; // Handle unknown users
        }


        // if (auth()->user()->user_type == "Admin" || auth()->user()->user_type == "Branch Admin") {
        $query = User::whereIn('user_type', ['Manager', 'Team Leader'])
            ->where('status', true)
            ->select('id', 'first_name', 'last_name', 'user_type', 'manager_id');

        if ($Selectedbranch) {
            $query->where('branch_id', $Selectedbranch);
        }


        // }

        return ['sales' => $sales, 'filterUsers' => $query->get()];
    }



    protected function monthSaleData($Selectedbranch, $filter)
    {

        // return $filter;
        $settings = Setting::first();
        $sumColumn = $settings->gst_enabled ? 'inclusive_gst' : 'client_paid';

        $userQuery = User::query();

        if (!empty($filter->manager)) {
            $users = User::where('manager_id', $filter->manager)->pluck('id')->toArray();
            $userQuery->whereIn('id', [...$users, $filter->manager]);

            if (!empty($filter->leader)) {
                $teamUsers = User::where([
                    ['manager_id', $filter->manager],
                    ['team_leader_id', $filter->leader]
                ])->pluck('id')->toArray();

                $userQuery->whereIn('id', [...$teamUsers, $filter->manager, $filter->leader]);
            }
        } else {
            $userQuery->whereIn('user_type', ['BDE', 'Team Leader', 'Manager', 'Admin']);
        }

        if ($filter->isActiveUsers == "inactive") {
            $userQuery->where('status', 0);
        } else if ($filter->isActiveUsers == "active") {
            $userQuery->where('status', 1);
        }

        if ($Selectedbranch) {
            $userQuery->where('branch_id', $Selectedbranch);
        }

        $users_ids = $userQuery->pluck('id')->toArray();

        $salesQuery = DB::table('sales')
            ->whereIn('user_id', $users_ids)
            ->whereYear('sale_date', now()->year)
            ->whereMonth('sale_date', now()->month);


        if ($Selectedbranch) {
            $salesQuery->where('branch_id', $Selectedbranch);
        }


        $sales = $salesQuery->select(
            'user_id',
            DB::raw('COUNT(*) as total_sales'),
            DB::raw("SUM($sumColumn) as sales")
        )
            ->groupBy('user_id')
            ->get();


        $users = User::whereIn('id', $sales->pluck('user_id')->toArray())
            ->select('id', 'first_name', 'last_name')
            ->when($Selectedbranch, function ($query) use ($Selectedbranch) {
                return $query->where('branch_id', $Selectedbranch);
            })
            ->get()
            ->keyBy('id');


        foreach ($sales as $sale) {
            $user = $users->get($sale->user_id);
            $sale->name = $user ? $user->first_name . ' ' . $user->last_name : 'Unknown'; // Handle unknown users
        }

        $query = User::whereIn('user_type', ['Manager', 'Team Leader'])
            ->where('status', true)
            ->select('id', 'first_name', 'last_name', 'user_type', 'manager_id');

        if ($Selectedbranch) {
            $query->where('branch_id', $Selectedbranch);
        }

        return ['sales' => $sales, 'filterUsers' => $query->get()];
    }


    protected function todayCallData($Selectedbranch, $filter)
    {


        $userQuery = User::query();

        if (!empty($filter->manager)) {
            $users = User::where('manager_id', $filter->manager)->pluck('id')->toArray();
            $userQuery->whereIn('id', [...$users, $filter->manager]);

            if (!empty($filter->leader)) {
                $teamUsers = User::where([
                    ['manager_id', $filter->manager],
                    ['team_leader_id', $filter->leader]
                ])->pluck('id')->toArray();

                $userQuery->whereIn('id', [...$teamUsers, $filter->manager, $filter->leader]);
            }
        } else {
            $userQuery->whereIn('user_type', ['BDE', 'Team Leader', 'Manager', 'Admin']);
        }


        if ($filter->isActiveUsers == "inactive") {
            $userQuery->where('status', 0);
        } else if ($filter->isActiveUsers == "active") {
            $userQuery->where('status', 1);
        }


        if ($Selectedbranch) {
            $userQuery->where('branch_id', $Selectedbranch);
        }


        $users_ids = $userQuery->pluck('id')->toArray();


        $callsQuery = DB::table('lead_statuses')
            ->whereIn('user_id', $users_ids)
            ->where('is_status_changed', true)
            ->whereDate('created_at', now()->today())
            ->select(
                'user_id',
                DB::raw('COUNT(*) as calls')
            )
            ->groupBy('user_id');


        $calls = $callsQuery->get();



        $users = User::whereIn('id', $calls->pluck('user_id')->toArray())
            ->select('id', 'first_name', 'last_name')
            ->when($Selectedbranch, function ($query) use ($Selectedbranch) {
                return $query->where('branch_id', $Selectedbranch);
            })
            ->get()
            ->keyBy('id');


        foreach ($calls as $call) {
            $user = $users->get($call->user_id);
            $call->name = $user ? $user->first_name . ' ' . $user->last_name : 'Unknown'; // Handle unknown users
        }


        $query = User::whereIn('user_type', ['Manager', 'Team Leader'])
            ->where('status', true)
            ->select('id', 'first_name', 'last_name', 'user_type', 'manager_id');

        if ($Selectedbranch) {
            $query->where('branch_id', $Selectedbranch);
        }



        return ['calls' => $calls, 'filterUsers' => $query->get()];
    }


    public function leadData($Selectedbranch, $filter)
    {



        $userQuery = User::query();

        if (!empty($filter->manager)) {
            $users = User::where('manager_id', $filter->manager)->pluck('id')->toArray();
            $userQuery->whereIn('id', [...$users, $filter->manager]);

            if (!empty($filter->leader)) {
                $teamUsers = User::where([
                    ['manager_id', $filter->manager],
                    ['team_leader_id', $filter->leader]
                ])->pluck('id')->toArray();

                $userQuery->whereIn('id', [...$teamUsers, $filter->manager, $filter->leader]);
            }
        } else {
            $userQuery->whereIn('user_type', ['BDE', 'Team Leader', 'Manager', 'Admin']);
        }


        if ($filter->isActiveUsers == "inactive") {
            $userQuery->where('status', 0);
        } else if ($filter->isActiveUsers == "active") {
            $userQuery->where('status', 1);
        }


        if ($Selectedbranch) {
            $userQuery->where('branch_id', $Selectedbranch);
        }


        $users_ids = $userQuery->pluck('id')->toArray();


        $leadsQuery = DB::table('leads')
            ->whereIn('user_id', $users_ids)
            ->select(
                'user_id',
                DB::raw('COUNT(*) as leads'),
                DB::raw('SUM(CASE WHEN status = "Closed Won" THEN 1 ELSE 0 END) as closedwon_leads')
            )
            ->groupBy('user_id');


        if ($Selectedbranch) {
            $leadsQuery->where('branch_id', $Selectedbranch);
        }


        $leads = $leadsQuery->get();


        $users = User::whereIn('id', $leads->pluck('user_id')->toArray())
            ->select('id', 'first_name', 'last_name')
            ->when($Selectedbranch, function ($query) use ($Selectedbranch) {
                return $query->where('branch_id', $Selectedbranch);
            })
            ->get()
            ->keyBy('id');


        foreach ($leads as $lead) {
            $user = $users->get($lead->user_id);
            $lead->name = $user ? $user->first_name . ' ' . $user->last_name : 'Unknown'; // Handle unknown users
        }


        $query = User::whereIn('user_type', ['Manager', 'Team Leader'])
            ->where('status', true)
            ->select('id', 'first_name', 'last_name', 'user_type', 'manager_id');

        if ($Selectedbranch) {
            $query->where('branch_id', $Selectedbranch);
        }



        return ['leads' => $leads, 'filterUsers' => $query->get()];
    }


    protected function monthCallData($Selectedbranch, $filter)
    {




        $userQuery = User::query();

        if (!empty($filter->manager)) {
            $users = User::where('manager_id', $filter->manager)->pluck('id')->toArray();
            $userQuery->whereIn('id', [...$users, $filter->manager]);

            if (!empty($filter->leader)) {
                $teamUsers = User::where([
                    ['manager_id', $filter->manager],
                    ['team_leader_id', $filter->leader]
                ])->pluck('id')->toArray();

                $userQuery->whereIn('id', [...$teamUsers, $filter->manager, $filter->leader]);
            }
        } else {
            $userQuery->whereIn('user_type', ['BDE', 'Team Leader', 'Manager', 'Admin']);
        }


        if ($filter->isActiveUsers == "inactive") {
            $userQuery->where('status', 0);
        } else if ($filter->isActiveUsers == "active") {
            $userQuery->where('status', 1);
        }


        if ($Selectedbranch) {
            $userQuery->where('branch_id', $Selectedbranch);
        }


        $users_ids = $userQuery->pluck('id')->toArray();


        $callsQuery = DB::table('lead_statuses')
            ->whereIn('user_id', $users_ids)
            ->where('is_status_changed', true)
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month);


        $calls = $callsQuery->select(
            'user_id',
            DB::raw('COUNT(*) as calls')
        )
            ->groupBy('user_id')
            ->get();






        $users = User::whereIn('id', $calls->pluck('user_id')->toArray())
            ->select('id', 'first_name', 'last_name')
            ->when($Selectedbranch, function ($query) use ($Selectedbranch) {
                return $query->where('branch_id', $Selectedbranch);
            })
            ->get()
            ->keyBy('id');


        foreach ($calls as $call) {
            $user = $users->get($call->user_id);
            $call->name = $user ? $user->first_name . ' ' . $user->last_name : 'Unknown'; // Handle unknown users
        }


        $query = User::whereIn('user_type', ['Manager', 'Team Leader'])
            ->where('status', true)
            ->select('id', 'first_name', 'last_name', 'user_type', 'manager_id');

        if ($Selectedbranch) {
            $query->where('branch_id', $Selectedbranch);
        }


        // }

        return ['calls' => $calls, 'filterUsers' => $query->get()];
    }




    public function filteredCount(Request $request)
    {
        if ($request->action == "status")  $value = Lead::where('status', $request->value)->count();
        else if ($request->action == "state")  $value = Lead::where('state', $request->value)->count();
        else   $value = Lead::where('source', $request->value)->count();

        return response()->json(['status' => 'success', 'action' => $request->action, 'value' => $value]);
    }
}
