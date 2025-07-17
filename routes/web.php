<?php

use App\Http\Controllers\ConsoleController;
use App\Http\Controllers\DocumentController;
use Illuminate\Support\Facades\Route;



foreach (config('tenancy.central_domains') as $domain) {
    Route::domain($domain)->group(function () {

        require __DIR__ . '/public.php';

        Route::domain('console.' . env('CRM_URL'))->group(function () {
            Route::get('/{any}', [ConsoleController::class, 'index'])->where('any', '.*');
        });
    });
}
