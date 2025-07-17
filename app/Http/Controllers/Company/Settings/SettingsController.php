<?php

namespace App\Http\Controllers\Company\Settings;

use App\Http\Controllers\Controller;
use App\Models\Company\Settings\Setting;
use App\Models\Console\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = Setting::first();
        $crm = tenancy()->central(function ($tenant) {
            return Company::where('domain', $tenant->id)->select('branch_no', 'corporate_branch_name')->first();
        });
        $settings->branch_no = $crm->branch_no;


        $warnings = $this->checkWarnings($settings);

        $data = [
            'settings' =>  $settings,

            'phone_hide_users' => ['Analyst', 'Accounts'],
            'broadcast_users_permission' => ['Admin', 'Analyst', 'Manager', 'Team Leader', 'HR', 'Complaince', 'Networking', 'Accounts'],
            'warnings' => $warnings

        ];
        return response()->json(['status' => 'success', 'data' => $data]);
    }

    public function store(Request $request)
    {


        $already = Setting::first();

        if ($already) return $this->update($request, $already);



        $validated = $request->validate([
            'admin_email' => 'nullable',
            'account_email' => 'nullable',
            'compliance_email' => 'nullable',
            'crm_name' => 'required|string',
            'crm_title' => 'nullable|string',
            'crm_link' => 'nullable|string',

            'crm_news' => 'nullable|string',
            'crm_website_details' => 'nullable|string',
            'crm_phones' => 'nullable|string',
            'broadcast_permission' => 'nullable|string',
            'crm_ip' => 'nullable|string',
            'logo' => 'nullable',
            'favicon' => 'nullable',
            'auto_expiry_enabled' => 'nullable|boolean',

            'lead_automation_enabled' => 'required|boolean',
            'invoice_enabled' => 'required|boolean',
            'has_manager_verification' => 'required|boolean',
            'has_complaince_verification' => 'required|boolean',
            'has_accounts_verification' => 'required|boolean',
            'payment_permission' => 'required|boolean',
            'transfer_permission' => 'required|boolean',
            'refer_permission' => 'required|boolean',


            'max_employee_count' => 'nullable|string',
            'security_numbers' => 'nullable|string',
            // 'invoice_prefix' => 'nullable|string'
        ]);



        if ($request->logo) {
            $path = $request->file('logo')->storeAs('logo.' . $request->file('logo')->getClientOriginalExtension());
            $validated['logo'] =  $path;
        } else $validated['logo'] = '';

        if ($request->favicon) {
            $path = $request->file('favicon')->storeAs(time() . 'favicon.' . $request->file('favicon')->getClientOriginalExtension());
            $validated['favicon'] =  $path;
        } else $validated['favicon'] = '';

        $response = Setting::create($validated);
        if ($response) {
            // Cache::pull('cache-settings');
            // $settings = Cache::rememberForever('cache-settings', function () {
            //     return  Setting::first();
            // });
            return response()->json([
                'message' => 'Settings Added',
                'status' => 'success',
                'settings' => $response
            ]);
        }
        return response()->json([
            'message' => 'Failed',
            'status' => 'error',
        ]);
    }


    public function update($request, $already)
    {
        $validated = $request->validate([
            'admin_email' => 'nullable',
            'account_email' => 'nullable',
            'compliance_email' => 'nullable',
            'crm_name' => 'required|string',
            'crm_title' => 'nullable|string',
            'crm_link' => 'nullable|string',

            'crm_news' => 'nullable|string',
            'crm_website_details' => 'nullable|string',
            'crm_phones' => 'nullable|string',
            'broadcast_permission' => 'nullable|string',
            'crm_ip' => 'nullable|string',
            'logo' => 'nullable',
            'favicon' => 'nullable',
            'auto_expiry_enabled' => 'nullable|boolean',



            'lead_automation_enabled' => 'required|boolean',
            'invoice_enabled' => 'required|boolean',
            'has_manager_verification' => 'required|boolean',
            'has_complaince_verification' => 'required|boolean',
            'has_accounts_verification' => 'required|boolean',
            'payment_permission' => 'required|boolean',
            'transfer_permission' => 'required|boolean',
            'refer_permission' => 'required|boolean',


            'max_employee_count' => 'nullable|string',
            'security_numbers' => 'nullable|string',
            // 'invoice_prefix' => 'nullable|string'
        ]);




        if ($request->logo) {
            $path = $request->file('logo')->storeAs(time() . 'logo.' . $request->file('logo')->getClientOriginalExtension());
            $validated['logo'] = tenant('id') . '/' . $path;
        } else $validated['logo'] = $already->logo;

        if ($request->favicon) {
            $path = $request->file('favicon')->storeAs(time() . 'favicon.' . $request->file('favicon')->getClientOriginalExtension());
            $validated['favicon'] =  tenant('id') . '/' . $path;
        } else $validated['favicon'] = $already->favicon;



        $updated = $already->update($validated);

        if ($updated) {
            Cache::forget("company-settings");
            return response()->json([
                'status' => 'success',
                'message' => 'Updated Successfully',
                'settings' => $already->refresh()
            ]);
        }
        return response()->json([
            'message' => 'Failed',
            'status' => 'error',

        ]);
    }

    public function storeUpdateIpConfig(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer',
            'crm_ip' => 'required'
        ]);

        $setting = Setting::find($validated['id']);
        if (!$setting) {
            return response()->json(['status' => 'error', 'message' => 'Setting not found!']);
        }
        $setting->crm_ip = $validated['crm_ip'];
        if ($setting->save()) {
            return response()->json(['status' => 'success', 'message' => 'CRM IP updated successfully', 'crm_ip' => $setting->crm_ip]);
        }
        return response()->json(['status' => 'error', 'message' => 'Failed to update CRM IP']);
    }




    public function checkWarnings($settings, $tab = 0)
    {

        $data = [];
        if ($tab) {
            $data['apple'] = "orange";
        } else {
            if ($settings->riskprofile_enabled) {
                $result = $this->checkRiskProfile();

                if ($result[0]) array_push($data, $result[1]);
            }
        }

        return $data;
    }

    protected function checkRiskProfile()
    {
        $riskProfileSettings = RiskprofileSetting::first();

        $data = [0];
        if (!$riskProfileSettings) {
            $data = [1, [
                'area' => 'RiskProfile',
                'title' => 'Risk Profile Settings Pending!',
                'message' => 'Risk Profile Enabled, But Risk Profile Settings Pending',
                'action' => 'navigation',
                'link' => '/settings/risk-profile',
                'linkLabel' => 'Go To Risk Profile Settings'
            ]];
        } else {

            if ($riskProfileSettings->questions && !count(json_decode($riskProfileSettings->questions))) {

                $data = [1, [
                    'area' => 'RiskProfile',
                    'title' => 'Risk Profile Questions Pending!',
                    'message' => 'Risk Profile Enabled, But Risk Profile Questions Pending',
                    'action' => 'navigation',
                    'link' => '/settings/risk-profile',
                    'linkLabel' => 'Go To Risk Profile Settings'
                ]];
            } else if ($riskProfileSettings->risk_assessment && !count(json_decode($riskProfileSettings->risk_assessment))) {

                $data = [1, [
                    'area' => 'RiskProfile',
                    'title' => 'Risk Assessment Pending!',
                    'message' => 'Risk Profile Enabled, But Risk Assessment Pending',
                    'action' => 'navigation',
                    'link' => '/settings/risk-profile',
                    'linkLabel' => 'Go To Risk Profile Settings'
                ]];
            } else if ($riskProfileSettings->credentials && !count(json_decode($riskProfileSettings->credentials))) {

                $data = [1, [
                    'area' => 'RiskProfile',
                    'title' => 'Risk Profile Credentials Pending!',
                    'message' => 'Risk Profile Enabled, But Risk Profile Credentials Pending',
                    'action' => 'navigation',
                    'link' => '/settings/risk-profile',
                    'linkLabel' => 'Go To Risk Profile Settings'
                ]];
            }
        }

        return $data;
    }
}
