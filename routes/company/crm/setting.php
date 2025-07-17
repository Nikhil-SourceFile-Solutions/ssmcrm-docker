<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Company\Settings\AuthPhoneController;
use App\Http\Controllers\Company\Settings\DropdownController;
use App\Http\Controllers\Company\Settings\EmployeeController;
use App\Http\Controllers\Company\Settings\IpTrackController;
use App\Http\Controllers\Company\Settings\LeadAutomationController;
use App\Http\Controllers\Company\Settings\PaymentGatewayController;
use App\Http\Controllers\Company\Settings\ProductController;
use App\Http\Controllers\Company\Settings\QrcodeController;
use App\Http\Controllers\Company\Settings\BankController;
use App\Http\Controllers\Company\Settings\InvoiceSettingController;
use App\Http\Controllers\Company\Settings\PackageController;
use App\Http\Controllers\Company\Settings\PermissionController;
use App\Http\Controllers\Company\Settings\ProductGroupController;
use App\Http\Controllers\Company\Settings\SalaryController;
use App\Http\Controllers\Company\Settings\SettingsController;


Route::group(['middleware' => 'auth:sanctum'], function () {




    Route::resource('authentication-phones', AuthPhoneController::class);

    Route::resource('dropdowns', DropdownController::class);
    Route::post('dropdowns-status-update', [DropdownController::class, 'statusUpdate']);


    Route::resource('users', EmployeeController::class);
    Route::get('users-handle-status', [EmployeeController::class, 'handleStatus']);
    Route::get('users-mfa', [EmployeeController::class, 'getMfa']);
    Route::post('users-mfa', [EmployeeController::class, 'storeMfa']);

    Route::get('get-active-employee', [EmployeeController::class, 'getActiveEmployee']);
    Route::get('get-lead-owners', [EmployeeController::class, 'getLeadOwners']);
    Route::post('user-update-status', [EmployeeController::class, 'updateStatus']);
    Route::get('get-manager-teamleader', [EmployeeController::class, 'getManagerTeamleader']);
    Route::get('get-employee-leads/{userId}', [EmployeeController::class, 'getEmployeeLeadsIndividually']);
    Route::get('employee-logs', [EmployeeController::class, 'employeeLogs']);
    Route::post('update-password', [EmployeeController::class, 'updatePassword']);
    Route::post('update-user-profile', [EmployeeController::class, 'updateUserProfile']);
    Route::post('update-password-pin-by-employee', [EmployeeController::class, 'updatePasswordPinByEmployee']);

    Route::get('ip-tracks', [IpTrackController::class, 'index']);

    Route::resource('leadautomation', LeadAutomationController::class);
    Route::post('leadauto-status-update', [LeadautomationController::class, 'statusUpdate']);

    Route::resource('payment-gateways', PaymentGatewayController::class);

    Route::resource('products', ProductController::class);
    Route::post('product-status-update', [ProductController::class, 'statusUpdate']);

    Route::resource('qrcodes', QrcodeController::class);
    Route::post('qrcode-update-status', [QrcodeController::class, 'statusUpdate']);

    Route::resource('banks', BankController::class);
    Route::get('get-payments', [BankController::class, 'index']);
    Route::get('get-bank', [BankController::class, 'getbankqrcode']);

    Route::resource('invoicesettings', InvoiceSettingController::class);
    Route::post('invoice-preview', [InvoiceSettingController::class, 'preview']);

    Route::resource('packages', PackageController::class);

    Route::resource('product-groups', ProductGroupController::class);


    Route::resource('salaries', SalaryController::class);


    //settings
    Route::resource('settings', SettingsController::class);
    Route::post('setting-ipconfig-store', [SettingsController::class, 'storeUpdateIpConfig']);





    Route::get('permissions-and-verifications', [PermissionController::class, 'index']);
    Route::post('permissions-and-verifications', [PermissionController::class, 'update']);
});
