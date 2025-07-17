<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class IndexController extends Controller
{
    public function index()
    {
        return 777;

        //         $ php artisan tinker
        // >>> $tenant1 = App\Models\Tenant::create(['id' => 'foo']);
        // >>> $tenant1->domains()->create(['domain' => 'foo.localhost']);
        // >>>
        // >>> $tenant2 = App\Models\Tenant::create(['id' => 'bar']);
        // >>> $tenant2->domains()->create(['domain' => 'bar.localhost']);
    }
}
