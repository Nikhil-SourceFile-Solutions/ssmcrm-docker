<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Lead;
use App\Models\Company\RiskProfile;
use App\Models\Company\Sale;
use App\Models\Company\SaleInvoice;
use App\Models\Company\SaleStatus;
use App\Models\Company\SaleVerification;
use App\Models\Company\Settings\Bank;
use App\Models\Company\Settings\Dropdown;
use App\Models\Company\Settings\InvoiceSetting;
use App\Models\Company\Settings\Product;
use App\Models\Company\Settings\Setting;
use App\Models\Company\User;
use App\Traits\Company\NotificationTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;

class SaleController extends Controller
{
    use NotificationTrait;

    public function create(Request $request)
    {
        $data = [
            'dropdowns' => Dropdown::whereIn('type', ['Service By', 'Client Type'])->where('status', true)->select('id', 'type', 'value')->get(),
            'bankqrcode' => Bank::where('status', true)->latest()->get(),
            'products' => Product::where('pro_status', true)->select('id', 'dropdown_id', 'pro_name', 'pro_price', 'pro_duration')->get(),
            'lead' => Lead::find($request->lead_id),
        ];
        return response()->json(['status' => 'success',  'data' => $data]);
    }



    public function store(Request $request)
    {


        if ($request->id) return $this->update($request);

        $validated = $request->validate([
            'lead_id' => 'required|integer',
            'bank' => 'required|string',
            'client_type' => 'required|string',
            'sale_service' => 'required|string',
            'sale_upload_reciept' => 'nullable',
            'product_id' => 'required|integer',
            'client_paid' => 'required|string',
            'sale_date' => 'date|nullable',
            'start_date' => 'date|nullable',
            'due_date' => 'date|nullable',
            'description' => 'nullable|string|max:1000',
        ]);


        if ($request->sale_upload_reciept) {
            $sale_upload_reciept = $request->file('sale_upload_reciept')->storeAs(time() . 'sale_upload_reciept.' . $request->file('sale_upload_reciept')->getClientOriginalExtension());
            $validated['sale_upload_reciept'] = tenant('id') . '/' . $sale_upload_reciept;
        } else $validated['sale_upload_reciept'] = " ";


        $owner = auth()->user();

        $validated['user_id'] = $owner->id;
        $validated['status'] = 'Pending';

        $product = Product::find($validated['product_id']);
        $validated['product'] = $product->pro_name;
        $validated['product_duration'] = $product->pro_duration;
        $validated['sale_price'] = $product->pro_price;


        $validated['is_custom_price']  = (floatval($validated['client_paid']) > floatval($validated['sale_price'])) ? 1 : 0;




        // $settings =  Cache::get("company-settings");
        // if (!$settings) {
        //     $settings = Setting::first();
        //     $crm = tenancy()->central(function ($tenant) {
        //         return Company::where('domain', $tenant->id)->select('branch_no', 'corporate_branch_name')->first();
        //     });
        //     $settings->branch_no = $crm->branch_no;
        //     Cache::forever("company-settings", $settings);
        // }

        $settings =  Setting::first();

        if ($validated['client_paid']) {



            if ($validated['is_custom_price'])  $offerPrice = 0;
            else $offerPrice =  $validated['sale_price'] - $validated['client_paid'];
        }

        $validated['offer_price'] = number_format((float)$offerPrice, 2, '.', '');




        //Verification
        if ($settings->sales_verification_enabled) {
            if ($settings->has_manager_verification && auth()->user()->user_type == "Manager") $validated['is_manager_verified'] = 1;
            $who = json_decode($settings->who_can_verify_sales);
            if (count($who) && in_array(auth()->user()->user_type, $who))  $validated['is_verified'] = 1;

            $who = json_decode($settings->who_can_verify_complaince_verification);
            if (count($who) && in_array(auth()->user()->user_type, $who))  $validated['is_complaince_verified'] = 1;
        }




        $created = Sale::create($validated);

        if ($created) {
            SaleStatus::create([
                'sale_id' => $created->id,
                'user_id' => $created->user_id,
                'user_type' => $owner->user_type,
                'status' => $created->status,
                'description' => $created->description
            ]);

            if ($settings->sales_verification_enabled) {
                if ($created->is_manager_verified) {
                    SaleVerification::updateOrCreate(
                        ['sale_id' => $created->id, 'verification_type' => 'Manager', 'status' => 1],
                        ['user_id' => $created->user_id, 'description' => '[Self-Verified While Creating Sale] ' . $created->description]
                    );
                }

                if ($created->is_verified) {
                    SaleVerification::updateOrCreate(
                        ['sale_id' => $created->id, 'verification_type' => 'Verified', 'status' => 1],
                        ['user_id' => $created->user_id, 'description' => '[Self-Verified While Creating Sale] ' . $created->description]
                    );
                }

                if ($created->is_complaince_verified) {
                    SaleVerification::updateOrCreate(
                        ['sale_id' => $created->id, 'verification_type' => 'Compliance', 'status' => 1],
                        ['user_id' => $created->user_id, 'description' => '[Self-Verified While Creating Sale] ' . $created->description]
                    );
                }

                $ids = User::whereIn('user_type', array_values(array_unique([
                    ...json_decode($settings->who_can_approve_expire_pause_sales),
                    ...json_decode($settings->who_can_verify_complaince_verification),
                    ...json_decode($settings->who_can_verify_sales),
                    'Accounts'
                ])))->where('status', true)->pluck('id')->toArray();

                if ($owner->user_type == "BDE") {
                    $ids = array_values(array_unique([...$ids, $owner->manager_id, $owner->team_leader_id]));
                } else if ($owner->user_type == "Team Leader") {
                    $ids = array_values(array_unique([...$ids, $owner->manager_id]));
                }
            } else $ids = [1];


            if (($key = array_search(auth()->user()->id, $ids)) !== false) {
                unset($ids[$key]);
            }

            $ids = array_values($ids);

            $message = $owner->first_name . ' ' . $owner->last_name . ' Created New Sale';
            $notification = [
                'title' => "New Sale Created!",
                'body' => $message
            ];

            $lead = Lead::find($validated['lead_id']);
            $data = [
                "action" => "sale",
                "message" => json_encode([
                    'action' => 'created',
                    'title' => "New Sale Created!",
                    'message' => $message,
                    'time' => now(),
                    'sale' => ['phone' => $lead->phone, 'client_paid' => $created->client_paid, 'product' => $created->product, 'status' => $created->status]
                ])
            ];

            $this->sendNotification($notification, $data, $ids);

            return response()->json(['status' => 'success', 'message' => 'Sale Created Successfully!', 'data' => $validated]);
        }


        return response()->json(['status' => 'error', 'message' => 'Failed to create sale']);
    }





