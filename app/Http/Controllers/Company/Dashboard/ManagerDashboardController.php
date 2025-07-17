<?php

namespace App\Http\Controllers\Company\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Company\Lead;
use App\Models\Company\Sale;
use App\Models\Company\Settings\Setting;
use App\Models\Company\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ManagerDashboardController extends Controller
{
    public function index(Request $request)
    {
        $data = [];

        if ($request->cardLoad) $data['cardData'] = $this->cardData();

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
        $settings = Setting::first();
        $user = auth()->user();

        $sumColumn = $settings->gst_enabled ? 'inclusive_gst' : 'client_paid';

        $ownSales = Sale::where('user_id', $user->id)
            ->whereNot('status', 'Pending')
            ->whereDate('sale_date', now()->today())
            ->sum($sumColumn);

        $ownLeads = Lead::where('user_id', $user->id)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Closed Won' THEN 1 ELSE 0 END) as closed_won,
                SUM(CASE WHEN status = 'Follow Up' THEN 1 ELSE 0 END) as follow_up,
                SUM(CASE WHEN status = 'Free Trial' THEN 1 ELSE 0 END) as free_trail
            ")
            ->first();

        $users_ids = User::whereIn('user_type', ['BDE', 'Team Leader'])
            ->where('manager_id', $user->id)
            ->pluck('id')
            ->toArray();

        $teamSales = Sale::whereIn('user_id', $users_ids)
            ->whereNot('status', 'Pending')
            ->whereDate('sale_date', now()->today())
            ->sum($sumColumn);

        $teamLeads = Lead::whereIn('user_id', $users_ids)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Closed Won' THEN 1 ELSE 0 END) as closed_won,
                SUM(CASE WHEN status = 'Follow Up' THEN 1 ELSE 0 END) as follow_up,
                SUM(CASE WHEN status = 'Free Trial' THEN 1 ELSE 0 END) as free_trail
            ")
            ->first();

        $leaders = User::where('manager_id', $user->id)
            ->where('user_type', 'Team Leader')
            ->where('status', true)
            ->count();

        $bdes = User::where('manager_id', $user->id)
            ->where('user_type', 'BDE')
            ->where('status', true)
            ->count();

        return [
            'leaders' => $leaders,
            'bdes' => $bdes,
            'ownSales' => $ownSales,
            'ownLeads' => $ownLeads->total ?? 0,
            'ownCloseWonLeads' => $ownLeads->closed_won ?? 0,
            'ownFollowupLeads' => $ownLeads->follow_up ?? 0,
            'ownFreeTrailLeads' => $ownLeads->free_trail ?? 0,
            'teamSales' => number_format($teamSales, 2),
            'teamLeads' => $teamLeads->total ?? 0,
            'teamCloseWonLeads' => $teamLeads->closed_won ?? 0,
            'teamFollowupLeads' => $teamLeads->follow_up ?? 0,
            'teamFreeTrailLeads' => $teamLeads->free_trail ?? 0,
            'totalSales' => number_format($ownSales + $teamSales, 2)
        ];
    }

    protected function saleData($request)
    {
        $settings = Setting::first();
        $userId = auth()->user()->id;

        $sumColumn = $settings->gst_enabled ? 'inclusive_gst' : 'client_paid';

        $currentMonth = now()->month;
        $currentYear = now()->year;
        $lastMonth = now()->subMonth();

        $salesQuery = Sale::where('user_id', $userId);

        $today = (clone $salesQuery)->whereDate('sale_date', now()->today())->sum($sumColumn);
        $thisMonth = (clone $salesQuery)
            ->whereMonth('sale_date', $currentMonth)
            ->whereYear('sale_date', $currentYear)
            ->sum($sumColumn);
        $lastMonth = (clone $salesQuery)
            ->whereMonth('sale_date', $lastMonth->month)
            ->whereYear('sale_date', $lastMonth->year)
            ->sum($sumColumn);
        $allTime = (clone $salesQuery)->sum($sumColumn);

        return [
            'today' => number_format($today, 2),
            'thisMonth' => number_format($thisMonth, 2),
            'lastMonth' => number_format($lastMonth, 2),
            'allTime' => number_format($allTime, 2),
            'teamSales' => $this->teamSaleData()
        ];
    }


    protected function teamSaleData()
    {
        $settings = Setting::first();
        $sumColumn = $settings->gst_enabled ? 'inclusive_gst' : 'client_paid';

        $teamIds = User::whereIn('user_type', ['BDE', 'Team Leader'])
            ->where('manager_id', auth()->user()->id)
            ->pluck('id')
            ->toArray();

        $currentMonth = now()->month;
        $currentYear = now()->year;
        $lastMonth = now()->subMonth();

        $teamSalesQuery = Sale::whereIn('user_id', $teamIds);

        $today = (clone $teamSalesQuery)->whereDate('sale_date', now()->today())->sum($sumColumn);
        $thisMonth = (clone $teamSalesQuery)
            ->whereMonth('sale_date', $currentMonth)
            ->whereYear('sale_date', $currentYear)
            ->sum($sumColumn);
        $lastMonth = (clone $teamSalesQuery)
            ->whereMonth('sale_date', $lastMonth->month)
            ->whereYear('sale_date', $lastMonth->year)
            ->sum($sumColumn);
        $allTime = (clone $teamSalesQuery)->sum($sumColumn);

        return [
            'today' => number_format($today, 2),
            'thisMonth' => number_format($thisMonth, 2),
            'lastMonth' => number_format($lastMonth, 2),
            'allTime' => number_format($allTime, 2)
        ];
    }

    public function todaySaleDtata($request)
    {
        $settings = Setting::first();

        $sumColumn = $settings->gst_enabled ? 'inclusive_gst' : 'client_paid';

        if ($request->todaySaleFilter == "inactive") {
            $users_ids = User::where([['status', 0], ['manager_id', auth()->user()->id]])->whereIn('user_type', ['BDE', 'Team Leader'])->pluck('id')->toArray();
        } else if ($request->todaySaleFilter == "active") {
            $users_ids = User::where([['status', 1],  ['manager_id', auth()->user()->id]])->whereIn('user_type', ['BDE', 'Team Leader'])->pluck('id')->toArray();
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
            $users_ids = User::where([['status', 0],  ['manager_id', auth()->user()->id]])->whereIn('user_type', ['BDE', 'Team Leader'])->pluck('id')->toArray();
        } else if ($request->monthSaleFilter == "active") {
            $users_ids = User::where([['status', 1],  ['manager_id', auth()->user()->id]])->whereIn('user_type', ['BDE', 'Team Leader'])->pluck('id')->toArray();
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
            $users_ids = User::where([['status', 0],  ['manager_id', auth()->user()->id]])->whereIn('user_type', ['BDE', 'Team Leader'])->pluck('id')->toArray();
        } else if ($request->todayCallFilter == "active") {
            $users_ids = User::where([['status', 1], ['manager_id', auth()->user()->id]])->whereIn('user_type', ['BDE', 'Team Leader'])->pluck('id')->toArray();
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
            $users_ids = User::where([['status', 0],  ['manager_id', auth()->user()->id]])->whereIn('user_type', ['BDE', 'Team Leader'])->pluck('id')->toArray();
        } else if ($request->monthCallFilter == "active") {
            $users_ids = User::where([['status', 1],  ['manager_id', auth()->user()->id]])->whereIn('user_type', ['BDE', 'Team Leader'])->pluck('id')->toArray();
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
            $users_ids = User::where([['status', 0],  ['manager_id', auth()->user()->id]])->whereIn('user_type', ['BDE', 'Team Leader'])->pluck('id')->toArray();
        } else if ($request->leadFilter == "active") {
            $users_ids = User::where([['status', 1],  ['manager_id', auth()->user()->id]])->whereIn('user_type', ['BDE', 'Team Leader'])->pluck('id')->toArray();
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
