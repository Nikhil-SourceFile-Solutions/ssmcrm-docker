<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Lead;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request)
    {

        $leads = Lead::join('users', 'users.id', 'leads.user_id')
            ->where('phone', 'LIKE', '%' . $request->search . '%')
            ->orWhere('leads.first_name', 'LIKE', '%' . $request->search . '%')
            ->orWhere('leads.last_name', 'LIKE', '%' . $request->search . '%')
            ->select('leads.id', 'phone', 'leads.first_name as f_name', 'leads.last_name as l_name', 'users.first_name', 'users.last_name', 'leads.state', 'leads.status')
            ->get();

        return response()->json(['status' => 'success', 'leads' => $leads]);
    }
}
