<?php

namespace App\Http\Controllers\Company\Campaign;

use App\Http\Controllers\Controller;
use App\Models\Company\Campaign\ApplicationCampaign;
use App\Models\Company\Campaign\ApplicationCampaignLead;
use App\Models\Company\Campaign\ApplicationCampaignUpdate;
use App\Models\Company\Lead;
use App\Models\Company\Sale;
use Illuminate\Support\Facades\Http;

use Illuminate\Http\Request;

class ApplicationCampaignUpdateController extends Controller
{
    public function index(){
        $campaingns=ApplicationCampaignLead::
        where('lead_id',auth()->user()->id)
        ->whereDate('created_at',now()->today())
        ->pluck('application_campaign_id')
        ->toArray();

        $getapplication=ApplicationCampaign::whereIn('id',$campaingns)->latest('updated_at')->get();
        foreach ($getapplication as $app)
        {
            $app->updates=ApplicationCampaignUpdate::where('application_campaign_id',$app->id)->latest()->get();
        }
        return response()->json([
            'status'=>'success',
            'getapplication'=>$getapplication
        ]);
    }

public function updateApplication(Request $request)
{
    $validated = $request->validate([
        'update' => 'required|string',
        'application_campaign_id' => 'nullable|integer'
    ]);

    $applicationCampaign = ApplicationCampaign::find($validated['application_campaign_id']);
    if (!$applicationCampaign) {
        return response()->json(['message' => 'Application Campaign not found', 'status' => 'error']);
    }
    $created = ApplicationCampaignUpdate::create([
        'update' => $validated['update'],
        'application_campaign_id' => $applicationCampaign->id,
    ]);
    $created->save();
    $applicationCampaign->updated_at=now();
    $applicationCampaign->save();
    // return response()->json([
    //     'message' => 'Update Notification Sent Successfully',
    //     'status' => 'success',
    //     'title' => 'Created!',
    //     'application'=>$created,
    //     'hello'=>$applicationCampaign

    // ]);

    $response = $this->sendNotification($applicationCampaign);
    if (is_array($response) && isset($response[0]) && $response[0]) {
        $created->response = $response[1] ?? 'Response not set';
        $created->save();
        $applicationCampaign->updated_at=now();
        $applicationCampaign->save();
        return response()->json([
            'message' => 'Update Notification Sent Successfully',
            'status' => 'success',
            'title' => 'Created!'
        ]);
    } else {
        $created->delete();
        return response()->json([
            'message' => $response[1] ?? 'Notification failed',
            'status' => 'error'
        ]);
    }
}


    protected function sendNotification( $validated)
    {
        $sales = json_decode($validated->sales);
        // return $sales;
        $leadsIds = Sale::whereIn('id', $sales)->pluck('lead_id')->toArray();
        // return $leadsIds;
        $fcmTokens = Lead::whereNotNull('fcm_token')->whereIn('id', $leadsIds)->pluck('fcm_token')->toArray();
        if (!count($fcmTokens)) return response()->json(['status' => 'error', 'message' => 'No App User']);

        // return $fcmTokens;

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post('https://exp.host/--/api/v2/push/send', [
            'to' => $fcmTokens,
            'title' => 'Growthlift Investment Advisories',
            'body' => 'Instrument Name:' . $validated->script_name . 'Action: ' .  $validated->action,
            // 'body' => 'Instrument Name:' . '$validated->script_name' . 'Action: ' .  '$validated->action',

            "data" =>  ["action" => "new-call"]
        ]);


        if ($response->successful()) {
            return [1, $response->json()];
        }

        return [0, $response->json()];
    }
}
