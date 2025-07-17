<?php

namespace App\Http\Controllers\Company\Settings;

use App\Http\Controllers\Controller;
use App\Models\Company\Settings\Bank;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BankController extends Controller
{


    public function index(Request $request)
    {

        $pageSize = $request->get('pageSize', 10);
        $currentPage = $request->get('page', 1);

        $offset = ($currentPage - 1) * $pageSize;




        $filterStatus = $request->get('filterStatus', 'all');

        $search = $request->get('search', 0);

        $query = DB::table('banks')->where('is_bank_upi', 'bank');




        if ($filterStatus != 'all') $query->where('status', $filterStatus);


        if ($search)  $query->where('bank_name', 'LIKE', '%' . $search . '%')
            ->orWhere('account_number', 'LIKE', '%' . $search . '%')
            ->orWhere('account_holder_name', 'LIKE', '%' . $search . '%')
            ->orWhere('ifsc_code', 'LIKE', '%' . $search . '%');

        $totalItems = $query->count();

        $query->latest('id')->offset($offset)->limit($pageSize);

        $from = $offset + 1;
        $to = min($offset + $pageSize, $totalItems);



        $data = [
            'data' => $query->GET(),
            'currentPage' => $currentPage,
            'pageSize' => $pageSize,
            'totalItems' => $totalItems,
            'from' => $from,
            'to' => $to
        ];

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function getbankqrcode()
    {
        $banks = Bank::get();
        return response()->json(['status' => 'success', 'banks' => $banks]);
    }



    public function store(Request $request)
    {
        if ($request->id) return $this->update($request);

        $validated = $request->validate([
            'bank_name' => 'nullable|string|max:250',
            'account_number' => 'nullable|string|max:250',
            'account_holder_name' => 'nullable|string|max:250',
            'account_type' => 'nullable|string|max:250',
            'ifsc_code' => 'nullable|string|max:11',
            'branch' => 'nullable|string|max:250',
            'status' => 'nullable|boolean',
        ]);
        $validated['is_bank_upi'] = 'bank';


        $created = Bank::create($validated);

        if ($created) return response()->json(['status' => 'success', 'message' => 'New Bank Added successfully!', 'bank' => $created]);

        return response()->json(['status' => 'error', 'message' => 'Failed to add new bank!']);
    }





    public function update($request)
    {

        $bank = Bank::find($request->id);

        if (!$bank) return response()->json(['status' => 'error', 'message' => 'Bank not found!']);

        $validated = $request->validate([
            'bank_name' => 'nullable|string|max:250',
            'account_number' => 'nullable|string|max:250',
            'account_holder_name' => 'nullable|string|max:250',
            'account_type' => 'nullable|string|max:250',
            'ifsc_code' => 'nullable|string|max:11',
            'branch' => 'nullable|string|max:250',
            'status' => 'nullable|boolean',
        ]);


        $updated = $bank->update($validated);

        if ($updated) return response()->json(['status' => 'success', 'message' => 'Bank Updated successfully!', 'bank' =>  $bank]);

        return response()->json(['status' => 'error', 'message' => 'Failed to update bank!']);
    }


    public function statusUpdate(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer'
        ]);
        $bank = Bank::find($validated['id']);
        if (!$bank) return response()->json(['status' => 'error', 'bank not found!']);
        $bank->status = !$bank->status;
        if ($bank->save()) return response()->json(['status' => 'success', 'message' => 'bank status Updated successfully', 'value' => $bank->status]);
    }



    public function destroy(Bank $bank)
    {

        if (!$bank) return response()->json(['status' => 'error', 'message' => 'Bank not found!']);

        if ($bank->delete()) return response()->json(['status' => 'success', 'message' => 'Bank deleted successfully!']);

        return response()->json(['status' => 'error', 'message' => 'Failed to deleted bank!']);
    }
}
