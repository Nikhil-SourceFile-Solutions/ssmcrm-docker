<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Models\Company\Branch;
use App\Models\Company\Lead;
use App\Models\Company\Settings\Dropdown;
use App\Models\Company\Settings\Setting;
use App\Models\Company\User;
use App\Models\Console\Company;
use App\Models\Console\UsersHistory;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class CompanyController extends Controller
{


    public function index(Request $request)
    {


        $pageSize = $request->get('pageSize', 10);
        $currentPage = $request->get('page', 1);

        $offset = ($currentPage - 1) * $pageSize;


        $search = $request->get('search', 0);

        $query = Company::query();

        if ($search) $query->where('phone', 'LIKE', '%' . $request->search . '%');


        $totalItems = $query->count();

        $query->orderBy('created_at', 'desc');

        $itemsForCurrentPage = $query->offset($offset)->limit($pageSize)->get();


        $from = $offset + 1;
        $to = min($offset + $pageSize, $totalItems);


        $data = [
            'data' => $itemsForCurrentPage,
            'currentPage' => $currentPage,
            'pageSize' => $pageSize,
            'totalItems' => $totalItems,
            'from' => $from,
            'to' => $to
        ];

        $response = [
            'status' => 'success',
            'data' => $data,
            'domain' => env('CRM_URL') == 'localhost' ? 'localhost:8000' : env('CRM_URL')
        ];


        return response()->json($response);
    }

    public function store(Request $request)
    {


        if ($request->id) return $this->update($request);

        $validated = $request->validate([
            'domain' => [
                'required',
                'string',
                'max:100',
                'unique:companies,domain',
                'unique:tenants,id',
                function ($attribute, $value, $fail) {
                    $dbName =  'ssmultiversecrm_crm_' . $value;
                    $dbExists = DB::select("SHOW DATABASES LIKE '$dbName'");
                    if (!empty($dbExists)) {
                        $fail("Domain OK! But DB $dbName already exists.");
                    }
                },
            ],
            'customer_name' => 'required|string|max:250',
            'customer_email' => 'required|email|max:250',
            'customer_phone' => 'required|digits:10',
            'company_name' => 'required|string|max:250',
            'city' => 'required|string|max:250',
            'branch_no' => 'required|string|max:250',
            'corporate_branch_name' => 'required|string|max:250',
            'state' => 'required|string|max:250',
            'status' => 'required|boolean'
        ]);

        if ($validated['status']) $validated['status_type'] = 'active';

        else {
            $validated2 = $request->validate(['status_type' => 'required|string']);

            $validated = [...$validated, ...$validated2];
        }

        $validated['domain'] = Str::slug($validated['domain'], '-');



        try {
            $createdCRM = $this->createCrm($validated);

            if ($createdCRM) {
                $created = Company::create($validated);

                if ($created) {
                    $branch = $this->createMainBranch($created);
                    $migration = $this->defaultMigration($created);
                    if ($migration) {

                        UsersHistory::create([
                            'company_id' => $created->id,
                            'user_id' => auth()->user()->id,
                            'previous_users' => 0,
                            'previous_active_users' => 0,
                            'previous_blocked_users' => 0,
                            'current_users' => 10,
                            'current_active_users' =>  0,
                            'current_blocked_users' =>  0,
                            'date_time' => now()
                        ]);

                        return response()->json(['status' => 'success', 'message' => 'Customer Added Successfully']);
                    }
                }
            }

            $createdCRM->delete();
            return response()->json(['status' => 'error', 'message' => 'Failed to Add Customer']);
        } catch (\Exception $e) {
            Log::error('Error in store method: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'An error occurred.']);
        }
    }

    protected function createMainBranch($company)
    {
        $tenant = Tenant::find($company->domain);
        $tenant->run(function ($tenant) use ($company) {

            $branch = Branch::create([
                'branch_name' => $company->corporate_branch_name,
                'branch_location' => $company->city . ' - ' . $company->state,
                'name' => $company->customer_name,
                'email' => $company->customer_email,
                'mobile_no' => $company->customer_phone,
                'status' => true,
            ]);

            return 2;
        });
    }

    public function show($domain)
    {
        $tenant = Tenant::find($domain);
        $company = Company::where('domain', $domain)->first();

        $data = $tenant->run(function ($tenant) {
            $activeEmployees = User::where('status', true)->count();
            $inactiveEmployees = User::where('status', false)->count();
            $totalsLeads = Lead::count();
            $totalClosedWonLeads = Lead::where('status', 'Closed Won')->count();
            $settings = Setting::first();
            $settings ? $settings = $settings->toArray() : null;
            return [
                'activeEmployees' => $activeEmployees,
                'inactiveEmployees' => $inactiveEmployees,
                'totalsLeads' => $totalsLeads,
                'totalClosedWonLeads' => $totalClosedWonLeads,
                'settings' => $settings
            ];
        });

        return response()->json(['data' => [
            'company' => $company,
            'crmData' => $data,
        ], 'status' => 'success']);
    }


    public function update($request)
    {
        $company = Company::find($request->id);

        if (!$company) return response()->json(['status' => 'error', 'message' => 'company not found!']);
        $validated = $request->validate([
            'customer_name' => 'required|string|max:250',
            'customer_email' => 'required|email|max:250',
            'customer_phone' => 'required|digits:10',
            'company_name' => 'required|string|max:250',
            'city' => 'required|string|max:250',
            'state' => 'required|string|max:250',
            'branch_no' => 'required|string|max:250',
            'corporate_branch_name' => 'required|string|max:250',
            'status' => 'required|boolean'
        ]);

        if (!$validated['status']) {
            $validated2 = $request->validate(['status_type' => 'required|string']);

            $validated = [...$validated, ...$validated2];
        } else $validated['status_type'] = 'active';

        $updated = $company->update($validated);

        if ($updated) {
            Cache::tags(["tenant{$company->domain}"])->forget("company");
            Cache::tags(["tenant{$company->domain}"])->forget("company-settings");
            return response()->json(['status' => 'success', 'message' => 'Customer Updated Successfully!']);
        }

        return response()->json(['status' => 'success', 'message' => 'Failed to update customer']);
    }


    protected function createCrm($validated)
    {
        $tenant = Tenant::create([
            'id' => $validated['domain']
        ]);

        return $tenant->domains()->create([
            'domain' => $validated['domain'] . '.' . env('CRM_URL')
        ]);
    }

    public function defaultMigration($company)
    {
        $tenant = Tenant::find($company->domain);
        $tenant->run(function ($tenant) use ($company) {
            $tableName = 'dropdowns';
            if (Schema::hasTable($tableName)) {
                Dropdown::truncate();
                $dropdowns = config('crm.dropdowns');
                foreach ($dropdowns as $key => $dropdown) {
                    foreach ($dropdown as $d) {
                        Dropdown::create(['type' => $key, 'value' => $d, 'is_editable' => 0]);
                    }
                }
            }
        });
        return true;
    }



    public function destroy($id)
    {
        $company = Company::find($id);
        if (!$company)  return response()->json(['status' => 'error', 'message' => 'Company Not Found Found']);
        $tenant = Tenant::find($company->domain);
        if ($tenant && $company->delete() && $tenant->delete()) {
            return response()->json(['status' => 'success', 'message' => 'Company Deteted']);
        }
        return response()->json(['status' => 'error', 'message' => 'Failed to Delete Company']);
    }
}
