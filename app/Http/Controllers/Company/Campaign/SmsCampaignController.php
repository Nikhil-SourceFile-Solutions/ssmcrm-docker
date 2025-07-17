<?php

namespace App\Http\Controllers\Company\Campaign;

use App\Http\Controllers\Controller;
use App\Models\Company\Campaign\AppCampaignUser;
use App\Models\Company\Campaign\ApplicationCampaign;
use App\Models\Company\Campaign\SmsCampaign;
use App\Models\Company\Campaign\SmsCampaignUpdate;
use App\Models\Company\Campaign\WhatsappCampaign;
use App\Models\Company\Lead;
use App\Models\Company\Sale;
use App\Models\Company\Settings\SmsConfig;
use App\Models\Company\Settings\SmsTemplate;
use App\Models\Company\Settings\Setting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use App\Models\Company\Campaign\ApplicationCampaignLead;
use App\Models\Company\Campaign\AppOneCampaign;

class SmsCampaignController extends Controller
{
    public function getTodayCampaigns()
    {

        $daterange = json_decode(request()->get('dateRange'));
        $fromDate = \Carbon\Carbon::parse($daterange[0])->startOfDay();
        $toDate = \Carbon\Carbon::parse($daterange[1])->endOfDay();

        $dataCollection  = SmsCampaign::where('is_free_trial', false)->join('sms_templates', 'sms_templates.id', 'sms_campaigns.template_id')
            ->whereBetween('sms_campaigns.created_at', [$fromDate, $toDate])->where('campaign_name', 'like', '%' . request()->get('search', '') . '%')
            ->select('sms_campaigns.*', 'sender_id', 'template_name')
            ->latest('sms_campaigns.created_at')->get();
        $perPage = request()->get('size', 5);
        $currentPage = request()->get('page', 1);
        $search = request()->get('search', 0);
        $totalItems = $dataCollection->count();
        $from = ($currentPage - 1) * $perPage + 1;
        $to = min($currentPage * $perPage, $totalItems);
        $itemsForCurrentPage = $dataCollection->slice($from - 1, $perPage)->values();
        foreach ($itemsForCurrentPage as $i) {
            $i->updates = SmsCampaignUpdate::where('sms_campaign_id', $i->id)->count();
        }
        if ($search) {
            $dataCollection->where('campaign_name', 'LIKE', '%' . $search . '%');
        }

        return response()->json(['status' => 'success', 'data' => [
            $itemsForCurrentPage,
            $currentPage,
            $totalItems,
            $from,
            $to,
        ]]);
    }

    public function getTodayFreeTrialCampaigns()
    {
        $daterange = json_decode(request()->get('dateRange'));
        $fromDate = \Carbon\Carbon::parse($daterange[0])->startOfDay();
        $toDate = \Carbon\Carbon::parse($daterange[1])->endOfDay();

        $dataCollection  = SmsCampaign::where('is_free_trial', true)->join('sms_templates', 'sms_templates.id', 'sms_campaigns.template_id')
            ->whereBetween('sms_campaigns.created_at', [$fromDate, $toDate])->where('campaign_name', 'like', '%' . request()->get('search', '') . '%')
            ->select('sms_campaigns.*', 'sender_id', 'template_name')
            ->latest('sms_campaigns.created_at')->get();
        $perPage = request()->get('size', 5);
        $currentPage = request()->get('page', 1);
        $totalItems = $dataCollection->count();
        $from = ($currentPage - 1) * $perPage + 1;
        $to = min($currentPage * $perPage, $totalItems);
        $itemsForCurrentPage = $dataCollection->slice($from - 1, $perPage)->values();


        foreach ($itemsForCurrentPage as $i) {
            $i->updates = SmsCampaignUpdate::where('sms_campaign_id', $i->id)->count();
        }

        return response()->json(['status' => 'success', 'data' => [
            $itemsForCurrentPage,
            $currentPage,
            $totalItems,
            $from,
            $to,
        ]]);
    }

