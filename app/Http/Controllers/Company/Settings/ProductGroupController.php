<?php

namespace App\Http\Controllers\Company\Settings;

use App\Http\Controllers\Controller;
use App\Models\Company\Settings\ProductGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Js;

class ProductGroupController extends Controller
{

    public function index()
    {
        $groups = ProductGroup::join('dropdowns', 'dropdowns.id', 'product_groups.dropdown_id')->select('product_groups.*', 'value')->get();


        return response()->json(['status' => 'success', 'groups' => $groups]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if ($request->id) return $this->update($request);

        $validated = $request->validate([
            'dropdown_id' => 'required|integer',
            'group_name' => 'required|string|unique:product_groups,group_name',
            'status' => 'required|boolean'
        ]);

        $created = ProductGroup::create($validated);

        if ($created) return response()->json(['status' => 'success', 'message' => 'Product Group Added successfully!']);

        return response()->json(['status' => 'error', 'message' => 'Failed to add Product Group!']);
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductGroup $productGroup)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProductGroup $productGroup)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update($request)
    {
        $productGroup = ProductGroup::find($request->id);

        if (!$productGroup)  response()->json(['status' => 'error', 'message' => 'Failed to add Product Group!']);

        $validated = $request->validate([
            'dropdown_id' => 'required|integer',
            'group_name' => 'required|string|unique:product_groups,group_name,' . $productGroup->id,
            'status' => 'required|boolean'
        ]);

        $created = $productGroup->update($validated);

        if ($created) return response()->json(['status' => 'success', 'message' => 'Product Group Updated successfully!']);

        return response()->json(['status' => 'error', 'message' => 'Failed to Update Product Group!']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductGroup $productGroup)
    {
        if ($productGroup->delete()) return response()->json(['status' => 'success', 'message' => 'Product Group Deleted Successfully!']);

        return response()->json(['status' => 'error', 'message' => 'Failed to delete Product Group!']);
    }
}
