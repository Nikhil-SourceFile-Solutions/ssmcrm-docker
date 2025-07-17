<?php

use App\Http\Controllers\GrowthLiftControllet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



foreach (config('tenancy.central_domains') as $domain) {

    Route::domain($domain)->group(function () {
        Route::domain('console.' . env('CRM_URL'))->group(function () {
            require __DIR__ . '/super-admin.php';
        });
    });
}

Route::middleware([
    'api',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {
    require __DIR__ . '/company/crm/company.php';
    require __DIR__ . '/company/crm/setting.php';
    require __DIR__ . '/company/crm/dashboard.php';
});
