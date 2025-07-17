<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Sale;
use App\Models\Company\Settings\Dropdown;
use App\Models\Company\Settings\Product;
use App\Models\Company\Settings\ProductGroup;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleServiceController extends Controller
{
    public function activeSales()
    {


        $perPage = request()->get('size', 100);
        $currentPage = request()->get('page', 1);

        $filter = request()->get('filter');

        if ($filter) $filter = json_decode($filter);
        $search = request()->get('search', '');

        $offset = ($currentPage - 1) * $perPage;


        $baseQuery = Sale::join('users', 'users.id', '=', 'sales.user_id')
            ->join('leads', 'leads.id', '=', 'sales.lead_id')
            ->where('is_service_activated', true)
            ->where('sales.due_date', '>=', Carbon::today());
        // }

        if (count($filter)) $baseQuery->whereIn('sales.product_id', $filter);


        // if (count($filter)) {
        //     $products = Product::whereIn('dropdown_id', $filter)->pluck('id')->toArray();
        //     $baseQuery->whereIn('sales.product_id', $products);
        // }

        // Apply search filter if provided
        if (!empty($search)) {
            $baseQuery->where('leads.phone', 'like', '%' . $search . '%');
        }

        // Count the total number of filtered items
        $totalItems = $baseQuery->count();

        // Fetch the paginated data with selective fields
        $data = $baseQuery->select(
            'sales.id',
            'sales.client_type',
            'sales.status',
            'sales.start_date',
            'sales.due_date',
            'sales.sale_service',
            'leads.first_name',
            'leads.last_name',
            'leads.phone',
            'sales.product',
            'is_service_activated',
            DB::raw("CONCAT(users.first_name, ' ', COALESCE(users.last_name, '')) AS owner"),
        )
            ->latest('sales.created_at')
            ->skip($offset)
            ->take($perPage)
            ->get();

        // Calculate the from and to indexes
        $from = $offset + 1;
        $to = min($offset + $perPage, $totalItems);

        // Return the response as JSON

        $dropdowns = Dropdown::where('type', 'Lead Products')->select('id', 'value')->get();


        foreach ($dropdowns as $drop) {
            $drop->groups = ProductGroup::where('dropdown_id', $drop->id)->get();

            foreach ($drop->groups as $product) {
                $product->products = Product::where('product_group_id', $product->id)->get();
            }
        }













        // Convert the collection to an array if needed
        // $groupedProductsArray = $groupedProducts->toArray();

        // foreach ($products as $product) {
        //     $product->products = Product::where('dropdown_id', $product->id)
        //         ->join('product_groups', 'product_groups.id', 'products.product_group_id')
        //         ->select('products.id', 'pro_name', 'pro_price', 'pro_duration', 'group_name')->get();
        // }

        return response()->json(['status' => 'success', 'data' => [
            $data,
            $currentPage,
            $totalItems,
            $from,
            $to,
            $dropdowns
        ]]);
    }


    public function  expiredSales(Request $request)
    {
        $pageSize = $request->get('pageSize', 10);
        $currentPage = request()->get('page', 1);

        $filter = request()->get('filterProducts');


        $search = request()->get('search', '');

        $offset = ($currentPage - 1) * $pageSize;


        $baseQuery = Sale::join('users', 'users.id', '=', 'sales.user_id')
            ->join('leads', 'leads.id', '=', 'sales.lead_id')
            ->where('sales.status', 'Expired');

        if ($filter) $baseQuery->where('sales.product_id', $filter);

        if (!empty($search)) {
            $baseQuery->where('leads.phone', 'like', '%' . $search . '%');
        }

        $totalItems = $baseQuery->count();

        $baseQuery->latest('sales.id')->offset($offset)->limit($pageSize);




        $from = $offset + 1;
        $to = min($offset + $pageSize, $totalItems);

        $baseQuery->select(
            'sales.id',
            'sales.client_type',
            'sales.status',
            'sales.start_date',
            'sales.due_date',
            'sales.sale_service',
            'leads.first_name',
            'leads.last_name',
            'leads.phone',
            DB::raw("CONCAT(users.first_name, ' ', COALESCE(users.last_name, '')) AS owner"),
        );



        $data = [
            'data' =>  $baseQuery->get(),
            'currentPage' => $currentPage,
            'pageSize' => $pageSize,
            'totalItems' => $totalItems,
            'from' => $from,
            'to' => $to
        ];

        return response()->json([
            'status' => 'success',
            'data' => $data,
            'products' => Product::get()
        ]);
    }

    public function  pausedSales(Request $request)
    {

        $pageSize = $request->get('pageSize', 10);
        $currentPage = request()->get('page', 1);

        $filter = request()->get('filterProducts');


        $search = request()->get('search', '');

        $offset = ($currentPage - 1) * $pageSize;


        $baseQuery = Sale::join('users', 'users.id', '=', 'sales.user_id')
            ->join('leads', 'leads.id', '=', 'sales.lead_id')
            ->where('sales.status', 'Paused');

        if ($filter) $baseQuery->where('sales.product_id', $filter);

        if (!empty($search)) {
            $baseQuery->where('leads.phone', 'like', '%' . $search . '%');
        }

        $totalItems = $baseQuery->count();

        $baseQuery->latest('sales.id')->offset($offset)->limit($pageSize);




        $from = $offset + 1;
        $to = min($offset + $pageSize, $totalItems);

        $baseQuery->select(
            'sales.id',
            'sales.client_type',
            'sales.status',
            'sales.start_date',
            'sales.due_date',
            'sales.sale_service',
            'leads.first_name',
            'leads.last_name',
            'leads.phone',
            DB::raw("CONCAT(users.first_name, ' ', COALESCE(users.last_name, '')) AS owner"),
        );



        $data = [
            'data' =>  $baseQuery->get(),
            'currentPage' => $currentPage,
            'pageSize' => $pageSize,
            'totalItems' => $totalItems,
            'from' => $from,
            'to' => $to
        ];

        return response()->json([
            'status' => 'success',
            'data' => $data,
            'products' => Product::get()
        ]);
    }
}
