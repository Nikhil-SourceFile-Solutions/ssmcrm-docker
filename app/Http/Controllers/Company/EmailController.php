<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Lead;
use App\Models\Company\Sale;
use App\Models\Company\Settings\EmailConfiguration;
use App\Models\Company\Settings\InvoiceSetting;
use App\Models\Company\Settings\Setting;
use Illuminate\Http\Request;
use App\Models\Company\Settings\WhatsappNewConfig;
use App\Models\Company\Settings\WhatsappTemplate;
use App\Models\Console\Company;
use App\Traits\Company\InvoiceTrait;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\Address;

class EmailController extends Controller
{

    use InvoiceTrait;
    public function sendInvoice(Request $request)
    {
        $validated = $request->validate([
            'sale_id' => 'required|integer',
            'is_email' => 'required|boolean',
            'is_sms' => 'required|boolean',
            'is_whatsapp' => 'required|boolean',
            'mobile' => 'nullable',
            'email' => 'nullable',
        ]);


        if ($validated['is_sms'] || $validated['is_whatsapp']) {
            $v1 = $request->validate(['mobile' => 'required|digits:10']);
            $validated = [...$validated, $v1];
        }

        if ($validated['is_email']) {
            $v2 = $request->validate(['email' => 'required|email|max:250']);
            $validated = [...$validated, $v2];
        }


        $sale = Sale::find($validated['sale_id']);
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

        $pdfContent = $pdf->output();

        $client = $lead->first_name . ' ' . $lead->last_name;

        $eR = [0, null];
        $wR = [0, null];


        if ($request->is_email)  $eR = $this->sendMail($validated['email'], $pdfContent, $client, $logo);
        if ($request->is_whatsapp) $wR = $this->sendWhatsApp($lead, $pdfContent, $validated['mobile'], $sale);


        if ($eR[0] || $wR[0]) return response()->json([
            'status' => 'success',
            'whatsAppResponse' => $wR[1],
            'emailResponse' => $eR[1]
        ]);

        return response()->json([
            'status' => 'error',
            'whatsAppResponse' => $wR[1],
            'emailResponse' => $eR[1]
        ]);
    }

    public function sendMail($clientEmail, $pdfContent, $client, $logo)
    {
        try {
            // $ses = AwsSes::first();
            // if (!$ses) return [0, 'AWS SES configuration not found!'];
            // Mail::to($email)->send(new InvoiceMail($pdfContent, ['clientName' => $client, 'logo' => $logo], $ses->email, $ses->from_name));

            $emailConfiguration = EmailConfiguration::first();

            if (!$emailConfiguration) return [1, 'Email Configuration not found!'];
            $transport = new EsmtpTransport(
                $emailConfiguration->host,
                $emailConfiguration->port,
                null
            );
            $transport->setUsername(
                $emailConfiguration->user_name
            );
            $transport->setPassword($emailConfiguration->password);
            $mailer = new Mailer($transport);
            $email = (new Email())
                ->from(new Address($emailConfiguration->from_address, $emailConfiguration->from_name))
                ->to($clientEmail)
                ->subject('Invoice')
                ->html(view('company.email.invoice', ['client' => $client, 'logo' => $logo])->render())
                ->attach($pdfContent, 'invoice.pdf', 'application/pdf');
            $mailer->send($email);

            return [1, 'Email sent successfully'];
        } catch (\Exception $e) {
            return [0, $e->getMessage()];
        }
    }





    protected function sendWhatsApp($lead, $pdfContent, $mobile, $sale)
    {
        $whatsapp_config = WhatsappNewConfig::first();
        if (!$whatsapp_config) {
            return [0, 'WhatsApp Config not found'];
        }

        $template = WhatsappTemplate::where([['template_type', 'Send Invoice'], ['status', true]])->first();
        if (!$template) {
            return [0, 'Send Invoice Template Not Found'];
        }

        $final_template = $template->template;
        $parameters = [];

        preg_match_all('/(#\w+|\{\{\d+\}\})/', $final_template, $matches);

        $data = [
            '#first_name' => $lead->first_name,
            '#full_name' => $lead->first_name . ' ' . $lead->last_name,
            '{{2}}' => $sale->id
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


        $fileName = 'invoice-' . time() . '.pdf';
        $filePath =  '/invoices/' . $fileName;

        Storage::put($filePath, $pdfContent);


        $pdfUrl = url('storage/' . tenant('id') . '/' . $filePath);


        $request_body = [
            "messaging_product" => "whatsapp",
            "to" => "91" . $mobile,
            "type" => "template",
            "template" => [
                "name" => $template->template_name,
                "language" => [
                    "code" => $template->code
                ],
                "components" => [
                    [
                        "type" => "header",
                        "parameters" => [
                            [
                                "type" => "document",
                                "document" => [
                                    "link" => $pdfUrl,
                                    "filename" => "Invoice.pdf"
                                ]
                            ]
                        ]
                    ],
                    [
                        "type" => "body",
                        "parameters" => $parameters

                    ]
                ]
            ]
        ];


        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $whatsapp_config->token
        ])->post(
            $whatsapp_config->api_link . '/' . $whatsapp_config->version . '/' . $whatsapp_config->phone_no_id . '/messages',
            $request_body
        );



        if ($response->successful()) {
            return [1, "whatsapp sent successfully"];
        } else {
            return [0, "failed to send whatsapp"];
        }
    }
}
