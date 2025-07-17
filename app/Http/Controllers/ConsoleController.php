<?php

namespace App\Http\Controllers;

use App\Models\Console\Script;
use Illuminate\Http\Request;

class ConsoleController extends Controller
{
    public function index()
    {

        $scripts = Script::where('status', true)->get();
        
      
  


        return view('console.index', ['scripts' => $scripts]);
    }
}
