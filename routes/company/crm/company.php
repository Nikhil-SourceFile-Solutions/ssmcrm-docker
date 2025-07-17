<?php

use App\Http\Controllers\Company\_TestController;
use App\Http\Controllers\Company\AuthController;
use App\Http\Controllers\Company\BranchController;
use App\Http\Controllers\Company\BroadcastController;
use App\Http\Controllers\Company\CallbackController;
use App\Http\Controllers\Company\Campaign\ApplicationCampaignController;
use App\Http\Controllers\Company\Campaign\ApplicationCampaignUpdateController;
use App\Http\Controllers\Company\CheckCrmController;
use App\Http\Controllers\Company\Datatable\LeadController as DatatableLeadController;
use App\Http\Controllers\Company\Datatable\SaleController as DatatableSaleController;
use App\Http\Controllers\Company\Datatable\TeamLeadController;
use App\Http\Controllers\Company\Datatable\TeamSaleController;
use App\Http\Controllers\Company\InvoiceController;
use App\Http\Controllers\Company\LeadController;
use App\Http\Controllers\Company\LeadReferController;
use App\Http\Controllers\Company\LeadRequestController;
use App\Http\Controllers\Company\LeadTransferController;
use App\Http\Controllers\Company\LeftNavController;
use App\Http\Controllers\Company\NotepadController;
use App\Http\Controllers\Company\OneClickTransferController;
use App\Http\Controllers\Company\ProfileController;
use App\Http\Controllers\Company\ReportController;
use App\Http\Controllers\Company\ReportDownloadController;
use App\Http\Controllers\Company\SaleController;
use App\Http\Controllers\Company\SaleServiceController;
use App\Http\Controllers\Company\SearchController;
use App\Http\Controllers\Company\SendBankDetailsController;
use App\Http\Controllers\Company\UploadController;
use App\Http\Controllers\Company\WebsiteController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Company\EmailController;