    public function show($sale_id, Request $request)
    {



        $sale = null;
        if ($request->action) {
            $query = DB::table('sales');
            $ower = auth()->user()->id;
            if (auth()->user()->user_type == "Admin" || auth()->user()->user_type == "Accounts") $ower =  $request->filterOwner;


            if ($ower)  $query->where('user_id', $ower);
            if ($request->filterStatus) $query->where('status', $request->filterStatus);
            if ($request->action == "nxt") $query->where('id', '<', $sale_id)->orderBy('id', 'desc');
            else if ($request->action == "prv") $query->where('id', '>', $sale_id)->orderBy('id', 'asc');
            $sale =   $query->first();
        } else   $sale = Sale::find($sale_id);



        if (!$sale) return response()->json(['status' => 'error', 'message' => 'No More Sales']);
        $owner = User::find($sale->user_id);
        $lead = Lead::find($sale->lead_id);

        $data['sale']  = $sale;
        $data['owner'] = $owner;
        $data['lead']  = $lead;

        $data['dropdowns'] = Dropdown::whereIn('type', ['Service By', 'Client Type', 'State', 'Sale Status'])->where('status', true)->select('id', 'type', 'value')->get();

        $data['banks'] = Bank::where('status', true)->latest()->get();


        $data['products'] = Product::where('pro_status', true)->select('id', 'dropdown_id', 'pro_name', 'pro_price', 'pro_duration')->get();

        $settings = Setting::first();




        $data['verification']['riskprofileEnabled'] = $settings->riskprofile_enabled;


        $data['verification']['hasManagerVerification'] = $settings->has_manager_verification;
        $data['verification']['hasComplainceVerification'] = $settings->has_complaince_verification;
        $data['verification']['hasAccountsVerification'] = $settings->has_accounts_verification;


        if ($sale->is_approved || $settings->sales_verification_enabled) {
            $data['verification']['employeeVerification'] = SaleVerification::join('users', 'users.id', 'sale_verifications.user_id')
                ->where([['sale_id', $sale->id], ['sale_verifications.status', true]])->select('sale_verifications.*', 'first_name', 'last_name', 'user_type')->get();
        }




        if ($settings->riskprofile_enabled) {

            $data['verification']['riskProfile'] = RiskProfile::firstOrCreate(
                ['lead_id' => $lead->id],
                ['token' => $this->generateUniqueToken('risk_profiles')]
            )->fresh();
        }





        $data['id'] = $sale->id;
        return response()->json(['status' => 'success', 'invoiceSetting' => InvoiceSetting::first(), 'data' => $data]);
    }

