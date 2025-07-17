<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Lead;
use App\Models\Company\Sale;
use App\Models\Company\SaleInvoice;
use App\Models\Company\Settings\Bank;
use App\Models\Company\Settings\Dropdown;
use App\Models\Company\Settings\InvoiceSetting;
use App\Models\Company\Settings\Sebi;
use App\Models\Company\Settings\Setting;
use App\Models\Company\Settings\WhatsappNewConfig;
use App\Models\Company\Settings\WhatsappTemplate;
use App\Models\Console\Company;
use App\Traits\Company\InvoiceTrait;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;

// use PDF;
// use Mail;


class InvoiceController extends Controller
{

    use InvoiceTrait;
    public function index(Request $request)
    {

        $invoiceSetting =  Cache::get("invoice-settings");

        if (!$invoiceSetting) {
            $invoiceSetting = InvoiceSetting::first();
            Cache::forever("invoice-settings", $invoiceSetting);
        }


        if ($invoiceSetting->invoice_type == 'Auto Invoice') return $this->autoInvoiceIndex($invoiceSetting, $request,);


        else return $this->manualInvoiceIndex($invoiceSetting, $request);
    }


    private function autoInvoiceIndex($invoiceSetting, $request)
    {

        $pageSize = $request->get('pageSize', 10);
        $currentPage = $request->get('page', 1);
        $offset = ($currentPage - 1) * $pageSize;
        $search = $request->get('search', 0);
        $query = Sale::join('leads', 'sales.lead_id', '=', 'leads.id')
            ->select(DB::raw(
                "CONCAT('" . $invoiceSetting->invoice_prefix . "', '-', " .
                    $invoiceSetting->invoice_start_from . " + sales.id) as invoice_id, 
            sales.id as sale_id,        
            phone, email, first_name, last_name, 
            client_paid , 
            DATE_FORMAT(sales.sale_date, '%d-%m-%y') as sale_date"
            ));

        if ($search) $query->where('leads.phone', 'LIKE', '%' . $search . '%');

        $totalItems = $query->count();
        $query->latest('sales.id')->offset($offset)->limit($pageSize);
        $from = $offset + 1;
        $to = min($offset + $pageSize, $totalItems);
        $data = [
            'data' => $query->GET(),
            'currentPage' => $currentPage,
            'pageSize' => $pageSize,
            'totalItems' => $totalItems,
            'from' => $from,
            'to' => $to,
            'states' => Dropdown::where([['type', 'State'], ['status', true]])->pluck('value')->toArray(),
            'invoiceSetting' => $invoiceSetting

        ];
        return response()->json(['status' => 'success', "data" =>  $data]);
    }


    private function manualInvoiceIndex($invoiceSetting, $request)
    {
        $pageSize = $request->get('pageSize', 10);
        $currentPage = $request->get('page', 1);
        $offset = ($currentPage - 1) * $pageSize;
        $search = $request->get('search', 0);
        $query = SaleInvoice::join('sales', 'sales.id', '=', 'sale_invoices.sale_id')
            ->select(DB::raw(
                "CONCAT('" . $invoiceSetting->invoice_prefix . "', '-', " .
                    $invoiceSetting->invoice_start_from . " + sale_invoices.id) as invoice_id, 
           sale_id,        
           mobile as phone, email, name as first_name, 
           client_paid,
            DATE_FORMAT(sale_invoices.created_at, '%d-%m-%y') as sale_date"
            ));

        if ($search) {
            $query->where('sale_invoices.mobile', 'LIKE', '%' . $search . '%');
        }
        // if ($search)
        //     $query->where('sale_invoices.name', 'like', '%' . $request->search . '%');
        $totalItems = $query->count();
        $query->latest('sale_invoices.id')->offset($offset)->limit($pageSize);
        $from = $offset + 1;
        $to = min($offset + $pageSize, $totalItems);
        $data = [
            'data' => $query->GET(),
            'currentPage' => $currentPage,
            'pageSize' => $pageSize,
            'totalItems' => $totalItems,
            'from' => $from,
            'to' => $to,
            'states' => Dropdown::where([['type', 'State'], ['status', true]])->pluck('value')->toArray(),
            'invoiceSetting' => $invoiceSetting

        ];
        return response()->json(['status' => 'success', "data" =>  $data]);
    }






