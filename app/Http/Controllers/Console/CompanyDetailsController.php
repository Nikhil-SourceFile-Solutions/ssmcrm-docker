<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Models\Company\Settings\Setting;
use App\Models\Company\User;
use App\Models\Console\Company;
use App\Models\Console\UsersHistory;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CompanyDetailsController extends Controller
{
    public function update(Request $request, $domain)
    {
        $tenant = Tenant::find($domain);
        $company = Company::where('domain', $domain)->first();


        $validated = $request->validate([
            'branch_no' => 'required|integer',
            'max_employee_count' => 'required|integer'
        ]);

        $result = $tenant->run(function ($tenant) use ($validated) {
            $settings = Setting::first();
            $oldValue = $settings->max_employee_count;
            $settings->max_employee_count = $validated['max_employee_count'];
            $newValue = $validated['max_employee_count'];;

            if ($settings->save() && $oldValue != $newValue) {


                $oldActiveUsers = User::where('status', true)->count();
                $oldInactiveUsers = User::where('status', false)->count();
                return [true, $oldValue, $oldActiveUsers, $oldInactiveUsers, $newValue];
            }

            return [false];
        });


        if ($result[0]) {

            UsersHistory::create([
                'company_id' => $company->id,
                'user_id' => auth()->user()->id,
                'previous_users' => $result[1],
                'previous_active_users' => $result[2],
                'previous_blocked_users' => $result[3],
                'current_users' => $result[4],
                'current_active_users' =>  $result[2],
                'current_blocked_users' =>  $result[3],
                'date_time' => now()
            ]);
        }

        $company->branch_no = $validated['branch_no'];

        if ($company->save()) {
            Cache::tags(["tenant{$company->domain}"])->forget("company");
            Cache::tags(["tenant{$company->domain}"])->forget("company-settings");
            return response()->json(['status' => 'success', 'message' => 'Company Details Updated!']);
        }

        return response()->json(['status' => 'error', 'message' => 'Failed to updated!']);
    }
}