    public function getCampaingUpdates(Request $request)
    {

        $campaigns = SmsCampaignUpdate::where('sms_campaign_id', $request->sms_campaign_id)
            ->join('sms_templates', 'sms_templates.id', 'sms_campaign_updates.template_id')
            ->select('sms_campaign_updates.id', 'template_name', 'sender_id', 'campaign_name', 'final_template', 'sms_campaign_updates.created_at')
            ->latest('sms_campaign_updates.created_at')->get();



        return response()->json(['status' => 'success', 'campaigns' => $campaigns]);
    }

    public function getTemplate(Request $request)
    {
        if ($request->sales) {
            $sales = Sale::where('sales.status', 'Approved')
                ->whereIn('id', json_decode($request->sales))
                ->where('sales.due_date', '>=', Carbon::today())->count();
        } else $sales = null;

        $templates = SmsTemplate::where('status', true)->select('id', 'sender_id', 'template_type', 'template_name', 'short_name', 'template')->get();


        return response()->json([
            'status' => 'success',
            'sender_ids' => $templates->pluck('sender_id')->unique()->values()->all(),
            'templates' => $templates,
            'sales' => $sales
        ]);
    }

    public function updateSmsCampaing(Request $request)
    {
        $validated = $request->validate([
            'fields' => 'nullable',
            'template_id' => 'required|integer',
            'sms_campaign_id' => 'required|integer'
        ]);

        $whatsappCampaign = SmsCampaign::find($validated['sms_campaign_id']);
        if (!$whatsappCampaign) return response()->json(['status' => 'error', 'message' => 'Whatsapp Campaign Not Found!']);
        $template = SmsTemplate::find($validated['template_id']);
        if (!$template) return response()->json(['status' => 'error', 'message' => 'Whatsapp Template Not Found!']);
        $validated['campaign_name'] = $whatsappCampaign->campaign_name . " Update - " .  (1 + SmsCampaignUpdate::where('sms_campaign_id', $whatsappCampaign->id)->count());
        $validated['count'] = $whatsappCampaign->count;
        $validated['sales'] = $whatsappCampaign->sales;
        $validated['final_template'] = $this->createFinalTemplate($template->template, json_decode($validated['fields']));
        $uniquePhones = json_decode($whatsappCampaign->phones);

        $validated['phones'] = json_encode($uniquePhones);
        $settings = Setting::first();
        if ($settings && $settings->app_enabled) {

            $app_one_campaign = AppOneCampaign::create([
                'campaign_name' => $validated['campaign_name'],
                'campaign' => $validated['final_template'],
                'customers' => $whatsappCampaign->customers
            ]);



            if ($app_one_campaign) {


                $ids = json_decode($whatsappCampaign->leads);

                $data = [];
                foreach ($ids as $id) {

                    array_push($data, [
                        'lead_id' => $id,
                        'app_one_campaign_id' => $app_one_campaign->id
                    ]);
                }

                $inserted = AppCampaignUser::insert($data);

                $notificationResponse = $this->sendNotification($uniquePhones, $validated['final_template']);
            }
        }


        $response =  $this->sendSms($uniquePhones, $template, $validated['final_template']);


        if ($response[0]) {
            if ($response[2] == "webpayservices") $sms = json_encode($response[1]);
            else  $sms = json_encode($response[1]["Data"]);
            $validated['response'] = $sms;
            $created = SmsCampaignUpdate::create($validated);
            if ($created)  return response()->json(['status' => 'success', 'message' => 'SMS  6665 sent successfully!', 'smssent' => $created]);
        }

        return response()->json(['status' => 'error', 'message' => 'Failed to send SMS!']);
    }

