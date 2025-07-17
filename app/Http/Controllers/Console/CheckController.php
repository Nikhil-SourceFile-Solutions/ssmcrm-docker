<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Models\Console\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class CheckController extends Controller
{
    public function checkCrm()
    {
        $user = User::first();
        if (!$user) return response()->json(['status' => 'error', 'action' => 'admin']);
        $settings = Setting::first();
        return response()->json(['status' => 'success', 'settings' => $settings]);
    }


    public function adminStore(Request $request)
    {
        $user = User::first();
        if ($user) return response()->json(['status' => 'success', 'action' => 'login', 'message' => 'Admin Already created!']);
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|confirmed|min:5',
            'phone' => 'required|digits:10|unique:users,phone',
        ]);


        $validated['show_password'] = $validated['password'];
        $validated['password'] = Hash::make($validated['password']);

        $admin = User::create($validated);

        if ($admin) return response()->json(['status' => 'success', 'action' => 'login', 'message' => 'Admin created successfully!']);
        return response()->json(['status' => 'error', 'message' => 'Failed to create admin']);
    }
}
