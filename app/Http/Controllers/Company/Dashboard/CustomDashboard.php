<?php

namespace App\Http\Controllers\Company\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Company\Lead;
use App\Models\Company\Sale;
use App\Models\Company\LeadStatus;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomDashboard extends Controller
{
    public function index(Request $request)
    {
        
        // return Sale::where('status','Approved')->where('sales.due_date', '>=', Carbon::today())->update(['is_service_activated'=>true]);
        //  Sale::where('is_service_activated', true)->whereNotNull('due_date')->where('due_date', '<=', Carbon::yesterday()->endOfDay())
        //     ->update([
        //         'status' => 'Expired',
        //         'is_service_activated' => false,
        //     ]);
        //  return Sale::where('is_service_activated', true)->whereNotNull('due_date')->where('due_date', '<=', Carbon::yesterday()->endOfDay())->select('due_date','is_service_activated')->get();
        return match ($request->tab) {
            'call' => $this->callData($request),
            'free' => $this->freeData($request),
            'follow' => $this->followUpData($request),
            default => throw new \Exception('Unsupported'),
        };
    }


    protected function callData($request)
    {
        $daterange = json_decode($request->dateRange);
        if (!is_array($daterange) || count($daterange) < 2) {
            return response()->json(['status' => 'error', 'message' => 'Invalid date range provided'], 400);
        }
        $startDate = Carbon::parse($daterange[0])->startOfDay();
        $endDate = Carbon::parse($daterange[1])->endOfDay();
        $query = LeadStatus::where('is_status_changed', true)
            ->join('users', 'users.id', '=', 'lead_statuses.user_id')
            ->whereBetween('lead_statuses.created_at', [$startDate, $endDate]);//Between('lead_statuses.created_at', [$startDate, $endDate])
        if ($request->filterEmployee !== "all") {
            $query->where('users.status', $request->filterEmployee);
        }
        $calls = $query->select('user_id', 'users.first_name', DB::raw('count(*) as total_calls'))
            ->groupBy('user_id', 'users.first_name')
            ->get();
        return response()->json(['status' => 'success', 'calls' => $calls]);
    }


    protected function freeData($request)
    {
        $daterange = json_decode($request->dateRange);
        if (!is_array($daterange) || count($daterange) < 2) {
            return response()->json(['status' => 'error', 'message' => 'Invalid date range provided'], 400);
        }
        // $startDate = Carbon::parse($daterange[0])->startOfDay();
        // $endDate = Carbon::parse($daterange[1])->endOfDay();
        $query = Lead::join('users', 'users.id', '=', 'leads.user_id')
            ->whereBetween('leads.free_trial', [$daterange[0],$daterange[1]]);
        if ($request->filterEmployee !== "all") {
            $query->where('users.status', $request->filterEmployee);
        }
        $freeTrials = $query->select('user_id', 'users.first_name', DB::raw('count(*) as total_calls'))
            ->groupBy('user_id', 'users.first_name')
            ->get();
        return response()->json(['status' => 'success', 'freeTrials' => $freeTrials]);
    }


    protected function followUpData($request)
    {
        $daterange = json_decode($request->dateRange);
        if (!is_array($daterange) || count($daterange) < 2) {
            return response()->json(['status' => 'error', 'message' => 'Invalid date range provided'], 400);
        }
        // $startDate = Carbon::parse($daterange[0])->startOfDay();
        // $endDate = Carbon::parse($daterange[1])->endOfDay();
        
        // return  $endDate;
        $query = Lead::join('users', 'users.id', '=', 'leads.user_id')
            ->whereBetween('leads.followup', [$daterange[0],$daterange[1]]);
        if ($request->filterEmployee !== "all") {
            $query->where('users.status', $request->filterEmployee);
        }
        $freeTrials = $query->select('user_id', 'users.first_name', DB::raw('count(*) as total_calls'))
            ->groupBy('user_id', 'users.first_name')
            ->get();
        return response()->json(['status' => 'success', 'freeTrials' => $freeTrials]);
    }
}
