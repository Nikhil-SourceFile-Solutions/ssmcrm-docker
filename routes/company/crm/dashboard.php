<?php

use App\Http\Controllers\Company\Dashboard\AnalystControler;
use App\Http\Controllers\Company\Dashboard\BdeDashboardController;
use App\Http\Controllers\Company\Dashboard\CustomDashboard;
use App\Http\Controllers\Company\Dashboard\HrController;
use App\Http\Controllers\Company\Dashboard\LeadController as DashboardLeadController;
use App\Http\Controllers\Company\Dashboard\LeaderDashboard;
use App\Http\Controllers\Company\Dashboard\ManagerDashboardController;
use App\Http\Controllers\Company\Dashboard\SaleController as DashboardSaleController;
use App\Http\Controllers\Company\Dashboard\SmsWhatsappHistoryController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::get('home-data-leads-dashboard', [DashboardLeadController::class, 'index']);
    Route::get('home-data-services-details', [DashboardLeadController::class, 'serviceDetails']);
    Route::get('home-data-leads-filered-count', [DashboardLeadController::class, 'filteredCount']);
    Route::get('home-data-sales-dashboard', [DashboardSaleController::class, 'index']);
    Route::get('get-leader-dashboard', [LeaderDashboard::class, 'index']);
    Route::get('get-bde-dashboard', [BdeDashboardController::class, 'index']);
    Route::get('get-manager-dashboard', [ManagerDashboardController::class, 'index']);
    Route::get('home-data-custom-dashboard', [CustomDashboard::class, 'index']);
    Route::get('dashboard-sms-whatsapp-histories', [SmsWhatsappHistoryController::class, 'index']);
    Route::get('dashboard-sms-whatsapp-histories-reports', [SmsWhatsappHistoryController::class, 'reports']);
    Route::post('dashboard-sms-whatsapp-histories-check-status', [SmsWhatsappHistoryController::class, 'check']);
    Route::get('home-data-hr-dashboard', [HrController::class, 'index']);
    Route::get('analyst-dashboards', [AnalystControler::class, 'index']);
});