    public function updateFreeTrialSmsCampaing(Request $request)
    {

        $validated = $request->validate([
            'fields' => 'nullable',
            'template_id' => 'required|integer',
            'sms_campaign_id' => 'required|integer'
        ]);



        $whatsappCampaign = SmsCampaign::find($validated['sms_campaign_id']);
        if (!$whatsappCampaign) return response()->json(['status' => 'error', 'message' => 'Whatsapp Campaign Not Found!']);
        $template = SmsTemplate::find($validated['template_id']);
        if (!$template) return response()->json(['status' => 'error', 'message' => 'Whatsapp Template Not Found!']);
        $validated['campaign_name'] = $whatsappCampaign->campaign_name . " Update - " .  (1 + SmsCampaignUpdate::where('sms_campaign_id', $whatsappCampaign->id)->count());
        $validated['count'] = $whatsappCampaign->count;
        $validated['leads'] = $whatsappCampaign->leads;
        $validated['final_template'] = $this->createFinalTemplate($template->template, json_decode($validated['fields']));
        $uniquePhones = json_decode($whatsappCampaign->phones);
        $validated['phones'] = json_encode($uniquePhones);


        $response =  $this->sendSms($uniquePhones, $template, $validated['final_template']);


        if ($response[0]) {
            $validated['response'] = json_encode($response[1]["Data"]);
            $created = SmsCampaignUpdate::create($validated);
            if ($created)  return response()->json(['status' => 'success', 'message' => 'SMS sent successfully!', 'smssent' => $created]);
        }

        return response()->json(['status' => 'error', 'message' => 'Failed to send SMS!']);
    }



    public function store(Request $request)
    {
        $validated = $request->validate([
            'template_id' => 'required|integer',
            'fields' => 'nullable',
            'campaign_name' => 'required|string|max:250',
            'sales' => 'required',
        ]);


        $existCampaign = SmsCampaign::where('campaign_name', $validated['campaign_name'])
            ->whereDate('created_at', now()->today())
            ->first();

        if ($existCampaign) {
            throw ValidationException::withMessages(['campaign_name' => 'Campaign name already exists today']);
        }


        $template = SmsTemplate::find($validated['template_id']);
        if (!$template) {
            throw ValidationException::withMessages(['template_id' => 'Template not found!']);
        }


        if (count(json_decode($validated['fields']))) {
            $validated['final_template'] = $this->createFinalTemplate($template->template, json_decode($validated['fields']));
        } else {
            $validated['final_template'] = $template->template;
        }



        $data = Sale::join('leads', 'leads.id', 'sales.lead_id')
            ->whereIn('sales.id', json_decode($validated['sales']))
            ->where('sales.status', 'Approved')
            ->get(['leads.phone', 'leads.id']);

        $phones = $data->pluck('phone')->unique()->values()->toArray();
        $ids = $data->pluck('id')->unique()->values()->toArray();



        $uniquePhones = array_values(array_unique($phones));



        $uniqueIds = array_values(array_unique($ids));

        $validated['phones'] = json_encode($uniquePhones);
        $validated['count'] = count($uniquePhones);


        $settings = Setting::first();


        $smsResponse = null;
        $notificationResponse = null;



        if ($settings && $settings->sms_enabled) {
            $smsResponse = $this->sendSms($uniquePhones, $template, $validated['final_template']);
        }


        if ($settings && $settings->app_enabled) {

            $app_one_campaign = AppOneCampaign::create([
                'campaign_name' => $validated['campaign_name'],
                'campaign' => $validated['final_template'],
                'customers' => json_encode($uniqueIds)
            ]);

            if ($app_one_campaign) {

                $data = [];
                foreach ($uniqueIds as $id) {

                    array_push($data, [
                        'lead_id' => $id,
                        'app_one_campaign_id' => $app_one_campaign->id
                    ]);
                }



                $inserted = AppCampaignUser::insert($data);
                $notificationResponse = $this->sendNotification($uniquePhones, $validated['final_template']);
            }
        }


        if (($smsResponse && $smsResponse[0]) || $notificationResponse) {

            if ($smsResponse[2] == "webpayservices") $sms = $smsResponse[1];
            else  $sms = $smsResponse[1]["Data"];

            $validated['response'] = json_encode([
                'sms' => $smsResponse ?  $sms : null,
                'notification' => $notificationResponse,
            ]);

            $validated['leads'] = json_encode($uniqueIds);
            $created = SmsCampaign::create($validated);

            if ($created) {
                return response()->json(['status' => 'success', 'message' => 'Messages sent successfully!', 'campaign' => $created]);
            }
        }

        return response()->json(['status' => 'error', 'message' => 'Failed to send messages!']);
    }



