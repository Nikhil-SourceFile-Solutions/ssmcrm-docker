<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Models\Console\Company;
use App\Models\Console\UsersHistory;
use Illuminate\Http\Request;

class UsersHistoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($domain)
    {
        $company = Company::where('domain', $domain)->first();

        if (!$company) return response()->json(['status' => 'error', 'message' => 'Company Not Found!']);

        $data = UsersHistory::where('company_id', $company->id)->join('users', 'users.id', 'users_histories.user_id')->select('users_histories.*', 'first_name', 'last_name')->latest('users_histories.created_at')->get();


        return response()->json(['status' => 'success', 'data' => $data]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(UsersHistory $usersHistory)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UsersHistory $usersHistory)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UsersHistory $usersHistory)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UsersHistory $usersHistory)
    {
        //
    }
}