Route::get('/check-crm', [CheckCrmController::class, 'checkCrm']);
Route::post('/admin', [CheckCrmController::class, 'adminStore']);
//Authentication
Route::post('/check-login-user', [AuthController::class, 'checkLoginUser']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/verify-2fa', [AuthController::class, 'verify2FA']);
Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('logout-all-users', [AuthController::class, 'logoutAllUsers']);
    Route::post('create-password', [ProfileController::class, 'createPassword']);
    Route::post('/user-update-pin', [ProfileController::class, 'setNewPin']);
    Route::post('fcm-token', [ProfileController::class, 'updateFcmToken']);
    Route::resource('leads', LeadController::class);
    Route::get('get-leads', [DatatableLeadController::class, 'index']);
    Route::post('update-lead-status', [LeadController::class, 'updateLeadStatus']);
    Route::post('get-lead-statuses/{id}', [LeadController::class, 'leadStatuses']);
    Route::post('lead-bulk-update', [LeadController::class, 'bulkUpdate']);
    Route::post('sale-lead-update', [LeadController::class, 'saleLeadUpdate']);
    Route::delete('leads-mass-delete', [LeadController::class, 'massDelete']);
    Route::get('get-team-leads', [TeamLeadController::class, 'index']);
    Route::get('check-upload-lead', [UploadController::class, 'checkUpload']);
    Route::post('lead-bulk-upload', [UploadController::class, 'bulkUpload']);
    Route::post('move-leads', [UploadController::class, 'moveLeads']);
    Route::get('get-data-for-oct', [OneClickTransferController::class, 'getDataForOct']);
    Route::get('get-leads-count-for-oct', [OneClickTransferController::class, 'getLeadsCountForOct']);
    Route::post('oct-leads', [OneClickTransferController::class, 'octLeads']);
    Route::get('state-for-lead-request', [LeadRequestController::class, 'leadRequestState']);
    Route::post('lead-request', [LeadRequestController::class, 'leadRequest']);
    Route::post('cancel-lead-request', [LeadRequestController::class, 'cancel']);
    Route::get('transfer-lead', [LeadTransferController::class, 'index']);
    Route::post('tranfer-lead', [LeadTransferController::class, 'store']);
    Route::post('approved-transfer-lead', [LeadTransferController::class, 'approvedTrasferedData']);
    Route::get('refer-lead', [LeadReferController::class, 'index']);
    Route::post('refer-lead', [LeadReferController::class, 'store']);
    Route::post('callbacks', [CallbackController::class, 'store']);
    Route::get('lead-callbacks/{id}', [CallbackController::class, 'callbackByLead']);
    Route::get('lead-callbacks-close/{id}', [CallbackController::class, 'closeCallback']);
    Route::get('get-callbacks', [CallbackController::class, 'getCallbacks']);
    Route::resource('sales', SaleController::class);
    Route::get('lead-sales-history', [SaleController::class, 'leadSalesHistory']);
    Route::get('lead-sales-statuses', [SaleController::class, 'salesStatuses']);
    Route::get('get-sales', [DatatableSaleController::class, 'index']);
    Route::get('get-team-sales', [TeamSaleController::class, 'index']);
    Route::get('analyst/active-sales', [SaleServiceController::class, 'activeSales']);
    Route::get('analyst/free-trial-leads', [DatatableLeadController::class, 'freeTrialLeads']);
    Route::get('expired-sales', [SaleServiceController::class, 'expiredSales']);
    Route::get('paused-sales', [SaleServiceController::class, 'pausedSales']);
    Route::get('get-invoice', [InvoiceController::class, 'index']);
    Route::get('sale-invoices/create', [InvoiceController::class, 'create']);
    Route::get('sale-invoices/{sale_id}', [InvoiceController::class, 'show']);
    Route::post('sales-invoice', [InvoiceController::class, 'store']);
    Route::get('download-invoice', [InvoiceController::class, 'downloadInvoice']);
    Route::get('send-invoice', [InvoiceController::class, 'sendInvoice']);
    Route::get('broadcasts', [BroadcastController::class, 'index']);
    Route::post('broadcasts', [BroadcastController::class, 'store']);
    Route::get('get-crm-latest-data', [CheckCrmController::class, 'latestData']);
    Route::get('lef-nav-data', [LeftNavController::class, 'index']);
    Route::post('email/send-invoice', [EmailController::class, 'sendInvoice']);
    Route::post('send-website-link', [WebsiteController::class, 'sendLink']);
    Route::post('bank-details', [SendBankDetailsController::class, 'sendLink']);
    Route::get('get-send-babk-details-data', [SendBankDetailsController::class, 'getSendBabkDetailsData']);
    Route::get('global-search', [SearchController::class, 'index']);
    Route::get('get-data-for-generate-report', [ReportController::class, 'dataForGenerateReport']);
    Route::GET('reports', [ReportController::class, 'index']);
    Route::POST('reports', [ReportController::class, 'store']);
    Route::DELETE('reports/{id}', [ReportController::class, 'destroy']);
    Route::post('reports-otp-generate', [ReportController::class, 'handleOTP']);
    Route::post('reports-download', [ReportDownloadController::class, 'downloadReports']);
    Route::get('get-data-for-download-report', [ReportController::class, 'dataForDownloadReport']);
    Route::get('reports/sms', [ReportController::class, 'sms']);
    Route::get('reports/whatsapp', [ReportController::class, 'whatsapp']);
    Route::get('reports/whatsapp/{id}', [ReportController::class, 'viewWhatsapp']);
    Route::get('reports/application', [ReportController::class, 'application']);
    Route::post('save-application-notification', [ApplicationCampaignController::class, 'storeapplication']);
    Route::get('get-application-notification', [ApplicationCampaignController::class, 'getAllindex']);
    Route::post('exist-application-notification', [ApplicationCampaignController::class, 'existCall']);
    Route::post('update-application-notification', [ApplicationCampaignUpdateController::class, 'updateApplication']);
    Route::get('get-application-update', [ApplicationCampaignUpdateController::class, 'index']);
    Route::resource('branches', BranchController::class);
    Route::post('branch-status-update', [BranchController::class, 'statusUpdate']);
    //Note Pad
    Route::resource('notepads', NotepadController::class);
});






// customer Kyc



Route::get('test-notification', [_TestController::class, 'send']);
Route::get('sale-alculation', [_TestController::class, 'saleCalculation']);
Route::get('report-download-file/{id}', [ReportController::class, 'downloadFile'])->name('report-download-file');
