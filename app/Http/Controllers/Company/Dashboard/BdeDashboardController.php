<?php

namespace App\Http\Controllers\Company\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Company\Lead;
use App\Models\Company\Sale;
use App\Models\Company\Settings\Setting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BdeDashboardController extends Controller
{
    public function index(Request $request)
    {

        $data = [];

        if ($request->fetchingCard) $data['cardData'] = $this->cardData();

        if ($request->fetchingSale) $data['saleData'] = $this->saleData();

        if ($request->followUpReload) $data['followUpData'] = $this->followUpData($request);

        if ($request->freeTrailReload) $data['freeTrailData'] = $this->freeTrailData($request);

        return response()->json(['status' => 'success', 'data' => $data]);
    }


    protected function cardData()
    {
        $totalLeads = Lead::where('user_id', auth()->user()->id)->count();
        $closedWon = Lead::where([['user_id', auth()->user()->id], ['status', 'Closed Won']])->count();
        $followUp = Lead::where('user_id', auth()->user()->id)->where('status', 'Follow Up')->count();
        $freeTrail = Lead::where('user_id', auth()->user()->id)->where('status', 'Free Trial')->count();
        $others = Lead::where('user_id', auth()->user()->id)->whereNotIn('status', ['Free Trial', 'Closed Won', 'Follow Up'])->count();

        return [
            'totalLeads' => $totalLeads,
            'closedWon' => $closedWon,
            'followUp' => $followUp,
            'freeTrail' => $freeTrail,
            'others' => $others
        ];
    }


    protected function saleData()
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
            'today' => $today,
            'thisMonth' => $thisMonth,
            'lastMonth' => $lastMonth,
            'allTime' => $allTime
        ];
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