    protected function sendNotification($leads, $final_template)
    {


        $fcmTokens = Lead::whereNotNull('fcm_token')->whereIn('phone', $leads)->pluck('fcm_token')->toArray();

        if (!count($fcmTokens)) return response()->json(['status' => 'error', 'message' => 'No App User']);


        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post('https://api.expo.dev/v2/push/send', [
            'to' => $fcmTokens,
            'title' => 'Growthlift Investment Advisories',
            'body' =>  $final_template,
            "data" =>  ["action" => "new-call"]
        ]);


        if ($response->successful()) {
            info($response->json());
            return [1, $response->json()];
        }


        return [0, $response->json()];
    }

    protected function sendSms($phones, $template, $final_template)
    {
        $sms_config = SmsConfig::first();
        if (!$sms_config) return [0, 'message' => 'SMS Config not found'];

        $settings = Setting::first();

        if ($settings && $settings->security_numbers) {
            $security_numbers = (explode(",", $settings->security_numbers));
            $phones = array_merge($phones, $security_numbers);
        }

        if ($template->provider == "webpayservices") return $this->sendWebPaySms($phones, $final_template, $template, $sms_config);

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',

            ])->post($sms_config->api_url, [
                'ApiKey' => $sms_config->api_key,
                'ClientId' => $sms_config->client_id,
                'SenderId' => $template->sender_id,
                'Message' => $final_template,
                'MobileNumbers' => implode(',', $phones),
            ]);
            if ($response->successful()) {

                return [1, $response->json(), "sfs"];
            } else {
                return [0, $response->json()];
            }
        } catch (\Exception $e) {
            return [0, 'message' => 'Sms sent failled'];
        }
    }

    private function sendWebPaySms($phones, $final_template, $template, $sms_config)
    {
        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->get($sms_config->api_url, [
                'username' => $sms_config->sms_user_name,
                'apikey' => $sms_config->api_key,
                'apirequest' => "$template->api_request",
                'sender' => $template->sender_id,
                'mobile' => implode(',', $phones),
                'message' => " $final_template",
                'route' =>  $template->api_route,
                'TemplateID' =>  $template->template_id,
                'format' => 'JSON',
            ]);

            if ($response->successful()) {
                return [1,  $response->json(), "webpayservices"];
            } else {
                return [0, $response->json()];
            }
        } catch (\Exception $e) {
            return [0, 'message' => 'Sms sent failled'];
        }
    }

    protected function createFinalTemplate($template, $values)
    {
        foreach ($values as $value) {
            $template = preg_replace('/{#var#}/', $value, $template, 1);
        }
        return $template;
    }



    public function freeTrialstore(Request $request)
    {
        $validated = $request->validate([
            'template_id' => 'required|integer',
            'fields' => 'nullable',
            'campaign_name' => 'required|string|max:250',
            'leads' => 'required',
        ]);

        $existCampaign = SmsCampaign::where([['campaign_name', $validated['campaign_name']], ['is_free_trial', true]])->whereDate('created_at', now()->today())->first();

        if ($existCampaign) throw ValidationException::withMessages(['campaign_name' => 'campaign name already exist today']);


        $template = SmsTemplate::find($validated['template_id']);

        if (!$template) throw ValidationException::withMessages(['template_id' => 'template not found!']);

        if (count(json_decode($validated['fields']))) $validated['final_template'] = $this->createFinalTemplate($template->template, json_decode($validated['fields']));

        else $validated['final_template'] = $template->template;

        $phones = Lead::whereIn('id', json_decode($validated['leads']))->pluck('phone')->toArray();

        $uniquePhones = array_values(array_unique($phones));


        $validated['phones'] = json_encode($uniquePhones);
        $validated['count'] = count($uniquePhones);
        $validated['is_free_trial'] = 1;

        $response =  $this->sendSms($uniquePhones, $template, $validated['final_template']);

        // return $response;
        if ($response[0]) {
            $validated['response'] = json_encode($response[1]["Data"]);
            $created = SmsCampaign::create($validated);
            if ($created)  return response()->json(['status' => 'success', 'message' => 'SMS sent successfully!', 'smssent' => $created]);
        }

        return response()->json(['status' => 'error', 'message' => 'Failed to send SMS!']);
    }
}
