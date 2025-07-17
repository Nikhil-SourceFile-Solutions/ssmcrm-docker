<?php

namespace App\Http\Controllers\Company\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Company\Campaign\ApplicationCampaign;
use App\Models\Company\Campaign\SmsCampaign;
use App\Models\Company\Campaign\WhatsappCampaign;
use App\Models\Company\Sale;
use Illuminate\Http\Request;

class AnalystControler extends Controller
{
    public function index()
    {

        return response()->json([
            'status' => 'success',
            'total_campaign' => SmsCampaign::count() + WhatsappCampaign::count() + ApplicationCampaign::count(),
            'sms_campaign' => SmsCampaign::count(),
            'whatsapp_campaign' => WhatsappCampaign::count(),
            'application_campaign' => SmsCampaign::count(),
            'expired' => Sale::get()->where('status', 'Expired')->count(),
            'paused' => Sale::get()->where('status', 'Paused')->count(),
        ]);
    }
}
