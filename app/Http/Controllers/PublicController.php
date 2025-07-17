<?php

namespace App\Http\Controllers;

use App\Models\Console\Script;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function index()
    {
        $scripts = Script::where('status', true)->get();
        return view('public.index', ['scripts' => $scripts]);
    }
}
