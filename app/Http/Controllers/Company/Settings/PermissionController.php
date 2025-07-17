<?php

namespace App\Http\Controllers\Company\Settings;

use App\Http\Controllers\Controller;
use App\Models\Company\Settings\Setting;
use App\Traits\Company\VerificationTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;


class PermissionController extends Controller
{

    public function index()
    {
        $data = Setting::first();


        $alerts = $this->getAlerts($data);

        return response()->json(['status' => 'success', 'data' => $data, 'alerts' => $alerts]);
    }

    private function getAlerts($data)
    {
        $alerts = [];


        return $alerts;
        // whatsapp_enabled
        // website_permission
        // sms_enabled
        // riskprofile_enabled
        // invoice_enabled
        // email_enabled


    }


    public function update(Request $request)
    {



        $validated = $request->validate([
            'auto_expiry_enabled' => 'nullable|boolean',

            'lead_automation_enabled' => 'required|boolean',
            'invoice_enabled' => 'required|boolean',
            'has_manager_verification' => 'required|boolean',
            'has_complaince_verification' => 'required|boolean',
            'has_accounts_verification' => 'required|boolean',
            'payment_permission' => 'required|boolean',
            'transfer_permission' => 'required|boolean',
            'refer_permission' => 'required|boolean',

            'sales_verification_enabled' => 'required|boolean',
            'broadcast_permission' => 'nullable|string',
            'who_can_verify_sales' => 'nullable|string',
            'who_can_verify_complaince_verification' => 'nullable|string',
            'who_can_approve_expire_pause_sales' => 'required|string',


        ]);

        if (!count(json_decode($validated['who_can_approve_expire_pause_sales']))) throw ValidationException::withMessages([
            'who_can_approve_expire_pause_sales' => ['value required'],
        ]);




        if (!$validated['sales_verification_enabled']) {
            $validated['has_manager_verification'] = 0;
            $validated['has_complaince_verification'] = 0;
            $validated['has_accounts_verification'] = 0;
            $validated['who_can_verify_sales'] = json_encode([]);
            $validated['who_can_verify_complaince_verification'] = json_encode([]);
        } else {

            if (!count(json_decode($validated['who_can_verify_sales']))) throw ValidationException::withMessages([
                'who_can_verify_sales' => ['value required'],
            ]);



            if ($validated['has_complaince_verification'] && !count(json_decode($validated['who_can_verify_complaince_verification']))) throw ValidationException::withMessages([
                'who_can_verify_complaince_verification' => ['value required'],
            ]);


            if (!$validated['has_complaince_verification']) $validated['who_can_verify_complaince_verification'] = json_encode([]);
        }








        $settings = Setting::first();

        $updated = $settings->update($validated);

        if ($updated) {
            Cache::forget("company-settings");

            return response()->json([
                'alerts' => $this->getAlerts($settings),
                'status' => 'success',
                'message' => 'Permissions Updated Successfully',
                'settings' =>  $settings->refresh()
            ]);
        }
        return response()->json([
            'message' => 'Failed to Updated Permissions',
            'status' => 'error',
        ]);
    }
}
