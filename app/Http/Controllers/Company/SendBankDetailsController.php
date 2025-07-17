<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Lead;
use App\Models\Company\SendBankDetails;
use App\Models\Company\Settings\Bank;
use App\Models\Company\Settings\Setting;
use App\Models\Company\Settings\SmsConfig;
use App\Models\Company\Settings\SmsTemplate;
use App\Models\Company\Settings\WhatsappNewConfig;
use App\Models\Company\Settings\WhatsappTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;


class SendBankDetailsController extends Controller
{


    public function getSendBabkDetailsData()
    {
        $whatsAppTemplates = WhatsappTemplate::whereIn('template_type', ['Bank Details', ['Upi Details']])->where('status', true)->latest()->get();

        $smsTemplates = SmsTemplate::whereIn('template_type', ['Bank Details', ['Upi Details']])->where('status', true)->latest()->get();

        $payments = Bank::where('status', true)->get();

        return response()->json(['status' => 'success', 'data' => ['whatsAppTemplates' => $whatsAppTemplates, 'smsTemplates' => $smsTemplates, 'payments' => $payments]]);
    }

    public function sendLink(Request $request)
    {
        $lead = Lead::find($request->lead_id);
        if (!$lead) return response()->json(data: [
            'status' => 'error',
            'messae' => 'Not Found'
        ]);

        $settings = Setting::first();
        if ($settings) {
            $send = $this->sendBankDeatils($lead, $settings, $request);
            return $send;
        }
        return response()->json([
            'status' => 'error',
            'messae' => 'Do Not have website permission'
        ]);
    }

    protected function sendBankDeatils($lead, $settings, $request)
    {
        $whatsapp = [0, ['message' => 'Not Enabled']];

        if ($settings->whatsapp_enabled) {
            if($request->bank_template_id){
              $whatsapp = $this->sendBankWhatsapp($lead,$request);
                if (!is_array($whatsapp) || count($whatsapp) < 2 || !isset($whatsapp[0], $whatsapp[1])) {
                    $whatsapp = [0, ['message' => 'WhatsApp function returned an invalid response']];
                }
            }
            if($request->upi_template_id){
                $whatsapp = $this->sendUpiWhatsapp($lead, $request);
                if (!is_array($whatsapp) || count($whatsapp) < 2 || !isset($whatsapp[0], $whatsapp[1])) {
                    $whatsapp = [0, ['message' => 'WhatsApp function returned an invalid response']];
                }
            }


        }
        if ($whatsapp[0]) {
            $already = SendBankDetails::where('lead_id', $lead->id)->first();
            if (!$already) $already = SendBankDetails::create([
                'lead_id' => $lead->id,
            'count' => 1,
            //  'is_bank' => $request->is_bank,
             'bank' => $request->bank,
            //  'is_upi' => $request->is_upi,
             'bank_template_id' => $request->bank_template_id,
             'upi_template_id' => $request->upi_template_id,
             'bank_final_template' => $request->bank_final_template,
             'upi_final_template' => $request->upi_final_template,
             'bankfields' => $request->bankfields,
             'upifields' => $request->upifields,
            ]);
            else $already->update(['count' => $already->count + 1,
            // 'is_bank' => $request->is_bank,
             'bank' => $request->bank,
            //  'is_upi' => $request->is_upi,
             'bank_template_id' => $request->bank_template_id,
             'upi_template_id' => $request->upi_template_id,
             'bank_final_template' => $request->bank_final_template,
             'upi_final_template' => $request->upi_final_template,
             'bankfields' => $request->bankfields,
             'upifields' => $request->upifields,


        ]);
            return response()->json([
                'status' => 'success',
                'data' => [
                    'whatsapp' => $whatsapp[1]
                ],
                'Bank Details' => $already
            ]);
        }

        // Return error if both failed
        return response()->json([
            'status' => 'error',
            'message' => 'No successful communication method found'
        ]);
    }


