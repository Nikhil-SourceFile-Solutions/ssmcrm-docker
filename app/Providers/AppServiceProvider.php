<?php

namespace App\Providers;

use App\Models\Company\Lead;
use App\Models\Company\LeadRequest;
use App\Models\Console\Company;
use App\Observers\CompanyObserver;
use App\Observers\LeadObserver;
use App\Observers\LeadRequestObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Lead::observe(LeadObserver::class);
        LeadRequest::observe(LeadRequestObserver::class);
        Company::observe(CompanyObserver::class);
    }
}
