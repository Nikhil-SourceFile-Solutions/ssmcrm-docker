<?php


use App\Http\Controllers\Console\AuthController;
use App\Http\Controllers\Console\CheckController;
use App\Http\Controllers\Console\CheckCrmController;
use App\Http\Controllers\Console\CompanyController;
use App\Http\Controllers\Console\CompanyDetailsController;
use App\Http\Controllers\Console\DashboardController;
use App\Http\Controllers\Console\PlansController;
use App\Http\Controllers\Console\ScriptController;
use App\Http\Controllers\Console\UsersHistoryController;
use Illuminate\Support\Facades\Route;




Route::get('check-crm', [CheckController::class, 'checkCrm']);
Route::post('/admin', [CheckController::class, 'adminStore']);
Route::post('/check-login-user', [AuthController::class, 'checkLoginUser']);
Route::post('/login', [AuthController::class, 'login']);

//

Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::get('companies', [CompanyController::class, 'index']);

    Route::get('companies/{domain}', [CompanyController::class, 'show']);

    Route::delete('companies/{id}', [CompanyController::class, 'destroy']);

    Route::post('companies', [CompanyController::class, 'store']);
    Route::post('company-update/{domain}', [CompanyDetailsController::class, 'update']);
    Route::get('employess-history/{domain}', [UsersHistoryController::class, 'index']);

    // Route::get('plans', [PlansController::class, 'index']);


    Route::post('logout', [AuthController::class, 'logout']);

    Route::GET('/', [DashboardController::class, 'index']);


    Route::resource('scripts', ScriptController::class);

    // Route::GET('check-crm', [CheckCrmController::class, 'index']);


    Route::GET('check-crm-depth', [CheckCrmController::class, 'check']);
});
