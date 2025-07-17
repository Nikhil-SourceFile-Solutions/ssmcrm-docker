<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Campaign\AppOneCampaign;
use App\Models\Company\Campaign\SmsCampaign;
use App\Models\Company\Campaign\SmsCampaignUpdate;
use App\Models\Company\Campaign\WhatsappCampaign;
use App\Models\Company\Lead;
use App\Models\Company\Report;
use App\Models\Company\Sale;
use App\Models\Company\SecurityOtp;
use App\Models\Company\Settings\AuthPhone;
use App\Models\Company\Settings\Dropdown;
use App\Models\Company\Settings\WhatsappConfig;
use App\Models\Company\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;


class ReportController extends Controller
{
    public function index(Request $request)
    {

        $pageSize = request()->get('size', 5);
        $currentPage = request()->get('page', 1);
        $offset = ($currentPage - 1) * $pageSize;

        $query  = Report::join('users', 'users.id', 'reports.user_id')
            ->select('users.first_name', 'users.last_name', 'reports.*');

        $totalItems = $query->count();

        $query->latest('reports.created_at')->offset($offset)->limit($pageSize);

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

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function dataForGenerateReport()
    {
        $leadstatus = Dropdown::where([['type', 'Lead Status'], ['status', true]])->pluck('value')->toArray();
        $states = Dropdown::where([['type', 'State'], ['status', true]])->pluck('value')->toArray();
        $employees = User::select('id', 'first_name', 'last_name', 'user_type')->get();
        array_unshift($leadstatus, 'All');
        $salestatus = ['All', 'Pending', 'Approved', 'Expired', 'Paused', 'Verified'];
        return response()->json([
            'status' => 'success',
            'data' => [
                'leadstatus' => $leadstatus,
                'salestatus' => $salestatus,
                'states' => $states,
                'employees' => $employees
            ]
        ]);
    }


    public function dataForDownloadReport(Request $request)
    {

        return response()->json([
            'status' => 'success',
            'phones' => AuthPhone::first(),
            'selectFields' => $request->type  == "Sales" ? $this->salesFields() : $this->leadsFields(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type'        => 'required|string',
            'status'      => 'required|string',
            'date_range'  => 'required|string',
            'report_name' => 'required|string',
            'employee_id' => 'nullable|integer',
            'state'       => 'nullable|string'
        ]);

        $daterange = json_decode($validated['date_range']);

        if (count($daterange) && count($daterange) != 2) throw ValidationException::withMessages([
            'date_range' => ['Invalid Date Range'],
        ]);

        $validated['user_id'] = auth()->user()->id;

        $a = $this->generateReport($validated);

        return $a;

        if (!$a) return response()->json(['status' => 'error', 'message' => 'No Data Found!']);

        $validated['file'] = $a;

        $created = Report::create($validated);

        if ($created) {
            return response()->json(['status' => 'success', 'message' => 'Report Generated Successfully']);
        }

        return response()->json(['status' => 'error', 'message' => 'Failed to generate report']);
    }

    public function handleOTP(Request $request)
    {
        if ($request->action === "otp") {
            $validated = $request->validate([
                'record_id' => 'required|integer',
                'recive_otp' => 'required|string'
            ]);

            $authPhone = AuthPhone::first();
            if (!$authPhone) {
                return response()->json(['status' => 'error', 'message' => 'Auth Phones Not Found']);
            }

            $phone = $this->getPhoneByMethod($validated['recive_otp'], $authPhone);
            if (!$phone) {
                return response()->json(['status' => 'error', 'message' => 'Phone number not found for selected method']);
            }

            $response = $this->sendOTP($phone, $validated['recive_otp']);
            if (!$response) {
                return response()->json(['status' => 'error', 'message' => 'Failed to Send OTP']);
            }

            $otpData = [
                'record_id' => $validated['record_id'],
                'phone' => $phone,
                'user_id' => auth()->user()->id,
                'action' => 'Report',
                'otp' => 123456
                // 'otp' => random_int(100000, 999999)
            ];

            $otp = SecurityOtp::whereDate('created_at', now()->today())
                ->where([
                    ['user_id', auth()->user()->id],
                    ['action', 'Report'],
                    ['record_id', $otpData['record_id']],
                    ['phone', $otpData['phone']],
                    ['status', false]
                ])->first();

            if (!$otp) {
                $otp = SecurityOtp::create($otpData);
            }

            return response()->json(['status' => 'success', 'message' => 'OTP sent to your registered phone', 'action' => 'verify']);
        }

        if ($request->action === "verify") {

            $validated = $request->validate([
                'record_id' => 'required|integer',
                'recive_otp' => 'required|string',
                'otp' => 'required|digits:6'
            ]);

            $authPhone = AuthPhone::first();
            if (!$authPhone) {
                return response()->json(['status' => 'error', 'message' => 'Auth Phones Not Found']);
            }

            $phone = $this->getPhoneByMethod($validated['recive_otp'], $authPhone);
            if (!$phone) {
                return response()->json(['status' => 'error', 'message' => 'Phone number not found for selected method']);
            }

            $otp = SecurityOtp::whereDate('created_at', now()->today())
                ->where([
                    ['user_id', auth()->user()->id],
                    ['action', 'Report'],
                    ['record_id', $validated['record_id']],
                    ['phone', $phone],
                    ['status', false]
                ])->latest()->first();



            if (!$otp) {
                return response()->json(['status' => 'error', 'message' => 'Invalid OTP or attempt']);
            }

            if ($otp->otp != $validated['otp']) {
                throw ValidationException::withMessages(['otp' => ['Invalid OTP']]);
            }

            $otp->status = true;
            $otp->save();

            $report = Report::find($validated['record_id']);
            if (!$report) {
                return response()->json(['status' => 'error', 'message' => 'Report not found']);
            }

            // $fileUrl = route('report-download-file', ['id' => $report->id]);



            return response()->json([
                'status' => 'success',
                'action' => 'selectFields',
                'selectFields' => $report->type == "Sales" ? $this->salesFields() : $this->leadsFields(),
                // 'fileUrl' => $fileUrl
            ]);
        }

        return response()->json(['status' => 'error', 'message' => 'Invalid action']);
    }

    protected function salesFields()
    {
        return [
            'Sale Id',
            'Lead Id',
            'Email',
            'Phone',
            'Second Phone',
            'Status',
            'State',
            'Start Date',
            'Bank',
            'Client Type',
            'Sale Service',
            'Sale Date',
            'Product',
            'Product Duration',
            'Product Price',
            'Due Date',
            'Custom Price or Not',
            'Sale Price',
            'Offer Price',
            'Inclusive GST',
            'GST',
            'Agreement Status',
            'Created At',
            'Client Paid',
            'Client Name',
            'Owner Name',
        ];
    }

    protected function leadsFields()
    {
        return [
            'Lead Id',
            'Lead Name',
            'Email',
            'Phone',
            'Second Phone',
            'Lead Status',
            'Investment',
            'Free Trial',
            'Followup',
            'Source',
            'DND',
            'City',
            'State',
            'Products',
            'Lot Size',

            'Riskprofile Status',
            'Called',
            'Moved At',
            'Created At',
            'Owner Name'
        ];
    }

    protected function getPhoneByMethod(string $method, AuthPhone $authPhone): ?string
    {
        return $method === 'whatsapp' ? $authPhone->whatsapp_phone : ($method === 'sms' ? $authPhone->sms_phone : null);
    }

    public function sendOTP($phone, $recive_otp)
    {
        return true;
    }

    public function downloadFile($id)
    {

        $report = Report::find($id);

        // return $report->file;
        return Storage::download($report->file);
    }


    public function sendDownloadOtp($request)
    {

        $validated = $request->validate([
            'phone' => 'required|digits:10',
            'record_id' => 'required|integer'
        ]);

        $validated['user_id'] = auth()->user()->id;
        $validated['action'] = 'Report';

        // $validated['otp'] = random_int(100000, 999999);
        $validated['otp'] = 123456;

        $otp = SecurityOtp::whereDate('created_at', now()->today())
            ->where([
                ['user_id', auth()->user()->id],
                ['action', $validated['action']],
                ['record_id', $validated['record_id']],
                ['phone', $validated['phone']]
            ])->first();

        if (!$otp) $otp = SecurityOtp::create($validated);

        // return $this->sendOtp($validated['phone'], $otp->otp);
    }



    protected function generateReport($validated)
    {

        $fromDate = null;
        $toDate = null;
        $daterange = json_decode($validated['date_range'], true);

        if (!empty($daterange) && count($daterange) == 2) {
            $fromDate = \Carbon\Carbon::parse($daterange[0])->startOfDay();
            $toDate = \Carbon\Carbon::parse($daterange[1])->endOfDay();
        }

        if ($validated['type'] == "Sales") {
            $report = $this->generateSaleReport($fromDate, $toDate, $validated['status'], $validated['employee_id'], $validated['state']);
        } else if ($validated['type'] == "Leads") {
            $report = $this->generateLeadReport($fromDate, $toDate, $validated['status'], $validated['employee_id'], $validated['state']);
        }

        if (!$report) return response()->json(['status' => 'error', 'message' => 'No Data Found!']);
        $fileName = $this->generateCsv($report[0], $validated['type'], $report[1]);

        // return $report[0];
        if ($fileName) {
            $generated = Report::create([
                'user_id' => auth()->user()->id,
                'type' => $validated['type'],
                'status' => $validated['status'],
                'date_range' => $validated['date_range'],
                'report_name' => $validated['report_name'],
                'file' => $fileName
            ]);

            if ($generated) {
                return response()->json(['status' => 'success', 'message' => 'Report Added Successfully!']);
            }

            return response()->json(['status' => 'error', 'message' => 'Failed to add report.']);
        }
    }



    protected function generateSaleReport($fromDate, $toDate, $status, $user_id, $state)
    {

        $data = Sale::join('users', 'users.id', 'sales.user_id')
            ->join('leads', 'leads.id', 'sales.lead_id')
            ->join('banks', 'banks.id', 'sales.bank')
            ->select(
                'sales.*',
                'leads.first_name',
                'leads.last_name',
                'leads.phone',
                'leads.email',
                'leads.second_phone',
                'leads.state',
                'users.first_name as owner_first_name',
                'users.last_name as owner_last_name',
                'bank_name',
                'account_number',
                'upi',
                'is_bank_upi'
            );

        if ($user_id) $data->where('sales.user_id', $user_id);

        if ($state) $data->where('state', $state);

        if ($fromDate && $toDate) {
            $data->whereBetween('sales.created_at', [$fromDate, $toDate]);
        }

        if ($status != "All") {
            $data->where('sales.status', $status);
        }

        $data = $data->latest('sales.created_at')->get();

        if ($data->isEmpty()) {
            return 0;
        }

        return [array_keys($data->first()->toArray()), $data];
    }

    protected function generateLeadReport($fromDate, $toDate, $status, $user_id, $state)
    {
        $data = Lead::join('users', 'users.id', 'leads.user_id')
            ->select(
                'leads.*',
                'users.first_name as owner_first_name',
                'users.last_name as owner_last_name',
            );

        if ($user_id) $data->where('user_id', $user_id);

        if ($state) $data->where('state', $state);

        if ($fromDate && $toDate) {
            $data->whereBetween('leads.created_at', [$fromDate, $toDate]);
        }

        if ($status != "All") {
            $data->where('leads.status', $status);
        }

        $data = $data->latest('leads.created_at')->get();

        if ($data->isEmpty()) {
            return 0;
        }

        return [array_keys($data->first()->toArray()), $data];
    }

    protected function generateCsv($h, $type, $data)
    {
        $cc = '';
        $fh = fopen('php://temp', 'r+');
        fputcsv($fh, $h);
        foreach ($data as $d) {
            fputcsv($fh, $d->toArray());
        }
        rewind($fh);
        $cc = stream_get_contents($fh);
        fclose($fh);
        $fn = 'reports/' . time() . '-' . $type . '.csv';
        Storage::put($fn, $cc);

        return  $fn;
    }

    public function sms()
    {
        $dataCollection  = SmsCampaign::join('sms_templates', 'sms_templates.id', 'sms_campaigns.template_id')
            ->where('campaign_name', 'like', '%' . request()->get('search', '') . '%')
            ->select('sms_campaigns.*', 'sender_id', 'template_name')
            ->latest('sms_campaigns.created_at')->get();
        $perPage = request()->get('size', 5);
        $currentPage = request()->get('page', 1);
        $totalItems = $dataCollection->count();
        $from = ($currentPage - 1) * $perPage + 1;
        $to = min($currentPage * $perPage, $totalItems);
        $itemsForCurrentPage = $dataCollection->slice($from - 1, $perPage)->values();


        foreach ($itemsForCurrentPage as $i) {
            $i->updates = SmsCampaignUpdate::where('sms_campaign_id', $i->id)->get();
        }

        return response()->json(['status' => 'success', 'data' => [
            $itemsForCurrentPage,
            $currentPage,
            $totalItems,
            $from,
            $to,
        ]]);
    }

    //   public function viewSms($id)
    // {
    //     return 123;
    //     $a = SmsCampaign::find($id);
    //     $d = [];
    //     $b = json_decode($a->response);

    //     $perPage = request()->get('size', 2);
    //     $currentPage = request()->get('page', 1);
    //     $totalItems = count($b);
    //     $from = ($currentPage - 1) * $perPage + 1;
    //     $to = min($currentPage * $perPage, $totalItems);
    //     $itemsForCurrentPage = array_values(array_slice($b, $from - 1, $to));


    //     foreach ($itemsForCurrentPage as $c) {
    //         $response = Http::withHeaders([
    //             'Content-Type' => 'application/json',
    //         ])->get("http://smartsms.sourcefilesolutions.com/api/v2/MessageStatus?ApiKey=JFIWEJf3GHghrai/rkmssjzEoU3cX33UZem6LbXZacY=&ClientId=aac8a1f5-d943-464e-9586-00e8f359485c&MessageId=$c->MessageId");
    //         $s = [...$response["Data"], 'template' => $a->template];
    //         array_push($d, $s);
    //     }



    //     return response()->json(['status' => 'success', 'data' => [
    //         // $d,
    //         // $currentPage,
    //         // $totalItems,
    //         // $from,
    //         // $to,
    //         'data' =>$d,
    //         'currentPage' => $currentPage,
    //         // 'pageSize' => $pageSize,
    //         'totalItems' => $totalItems,
    //         'from' => $from,
    //         'to' => $to
    //     ]]);
    // }


    public function whatsapp()
    {
        $dataCollection  = WhatsappCampaign::whereDate('created_at', now()->today())
            ->where('campaign_name', 'like', '%' . request()->get('search', '') . '%')->latest()->get();
        $perPage = request()->get('size', 5);
        $currentPage = request()->get('page', 1);
        $totalItems = $dataCollection->count();
        $from = ($currentPage - 1) * $perPage + 1;
        $to = min($currentPage * $perPage, $totalItems);
        $itemsForCurrentPage = $dataCollection->slice($from - 1, $perPage)->values();




        return response()->json(['status' => 'success', 'data' => [
            $itemsForCurrentPage,
            $currentPage,
            $totalItems,
            $from,
            $to,
        ]]);
    }

    public function application(Request $request)
    {
        $pageSize = $request->get('pageSize', 10);
        $currentPage = $request->get('page', 1);
        $offset = ($currentPage - 1) * $pageSize;
        $search = $request->get('search', '');
        $query = AppOneCampaign::latest('created_at');
        if (!empty($search)) {
            $query->where('campaign_name', 'LIKE', '%' . $search . '%');
        }

        $totalItems = $query->count();
        $data = $query->offset($offset)->limit($pageSize)->get();
        $from = $offset + 1;
        $to = min($offset + $pageSize, $totalItems);

        return response()->json([
            'status' => 'success',
            'data' => [
                'data' => $data,
                'currentPage' => $currentPage,
                'pageSize' => $pageSize,
                'totalItems' => $totalItems,
                'from' => $from,
                'to' => $to,
            ],
        ]);
    }




    public function viewSms($id)
    {



        $a = SmsCampaign::find($id);
        $d = [];
        $b = json_decode($a->response);



        $perPage = request()->get('size', 2);
        $currentPage = request()->get('page', 1);
        $totalItems = count($b);
        $from = ($currentPage - 1) * $perPage + 1;
        $to = min($currentPage * $perPage, $totalItems);
        $itemsForCurrentPage = array_values(array_slice($b, $from - 1, $to));


        foreach ($itemsForCurrentPage as $c) {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->get("http://smartsms.sourcefilesolutions.com/api/v2/MessageStatus?ApiKey=JFIWEJf3GHghrai/rkmssjzEoU3cX33UZem6LbXZacY=&ClientId=aac8a1f5-d943-464e-9586-00e8f359485c&MessageId=$c->MessageId");
            $s = [...$response["Data"], 'template' => $a->template];
            array_push($d, $s);
        }



        return response()->json(['status' => 'success', 'data' => [
            // $d,
            // $currentPage,
            // $totalItems,
            // $from,
            // $to,
            'data' => $d,
            'currentPage' => $currentPage,
            // 'pageSize' => $pageSize,
            'totalItems' => $totalItems,
            'from' => $from,
            'to' => $to
        ]]);
    }


    public function viewWhatsapp($id)
    {

        $whatsapp_config = WhatsappConfig::first();
        if (!$whatsapp_config) return [0, 'message' => 'Whatsapp Config not found'];

        $a = WhatsappCampaign::find($id);
        $d = [];
        $b = json_decode($a->response);

        // return $b;

        $perPage = request()->get('size', 5);
        $currentPage = request()->get('page', 1);
        $totalItems = count($b);
        $from = ($currentPage - 1) * $perPage + 1;
        $to = min($currentPage * $perPage, $totalItems);
        $itemsForCurrentPage = array_values(array_slice($b, $from - 1, $to));




        foreach ($itemsForCurrentPage as $c) {
            $data = [
                'id' => ['wamid.HBgMOTE5NjAwNDAwOTQzFQIAERgSOEZEQUFBNkM4QUFEMDU5QzJFAA==']
            ];

            // Build the query string from the data
            $queryString = http_build_query($data, '', '&', PHP_QUERY_RFC3986);

            // Append the query string to the URL
            $urlWithQuery = $whatsapp_config->get_message . '?' . $queryString;


            // $response = Http::withHeaders([
            //     'Content-Type' => 'application/json',
            //     'token' => $whatsapp_config->token
            // ])->get($urlWithQuery);



            try {
                $response = Http::withHeaders([
                    'token' => 'Q3JlYXRlWW91ck93bl5zb3VyY2VmaWxlIA==',
                ])->get('https://spacesms.sourcefilesolutions.com/getmessage', [
                    'id' => ['wamid.HBgMOTE5NjU2Njc2NDY2FQIAERgSQkU2RDU3NDQ4RDdGNjlCMTg4AA==']
                ]);

                return $response;
            } catch (\Exception $e) {
                // Log the exception message
                Log::error('Request failed: ' . $e->getMessage());
                // Return a friendly error message
                return response()->json(['error' => 'Request failed'], 500);
            }
            // dd($response);
            // return $response;
            // $s = [...$response["Data"], 'template' => $a->template];
            // array_push($d, $s);
        }
        // return $item;
        return response()->json(['status' => 'success', 'data' => [
            $itemsForCurrentPage,
            $currentPage,
            $totalItems,
            $from,
            $to,
        ]]);
    }


    public function destroy($id)
    {
        $report = Report::find($id);

        if (!$report) return response()->json(['status' => 'error', 'message' => 'Report Not Found!']);

        if ($report->delete()) return response()->json(['status' => 'success', 'message' => 'Report Deleted successfully!']);

        return response()->json(['status' => 'error', 'message' => 'Failed to Delete Report']);
    }
}
