<?php

namespace App\Http\Controllers\Company\Settings;

use App\Http\Controllers\Controller;
use App\Models\Company\Settings\Dropdown;
use App\Models\Company\Settings\Product;
use App\Models\Company\Settings\ProductGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Nette\Schema\Schema;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        if ($request->filterType) {
            $product = Product::join('dropdowns', 'dropdowns.id', 'products.dropdown_id')
                ->join('product_groups', 'product_groups.id', 'products.product_group_id')
                ->where('product_groups.dropdown_id', $request->filterType)
                ->where('pro_name', 'like', '%' . $request->search . '%')
                ->select('products.*', 'value', 'group_name')
                ->latest()
                ->paginate($request->pageSize);
        } else {
            $product = Product::join('dropdowns', 'dropdowns.id', 'products.dropdown_id')
                ->join('product_groups', 'product_groups.id', 'products.product_group_id')
                ->where('pro_name', 'like', '%' . $request->search . '%')
                ->select('products.*', 'value', 'group_name')
                ->latest()
                ->paginate($request->pageSize);
        }

        $dropdowns = Dropdown::where('type', 'Lead Products')->get();

        return response()->json(['status' => 'success', 'data' => $product, 'dropdowns' => $dropdowns]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $dropdowns = Dropdown::where('type', 'Lead Products')->get();
        $groups = ProductGroup::where('status', true)->get();

        return response()->json(['status' => 'success', 'data' => [
            'dropdowns' => $dropdowns,
            'groups' => $groups
        ]]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if ($request->id) return $this->update($request);

        $validated = $request->validate([
            'dropdown_id' => 'required|integer',
            'pro_name' => 'nullable|string',
            'pro_price' => 'nullable|string',
            'pro_duration' => 'nullable|string',
            'pro_status' => 'nullable|string',
            'product_group_id' => 'required|integer'
        ]);

        $response = Product::create($validated);

        if ($response) return response()->json([
            'message' => 'Product Price Created',
            'status' => 'success',
        ]);
        return response()->json([
            'message' => 'Failed',
            'status' => 'error',

        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return response()->json(['productprice' => $product]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        return response()->json(['productprice' => $product]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update($request)
    {
        $product = Product::find($request->id);
        if (!$product) return response()->json([
            'message' => 'Product Price not found',
            'status' => 'error',
        ]);

        $validated = $request->validate([
            'dropdown_id' => 'integer|required',
            'pro_name' => 'nullable|string',
            'pro_price' => 'nullable|string',
            'pro_duration' => 'nullable|string',
            'pro_status' => 'nullable|string',
            'product_group_id' => 'required|integer'
        ]);

        $response = $product->update($validated);

        if ($response) return response()->json([
            'message' => 'Product Price Updated',
            'status' => 'success',

        ]);
        return response()->json([
            'message' => 'Failed',
            'status' => 'error',

        ]);
    }


    public function statusUpdate(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer'
        ]);

        $product = Product::find($validated['id']);
        if (!$product) return response()->json(['pro_status' => 'error', 'productprice not found!']);
        // if (!$dropdown->is_editable) return response()->json(['pro_status' => 'error', 'this dropdown not editable!']);
        $product->pro_status = !$product->pro_status;

        if ($product->save()) return response()->json(['status' => 'success', 'message' => 'productprice status Updated successfully', 'value' => $product->pro_status]);
    }
    /**
     * Remove the specified resource from storage.
     */
    // public function destroy2(Product $product)
    // {
    //     return $product;
    //     if ($product->delete()) return response()->json([
    //         'message' => 'Deleted successfully',
    //         'status' => 'success',
    //     ]);

    //     else  return response()->json([
    //         'message' => 'Failed',
    //         'status' => 'error',
    //     ]);
    // }


    public function destroy(Product $product)
    {
        $isUsedInOtherTables = DB::table('sales')
            ->where('product_id', $product->id)
            ->exists();

        if ($isUsedInOtherTables) {
            return response()->json([
                'message' => 'Product cannot be deleted as it is being used in other tables.',
                'status' => 'error',
            ], 400);
        }
        if ($product->delete()) {
            return response()->json([
                'message' => 'Deleted successfully',
                'status' => 'success',
            ]);
        }

        return response()->json([
            'message' => 'Failed to delete dropdown',
            'status' => 'error',
        ]);
    }
}
