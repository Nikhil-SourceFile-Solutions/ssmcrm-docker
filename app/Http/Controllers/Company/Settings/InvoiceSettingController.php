<?php

namespace App\Http\Controllers\Company\Settings;

use App\Http\Controllers\Controller;
use App\Models\Company\Sale;
use App\Models\Company\Settings\Bank;
use App\Models\Company\Settings\InvoiceSetting;
use App\Models\Company\Settings\Setting;
use App\Models\Console\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class InvoiceSettingController extends Controller
{

    public function index()
    {
        $invoicesetting = InvoiceSetting::first();
        return response()->json(['status' => 'success', 'invoicesetting' => $invoicesetting]);
    }

    public function store(Request $request)
    {
        $already = InvoiceSetting::first();
        if ($already) return $this->update($request, $already);
        $validated = $request->validate([
            'invoice_prefix' => 'required|string',
            'invoice_start_from' => 'required|integer',
            'invoice_type' => 'required|string',
            'invoice_template' => 'required|string',
            'company_name' => 'required|string|max:250',
            'address' => 'required|string|max:2000',
            'email' => 'required|string|max:1000',
            'phone' => 'required|string|max:1000',
            'is_send_invoice' => 'nullable|string|max:250',
            'send_invoice_via_sms' => 'required|boolean',
            'send_invoice_via_whatsapp' => 'required|boolean',
            'send_invoice_via_email' => 'required|boolean',
            'enabled_send_auto_invoice' => 'required|boolean',
            'enabled_send_sms_invoice' => 'required|boolean',
            'enabled_send_whatsapp_invoice' => 'required|boolean',
            'enabled_send_email_invoice' => 'required|boolean',
        ]);
        if (!$validated['is_send_invoice']) {
            $validated['send_invoice_via_sms'] = 0;
            $validated['send_invoice_via_whatsapp'] = 0;
            $validated['send_invoice_via_email'] = 0;
            $validated['enabled_send_auto_invoice'] = 0;
        }
        if (!$validated['enabled_send_auto_invoice']) {
            $validated['enabled_send_sms_invoice'] = 0;
            $validated['enabled_send_whatsapp_invoice'] = 0;
            $validated['enabled_send_email_invoice'] = 0;
        }
        $response = InvoiceSetting::create($validated);
        if ($response) {
            Cache::forget("invoice-settings");
            return response()->json([
                'message' => 'Invoice Setting Added',
                'status' => 'success',
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
            'invoice_prefix' => 'required|string',
            'invoice_start_from' => 'required|integer',
            'invoice_type' => 'required|string',
            'invoice_template' => 'required|string',
            'company_name' => 'required|string|max:250',
            'address' => 'required|string|max:2000',
            'email' => 'required|string|max:1000',
            'phone' => 'required|string|max:1000',
            'is_send_invoice' => 'nullable|string|max:250',
            'send_invoice_via_sms' => 'required|boolean',
            'send_invoice_via_whatsapp' => 'required|boolean',
            'send_invoice_via_email' => 'required|boolean',
            'enabled_send_auto_invoice' => 'required|boolean',
            'enabled_send_sms_invoice' => 'required|boolean',
            'enabled_send_whatsapp_invoice' => 'required|boolean',
            'enabled_send_email_invoice' => 'required|boolean',
        ]);

        if (!$validated['is_send_invoice']) {
            $validated['send_invoice_via_sms'] = 0;
            $validated['send_invoice_via_whatsapp'] = 0;
            $validated['send_invoice_via_email'] = 0;
            $validated['enabled_send_auto_invoice'] = 0;
        }

        if (!$validated['enabled_send_auto_invoice']) {
            $validated['enabled_send_sms_invoice'] = 0;
            $validated['enabled_send_whatsapp_invoice'] = 0;
            $validated['enabled_send_email_invoice'] = 0;
        }

        $updated = $already->update($validated);

        if ($updated) {
            Cache::forget("invoice-settings");
            return response()->json([
                'status' => 'success',
                'message' => 'Invoice Setting Updated Successfully',
                'invoicesetting' => $already
            ]);
        }
        return response()->json([
            'message' => 'Failed',
            'status' => 'error',

        ]);
    }

    public function preview(Request $request)
    {
        $company_settings =  Cache::get("company-settings");


        if ($request->invoice_template == 'single-product-invoice') {
            $view = 'company.invoice.single-product-invoice';
        } else  if ($request->invoice_template == 'table-product-invoice') {
            $view = 'company.invoice.table-product-invoice';
        } else $view = 'company.invoice.invoice-three';

        if (!$company_settings) {
            $company_settings = Setting::first();
            $crm = tenancy()->central(function ($tenant) {
                return Company::where('domain', $tenant->id)->select('branch_no', 'corporate_branch_name')->first();
            });
            $company_settings->branch_no = $crm->branch_no;
            Cache::forever("company-settings", $company_settings);
        }

        $logo = $company_settings->logo ? url('storage/' . $company_settings->logo) : null;
        $sale = Sale::first();

        $userData = [
            'name' => "Jinto Xavier",
            'address_one' => "No 3 Basapura Main road",
            'address_two' => "Sulthan Bathery - Kerala",
            'email' => "username@email.com",
            'phone' => 974474747
        ];

        $invoiceData = [
            'address' => $request->address,
            'email' => $request->email,
            'phone' => $request->phone,

            'company_name' => $request->company_name,
        ];

        $invoiceData = [
            ...$invoiceData,
            'invoice_id' => $request->invoice_prefix . '-' . $request->invoice_start_from + $sale->id,
            'date' => $sale->created_at
        ];



        return response()->json([
            'status' => 'success',
            'preview' => view($view, [
                'logo' => $logo,
                'sale' => $sale,
                'userData' => $userData,
                'invoiceData' => $invoiceData,
                'bank' => Bank::first()
            ])->render()
        ]);
    }
}
