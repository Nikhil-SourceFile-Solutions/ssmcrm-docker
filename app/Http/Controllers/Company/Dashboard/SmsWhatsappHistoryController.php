<?php

namespace App\Http\Controllers\Company\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Company\SendLinkResponse;
use App\Models\Company\Settings\SmsConfig;
use App\Models\Company\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Js;

class SmsWhatsappHistoryController extends Controller
{
    public function index()
    {

        $users = User::whereIn('user_type', ['Admin', 'Branch Admin', 'Manager', 'Team Leader', 'BDE'])->select('id', 'first_name', 'last_name', 'status')->get();

        return response()->json(['status' => 'success', 'employees' => $users]);
    }


    public function reports(Request $request)
    {
        $pageSize = $request->get('pageSize', 10);
        $currentPage = $request->get('page', 1);
        $offset = ($currentPage - 1) * $pageSize;
        $dateRange = $request->get('dateRange', 0);

        $field = $request->field;

        $action = $request->action;
        $query = DB::table('send_link_responses')
            ->leftJoin('users', 'users.id', 'send_link_responses.user_id')
            ->leftJoin('leads', 'leads.id', 'send_link_responses.lead_id');

        if ($action) $query->where('platform', $action);

        if ($field) $query->where('action', $field);

        if ($request->user_id) $query->where('send_link_responses.user_id', $request->user_id);

        if ($request->search) $query->where('leads.phone', 'LIKE', '%' . $request->search . '%');

        if ($dateRange) {
            $daterange = json_decode($dateRange);
            $query->whereBetween('send_link_responses.created_at', [Carbon::parse($daterange[0])->startOfDay(), Carbon::parse($daterange[1])->endOfDay()]);
        }
        $query->select(
            'send_link_responses.*',
            DB::raw("CONCAT(users.first_name, IF(users.last_name IS NOT NULL, CONCAT(' ', users.last_name), '')) as owner"),
            DB::raw("CONCAT(leads.first_name, IF(leads.last_name IS NOT NULL, CONCAT(' ', leads.last_name), '')) as lead"),
        );
        $totalItems = $query->count();
        $query->latest('send_link_responses.id')->offset($offset)->limit($pageSize);
        $from = $offset + 1;
        $to = min($offset + $pageSize, $totalItems);
        $data = $query->GET();
        $data = [
            'data' => $data,
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


    public function check(Request $request)
    {
        $linkResponse = SendLinkResponse::find($request->id);

        if (!$linkResponse) return response()->json(['status' => 'error', 'message' => 'Not Found']);

        $data = json_decode($linkResponse->response);

        $smsSettings = SmsConfig::first();

        if (isset($data->Data)) {

            $MessageId = $data->Data[0]->MessageId;
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->get("$smsSettings->get_api_url?ApiKey=$smsSettings->api_key&ClientId=$smsSettings->client_id&MessageId=$MessageId");

            if ($response->successful()) {
                $linkResponse->status_response = $response["Data"];
                $linkResponse->status = $response["Data"]['Status'];
                $linkResponse->save();
                return response()->json(['status' => 'success', 'response' => json_encode($response["Data"])]);
            } else {
                return response()->json(['status' => 'error', 'response' => json_encode($response->json())]);
            }
        } else {

            $messageId = $data->{'message-id'}[0];
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->get($smsSettings->api_url, [
                'username' => $smsSettings->sms_user_name,
                'apikey' => $smsSettings->api_key,
                'apirequest' => "DeliveryReport",
                'messageid' => $messageId,
                'format' => 'JSON',
            ]);

            $a = json_decode($response);
            if ($response->successful()) {
                $linkResponse->status_response =   json_encode($response->json());
                $linkResponse->status = $a->stat;
                $linkResponse->save();
                return response()->json(['status' => 'success', 'response' =>  $response->json()]);
            } else {
                return response()->json(['status' => 'error', 'response' => $response->json()]);
            }
        }
    }
}