    private function generateUniqueToken($table)
    {
        do {
            $token = Str::random(6);
            $exists = DB::table($table)->where('token', $token)->exists();
        } while ($exists);

        return $token;
    }


    public function update($request)
    {
        $sale = Sale::find($request->id);
        if (!$sale) return response()->json(['status' => 'error', 'message' => 'sale not found!']);


        $validated = $request->validate([
            'bank' => 'required|string',
            'client_type' => 'required|string',
            'sale_service' => 'required|string',
            'sale_upload_reciept' => 'nullable',
            'product_id' => 'required|integer',
            'client_paid' => 'nullable|string',
            'description' => 'required|string|max:1000',
            'status' => 'required|string',
            'sale_date' => 'date|required',
            'start_date' => 'date|nullable',
            'due_date' => 'date|nullable',
            'is_verified' => 'required|boolean',
            'is_complaince_verified' => 'required|boolean',
            'is_account_verified' => 'required|boolean',
            'is_manager_verified' => 'required|boolean',
            'is_service_activated' => 'nullable|boolean'
        ]);


        $aletData = null;
        if ($sale->is_verified) $validated['is_verified'] = 1;
        else if ($validated['is_verified']) {
            $validated['is_verified'] = 1;
            SaleVerification::updateOrCreate(
                ['sale_id' => $sale->id, 'verification_type' => 'Verified', 'status' => 1],
                ['user_id' => auth()->user()->id, 'description' => $validated['description']]
            );

            $aletData = [$sale, "Sale Verified", 'The sale has been successfully Verified by ' . auth()->user()->first_name . ' ' . auth()->user()->last_name];
        } else $validated['is_verified'] = 0;



        if ($sale->is_complaince_verified) $validated['is_complaince_verified'] = 1;
        else if ($validated['is_complaince_verified']) {
            $validated['is_complaince_verified'] = 1;
            SaleVerification::updateOrCreate(
                ['sale_id' => $sale->id, 'verification_type' => 'Compliance', 'status' => 1],
                ['user_id' => auth()->user()->id, 'description' => $validated['description']]
            );

            $aletData = [$sale, "Sale Compliance Verified", auth()->user()->first_name . ' ' . auth()->user()->last_name . ' has successfully completed the Compliance Verification for the sale.'];
        } else $validated['is_complaince_verified'] = 0;


        if ($sale->is_account_verified) $validated['is_account_verified'] = 1;
        else if ($validated['is_account_verified']) {
            $validated['is_account_verified'] = 1;
            SaleVerification::updateOrCreate(
                ['sale_id' => $sale->id, 'verification_type' => 'Accounts', 'status' => 1],
                ['user_id' => auth()->user()->id, 'description' => $validated['description']]
            );
            $aletData = [$sale, "Sale Accounts Verified", auth()->user()->first_name . ' ' . auth()->user()->last_name . ' has successfully completed the Accounts Verification for the sale.'];
        } else $validated['is_account_verified'] = 0;


        if ($sale->is_manager_verified) $validated['is_manager_verified'] = 1;
        else if ($validated['is_manager_verified']) {
            $validated['is_manager_verified'] = 1;
            SaleVerification::updateOrCreate(
                ['sale_id' => $sale->id, 'verification_type' => 'Manager', 'status' => 1],
                ['user_id' => auth()->user()->id, 'description' => $validated['description']]
            );

            $aletData = [$sale, "Sale Manager Verified", auth()->user()->first_name . ' ' . auth()->user()->last_name . ' has successfully completed the Manager Verification for the sale.'];
        } else $validated['is_manager_verified'] = 0;



        if ($sale->is_approved) $validated['is_approved'] = 1;
        else if ($validated['status'] == 'Approved') {
            $validated['is_approved'] = 1;
            SaleVerification::updateOrCreate(
                ['sale_id' => $sale->id, 'verification_type' => 'Approved', 'status' => true],
                ['user_id' => auth()->user()->id, 'description' => $validated['description']]
            );

            $aletData = [$sale, "Sale Approved", 'The sale has been successfully Approved by ' . auth()->user()->first_name . ' ' . auth()->user()->last_name];
        } else $validated['is_approved'] = 0;







        if ($request->sale_upload_reciept) {
            $sale_upload_reciept = $request->file('sale_upload_reciept')->storeAs(time() . 'sale_upload_reciept.' . $request->file('sale_upload_reciept')->getClientOriginalExtension());
            $validated['sale_upload_reciept'] = tenant('id') . '/' . $sale_upload_reciept;
        } else $validated['sale_upload_reciept'] = $sale->sale_upload_reciept;





        $product = Product::find($validated['product_id']);
        $validated['product'] = $product->pro_name;
        $validated['product_duration'] = $product->pro_duration;
        $validated['sale_price'] = $product->pro_price;



        $validated['is_custom_price']  = (floatval($validated['client_paid']) > floatval($validated['sale_price'])) ? 1 : 0;



        $settings =  Setting::first();

        if ($validated['client_paid']) {

            if ($validated['is_custom_price'])  $offerPrice = 0;
            else $offerPrice =  $validated['sale_price'] - $validated['client_paid'];
        }



        $validated['offer_price'] = number_format((float)$offerPrice, 2, '.', '');





        // if ($validated['status'] == 'Verified') {
        // if (auth()->user()->user_type == "Manager" && $settings->has_manager_verification) {
        //     $validated['is_manager_verified'] = true;
        //     SaleVerification::updateOrCreate(
        //         ['sale_id' => $sale->id, 'verification_type' => 'Manager', 'status' => true],
        //         ['user_id' => auth()->user()->id, 'description' => $validated['description']]
        //     );
        // }
        //  else if (auth()->user()->user_type == "Accounts" && $settings->has_accounts_verification) {
        //     $validated['is_account_verified'] = true;
        //     SaleVerification::updateOrCreate(
        //         ['sale_id' => $sale->id, 'verification_type' => 'Accounts', 'status' => true],
        //         ['user_id' => auth()->user()->id, 'description' => $validated['description']]
        //     );
        // }

        // else if (auth()->user()->user_type == "Compliance" && $settings->has_complaince_verification) {
        //     $validated['is_complaince_verified'] = true;
        //     SaleVerification::updateOrCreate(
        //         ['sale_id' => $sale->id, 'verification_type' => 'Compliance', 'status' => true],
        //         ['user_id' => auth()->user()->id, 'description' => $validated['description']]
        //     );
        // }
        // } else  if ($validated['status'] == 'Approved' && auth()->user()->user_type == "Accounts" && $settings->has_accounts_verification) {
        //     $validated['is_account_verified'] = true;
        //     SaleVerification::updateOrCreate(
        //         ['sale_id' => $sale->id, 'verification_type' => 'Accounts', 'status' => true],
        //         ['user_id' => auth()->user()->id, 'description' => $validated['description']]
        //     );
        // }




        if ($validated['status'] == 'Approved') {

            $validated2 = $request->validate([
                'sale_date' => 'date|required',
                'start_date' => 'date|required',
                'due_date' => 'date|required',
            ]);

            $validated = [...$validated, ...$validated2];
        }





        $data = Arr::except($validated, ['description']);



        $updated = $sale->update($data);

        if ($updated) {
            SaleStatus::create([
                'sale_id' => $sale->id,
                'user_id' => auth()->user()->id,
                'user_type' => auth()->user()->user_type,
                'status' => $validated['status'],
                'description' => $validated['description']
            ]);

            if ($aletData) $this->verificationAlert($aletData[0], $aletData[1], $aletData[2]);
            $sale->is_custom_price = $sale->is_custom_price ? 1 : 0;
            return response()->json([
                'status' => 'success',
                'message' => 'Sale Updated successfully!',
                'sale' => $sale,
                'employeeVerification' =>  SaleVerification::join('users', 'users.id', 'sale_verifications.user_id')
                    ->where([['sale_id', $sale->id], ['sale_verifications.status', true]])->select('sale_verifications.*', 'first_name', 'last_name', 'user_type')->get()
            ]);
        }

        return response()->json(['status' => 'error', 'message' => 'Failed to  Updated sale!']);
    }


