<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Sale;
use App\Models\Company\Settings\Setting;
use App\Traits\Company\NotificationTrait;
use Illuminate\Http\Request;

class _TestController extends Controller
{

    use NotificationTrait;



    public function send()
    {
        sleep(5);
        $notification = [
            'title' => 'Lead Request Accepted',
            'body' => 'Test Message Test Message',
        ];
        $data = [
            "action" => "lead-request",
            "value" => "1",
            "state" => "Kerala",
            "totalRequest" => "35"
        ];


        return $this->sendNotification($notification, $data, [1]);
    }

    public function saleCalculation()
    {
        $s =  Setting::first();




        if ($s->gst_enabled) {
            $sales = Sale::get();
            foreach ($sales as $sale) {
                $gst = 118;
                $res = (($sale->client_paid / $gst) * 100);
                $res2 = $sale->client_paid - $res;

                $sale->save();
            }
        }


        return "Done";
    }
}
