<?php

namespace App\Http\Controllers\Company\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Company\Lead;
use App\Models\Company\Sale;
use App\Models\Company\Settings\Setting;
use App\Models\Company\User;
use App\Models\Console\Company;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class LeaderDashboard extends Controller
{
    public function index(Request $request)
    {
        // return $request;
        $data = [];

        if ($request->cardLoad) $data['cardData'] = $this->cardData(); //ccc

        if ($request->fetchingSale) $data['saleData'] = $this->saleData($request);
        if ($request->followUpReload) $data['followUpData'] = $this->followUpData($request);
        if ($request->freeTrailReload) $data['freeTrailData'] = $this->freeTrailData($request);


        if ($request->tab == "todaySale") $data['todaySaleDtata'] = $this->todaySaleDtata($request);

        else if ($request->tab == "monthSale") $data['monthSaleDtata'] = $this->monthSaleDtata($request);

        else if ($request->tab == "todayCall") $data['todayCallData'] = $this->todayCallData($request);

        else if ($request->tab == "monthCall") $data['monthCallData'] = $this->monthCallData($request);

        else if ($request->tab == "leadCount") $data['leadData'] = $this->leadData($request);



        return response()->json(['status' => 'success', 'data' => $data]);
    }

    protected function cardData()
    {
        $team = Cache::rememberForever("dashboard-leader-id", function () {
            return User::where([
                ['status', true],
                ['team_leader_id', auth()->user()->id],
                ['user_type', 'BDE']
            ])->pluck('id')->toArray();
        });

        $ownLeads = Lead::where('user_id', auth()->user()->id)
            ->selectRaw("
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Closed Won' THEN 1 ELSE 0 END) as closed_won,
        SUM(CASE WHEN status = 'Follow Up' THEN 1 ELSE 0 END) as follow_up,
        SUM(CASE WHEN status = 'Free Trial' THEN 1 ELSE 0 END) as free_trial
    ")
            ->first();

        $teamLeads = !empty($team)
            ? Lead::whereIn('user_id', $team)
            ->selectRaw("
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'Closed Won' THEN 1 ELSE 0 END) as closed_won,
                    SUM(CASE WHEN status = 'Follow Up' THEN 1 ELSE 0 END) as follow_up,
                    SUM(CASE WHEN status = 'Free Trial' THEN 1 ELSE 0 END) as free_trial
                ")
            ->first()
            : (object)[
                'total' => 0,
                'closed_won' => 0,
                'follow_up' => 0,
                'free_trial' => 0
            ];
        return [
            'ownTotalLeads' => $ownLeads->total ?? 0,
            'ownClosedWonLeads' => $ownLeads->closed_won ?? 0,
            'ownFollowupLeads' => $ownLeads->follow_up ?? 0,
            'ownFreeTrailLeads' => $ownLeads->free_trial ?? 0,
            'teamTotalLeads' => $teamLeads->total ?? 0,
            'teamClosedWonLeads' => $teamLeads->closed_won ?? 0,
            'teamFollowupLeads' => $teamLeads->follow_up ?? 0,
            'teamFreeTrailLeads' => $teamLeads->free_trial ?? 0,
        ];
    }


    protected function saleData($request)
    {
        $settings = Setting::first();

        $sumColumn = $settings->gst_enabled ? 'inclusive_gst' : 'client_paid';

        $today = Sale::where('user_id', auth()->user()->id)->whereDate('sale_date', now()->today())->sum($sumColumn);

        $thisMonth = Sale::where('user_id', auth()->user()->id)
            ->whereMonth('sale_date', now()->month)
            ->whereYear('sale_date', now()->year)
            ->sum($sumColumn);

        $lastMonth = Sale::where('user_id', auth()->user()->id)
            ->whereMonth('sale_date', now()->subMonth()->month)  // Previous month
            ->whereYear('sale_date', now()->subMonth()->year)    // Previous year (handles year change)
            ->sum($sumColumn);

        $allTime   = Sale::where('user_id', auth()->user()->id)
            ->sum($sumColumn);

        return [
            'today' =>   number_format($today, 2),
            'thisMonth' => number_format($thisMonth, 2),
            'lastMonth' => number_format($lastMonth, 2),
            'allTime' => number_format($allTime, 2),
            'teamSales' => $this->teamSales()
        ];
    }

    protected function teamSales()
    {
        $settings = Setting::first();

        $sumColumn = $settings->gst_enabled ? 'inclusive_gst' : 'client_paid';

        $teamIds = User::where([['user_type', 'BDE'], ['team_leader_id', auth()->user()->id]])->pluck('id')->toArray();

        $today = Sale::whereIn('user_id', $teamIds)->whereDate('sale_date', now()->today())->sum($sumColumn);

        $thisMonth = Sale::whereIn('user_id',  $teamIds)->whereMonth('sale_date', now()->month)
            ->whereYear('sale_date', now()->year)->sum($sumColumn);

        $lastMonth = Sale::whereIn('user_id', $teamIds)->whereMonth('sale_date', now()->subMonth()->month)
            ->whereYear('sale_date', now()->subMonth()->year)->sum($sumColumn);

        $allTime   = Sale::whereIn('user_id', $teamIds)->sum($sumColumn);

        return [
            'today' => number_format($today, 2),
            'thisMonth' => number_format($thisMonth, 2),
            'lastMonth' => number_format($lastMonth, 2),
            'allTime' => number_format($allTime, 2),
        ];
    }

    public function todaySaleDtata($request)
    {

        $settings =  Cache::get("company-settings");

        if (!$settings) {
            $settings = Setting::first();
            $crm = tenancy()->central(function ($tenant) {
                return Company::where('domain', $tenant->id)->select('branch_no', 'corporate_branch_name')->first();
            });
            $settings->branch_no = $crm->branch_no;
            Cache::forever("company-settings", $settings);
        }

        $sumColumn = $settings->gst_enabled ? 'inclusive_gst' : 'client_paid';

        if ($request->todaySaleFilter == "inactive") {
            $users_ids = User::where([['status', 0], ['user_type', 'BDE'], ['team_leader_id', auth()->user()->id]])->pluck('id')->toArray();
        } else if ($request->todaySaleFilter == "active") {
            $users_ids = User::where([['status', 1], ['user_type', 'BDE'], ['team_leader_id', auth()->user()->id]])->pluck('id')->toArray();
        }

        $sales =  DB::table('sales')->whereIn('user_id', $users_ids)
            ->whereDate('sale_date', now()->today())
            ->select(
                'user_id',
                DB::raw('COUNT(*) as total_sales'),
                DB::raw("SUM($sumColumn) as sales")
            )

            ->groupBy('user_id')
            ->get();



        $users = User::whereIn('id', $sales->pluck('user_id')->toArray())->select('id', 'first_name', 'last_name')->get();

        foreach ($sales as $lead) {
            $user = $users->where('id', $lead->user_id)->first();
            $lead->name = $user->first_name . ' ' . $user->last_name;
        }

        return $sales;
    }

    protected function monthSaleDtata($request)
    {
        $settings = Setting::first();

        $sumColumn = $settings->gst_enabled ? 'inclusive_gst' : 'client_paid';

        if ($request->monthSaleFilter == "inactive") {
            $users_ids = User::where([['status', 0], ['user_type', 'BDE'], ['team_leader_id', auth()->user()->id]])->pluck('id')->toArray();
        } else if ($request->monthSaleFilter == "active") {
            $users_ids = User::where([['status', 1], ['user_type', 'BDE'], ['team_leader_id', auth()->user()->id]])->pluck('id')->toArray();
        }

        $sales =  DB::table('sales')->whereIn('user_id', $users_ids)
            ->whereYear('sale_date', now()->year)
            ->whereMonth('sale_date', now()->month)
            ->select(
                'user_id',
                DB::raw('COUNT(*) as total_sales'),
                DB::raw("SUM($sumColumn) as sales")
            )

            ->groupBy('user_id')
            ->get();

        $users = User::whereIn('id', $sales->pluck('user_id')->toArray())->select('id', 'first_name', 'last_name')->get();

        foreach ($sales as $lead) {
            $user = $users->where('id', $lead->user_id)->first();
            $lead->name = $user->first_name . ' ' . $user->last_name;
        }

        return $sales;
    }

    protected function todayCallData($request)
    {


        if ($request->todayCallFilter == "inactive") {
            $users_ids = User::where([['status', 0], ['user_type', 'BDE'], ['team_leader_id', auth()->user()->id]])->pluck('id')->toArray();
        } else if ($request->todayCallFilter == "active") {
            $users_ids = User::where([['status', 1], ['user_type', 'BDE'], ['team_leader_id', auth()->user()->id]])->pluck('id')->toArray();
        }

        $calls =  DB::table('lead_statuses')->whereIn('user_id', $users_ids)
            ->where('is_status_changed', true)
            ->whereDate('created_at', now()->today())
            ->select(
                'user_id',
                DB::raw('COUNT(*) as calls'),
            )

            ->groupBy('user_id')
            ->get();

        $users = User::whereIn('id', $calls->pluck('user_id')->toArray())->select('id', 'first_name', 'last_name')->get();

        foreach ($calls as $lead) {
            $user = $users->where('id', $lead->user_id)->first();
            $lead->name = $user->first_name . ' ' . $user->last_name;
        }

        return $calls;
    }

    protected function monthCallData($request)
    {
        if ($request->monthCallFilter == "inactive") {
            $users_ids = User::where([['status', 0], ['user_type', 'BDE'], ['team_leader_id', auth()->user()->id]])->pluck('id')->toArray();
        } else if ($request->monthCallFilter == "active") {
            $users_ids = User::where([['status', 1], ['user_type', 'BDE'], ['team_leader_id', auth()->user()->id]])->pluck('id')->toArray();
        }

        $calls =  DB::table('lead_statuses')->whereIn('user_id', $users_ids)
            ->where('is_status_changed', true)
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->select(
                'user_id',
                DB::raw('COUNT(*) as calls'),
            )

            ->groupBy('user_id')
            ->get();

        $users = User::whereIn('id', $calls->pluck('user_id')->toArray())->select('id', 'first_name', 'last_name')->get();

        foreach ($calls as $lead) {
            $user = $users->where('id', $lead->user_id)->first();
            $lead->name = $user->first_name . ' ' . $user->last_name;
        }

        return $calls;
    }


    public function leadData($request)
    {
        if ($request->leadFilter == "inactive") {
            $users_ids = User::where([['status', 0], ['user_type', 'BDE'], ['team_leader_id', auth()->user()->id]])->pluck('id')->toArray();
        } else if ($request->leadFilter == "active") {
            $users_ids = User::where([['status', 1], ['user_type', 'BDE'], ['team_leader_id', auth()->user()->id]])->pluck('id')->toArray();
        }

        $leads =  DB::table('leads')->whereIn('user_id', $users_ids)
            ->select(
                'user_id',
                DB::raw('COUNT(*) as leads'),
                DB::raw('SUM(CASE WHEN status = "Closed Won" THEN 1 ELSE 0 END) as closedwon_leads')
            )
            ->groupBy('user_id')
            ->get();

        $users = User::whereIn('id', $leads->pluck('user_id')->toArray())->select('id', 'first_name', 'last_name')->get();

        foreach ($leads as $lead) {
            $user = $users->where('id', $lead->user_id)->first();
            $lead->name = $user->first_name . ' ' . $user->last_name;
        }

        return $leads;
    }


    protected function followUpData($request)
    {
        $pageSize = $request->get('followUpPageSize', 10);
        $currentPage = $request->get('followUpPage', 1);
        $offset = ($currentPage - 1) * $pageSize;
        $date = $request->get('followUpDate', now()->today());

        $query = DB::table('leads')
            ->where('user_id', auth()->user()->id)
            ->where('status', 'Follow Up')
            ->whereDate('followup', Carbon::createFromFormat('Y-m-d', $date));

        $totalItems = $query->count();
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

        return $data;
    }

    protected function freeTrailData($request)
    {
        $pageSize = $request->get('freeTrailPageSize', 10);
        $currentPage = $request->get('freeTrailPage', 1);
        $offset = ($currentPage - 1) * $pageSize;
        $date = $request->get('freeTrailDate', now()->today());
        $query = DB::table('leads')
            ->where('user_id', auth()->user()->id)
            ->where('status', 'Free Trial')
            ->whereDate('free_trial', Carbon::createFromFormat('Y-m-d', $date));


        $totalItems = $query->count();
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

        return $data;
    }
}
