<?php

namespace App\Http\Controllers\Company\Settings;

use App\Http\Controllers\Controller;
use App\Models\Company\Settings\Bank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QrcodeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $pageSize = $request->get('pageSize', 10);
        $currentPage = $request->get('page', 1);

        $offset = ($currentPage - 1) * $pageSize;

        $filterStatus = $request->get('filterStatus', 'all');

        $search = $request->get('search', 0);

        $query = DB::table('banks')->where('is_bank_upi', 'upi')
            ->select('id', 'ifsc_code', 'name', 'status', 'upi', 'image');


        if ($filterStatus != 'all') $query->where('status', $filterStatus);


        if ($search)  $query->where('upi', 'LIKE', '%' . $search . '%')
            ->orWhere('name', 'LIKE', '%' . $search . '%');

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

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }


    public function store(Request $request)
    {
        if ($request->id) return $this->update($request);

        $validated = $request->validate([
            'status' => 'nullable|boolean',
            'name' => 'nullable|string|max:250',
            'image' => 'nullable',
            'upi' => 'required|string|max:100,unique:banks,upi',
        ]);

        $validated['is_bank_upi'] = 'upi';

        if ($request->image) {
            $path = $request->file('image')->storeAs('qrcode-' . time() . '.' . $request->file('image')->getClientOriginalExtension());

            $validated['image'] = '/storage/' .  tenant('id') . '/' . $path;
        } else $validated['image'] = '';

        $created = Bank::create($validated);

        if ($created) return response()->json(['status' => 'success', 'message' => 'New Qrcode Added successfully!', 'bank' => $created]);

        return response()->json(['status' => 'error', 'message' => 'Failed to add new qrcode!']);
    }




    public function update($request)
    {

        $bank = Bank::find($request->id);

        if (!$bank) return response()->json(['status' => 'error', 'message' => 'Qrcode not found!']);

        $validated = $request->validate([
            'name' => 'nullable|string|max:250',
            'image' => 'nullable',
            'upi' => 'nullable|string|max:100,unique:qrcodes,upi',
            'status' => 'nullable|boolean',
        ]);

        if ($request->image) {
            $path = $request->file('image')->storeAs('qrcode-' . time() . '.' . $request->file('image')->getClientOriginalExtension());
            $validated['image'] = '/storage/' .  tenant('id') . '/' . $path;
        } else $validated['image'] = $bank->image;

        $updated = $bank->update($validated);

        if ($updated) return response()->json(['status' => 'success', 'message' => 'Qrcode Updated successfully!', 'bank' =>  $bank]);

        return response()->json(['status' => 'error', 'message' => 'Failed to update qrcode!']);
    }



    public function statusUpdate(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer'
        ]);
        $qrcode = Bank::find($validated['id']);
        if (!$qrcode) return response()->json(['status' => 'error', 'qrcode not found!']);
        $qrcode->status = !$qrcode->status;
        if ($qrcode->save()) return response()->json(['status' => 'success', 'message' => 'qrcode status Updated successfully', 'value' => $qrcode->status]);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $qrcode = Bank::find($id);

        if (!$qrcode) return response()->json(['status' => 'error', 'message' => 'qrcode not found!']);

        if ($qrcode->delete()) return response()->json(['status' => 'success', 'message' => 'qrcode deleted successfully!']);

        return response()->json(['status' => 'error', 'message' => 'Failed to deleted qrcode!']);
    }
}
