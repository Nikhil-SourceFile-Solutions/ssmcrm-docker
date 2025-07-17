<?php

namespace App\Http\Controllers\Company\Campaign;

use App\Http\Controllers\Controller;
use App\Models\Company\Campaign\ApplicationCampaign;
use App\Models\Company\Campaign\ApplicationCampaignLead;
use App\Models\Company\Campaign\ApplicationCampaignUpdate;
use App\Models\Company\Lead;
use App\Models\Company\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;


class ApplicationCampaignController extends Controller
{

    public function index(Request $request)
    {

        if ($request->filterType) {
            $application = ApplicationCampaign::where('type', $request->filterType)
            ->where('script_name', 'like', '%' . $request->search . '%')
            ->whereDate('created_at', now()->today())->latest('updated_at')
            ->paginate($request->pageSize);
            foreach ($application as $app) {
                $app->updates = ApplicationCampaignUpdate::where('application_campaign_id', $app->id)->latest()
                ->paginate($request->pageSize);
            }

        } else {
            $application = ApplicationCampaign::where('script_name', 'like', '%' . $request->search . '%')->whereDate('created_at', now()->today())->latest('updated_at')
            ->paginate($request->pageSize);
            foreach ($application as $app) {
                $app->updates = ApplicationCampaignUpdate::where('application_campaign_id', $app->id)->latest()
                ->paginate($request->pageSize);
            }

        }

        return response()->json([
            'status' => 'success',
            'application' => $application
        ]);
    }

    public function getAllindex(Request $request)
    {
        $pageSize =$request->size;
        $currentPage =$request->page;
        $search =$request->search;
        $daterange = json_decode(request()->get('dateRange'));

        $fromDate = \Carbon\Carbon::parse($daterange[0])->startOfDay();
        $toDate = \Carbon\Carbon::parse($daterange[1])->endOfDay();

        $query = DB::table('application_campaigns')

        ->where('script_name', 'like', '%' .$search . '%')
        ->whereBetween('created_at', [$fromDate, $toDate]) ;
        $totalItems =  $query->count();
        $offset = ($currentPage - 1) * $pageSize;
        $query->latest('created_at')->offset($offset)->limit($pageSize);
        $from = $offset + 1;
        $to = min($offset + $pageSize, $totalItems);
        $datas=$query->GET();
        foreach ($datas as $data){
            $data->updates = ApplicationCampaignUpdate::where('application_campaign_id', $data->id)->latest()->get();
        }
        $data = [
            'data' => $datas,
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


    public function storeapplication(Request $request)
    {
        $validated = $request->validate([
            'script_name' => 'required|string',
            'price_range' => 'required|string',
            'action' => 'required|string',
            'stoploss' => 'required|string',
            'target_one' => 'required|string',
            'target_two' => 'required|string',
            'sales' => 'required|string',
        ]);
        $created = ApplicationCampaign::create($validated);
        $sales = is_array($validated) ? json_decode($validated['sales']) : json_decode($validated->sales);
        $leadsIds = Sale::whereIn('id', $sales)->pluck('lead_id')->toArray();
        $fcmTokens = Lead::whereNotNull('fcm_token')->whereIn('id', $leadsIds)->pluck('fcm_token')->toArray();
        if ($created) {
            $created->save();
                // return response()->json(['message' => 'Notification Sent Successfully', 'status' => 'success', 'title' => 'Created!']);

          $response = $this->sendNotification($created);
            
            info( $response);

            if (is_array($response) && isset($response[0]) && $response[0]) {
                $created->response = $response[1] ?? 'Response not set';
                $created->save();
                return response()->json(['message' => 'Notification Sent Successfully', 'status' => 'success', 'title' => 'Created!']);
            } else {
                $created->delete();
                return response()->json(['message' => $response[1] ?? 'Notification failed', 'status' => 'error']);
            }
        }

        return response()->json(['message' => 'Failed', 'status' => 'error']);
    }



    protected function sendNotification($validated)
    {
        // return $validated;

        $sales = json_decode($validated->sales);
        $leadsIds = Sale::whereIn('id', $sales)->pluck('lead_id')->toArray();
        $data=[];
       foreach ($leadsIds as $lead_id){
        array_push($data, [
            'lead_id'=>$lead_id,
            'application_campaign_id'=>$validated->id,
            'created_at'=>now()
        ]);

       }
       ApplicationCampaignLead::insert($data);
        $fcmTokens = Lead::whereNotNull('fcm_token')->whereIn('id', $leadsIds)->pluck('fcm_token')->toArray();
        if (!count($fcmTokens)) return response()->json(['status' => 'error', 'message' => 'No App User']);
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post('https://api.expo.dev/v2/push/send', [
            'to' => $fcmTokens,
            'title' => 'Growthlift Investment Advisories',
            'body' => 'Instrument Name:' . $validated->script_name .' '. ' Action: ' .' '.  $validated->action,
            'subtitle'=>"Heiiiii",
            "data" =>  ["action" => "new-call"]
        ]);


        if ($response->successful()) {
            return [1, $response->json()];
        }

        return [0, $response->json()];
    }


    public function existCall(Request $request)
    {
        $validated = $request->validate([
            'exist_message' => 'required|string|max:255',
            'id' => 'required|integer'
        ]);
        $data = ApplicationCampaign::find($validated['id']);
        if (!$data) return response()->json(['status' => 'error']);
        if ($data->is_existed) return response()->json(['status' => 'error']);
        $data->is_existed = true;
        $data->exist_message = $validated['exist_message'];
        // if ($data->save()) return response()->json(['message' => 'Notification Sent Successfully', 'status' => 'success', 'title' => 'Created!']);
        if ($data->save()) {
            $response = $this->sendNotification($data);
            if (is_array($response) && isset($response[0]) && $response[0]) {
                $data->response = $response[1] ?? 'Response not set';
                $data->save();
                return response()->json(['message' => 'Notification Sent Successfully', 'status' => 'success', 'title' => 'Created!']);
            } else {
                $data->delete();
                return response()->json(['message' => $response[1] ?? 'Notification failed', 'status' => 'error']);
            }

        }
        return response()->json(['status' => 'error']);
    }
}
