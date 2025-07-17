<?php

namespace App\Http\Controllers;

use App\Models\Console\Script;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function index()
    {

        $scripts =  tenancy()->central(function ($tenant) {
            return Script::where('status', true)->get();
        });

        // return  $scripts;

        return view('company.Index', ['scripts' => $scripts]);
    }
}
