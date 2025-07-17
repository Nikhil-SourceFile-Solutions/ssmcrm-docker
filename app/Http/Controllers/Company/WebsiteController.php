<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Lead;
use App\Models\Company\SendLinkResponse;
use App\Models\Company\Settings\Setting;
use App\Models\Company\Settings\SmsConfig;
use App\Models\Company\Settings\SmsTemplate;
use App\Models\Company\Settings\WhatsappNewConfig;
use App\Models\Company\Settings\WhatsappTemplate;
use App\Models\Company\WebsiteLink;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class WebsiteController extends Controller
{
    public function sendLink(Request $request)
    {

        $lead = Lead::find($request->lead_id);
        if (!$lead) return response()->json([
            'status' => 'error',
            'messae' => 'Not Found'
        ]);

        $settings = Setting::first();

        if ($settings && $settings->website_permission) {

            $send = $this->sendWebsiteLink($lead, $settings);

            return $send;
        }

        return response()->json([
            'status' => 'error',
            'messae' => 'Not website_permission'
        ]);
    }

    protected function sendWebsiteLink($lead, $settings)
    {
        $sms = [0, ['message' => 'Not Enabled']];
        $whatsapp = [0, ['message' => 'Not Enabled']];


        if ($settings->sms_enabled) {
            $sms = $this->sendSms($lead);
            if (!is_array($sms) || count($sms) < 2 || !isset($sms[0], $sms[1])) {
                $sms = [0, ['message' => 'SMS function returned an invalid response']];
            }
        }


        if ($settings->whatsapp_enabled) {
            $whatsapp = $this->sendWhatsapp($lead);
            if (!is_array($whatsapp) || count($whatsapp) < 2 || !isset($whatsapp[0], $whatsapp[1])) {
                $whatsapp = [0, ['message' => 'WhatsApp function returned an invalid response']];
            }
        }

        if ($sms[0] || $whatsapp[0]) {
            $already = WebsiteLink::where('lead_id', $lead->id)->first();
            if (!$already) $already = WebsiteLink::create(['lead_id' => $lead->id, 'count' => 1]);
            else $already->update(['count' => $already->count + 1]);
            return response()->json([
                'status' => 'success',
                'data' => [
                    'sms' => $sms[1],
                    'whatsapp' => $whatsapp[1]
                ],
                'website' => $already,
                'message' => 'Link Send Successfully!'
            ]);
        }


        return response()->json([
            'status' => 'error',
            'message' => 'No successful communication method found'
        ]);
    }

    protected function sendSms($lead)
    {


        $sms_config = SmsConfig::first();
        if (!$sms_config) return [0, 'message' => 'SMS Config not found'];
        $template = SmsTemplate::where([['template_type', 'Website Send Link'], ['status', true]])->first();
        if (!$template) return [0, 'message' => 'Template Not Found'];

        if ($template->provider == "webpayservices") return $this->sendWebPaySms($lead, $template, $sms_config);

        $data = [
            '#first_name' => $lead->first_name,
            '#full_name' => $lead->first_name . ' ' . $lead->last_name
        ];
        $final_template = $template->template;
        foreach ($data as $key => $value) {
            $final_template = str_replace($key, $value,  $final_template);
        }
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',

            ])->post($sms_config->api_url, [
                'ApiKey' => $sms_config->api_key,
                'ClientId' => $sms_config->client_id,
                'SenderId' => $template->sender_id,
                'Message' => $final_template,
                'MobileNumbers' => implode(',', [$lead->phone]),
            ]);
            if ($response->successful()) {
                SendLinkResponse::create([
                    'phone' => $lead->phone,
                    'branch_id' => auth()->user()->branch_id,
                    'user_id' => auth()->user()->id,
                    'lead_id' => $lead->id,
                    'response' => json_encode($response->json()),
                ]);
                return [1,  $response->json()];
            } else {
                return [0, $response->json()];
            }
        } catch (\Exception $e) {
            return [0, 'message' => 'Sms sent failled'];
        }
    }

    private function sendWebPaySms($lead, $template, $sms_config)
    {

        $finalTemplate = str_replace("#first_name", $lead->first_name, $template->template);
        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->get($sms_config->api_url, [
                'username' => $sms_config->sms_user_name,
                'apikey' => $sms_config->api_key,
                'apirequest' => "$template->api_request",
                'sender' => $template->sender_id,
                'mobile' => $lead->phone,
                'message' => " $finalTemplate",
                'route' =>  $template->api_route,
                'TemplateID' =>  $template->template_id,
                'format' => 'JSON',
            ]);

            if ($response->successful()) {

                SendLinkResponse::create([
                    'phone' => $lead->phone,
                    'branch_id' => auth()->user()->branch_id,
                    'user_id' => auth()->user()->id,
                    'lead_id' => $lead->id,
                    'response' => json_encode($response->json()),

                ]);
                return [1,  $response->json()];
            } else {
                return [0, $response->json()];
            }
        } catch (\Exception $e) {
            return [0, 'message' => 'Sms sent failled'];
        }
    }
    protected function countPlaceholders($template)
    {
        // Regular expression to match both #placeholders and {{placeholders}}
        preg_match_all('/(#\w+|{{\d+}})/', $template, $matches);

        // Return the unique placeholders found
        return array_unique($matches[0]);
    }

    protected function sendWhatsapp($lead)
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
            '#first_name' => $lead->first_name,
            '#full_name' => $lead->first_name . '' . $lead->last_name,
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
            SendLinkResponse::create([
                'phone' => $lead->phone,
                'branch_id' => auth()->user()->branch_id,
                'user_id' => auth()->user()->id,
                'lead_id' => $lead->id,
                'response' => json_encode($response->json()),
                'platform' => 'whatsapp'
            ]);
            return [1, $response->json()];
        } else {
            return [0, $response->json()];
        }
    }
    // protected function sendWhatsapplast($lead)
    // {
    //     $whatsapp_config = WhatsappNewConfig::first();
    //     if (!$whatsapp_config) {
    //         return [0, ['message' => 'Whatsapp Config not found']];
    //     }

    //     $template = WhatsappTemplate::where([['template_type', 'Website Send Link'], ['status', true]])->first();
    //     if (!$template) return [0, ['message' => 'Template Not Found']];

    //     // Extract placeholders from the template
    //     $placeholders = $this->countPlaceholders($template->template);

    //     // Initialize the dynamic data array
    //     $data = [];



    //     // Populate the data array based on the placeholders found
    //     foreach ($placeholders as $placeholder) {
    //         switch ($placeholder) {
    //             case '#first_name':
    //                 $data[$placeholder] = $lead->first_name; // Populate with lead's first name
    //                 break;
    //             case '#full_name':
    //                 $data[$placeholder] = $lead->first_name . ' ' . $lead->last_name; // Populate with lead's full name
    //                 break;
    //             case '{{1}}':
    //                 $data[$placeholder] = 'https://example.com/link1'; // Example dynamic link
    //                 break;
    //             case '{{2}}':
    //                 $data[$placeholder] = 'https://example.com/link2'; // Example dynamic link
    //                 break;
    //             case '{{3}}':
    //                 $data[$placeholder] = 'https://example.com/link3'; // Example dynamic link
    //                 break;
    //             case '{{4}}':
    //                 $data[$placeholder] = 'https://example.com/link4'; // Example dynamic link
    //                 break;
    //             case '{{5}}':
    //                 $data[$placeholder] = 'https://example.com/link5'; // Example dynamic link
    //                 break;
    //             case '{{6}}':
    //                 $data[$placeholder] = 'https://example.com/link6'; // Example dynamic link
    //                 break;
    //             case '{{7}}':
    //                 $data[$placeholder] = 'https://example.com/link7'; // Example dynamic link
    //                 break;
    //             // Add more cases as needed for other placeholders
    //         }
    //     }

    //     // Prepare parameters as JSON objects
    //     $parameters = [];
    //     foreach ($data as $key => $value) {
    //         $parameters[] = [
    //             "type" => "text",
    //             "text" => $value
    //         ];
    //     }
    //     // Send the request
    //     $phone = '91' . $lead->phone; // Format phone number for WhatsApp
    //     $request_body = [
    //         "messaging_product" => "whatsapp",
    //         "to" => $phone,
    //         "type" => "template",
    //         "template" => [
    //             "name" => $template->template_name,
    //             "language" => [
    //                 // "code" => "en_US"
    //                 "code" =>$template->code
    //             ],
    //             "components" => [
    //                 [
    //                     "type" => "body",
    //                     "parameters" => $parameters // Use the dynamically populated parameters
    //                 ]
    //             ]
    //         ]
    //     ];

    //     // Send the request
    //     $response = Http::withHeaders([
    //         'Content-Type' => 'application/json',
    //         'Authorization' => 'Bearer ' . $whatsapp_config->token
    //     ])->withBody(json_encode($request_body), 'application/json')
    //         ->post($whatsapp_config->api_link . '/' . $whatsapp_config->version . '/' . $whatsapp_config->phone_no_id . '/messages');

    //     if ($response->successful()) {
    //         return [1, $response->json()];
    //     } else {
    //         return [0, $response->json()];
    //     }
    // }


    //     protected function sendWhatsappssss($lead)
    //     {
    //         $whatsapp_config = WhatsappNewConfig::first();
    //         if (!$whatsapp_config) {
    //             return [0, ['message' => 'Whatsapp Config not found']];
    //         }

    //         $template = WhatsappTemplate::where([['template_type', 'Website Send Link'], ['status', true]])->first();
    //         if (!$template) return [0, ['message' => 'Template Not Found']];

    //         // Dynamic data
    //         $data = [
    //             '#first_name' => $lead->first_name,
    //             '#full_name' => $lead->first_name . ' ' . $lead->last_name,
    //             '{{3}}' => 'https://example.com/link', // Add your dynamic link here
    //             '{{4}}' => 'https://example.com/link', // Add your dynamic link here
    //             '{{5}}' => 'https://example.com/link'  // Add your dynamic link here
    //         ];

    //         // Check if the template contains dynamic placeholders
    //         $final_template = $template->template;
    //         $contains_dynamic_data = false;
    //         $parameters = [];

    //         foreach ($data as $key => $value) {
    //             if (strpos($final_template, $key) !== false) {
    //                 $contains_dynamic_data = true; // Template has dynamic placeholders
    //                 $final_template = str_replace($key, $value, $final_template);

    //                 // Add dynamic data as text parameters for WhatsApp API
    //                 $parameters[] = [
    //                     "type" => "text",
    //                     "text" => $value
    //                 ];
    //             }
    //         }

    //         $phone = '91' . $lead->phone;

    //         // Prepare the request body conditionally
    //         $request_body = [
    //             "messaging_product" => "whatsapp",
    //             "to" => $phone,
    //             "type" => "template",
    //             "template" => [
    //                 "name" => $template->template_name,
    //                 "language" => [
    //                     // "code" => "en_US"
    //                     "code" =>$template->code
    //                 ]
    //             ]
    //         ];

    //         // If dynamic data is found in the template, add parameters
    //         if ($contains_dynamic_data) {
    //             $request_body["template"]["components"] = [
    //                 [
    //                     "type" => "body",
    //                     "parameters" => $parameters
    //                 ]
    //             ];
    //         }

    //         // Send the request
    //         $response = Http::withHeaders([
    //             'Content-Type' => 'application/json',
    //             'Authorization' => 'Bearer ' . $whatsapp_config->token
    //         ])->withBody(json_encode($request_body), 'application/json')
    //             ->post($whatsapp_config->api_link . '/' . $whatsapp_config->version . '/' . $whatsapp_config->phone_no_id . '/messages');

    //         if ($response->successful()) {
    //             return [1, $response->json()];
    //         } else {
    //             return [0, $response->json()];
    //         }
    //     }

    //     protected function sendWhatsapp11111($lead)
    //     {
    //         $whatsapp_config = WhatsappNewConfig::first();
    //         if (!$whatsapp_config) {
    //             return [0, ['message' => 'Whatsapp Config not found']];
    //         }

    //         $template = WhatsappTemplate::where([['template_type', 'Website Send Link'], ['status', true]])->first();
    //         if (!$template)  return [0, ['message' => 'Template Not Found']];


    //         // Dynamic data
    //         $data = [
    //             '#first_name' => $lead->first_name,
    //             '#full_name' => $lead->first_name . ' ' . $lead->last_name,
    //             '{{3}}' => 'https://example.com/link', // Add your dynamic link here
    //             '{{4}}' => 'https://example.com/link',  // Add your dynamic link here
    //             '{{5}}' => 'https://example.com/link'  // Add your dynamic link here


    //         ];

    //         // Check if the template contains dynamic placeholders
    //         $final_template = $template->template;
    //         $contains_dynamic_data = false;

    //         foreach ($data as $key => $value) {
    //             if (strpos($final_template, $key) !== false) {
    //                 $contains_dynamic_data = true; // Template has dynamic placeholders
    //                 $final_template = str_replace($key, $value, $final_template);
    //             }
    //         }

    //         $phone = '91' . $lead->phone;

    //         // Prepare the request body conditionally
    //         $request_body = [
    //             "messaging_product" => "whatsapp",
    //             "to" => $phone,
    //             "type" => "template",
    //             "template" => [
    //                 "name" => $template->template_name,
    //                 "language" => [
    //                     // "code" => "en_US"
    //                     "code" =>$template->code
    //                 ]
    //             ]
    //         ];

    //         // If dynamic data is found in the template, add parameters
    //         if ($contains_dynamic_data) {
    //             $request_body["template"]["components"] = [
    //                 [
    //                     "type" => "body",
    //                     "parameters" => [
    //                         [
    //                             "type" => "text",
    //                             "text" => $lead->first_name // First dynamic data
    //                         ],
    //                         [
    //                             "type" => "text",
    //                             "text" => $lead->first_name . ' ' . $lead->last_name // Second dynamic data
    //                         ],
    //                         [
    //                             "type" => "text",
    //                             "text" => 'https://example.com/link' // Link (dynamic)
    //                         ],
    //                         [
    //                             "type" => "text",
    //                             "text" => 'https://example.com/link' // Link (dynamic)
    //                         ],
    //                         [
    //                             "type" => "text",
    //                             "text" => 'https://example.com/link' // Link (dynamic)
    //                         ]
    //                     ]
    //                 ]
    //             ];
    //         }

    //         // Send the request
    //         $response = Http::withHeaders([
    //             'Content-Type' => 'application/json',
    //             'Authorization' => 'Bearer ' . $whatsapp_config->token
    //         ])->withBody(json_encode($request_body), 'application/json')
    //             ->post($whatsapp_config->api_link . '/' . $whatsapp_config->version . '/' . $whatsapp_config->phone_no_id . '/messages');

    //         if ($response->successful()) {
    //             return [1, $response->json()];
    //         } else {
    //             return [0, $response->json()];
    //         }
    //     }

    //     protected function sendWhatsapp2($lead)
    //     {
    //         $whatsapp_config = WhatsappNewConfig::first();
    //         if (!$whatsapp_config) {
    //             return [0, ['message' => 'Whatsapp Config not found']];
    //         }

    //         $template = WhatsappTemplate::where([['template_type', 'Website Send Link'], ['status', true]])->first();
    //         if (!$template)  return [0, ['message' => 'Template Not Found']];

    //         $data = [
    //             '#first_name' => $lead->first_name,
    //             '#full_name' => $lead->first_name . ' ' . $lead->last_name,
    //             '#link' => 'https://example.com/link'  // Add your dynamic link here
    //         ];

    //         $final_template = $template->template;
    //         foreach ($data as $key => $value) {
    //             $final_template = str_replace($key, $value, $final_template);
    //         }



    //         $phone = '91' . $lead->phone;

    //         $response = Http::withHeaders([
    //             'Content-Type' => 'application/json',
    //             'Authorization' => 'Bearer ' . $whatsapp_config->token
    //         ])->withBody(json_encode([
    //             "messaging_product" => "whatsapp",
    //             "to" => $phone,
    //             "type" => "template",
    //             "template" => [
    //                 "name" => $template->template_name,
    //                 "language" => [
    //                     // "code" => "en_US"
    //                     "code" =>$template->code
    //                 ],
    //                 "components" => [
    //                     [
    //                         "type" => "body",
    //                         "parameters" => [
    //                             [
    //                                 "type" => "text",
    //                                 "text" => $lead->first_name // First dynamic data
    //                             ],
    //                             [
    //                                 "type" => "text",
    //                                 "text" => $lead->first_name . ' ' . $lead->last_name // Second dynamic data
    //                             ],
    //                             [
    //                                 "type" => "text",
    //                                 "text" => 'https://example.com/link' // Link (dynamic)
    //                             ],
    //                             [
    //                                 "type" => "text",
    //                                 "text" => 'https://example.com/link' // Link (dynamic)
    //                             ],
    //                             [
    //                                 "type" => "text",
    //                                 "text" => 'https://example.com/link' // Link (dynamic)
    //                             ]
    //                         ]
    //                     ]
    //                 ]
    //             ]
    //         ]), 'application/json')->post($whatsapp_config->api_link . '/' . $whatsapp_config->version . '/' . $whatsapp_config->phone_no_id . '/messages');

    //         if ($response->successful()) {
    //             return [1, $response->json()];
    //         } else {
    //             return [0, $response->json()];
    //         }
    //     }


}
