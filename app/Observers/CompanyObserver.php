<?php

namespace App\Observers;

use App\Mail\Console\CompanyMail;
use App\Models\Company\User;
use App\Models\Console\Company;
use App\Models\Tenant;
use Illuminate\Support\Facades\Mail;

class CompanyObserver
{
    /**
     * Handle the Company "created" event.
     */
    public function created(Company $company): void
    {
        // Mail::to('nikhilsasikumar1@gmail.com')->send(new CompanyMail($company));
    }

    /**
     * Handle the Company "updated" event.
     */
    public function updated(Company $company): void
    {
        if (!$company->status) {
            $tenant = Tenant::find($company->domain);
            $data = $tenant->run(function ($tenant) {
                User::whereNotNull('id')->each(function ($user) {
                    $user->tokens()->delete();
                });
            });
        }

        // Sourcefile CRM
    }

    /**
     * Handle the Company "deleted" event.
     */
    public function deleted(Company $company): void
    {
        //
    }

    /**
     * Handle the Company "restored" event.
     */
    public function restored(Company $company): void
    {
        //
    }

    /**
     * Handle the Company "force deleted" event.
     */
    public function forceDeleted(Company $company): void
    {
        //
    }
}
