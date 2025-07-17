<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BranchController extends Controller
{
    public function index(Request $request)
    {
            $branch = Branch::where('branch_name', 'like', '%' . $request->search . '%')->latest()
                ->paginate($request->pageSize);

        return response()->json(['status' => 'success', 'data' => $branch]);
    }


    public function store(Request $request)
    {
        if ($request->id) return $this->update($request);

        $validated = $request->validate([
            'branch_name' => 'required|string|unique:branches,branch_name',
            'branch_location' => 'nullable|string',
            'name'=>'required|string',
            'email' => 'required|string',
            'mobile_no' => 'nullable|integer',
            'status' => 'required|boolean'

        ]);

        $created = Branch::create($validated);

        if ($created) return response()->json(['status' => 'success', 'message' => 'Branch Created successfully!', 'branches' => Branch::where('status',true)->get()]);

        return response()->json(['status' => 'error', 'message' => 'Failed to Create Branch!']);
    }

    public function update($request)
    {
        $branch = Branch::find($request->id);
        if (!$branch)  response()->json(['status' => 'error', 'message' => 'Branch Not Found!']);

        $validated = $request->validate([
            // 'branch_name' => 'required|string|unique:branches,branch_name'.$branch->id,
            'branch_name'=>'nullable',
            'branch_location' => 'nullable|string',
            'name'=>'required|string',
            'email' => 'required|string|max:10000',
            'mobile_no' => 'nullable|integer',
            'status' => 'required|boolean'
        ]);

        $updated = $branch->update($validated);

        if ($updated) return response()->json(['status' => 'success', 'message' => 'Branch updated successfully!', 'branches' => Branch::where('status',true)->get()]);

        return response()->json(['status' => 'error', 'message' => 'Failed to update Branch!']);
    }

    public function statusUpdate(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer'
        ]);

        $branch = Branch::find($validated['id']);

        if (!$branch) return response()->json(['status' => 'error', 'branch not found!']);


        $branch->status = !$branch->status;

        if ($branch->save()) {
            // Cache::pull('all-lead-status');
            // Cache::pull('all-lead-sources');
            return response()->json(['status' => 'success', 'message' => 'branch Status Updated successfully', 'value' => $branch->status,
        'branches' => Branch::where('status',true)->get()
        ]);
        }
    }

  public function destroy(Branch $branch)
    {


        $isUsed = DB::table('users')
            ->where('branch_id', $branch->id)
            // ->union(
            //     DB::table('products')->where('branch_id', $branch->id)
            // )
            ->exists();

        if ($isUsed) {
            return response()->json([
                'message' => 'Branch cannot be deleted as it is being used in Other
                 Table.',
                'status' => 'error',
            ], 400);
        }

        if ($branch->delete()) {
            return response()->json([
                'message' => 'Deleted successfully',
                'status' => 'success',
            ]);
        }

        return response()->json([
            'message' => 'Failed to delete branch',
            'status' => 'error',
        ]);
    }
}
