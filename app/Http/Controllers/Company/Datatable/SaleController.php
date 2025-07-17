<?php

namespace App\Http\Controllers\Company\Datatable;

use App\Http\Controllers\Controller;
use App\Models\Company\Sale;
use App\Models\Company\Settings\Bank;
use App\Models\Company\Settings\Dropdown;
use App\Models\Company\Settings\Product;
use App\Models\Company\Settings\Setting;
use App\Models\Company\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{



    public function index(Request $request)
    {
        $pageSize = $request->get('pageSize', 10);


        $currentPage = $request->get('page', 1);


        $offset = ($currentPage - 1) * $pageSize;

     $filterState = $request->get('filterState', 0);

        if (auth()->user()->user_type == 'BDE' || auth()->user()->user_type == 'Manager' || auth()->user()->user_type == 'Team Leader') $filterOwner = auth()->user()->id;

        else $filterOwner = $request->get('filterOwner', 0);

        $filterStatus = $request->get('filterStatus', 0);

        $search = $request->get('search', 0);

        $query = Sale::Join('users', 'sales.user_id', 'users.id')
            ->join('banks', 'banks.id', 'sales.bank')
            ->Join('leads', 'sales.lead_id', 'leads.id');

   if($filterState) $query->where('state', $filterState);

        if ($filterOwner)  $query->where('sales.user_id', $filterOwner);

        if ($filterStatus)  $query->where('sales.status', $filterStatus);

        // if ($search) $query->where('phone', 'LIKE', '%' . $request->search . '%');


        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('leads.phone', 'like', '%' . $search . '%')
                    ->orWhere('leads.last_name', 'like', '%' . $search . '%')
                    ->orWhere('leads.first_name', 'like', '%' . $search . '%')
                    ->orWhere(DB::raw("CONCAT(leads.first_name, ' ', leads.last_name)"), 'like', '%' . $search . '%');
            });
        }


        $totalItems = $query->count();

        $query->select(
            'sales.*',
            'banks.bank_name',
            'banks.upi',
            'banks.is_bank_upi',
            'leads.first_name',
            'leads.last_name',
            'leads.email',
            'leads.phone',
            'leads.second_phone',
            DB::raw("CONCAT(users.first_name, IF(users.last_name IS NOT NULL, CONCAT(' ', users.last_name), '')) as owner")
        )
            ->orderBy('sales.created_at', 'desc');

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
        ];

        if ($request->firstTime) {
            $response['settings'] = Setting::first();
            $response['saleStatuses'] = $this->allSaleStatuses();
              $response['saleStates'] = $this->allSaleStates();

            if (auth()->user()->user_type == 'Admin' || auth()->user()->user_type == 'Accounts' || auth()->user()->user_type == 'HR' || auth()->user()->user_type == 'Complaince')    $response['allSaleOwners'] = $this->allSaleOwners();
        }

        return response()->json($response);
    }

      private function allSaleStates(){
        $dropdownItems = Dropdown::where('type', 'State')
        ->where('status', true)
        ->select('value as value', 'value as label')
        ->get();

    return  $dropdownItems->prepend(['value' => 0, 'label' => 'All States']);
    }


    protected function createSaleData()
    {
        $data = [
            'dropdowns' => Dropdown::whereIn('type', ['Service By', 'Client Type'])->where('status', true)->select('id', 'type', 'value')->get(),
            'banks' => Bank::where([['status', true], ['is_bank_upi', 'bank']])->latest()->get(),
            'qrCodes' => Bank::where([['status', true], ['is_bank_upi', 'upi']])->latest()->get(),
            'products' => Product::where('pro_status', true)->select('id', 'dropdowns', 'pro_name', 'pro_price', 'pro_duration')->get()
        ];

        return $data;
    }

    private function allSaleStatuses()
    {
        $dropdownItems = Dropdown::where('type', 'Sale Status')
            ->where('status', true)
            ->select('value as value', 'value as label')
            ->get();

        return  $dropdownItems->prepend(['value' => 0, 'label' => 'All']);
    }

    protected function getallSaleOwners($query)
    {
        $query->select('users.id as value', DB::raw("CONCAT(users.first_name, IF(users.last_name IS NOT NULL, CONCAT(' ', users.last_name), '')) as label"))
            ->distinct();

        // label
        $uniqueUsers = $query->get();
        $allOption = collect([
            (object) [
                'value' => 0,
                'label' => 'All Sales',
            ]
        ]);
        $userId1Option = $uniqueUsers->firstWhere('value', 1);
        $remainingUsers = $uniqueUsers->filter(function ($user) {
            return $user->value != 1;
        });
        $result = $allOption;
        if ($userId1Option) {
            $result = $result->push($userId1Option);
        }
        return $result->merge($remainingUsers);
    }






    protected function allSaleOwners()
    {
        $userIds = Sale::distinct()->pluck('user_id');
        $owners = User::whereIn('id', $userIds)
            ->where('status', true)
            ->select(
                'id as value',
                DB::raw("CONCAT_WS(' ', first_name, last_name) as label")
            )
            ->latest()
            ->get();

        $owners->prepend([
            'value' => 0,
            'label' => 'All'
        ]);
        return $owners;
    }
}