    private function verificationAlert($sale, $title, $message)
    {
        $settings = Setting::first();
        if ($settings->sales_verification_enabled) {
            $ids = User::whereIn('user_type', array_values(array_unique([
                ...json_decode($settings->who_can_approve_expire_pause_sales),
                ...json_decode($settings->who_can_verify_complaince_verification),
                ...json_decode($settings->who_can_verify_sales),
                'Accounts'
            ])))->where('status', true)->pluck('id')->toArray();

            $owner = User::find($sale->user_id);

            if ($owner->user_type == "BDE") {
                $ids = array_values(array_unique([...$ids, $owner->manager_id]));
            } else if ($owner->user_type == "Team Leader") {
                $ids = array_values(array_unique([...$ids, $owner->manager_id]));
            }

            $ids = array_values(array_unique([...$ids, $owner->id]));




            if (($key = array_search(auth()->user()->id, $ids)) !== false) {
                unset($ids[$key]);
            }

            $ids = array_values($ids);

            $notification = [
                'title' => $title,
                'body' => $message,
            ];

            $lead = Lead::find($sale->lead_id);

            $data = [
                "action" => "sale",
                "message" => json_encode([
                    'action' => 'created',
                    'title' => $title,
                    'message' => $message,
                    'time' => now(),
                    'sale' => ['phone' => $lead->phone, 'client_paid' => $sale->client_paid, 'product' => $sale->product, 'status' => $sale->status]
                ])
            ];


            $this->sendNotification($notification, $data, $ids);
        }
    }