    public function store(Request $request)
    {
        if ($request->id) return $this->update($request);

        $validated = $request->validate([
            'lead_id' => 'nullable',
            'sale_id' => 'nullable',
            'name' => [
                'required',
                'string',
                // Conditionally check for unique name only if "Add Address" is selected
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->select_address === 'Add Address') {
                        $existingName = SaleInvoice::where('name', $value)->first();
                        if ($existingName) {
                            $fail('The name already exists. Name must be unique.');
                        }
                    }
                },
            ],
            'email' => 'required|string',
            'mobile' => 'nullable|string|max:10',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
        ]);

        // Check if sale_id exists to decide whether to throw an error
        if ($validated['sale_id']) {
            $existingInvoice = SaleInvoice::where('sale_id', $validated['sale_id'])->first();
            if ($existingInvoice) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invoice cannot be created as only one invoice is allowed per Sale ID!',
                    'data' => $existingInvoice,
                    'action' => 'error'
                ]);
            }
        }

        // If no sale_id exists or not found, create a new invoice
        $created = SaleInvoice::create($validated);

        if ($created) {

            return response()->json([
                'status' => 'success',
                'message' => 'Sale Invoice Address Created Successfully!',
                'data' => $created,
                'action' => 'create'
            ]);
        }

        return response()->json(['status' => 'error', 'message' => 'Failed to create sale invoice']);
    }

    public function update($request)
    {
        $invoicesales = SaleInvoice::find($request->id);
        if (!$invoicesales) return response()->json([
            'message' => 'invoicesales not found',
            'status' => 'error',
        ]);

        $validated = $request->validate([
            'lead_id' => 'nullable',
            'sale_id' => 'nullable',
            'name' => [
                'required',
                'string',

            ],
            'email' => 'required|string',
            'mobile' => 'nullable|string|max:10',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
        ]);

        $response = $invoicesales->update($validated);

        if ($response) return response()->json([
            'message' => 'Address Updated',
            'status' => 'success',
            'invoicesales' => $invoicesales,
            'action' => 'update'

        ]);
        return response()->json([
            'message' => 'Failed',
            'status' => 'error',

        ]);
    }

    public function show($sale_id)
    {


        $invoiceSetting =  Cache::get("invoice-settings");

        if (!$invoiceSetting) {
            $invoiceSetting = InvoiceSetting::first();
            Cache::forever("invoice-settings", $invoiceSetting);
        }

        $sale = Sale::where('id', $sale_id)->select(
            'sales.id as sale_id',
            'sale_date',
            'bank',
            'client_paid',
            'lead_id',
            'product',
            'sale_service',
            'sale_date',
            'due_date',
            'client_paid',

        )->first();

        if ($invoiceSetting->invoice_type == 'Auto Invoice') {

            $lead = Lead::find($sale->lead_id);
            $sale->invoice_id =  $invoiceSetting->invoice_prefix . '-' . $invoiceSetting->invoice_start_from + $sale_id;
            $sale->phone = $lead->phone;
            $sale->email = $lead->email;
            $sale->first_name = $lead->first_name;
            $sale->last_name = $lead->last_name;
            $sale->address_two = ($lead->city ? $lead->city . ' - ' : '') . $lead->state;
        } else {
            $invoice = SaleInvoice::where('sale_id', $sale_id)->first();
            $sale->invoice_id =  $invoiceSetting->invoice_prefix . '-' . $invoiceSetting->invoice_start_from + $invoice->id;
            $sale->phone = $invoice->mobile;
            $sale->email = $invoice->email;
            $sale->first_name = $invoice->name;
            $sale->address_one = $invoice->address;
            $sale->address_two = ($invoice->city ? $invoice->city . ' - ' : '') . $invoice->state;
        }

        return response()->json(['status' => 'success', 'data' => [
            'invoice' => $sale,
            'sebi' => Sebi::first(),
            'bank' => Bank::find($sale->bank),
        ]]);
    }

    public function create(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'previousInvoices' => SaleInvoice::where('sale_invoices.lead_id', $request->lead_id)->latest()->get(),
                'states' => Dropdown::where([['type', 'State'], ['status', true]])->pluck('value')->toArray()
            ]
        ]);
    }

    public function downloadInvoice(Request $request)
    {

        $sale = Sale::find($request->id);
        if (!$sale) return response()->json(['status' => 'error', 'message' => 'Sale Not Found!']);
        $invoicesetting = InvoiceSetting::first();

        if (!$invoicesetting) return response()->json(['status' => 'error', 'message' => 'Invoice settings pending!']);


        $company_settings =  Cache::get("company-settings");

        if (!$company_settings) {
            $company_settings = Setting::first();
            $crm = tenancy()->central(function ($tenant) {
                return Company::where('domain', $tenant->id)->select('branch_no', 'corporate_branch_name')->first();
            });
            $company_settings->branch_no = $crm->branch_no;
            Cache::forever("company-settings", $company_settings);
        }

        $logo = $company_settings->logo ? url('storage/' . $company_settings->logo) : null;

        $lead = Lead::find($sale->lead_id);

        $pdf = $this->getPdfInvoice($sale, $invoicesetting, $logo, $lead);


        return $pdf->download('invoice.pdf');
    }

    public function testPdfView()
    {

        $company_settings =  Cache::get("company-settings");
        $invoicesetting = InvoiceSetting::first();
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



        // $viewData = [
        //     'invoicesetting' => $invoicesetting,
        //     'sale' => $sale,
        //     'logo' => $logo,
        // ];

        // if ($invoicesetting->invoice_type === 'Auto Invoice') {
        //     $view = 'company.documents.invoice';
        //     $viewData['lead'] = $lead;
        // } else {
        //     $view = 'company.documents.invoice';
        //     $viewData['invoice'] = SaleInvoice::where('sale_id', $sale->id)->first();
        // }

        $invoiceData = [
            'address' => $invoicesetting->address,
            'email' => $invoicesetting->email,
            'phone' => $invoicesetting->phone,

            'company_name' => $invoicesetting->company_name
        ];




        if ($invoicesetting->invoice_type === 'Auto Invoice') {

            $lead = Lead::find($sale->lead_id);

            $userData = [
                'name' => $lead->first_name . ' ' . $lead->last_name,
                'address_one' => null,
                'address_two' => ($lead->city ? $lead->city . ' - ' : '') . $lead->state,
                'email' => $lead->email,
                'phone' => $lead->phone
            ];

            $invoiceData = [
                ...$invoiceData,
                'invoice_id' => $invoicesetting->invoice_prefix . '-' . $invoicesetting->invoice_start_from + $sale->id,
                'date' => $sale->created_at
            ];
        } else {
            $invoice = SaleInvoice::where('sale_id', $sale->id)->first();
            $userData = [
                'name' => $invoice->name,
                'address_one' => $invoice->address,
                'address_two' => ($invoice->city ? $invoice->city . ' - ' : '') . $invoice->state,
                'email' => $invoice->email,
                'phone' => $invoice->mobile
            ];

            $invoiceData = [
                ...$invoiceData,
                'invoice_id' => $invoicesetting->invoice_prefix . '-' . $invoicesetting->invoice_start_from + $invoice->id,
                'date' => $invoice->created_at
            ];
        }


        // return;

        $pdf = Pdf::setOption(['isRemoteEnabled' => true])
            ->loadView('company.documents.invoice', [
                'logo' => $logo,
                'sale' => $sale,
                'userData' => $userData,
                'invoiceData' => $invoiceData
            ])
            ->setWarnings(true);


        return $pdf->download('invoice.pdf');

        return view('company.documents.invoice', [
            'logo' => $logo,

            'sale' => $sale,
            'userData' => $userData,
            'invoiceData' => $invoiceData
        ]);
    }



    public function sendInvoice1111(Request $request)
    {

        if ($request->tab == "Whatsapp") {
            $validated = $request->validate([
                'mobile' => 'required|max:10',
            ]);
            $send = $this->SendWhatsappInvoice($request);
            return $send;
        }

        // return $request;
        $validated = $request->validate([
            'email' => 'required|email',
            // 'mobile' => 'nullable|string|max:10',
        ]);

        $invoicesetting = InvoiceSetting::first();

        if ($invoicesetting->invoice_type == 'Auto Invoice') {
            $data = [
                'full_name' => $request->name,
                'email' => $validated['email'],
                'mobile' => $request->mobile,
            ];

            Mail::send('emails.contact', $data, function ($message) use ($data, $request, $validated) {
                $sale = Sale::find($request->sale_id);
                $invoice = SaleInvoice::find($request->id);
                $data = [
                    'lead' => Lead::find($sale->lead_id),
                    'sale' => $sale,
                    'sebi' => Sebi::first(),
                    'bank' => Bank::find($sale->bank),
                    'invoice' => $invoice,
                    'apple' => InvoiceSetting::first(),
                    'setting' => Setting::first()
                ];
                $pdf = Pdf::loadView('company.documents.autoInvoice', ['data' =>  $data]);
                $message->to($validated['email'])
                    ->subject('Invoice')
                    ->attachData($pdf->output(), "Invoice.pdf")
                    ->from('gudiya@sourcefilesolutions.com');
            });
            return response()->json(["status" => "success", 'data' => $data, "message" => "Data sent success"]);
        }

        $data = [
            'full_name' => $request->name,
            'email' => $validated['email'],
            'mobile' => $request->mobile,
        ];

        Mail::send('emails.contact', $data, function ($message) use ($data, $request, $validated) {
            $sale = Sale::find($request->sale_id);
            $invoice = SaleInvoice::find($request->id);
            $data = [
                'lead' => Lead::find($sale->lead_id),
                'sale' => $sale,
                'sebi' => Sebi::first(),
                'bank' => Bank::find($sale->bank),
                'invoice' => $invoice,
                'apple' => InvoiceSetting::first(),
                'setting' => Setting::first()
            ];
            $pdf = Pdf::loadView(
                'company.documents.invoice',
                ['data' =>  $data]
            );
            $message->to($validated['email'])
                ->subject('Invoice')
                ->attachData($pdf->output(), "Invoice.pdf")
                ->from('gudiya@sourcefilesolutions.com');
        });

        return response()->json(["status" => "success", 'data' => $data, "message" => "Data sent success"]);
    }

    protected function SendWhatsappInvoice($request)
    {

        $whatsapp_config = WhatsappNewConfig::first();
        if (!$whatsapp_config) {
            return [0, ['message' => 'Whatsapp Config not found']];
        }

        $template = WhatsappTemplate::where([['template_type', 'Website Send Link'], ['status', true]])->first();
        if (!$template) {
            return [0, ['message' => 'Template Not Found']];
        }

        $final_template = $template->template;
        $parameters = [];

        preg_match_all('/(#\w+|\{\{\d+\}\})/', $final_template, $matches);

        // Data to replace in the template
        $data = [
            '#first_name' => "TESTING",
            '#full_name' => "TESt",
            '#link' => "link",
            '{{1}}' => "jjjjj",
            '{{2}}' => 'Buy',
            '{{3}}' => '175.50',
            '{{4}}' => '180.00',
            '{{5}}' => '185.00',
            '{{6}}' => '170.00'
        ];


        foreach ($matches[0] as $placeholder) {
            if (isset($data[$placeholder])) {
                $final_template = str_replace($placeholder, $data[$placeholder], $final_template);

                $parameters[] = [
                    "type" => "text",
                    "text" => $data[$placeholder]
                ];
            }
        }

        // $phone = '91' . $lead->phone;

        $request_body = [
            "messaging_product" => "whatsapp",
            "to" => "919632884028",
            "type" => "template",
            "template" => [
                "name" => $template->template_name,
                "language" => [
                    "code" => $template->code
                ]
            ]
        ];

        if (!empty($parameters)) {
            $request_body["template"]["components"] = [
                [
                    "type" => "body",
                    "parameters" => $parameters
                ]
            ];
        }

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $whatsapp_config->token
        ])->withBody(json_encode($request_body), 'application/json')
            ->post($whatsapp_config->api_link . '/' . $whatsapp_config->version . '/' . $whatsapp_config->phone_no_id . '/messages');

        if ($response->successful()) {
            return [1, $response->json()];
        } else {
            return [0, $response->json()];
        }
    }
}
