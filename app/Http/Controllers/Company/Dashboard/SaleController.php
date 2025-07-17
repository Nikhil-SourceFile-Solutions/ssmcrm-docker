<?php

namespace App\Http\Controllers\Company\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Company\Sale;
use App\Models\Company\Settings\Setting;
use App\Models\Company\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class SaleController extends Controller
{


    private function cardData($sumColumn)
    {
        $todaySales = DB::table('sales')
            ->whereDate('sale_date', now())
            ->sum($sumColumn);

        $thisMonthSales = DB::table('sales')
            ->whereMonth('sale_date', now()->month)
            ->whereYear('sale_date', now()->year)
            ->sum($sumColumn);

        $yearlySales = DB::table('sales')
            ->whereYear('sale_date', now()->year)
            ->sum($sumColumn);

        $totalSales = DB::table('sales')
            ->sum($sumColumn);

        return  [
            'todaySales' => number_format($todaySales, 2),
            'thisMonthSales' => number_format($thisMonthSales, 2),
            'yearlySales' => number_format($yearlySales, 2),
            'totalSales' => number_format($totalSales, 2),
        ];
    }
    public function index(Request $request)
    {


        $settings = Setting::first();
        $sumColumn =  'client_paid';


        $filter = json_decode($request->filter);


        $data = [];

        if ($request->fetchingCard) {

            $data['cardData'] = $this->cardData($sumColumn);
        }



        $data['filterUsers'] = $this->filterUsers();
        if ($request->tab == "graph") {
            if ($filter->subTab == "all-sales") {

                $d = $this->allSales($filter->allSaleFilter, $settings);
                $data['allSales'] = $d[1];
                $data['count'] = $d[0];
            } else if ($filter->subTab == "employee-sales") {
                $d = $this->employeeSales($filter->employeeSaleFilter, $settings);
                $data['employeeSales'] = $d[1];
                $data['count'] = $d[0];
            } else if ($filter->subTab == "yearly-report") {
                $data['yearlyReport'] = $this->yearlyReport($filter->yearlyReportFilter, $settings);
            } else if ($filter->subTab == "monthly-report") {
                $data['monthlyReport'] = $this->monthlyReport($filter->monthlyReportFilter, $settings);
            }
        }









        // tab: 





        // return now()->month;
        // $data['monthlyReport'] = $this->monthlyReport($request);
        // $data['yearlyReport'] = $this->yearlyReport($request);
        // $data['esData'] = $this->employeeSales($request);
        // $data['asData'] = $this->allSales($request);
        return response()->json(['status' => 'success', 'data' => $data]);
    }


    protected function filterUsers()
    {
        $filterUsers = [];

        if (auth()->check()) {
            $userType = auth()->user()->user_type;

            if ($userType === "Admin") {
                $filterUsers = User::whereIn('user_type', ['Manager', 'Team Leader'])
                    ->select('id', 'first_name', 'last_name', 'status', 'user_type', 'manager_id')
                    ->get();
            } elseif ($userType === "Manager") {
                $filterUsers = User::where('user_type', 'Team Leader')
                    ->select('id', 'first_name', 'last_name', 'status', 'user_type', 'manager_id')
                    ->get();
            }
        }

        return $filterUsers;
    }

    protected function monthlyReport($filter, $settings)
    {


        $settings = Setting::first();
        $pageSize = $filter->pageSize;
        $currentPage = $filter->page;
        $offset = ($currentPage - 1) * $pageSize;
        $month = $filter->selectedMonth;
        $year = $filter->selectedYear;

        // Build the base query
        $query = DB::table('sales')
            ->whereMonth('sale_date', $month)
            ->whereYear('sale_date', $year)
            ->select(
                'user_id',
                DB::raw('SUM(client_paid) as client_paid'),
                DB::raw('SUM(offer_price) as offer_price'),
                DB::raw('SUM(sale_price) as sale_price')
            );


        $query->addSelect(DB::raw('SUM(client_paid) as total_sales'));

        // Get the paginated results
        $itemsForCurrentPage = $query->groupBy('user_id')
            ->offset($offset)
            ->limit($pageSize)
            ->get();

        // Get total items for pagination
        $totalItems = $query->count();

        // Eager load users to minimize queries
        $userIds = $itemsForCurrentPage->pluck('user_id')->toArray();
        $users = User::whereIn('id', $userIds)->get()->keyBy('id');

        // Format the sales data
        foreach ($itemsForCurrentPage as $sale) {
            $user = $users->get($sale->user_id);
            if ($user) {
                $sale->owner = $user->first_name . ' ' . $user->last_name;
                $sale->user_type = $user->user_type;
            }

            $sale->client_paid = number_format($sale->client_paid ?? 0, 2);
            $sale->offer_price = number_format($sale->offer_price ?? 0, 2);
            $sale->sale_price = number_format($sale->sale_price ?? 0, 2);


            $sale->total_sales = $sale->client_paid;
        }

        $from = $offset + 1;
        $to = min($offset + $pageSize, $totalItems);

        return [
            'data' => $itemsForCurrentPage,
            'currentPage' => $currentPage,
            'pageSize' => $pageSize,
            'totalItems' => $totalItems,
            'from' => $from,
            'to' => $to,
        ];
    }


    protected function yearlyReport($filter, $settings)
    {
        $year = $filter->selectedYear;

        $financialYearStart = Carbon::create($year, 4, 1);
        $endOfFinancialYear = Carbon::create($year + 1, 3, 31);
        $now = Carbon::now()->greaterThan($endOfFinancialYear) ? $endOfFinancialYear : Carbon::now();

        $months = collect();
        for ($date = $financialYearStart; $date->lte($now); $date->addMonth()) {
            $months->push([
                'month' => $date->month,
                'month_name' => $date->format('F'),
                'year' => $date->year,
            ]);
        }


        $months = $months->map(function ($month) use ($settings) {
            $startOfMonth = Carbon::create($month['year'], $month['month'], 1)->startOfMonth();
            $endOfMonth = Carbon::create($month['year'], $month['month'], 1)->endOfMonth();

            $baseQuery = Sale::whereBetween('sale_date', [$startOfMonth, $endOfMonth]);


            $month['total_sales'] = number_format($baseQuery->sum('client_paid'), 2);

            $month['client_paid'] = number_format($baseQuery->sum('client_paid'), 2);
            $month['offer_price'] = number_format($baseQuery->sum('offer_price'), 2);
            $month['sale_price'] = number_format($baseQuery->sum('sale_price'), 2);

            return $month;
        });


        $totalItems = count($months);
        $from = 1;
        $to = 1;

        return [
            'data' => $months,
            'currentPage' => 1,
            'pageSize' => 12,
            'totalItems' => $totalItems,
            'from' => $from,
            'to' => $to,
        ];
    }


    protected function employeeSales($filter, $settings)
    {
        $daterange = $filter->dateRange;
        $isActiveUsers = $filter->isActiveUsers;
        $manager = $filter->manager;
        $leader = $filter->leader;


        $salesQuery = DB::table('sales')
            ->whereBetween('sale_date', [$daterange[0], $daterange[1]])
            ->select(
                'user_id',
                DB::raw('SUM(client_paid) as total_sales'),
            );


        if ($filter->chart == "table") {
            $salesQuery->addSelect(
                DB::raw('SUM(sales.offer_price) as offer_price'),
                DB::raw('SUM(sales.client_paid) as client_paid'),
                DB::raw('SUM(sales.sale_price) as sale_price'),
                DB::raw('COUNT(*) as total_count')
            );
        }

        $salesQuery->groupBy('user_id');

        $salesQuery = $salesQuery->when($manager, function ($query) use ($manager, $leader) {
            $users = User::when($leader, function ($query) use ($manager, $leader) {
                return $query->where('manager_id', $manager)->where('team_leader_id', $leader);
            }, function ($query) use ($manager) {
                return $query->where('manager_id', $manager);
            })->pluck('id');

            return $query->whereIn('user_id', $users);
        });


        $sales = $salesQuery->get();


        $userIds = $sales->pluck('user_id')->toArray();
        $users = User::whereIn('id', $userIds)->get()->keyBy('id');


        foreach ($sales as $sale) {
            $user = $users->get($sale->user_id);

            if (!$user) {
                info("User not found: " . $sale->user_id);
            }

            $sale->owner = $user ? $user->first_name . ' ' . $user->last_name : 'Unknown';
            $sale->user_status = $user ? $user->status : 0;

            $sale->total_sales = number_format($sale->total_sales, 2, '.', '');
        }


        $filteredCollection = $sales->filter(function ($item) use ($isActiveUsers) {
            if ($isActiveUsers == "active") return $item->user_status;
            else if ($isActiveUsers == "active") return !$item->user_status;
            else true;
        });


        $sales = $filteredCollection->values();


        $count = DB::table('sales')

            ->whereBetween('sale_date', [$daterange[0], $daterange[1]])
            ->when($manager, function ($query) use ($manager, $leader) {
                $users = User::when($leader, function ($query) use ($manager, $leader) {
                    return $query->where('manager_id', $manager)->where('team_leader_id', $leader);
                }, function ($query) use ($manager) {
                    return $query->where('manager_id', $manager);
                })->pluck('id');

                return $query->whereIn('user_id', $users);
            })
            ->count();

        return [$count, $sales];
    }



    protected function allSales($filter, $settings)
    {

        $daterange = $filter->dateRange ?? [];
        $isActiveUsers = $filter->isActiveUsers ?? null;
        $manager = $filter->manager;
        $leader = $filter->leader;

        if (empty($daterange) || count($daterange) < 2) {
            return [0, collect([])];
        }

        $userIds = null;
        if ($manager) {
            $userQuery = User::where('manager_id', $manager);
            if ($leader) {
                $userQuery->where('team_leader_id', $leader);
            }
            $userIds = $userQuery->pluck('id')->toArray();
        }

        $salesQuery = DB::table('sales')
            ->join('users', 'users.id', '=', 'sales.user_id')
            ->whereBetween('sales.sale_date', [$daterange[0], $daterange[1]])
            ->select(
                DB::raw("DATE_FORMAT(sales.sale_date, '%b %d') as day"),
                DB::raw('SUM(sales.client_paid) as total_sales'),
            );


        if ($filter->chart == "table") {
            $salesQuery->addSelect(
                DB::raw('SUM(sales.offer_price) as offer_price'),
                DB::raw('SUM(sales.client_paid) as client_paid'),
                DB::raw('SUM(sales.sale_price) as sale_price'),
                DB::raw('COUNT(*) as total_count')
            );
        }

        $salesQuery->groupBy(DB::raw("DATE_FORMAT(sales.sale_date, '%b %d')"))
            ->orderBy(DB::raw("DATE_FORMAT(sales.sale_date, '%Y-%m-%d')"));


        if ($isActiveUsers !== null) {
            $salesQuery->where('users.status', $isActiveUsers === "active");
        }
        if ($userIds) {
            $salesQuery->whereIn('users.id', $userIds);
        }


        $sales = $salesQuery->get();
        foreach ($sales as $sale) {
            $sale->total_sales = number_format($sale->total_sales, 2, '.', '');
        }

        $countQuery = DB::table('sales')
            ->join('users', 'users.id', '=', 'sales.user_id')
            ->whereBetween('sales.sale_date', [$daterange[0], $daterange[1]]);


        if ($isActiveUsers !== null) {
            $countQuery->where('users.status', $isActiveUsers === "active");
        }
        if ($userIds) {
            $countQuery->whereIn('users.id', $userIds);
        }

        $count = $countQuery->count();

        return [$count, $sales];
    }


    private function allSalesTable($filter, $settings)
    {

        $daterange = $filter->dateRange ?? [];
        $isActiveUsers = $filter->isActiveUsers ?? null;
        $manager = $filter->manager;
        $leader = $filter->leader;

        if (empty($daterange) || count($daterange) < 2) {
            return [0, collect([])];
        }

        $userIds = null;
        if ($manager) {
            $userQuery = User::where('manager_id', $manager);
            if ($leader) {
                $userQuery->where('team_leader_id', $leader);
            }
            $userIds = $userQuery->pluck('id')->toArray();
        }


        $salesQuery = DB::table('sales')
            ->join('users', 'users.id', '=', 'sales.user_id')
            ->whereNot('sales.status', 'Pending')
            ->whereBetween('sales.sale_date', [$daterange[0], $daterange[1]])
            ->select(
                DB::raw("DATE_FORMAT(sales.sale_date, '%b %d') as day"),
                DB::raw('SUM(sales.client_paid) as total_sales'),
                DB::raw('SUM(sales.offer_price) as offer_price'),
                DB::raw('SUM(sales.client_paid) as client_paid'),
                DB::raw('SUM(sales.sale_price) as sale_price'),
                // DB::raw('COUNT(id) as count')
            )
            ->groupBy(DB::raw("DATE_FORMAT(sales.sale_date, '%b %d')"))
            ->orderBy(DB::raw("DATE_FORMAT(sales.sale_date, '%Y-%m-%d')"));

        if ($isActiveUsers !== null) {
            $salesQuery->where('users.status', $isActiveUsers === "active");
        }
        if ($userIds) {
            $salesQuery->whereIn('users.id', $userIds);
        }

        $sales = $salesQuery->get();

        $countQuery = DB::table('sales')
            ->join('users', 'users.id', '=', 'sales.user_id')
            ->whereNot('sales.status', 'Pending')
            ->whereBetween('sales.sale_date', [$daterange[0], $daterange[1]]);


        if ($isActiveUsers !== null) {
            $countQuery->where('users.status', $isActiveUsers === "active");
        }
        if ($userIds) {
            $countQuery->whereIn('users.id', $userIds);
        }

        $count = $countQuery->count();

        return [$count, $sales];
    }
}