    protected function sendBankWhatsapp($lead,$request)
    {
        // return $request->bankfields;
        $whatsapp_config = WhatsappNewConfig::first();
        if (!$whatsapp_config) {
            return [0, ['message' => 'Whatsapp Config not found']];
        }

        $template = WhatsappTemplate::where([['template_type', 'Bank Details'], ['status', true]])->first();
        if (!$template) {
            return [0, ['message' => 'Template Not Found']];
        }

        $final_template = $template->template;
        $parameters = [];

        preg_match_all('/(#\w+|\{\{\d+\}\})/', $final_template, $matches);

        // Data to replace in the template
        $bankFieldsArray = explode(',',  $request->bankfields);

        $data = [
            '#first_name' => $lead->first_name ?? 'Sir/Madam' ,
            '#full_name' => $lead->first_name . '' . $lead->last_name,
            '{{1}}' =>  $bankFieldsArray[0] ?? 'one',
            '{{2}}' =>  $bankFieldsArray[1] ?? 'two Name',
            '{{3}}' =>  $bankFieldsArray[1] ?? '3 Name',
            '{{4}}' =>  $bankFieldsArray[3] ?? '4 Name',
            '{{5}}' =>  $bankFieldsArray[4] ?? '5 Name',
            '{{6}}' => $bankFieldsArray[5] ?? '5 Name',
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

        $phone = '91' . $lead->phone;

        $request_body = [
            "messaging_product" => "whatsapp",
            "to" => $phone,
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
    protected function sendUpiWhatsapp($lead, $request)
{
    $whatsapp_config = WhatsappNewConfig::first();
    if (!$whatsapp_config) {
        return [0, ['message' => 'WhatsApp Config not found']];
    }

    $template = WhatsappTemplate::where([['template_type', 'Upi Details'], ['status', true]])->first();
    if (!$template) {
        return [0, ['message' => 'Template Not Found']];
    }

    $final_template = $template->template;
    $parameters = [];

    preg_match_all('/(#\w+|\{\{\d+\}\})/', $final_template, $matches);

    // Extract UPI fields from request
    $bankFieldsArray = explode(',', $request->upifields);

    // Data to replace in the template
    $data = [
        '#first_name' => $lead->first_name,
        '#full_name' => $lead->first_name . ' ' . $lead->last_name,
        '{{1}}'=>$bankFieldsArray[0] ?? 'one',
        '{{2}}' => $bankFieldsArray[1] ?? 'one',
        '{{3}}' => $bankFieldsArray[2] ?? 'two',
        '{{4}}' => $bankFieldsArray[3] ?? 'three',

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

    $phone = '91' . $lead->phone;

    // Request body for WhatsApp API
    $request_body = [
        "messaging_product" => "whatsapp",
        "to" => $phone,
        "type" => "template",
        "template" => [
            "namespace" => "26908059_67f8_4fa3_85df_3ac28ce13824",
            "language" => [
                "policy" => "deterministic",
                "code" => "en_US"
            ],
            "name" => "qrdetails",
            "components" => [
                // Header Component with Image
                [
                    "type" => "header",
                    "parameters" => [
                        [
                            "type" => "image",
                            "image" => [
                                // "link" =>"https://srresearch.thefinsap.com/storage/srresearch/1727596006logo.png"
                                "link" =>$request->api_url.$bankFieldsArray[2]?? "https://srresearch.thefinsap.com/storage/srresearch/1727596006logo.png"


                            ]
                        ]
                    ]
                ],
                // Body Component with Dynamic Parameters
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
    ])->withBody(json_encode($request_body), 'application/json')
        ->post($whatsapp_config->api_link . '/' . $whatsapp_config->version . '/' . $whatsapp_config->phone_no_id . '/messages');

    if ($response->successful()) {
        return [1, $response->json()];
    } else {
        return [0, $response->json()];
    }
}


}
