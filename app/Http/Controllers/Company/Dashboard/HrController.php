<?php

namespace App\Http\Controllers\Company\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Company\IpTrack;
use App\Models\Company\Sale;
use App\Models\Company\Settings\Setting;
use App\Models\Company\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HrController extends Controller
{
    public function index(){

$sales=$this->Sales();
        $data['todaysSales']=$sales[0];
        $data['monthlySales']=$sales[1];
        $data['yearlySales']=$sales[2];
        $data['totalSales']=$sales[3];
$employees=$this->Employees();

        $data['totalEmployees']=$employees[0];
        $data['activeEmployees']=$employees[1];
        $data['inactiveEmployees']=$employees[2];
        $data['presentEmployees']=$employees[3];


        return response()->json([
            'status'=>'success',
            'data'=>$data
        ]);
    }

    private function Sales()
{
    $settings = Setting::first();
    $sumColumn = $settings->gst_enabled ? 'inclusive_gst' : 'client_paid';

    $todaySales = DB::table('sales')
    ->whereDate('sale_date', now())
    ->sum($sumColumn);


    $monthlySales=DB::table('sales')
    ->whereMonth('sale_date', now()->month)
    ->whereYear('sale_date', now()->year)
    ->sum($sumColumn);

$yearlySales=DB::table('sales')
 ->whereYear('sale_date', now()->year)
->sum($sumColumn);



$totalSales=DB::table('sales')
->sum($sumColumn);
    return [number_format($todaySales,2),
     number_format( $monthlySales,2),
     number_format($yearlySales,2)

     ,number_format($totalSales,2)];
}


private function Employees(){
    $totalEmployees=User::where('user_type','!=','Admin')->count();

    $activeEmployees=User::where([['user_type','!=','Admin'],['status',true]])->count();

    $inactiveEmployees=User::where([['user_type','!=','Admin'],['status',false]])->count();

    $ids=IpTrack::whereDate('created_at', now())->where('action','Log In')->pluck('user_id')->toArray();

    $presentEmployees=User::whereIn('id',$ids)->count();
    return [$totalEmployees,$activeEmployees,$inactiveEmployees,$presentEmployees];
}
}
