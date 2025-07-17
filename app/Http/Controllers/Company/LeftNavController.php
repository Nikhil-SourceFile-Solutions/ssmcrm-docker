<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Fileinfo;
use App\Models\Company\LeadRequest;
use App\Models\Company\LeadStatus;
use App\Models\Company\ReferLead;
use App\Models\Company\Sale;
use App\Models\Company\Settings\Setting;
use App\Models\Company\TransferLead;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeftNavController extends Controller
{
    public function index(Request $request)
    {
        return match ($request->action) {
            'lead-upload' => $this->leadUpload(),
            'recent-activity' => $this->recentActivity(),
            'month-sale' => $this->monthSale(),
            'calls-details' => $this->callsDetails(),
            'sales-details' => $this->salesDetails(),
            'refer-client' => $this->referClientDetails(),
            'transfer-clients' => $this->transferClientDetails(),
            'lead-request' => $this->leadRequests(),
            default => $this->error(),
        };
    }


    protected function leadUpload()
    {
        $files = Fileinfo::latest()->take(10)->get();
        return response()->json(['status' => 'success', 'data' => $files, 'action' => 'lead-upload']);
    }

    protected function recentActivity()
    {
        $data = [
            ['activitiy' => 'Updated Server Logs', 'created_at' => 'just now'],
            ['activitiy' => 'Send Mail to HR and Admin', 'created_at' => '20 sec ago'],
            ['activitiy' => 'Backup Files EOD', 'created_at' => '3 min ago'],
            ['activitiy' => 'Collect documents from Sara', 'created_at' => '20 min ago'],
            ['activitiy' => 'Conference call with Marketing Manager.', 'created_at' => '30 min ago'],
            ['activitiy' => 'Rebooted Server', 'created_at' => '1 hour ago'],
        ];
        return response()->json(['status' => 'success', 'data' => $data, 'action' => 'recent-activity']);
    }

    protected function monthSale()
    {


        $settings = Setting::first();

        $latestDate = DB::table('sales')
            ->select(DB::raw('MAX(sale_date) as latest_date'))
            ->pluck('latest_date')
            ->first();

        if (auth()->user()->user_type == "Admin") {
            $salesByMonth = Sale::whereNot('status', 'Pending')
                ->whereBetween('sale_date', [
                    Carbon::parse($latestDate)->subMonths(5)->startOfMonth(),
                    Carbon::parse($latestDate)->endOfMonth()
                ])


                ->select(DB::raw('YEAR(sale_date) as year'), DB::raw('MONTH(sale_date) as month'), $settings->gst_enabled ? DB::raw('SUM(inclusive_gst) as amount') : DB::raw('SUM(client_paid) as amount'))
                ->groupBy(DB::raw('YEAR(sale_date)'), DB::raw('MONTH(sale_date)'))
                ->orderBy(DB::raw('YEAR(sale_date)'))
                ->orderBy(DB::raw('MONTH(sale_date)'))
                ->get();
            $data =  $salesByMonth->map(function ($item) {
                $monthYear = Carbon::create($item['year'], $item['month'], 1);
                $month = $monthYear->format('F Y');
                return [
                    'month' => $month,
                    'amount' => number_format($item['amount'] ?? 0, 2),
                ];
            });
        } else {
            $salesByMonth = Sale::where('user_id', auth()->user()->id)
                ->whereNot('status', 'Pending')
                ->whereBetween('sale_date', [
                    Carbon::parse($latestDate)->subMonths(5)->startOfMonth(),
                    Carbon::parse($latestDate)->endOfMonth()
                ])
                ->select(DB::raw('YEAR(sale_date) as year'), DB::raw('MONTH(sale_date) as month'), $settings->gst_enabled ? DB::raw('SUM(inclusive_gst) as amount') : DB::raw('SUM(client_paid) as amount'))
                ->groupBy(DB::raw('YEAR(sale_date)'), DB::raw('MONTH(sale_date)'))
                ->orderBy(DB::raw('YEAR(sale_date)'))
                ->orderBy(DB::raw('MONTH(sale_date)'))
                ->get();
            $data =  $salesByMonth->map(function ($item) {
                $monthYear = Carbon::create($item['year'], $item['month'], 1);
                $month = $monthYear->format('F Y');
                return [
                    'month' => $month,
                    'amount' => number_format($item['amount'] ?? 0, 2),
                ];
            });
        }
        return response()->json(['status' => 'success', 'data' => $data, 'action' => 'month-sale']);
    }

    protected function callsDetails()
    {

        if (auth()->user()->user_type == "Admin") {
            $ct = LeadStatus::whereDate('created_at', now()->today())->where('is_status_changed', true)->count();
            $cm = LeadStatus::whereYear('created_at', now()->year)->whereMonth('created_at', now()->month)->where('is_status_changed', true)->count();
            $ftcd  = LeadStatus::whereDate('created_at', now()->today())->where([['is_status_changed', true], ['status', 'Free Trial']])->count();
            $ftcm = LeadStatus::whereYear('created_at', now()->year)->whereMonth('created_at', now()->month)->where([['is_status_changed', true], ['status', 'Free Trial']])->count();
            $fucd   = LeadStatus::whereDate('created_at', now()->today())->where([['is_status_changed', true], ['status', 'Follow Up']])->count();
            $fucm = LeadStatus::whereYear('created_at', now()->year)->whereMonth('created_at', now()->month)->where([['is_status_changed', true], ['status', 'Follow Up']])->count();
        } else {
            $ct = LeadStatus::whereDate('created_at', now()->today())->where([['is_status_changed', true], ['user_id', auth()->user()->id]])->count();
            $cm = LeadStatus::whereYear('created_at', now()->year)->whereMonth('created_at', now()->month)->where([['is_status_changed', true], ['user_id', auth()->user()->id]])->count();
            $ftcd  = LeadStatus::whereDate('created_at', now()->today())->where([['is_status_changed', true], ['status', 'Free Trial'], ['user_id', auth()->user()->id]])->count();
            $ftcm = LeadStatus::whereYear('created_at', now()->year)->whereMonth('created_at', now()->month)->where([['is_status_changed', true], ['status', 'Free Trial'], ['user_id', auth()->user()->id]])->count();
            $fucd   = LeadStatus::whereDate('created_at', now()->today())->where([['is_status_changed', true], ['status', 'Follow Up'], ['user_id', auth()->user()->id]])->count();
            $fucm = LeadStatus::whereYear('created_at', now()->year)->whereMonth('created_at', now()->month)->where([['is_status_changed', true], ['status', 'Follow Up'], ['user_id', auth()->user()->id]])->count();
        }
        $data = [
            'calls' => ['daily' => $ct, 'monthly' =>  $cm],
            'freeTrail' => ['daily' => $ftcd, 'monthly' => $ftcm],
            'followUp' => ['daily' => $fucd, 'monthly' => $fucm]
        ];
        return response()->json(['status' => 'success', 'data' => $data, 'action' => 'calls-details']);
    }



  protected function salesDetails()
    {
        $settings = Setting::first();
        $query = Sale::join('users', 'users.id', 'sales.user_id')
            ->whereDate('sales.created_at', now()->today())
            ->select(
                DB::raw("CONCAT(users.first_name, ' ', COALESCE(users.last_name, '')) AS name"),
                'sales.status',
                $settings->gst_enabled ? DB::raw('SUM(inclusive_gst) as amount') : DB::raw('SUM(client_paid) as amount')
            );

        if (auth()->user()->user_type != "Admin") {
            $query->where('user_id', auth()->user()->id);
        }

        $salesByUser = $query->groupBy('name', 'sales.status')->get();

        return response()->json(['status' => 'success', 'data' => $salesByUser, 'action' => 'sales-details']);
    }
    protected function transferClientDetails()
    {
        // $tranfser = [
        //     ['name' => 'Albin', 'amount' => '250125', 'status' => 'Pending'],
        //     ['name' => 'Roshan', 'amount' => '584598', 'status' => 'Pending'],
        //     ['name' => 'Jinto', 'amount' => '852147', 'status' => 'Pending'],
        //     ['name' => 'Sachin', 'amount' => '102587', 'status' => 'Pending'],
        //     ['name' => 'Pranav', 'amount' => '897456', 'status' => 'Pending'],
        // ];

        $tranfser = TransferLead::join('users', 'users.id', 'transfer_leads.from_id')
            ->join('leads', 'leads.id', 'transfer_leads.lead_id')
            ->select('leads.*', 'users.first_name as owner', 'transfer_leads.id as transfer_lead_id')
            ->where('is_approved', false)
            // ->where('to_id', auth()->user()->id,'is_approved','false')
            ->latest('transfer_leads.created_at')
            ->get();

        return response()->json(['status' => 'success', 'data' => $tranfser, 'action' => 'transfer-clients']);
    }

    protected function referClientDetails()
    {
        $refers = ReferLead::join('users', 'users.id', 'refer_leads.from_id')
            ->join('leads', 'leads.id', 'refer_leads.lead_id')
            ->select(
                'users.first_name as owner',
                'leads.*',
                'leads.first_name as client',
                'refer_leads.id',
                'refer_leads.created_at'
            )
            ->where('to_id', auth()->user()->id)->latest('refer_leads.created_at')->get();
        return response()->json(['status' => 'success', 'data' => $refers, 'action' => 'refer-client']);
    }

    protected function leadRequests()
    {
        $data = LeadRequest::join('users', 'users.id', 'lead_requests.user_id')
            ->where('lead_requests.status', false)
            ->select('lead_requests.id', 'first_name', 'last_name', 'lead_requests.state', 'count')
            ->get();

        return response()->json(['status' => 'success', 'data' => $data, 'action' => 'lead-request']);
    }

    protected function error()
    {
        return response()->json(['status' => 'error', 'message' => 'Unsupported']);
    }
}
