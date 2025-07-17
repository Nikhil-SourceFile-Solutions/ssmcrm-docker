<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Settings\Setting;
use App\Models\Company\User;
use App\Models\Console\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Models\Company\Broadcast;

class CheckCrmController extends Controller
{
    public function checkCrm()
    {

        $tenantDomain = tenant()->id;


        $company = Cache::get("company");

        if (!$company) {
            $company = tenancy()->central(function ($tenant) use ($tenantDomain) {
                return Company::where('domain', $tenantDomain)
                    ->first();
            });
            Cache::forever("company", $company);
        }

        if (!$company) {
            return "SERVER ERROR SFS:001";
            info("No company found for domain: {$tenantDomain}. Fetching from database.");
        }

        if (!$company->status)  return response()->json(['status' => 'error', 'action' => 'blocked', 'type' => $company->status_type]);

        $user = User::first();

        if (!$user) return response()->json(['status' => 'error', 'action' => 'admin']);


        $company_settings =  Cache::get("company-settings");

        if (!$company_settings) {
            $company_settings = Setting::first();
            $crm = tenancy()->central(function ($tenant) {
                return Company::where('domain', $tenant->id)->select('branch_no', 'corporate_branch_name')->first();
            });
            $company_settings->branch_no = $crm->branch_no;
            Cache::forever("company-settings", $company_settings);
        }

        return response()->json(['status' => 'success', 'settings' => $company_settings]);
    }


    public function adminStore(Request $request)
    {

        $company =  tenancy()->central(function ($tenant) {
            return Company::where('domain', $tenant->id)->first();
        });

        $user = User::first();

        if ($user) return response()->json(['status' => 'success', 'action' => 'login', 'message' => 'Admin Already created!']);
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|confirmed|min:5',
            'phone_number' => 'required|digits:10|unique:users,phone_number',
            'crm_link' => 'required|string|max:250',
        ]);

        $validated['branch_id'] = 1;


        $validated['employee_id'] = 001;
        $validated['user_type'] = 'Admin';
        $validated['show_password'] = $validated['password'];
        $validated['password'] = Hash::make($validated['password']);



        $admin = User::create(Arr::except($validated, ['crm_link']));



        if ($admin) {

            $validated['crm_name'] = $company->company_name;

            try {
                $settings = Setting::insert(Arr::except($validated, ['first_name', 'last_name', 'email', 'password', 'phone_number', 'employee_id', 'user_type', 'show_password', 'branch_id']));
                if ($settings) return response()->json(['status' => 'success', 'action' => 'login', 'message' => 'Admin created successfully!']);
            } catch (\Exception $e) {
                Log::error('Error in store method: ' . $e->getMessage());
                User::truncate();
            }
        }
        return response()->json(['status' => 'error', 'message' => 'Failed to create admin']);
    }

    public function latestData()
    {

        $data = Cache::get('latest-broadcast');

        if (!$data) {
            $broadCast = Broadcast::whereDate('created_at', now())->latest()->first();
            if ($broadCast) {
                $broadCast->new = true;
                Cache::put('latest-broadcast', $broadCast, 60);
                $data = $broadCast;
            }
        }

        return response()->json(['status' => 'success', 'data' => ['broadCast' => $data, 'crmVersion' => env('CRM_VERSION')]]);
    }
}