    public function leadSalesHistory(Request $request)
    {

        $lead = Lead::find($request->lead_id);

        if (!$lead) return response()->json(['status' => 'error', 'message' => 'Lead not found!']);

        $sales = Sale::where('lead_id', $lead->id)->join('users', 'users.id', 'sales.user_id')
            ->join('banks', 'banks.id', 'sales.bank')
            ->select('sales.*', 'first_name', 'last_name', 'user_type', 'bank_name', 'is_bank_upi')->latest()->get();

        return response()->json(['status' => 'success', 'sales' => $sales]);
    }

    public function salesStatuses(Request $request)
    {
        $statuses = SaleStatus::join('users', 'users.id', 'sale_statuses.user_id')
            ->where('sale_id', $request->sale_id)
            ->select('sale_statuses.*', 'first_name', 'last_name')
            ->latest()
            ->get();

        foreach ($statuses as $status) {
            $status->time = $status->created_at->format('d M Y H:i:s a');
        }

        return response()->json(['status' => 'success', 'statuses' => $statuses]);
    }

    public function destroy($sale)
    {
        $sale = Sale::find($sale);
        if (!$sale) {
            return response()->json(['status' => 'error', 'message' => 'Sale not found!']);
        }

        // Restrict deletion based on user type and ownership of the sale
        if (auth()->user()->user_type == "BDE" || auth()->user()->user_type == "Manager" || auth()->user()->user_type == "Team Leader") {
            if ($sale->user_id != auth()->user()->id) {
                return response()->json(['status' => 'error', 'message' => 'This sale does not belong to you']);
            }
            if ($sale->status != "Pending") {
                return response()->json([
                    'status' => 'error',
                    'title' => 'Failed!',
                    'message' => 'Sales not in Pending status!',
                    'description' => 'If you want to delete, contact Admin or Accounts.'
                ]);
            }
        }

        $invoice = SaleInvoice::where('sale_id', $sale->id)->first();
        if ($invoice) return response()->json(['status' => 'error', 'message' => 'Sales Can Not be Deleted Because Invoice is already generated']);

        SaleStatus::where('sale_id', $sale->id)->delete();
        SaleVerification::where('sale_id', $sale->id)->delete();


        if ($sale->delete()) {

            $message = "Sale Deleted by " . auth()->user()->first_name . ' ' . auth()->user()->last_name . ' [' . auth()->user()->user_type . ']';
            $notification = [
                'title' => "Sale Deleted",
                'body' => "$message",
            ];

            $lead = Lead::find($sale->lead_id);

            $data = [
                "action" => "sale",
                "message" => json_encode([
                    'action' => 'created',
                    'title' => "Sale Deleted",
                    'message' => $message,
                    'time' => now(),
                    'sale' => ['phone' => $lead->phone, 'client_paid' => $sale->client_paid, 'product' => $sale->product, 'status' => $sale->status]
                ])
            ];

            $ids = User::whereIn('user_type', ['Admin', 'Accounts'])
                ->where('status', true)
                ->where('id', '!=', auth()->id())
                ->pluck('id')
                ->toArray();

            $ids[] = $sale->user_id;
            $ids = array_unique($ids);

            $this->sendNotification($notification, $data, $ids);
            return response()->json(['status' => 'success', 'message' => 'Sale deleted successfully!']);

            // info sales's owner, admin and accounts


        }

        return response()->json(['status' => 'error', 'message' => 'Failed to delete sale.']);
    }
}
