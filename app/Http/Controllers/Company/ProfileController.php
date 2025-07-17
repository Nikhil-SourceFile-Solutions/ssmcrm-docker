<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function setNewPin(Request $request)
    {
        $validated = $request->validate([
            'pin' => 'required|digits:4|same:pin_confirmation',
            'pin_confirmation' => 'required',
        ]);

        $user = auth()->user();

        $user->pin = $validated['pin'];

        if ($user->save()) return response()->json(['status' => 'success', 'message' => 'pin created successfully!', 'user' => $user]);

        return response()->json(['status' => 'error', 'message' => 'Failed to create pin!']);
    }

    public function createPassword(Request $request)
    {

        $validated = $request->validate([
            'password' => 'required|string',
            'password_confirmation' => 'required_with:password|same:password',
        ]);
        $user = auth()->user();
        $user->password = Hash::make($validated['password']);
        $user->fcm_token = null;
        $user->show_password = $validated['password'];
        $savePassword = $user->save();
        if ($savePassword) {
            return response()->json([
                'status' => 'success',
                'message' => 'Password created successfully!',
                'employee' => $user,
            ]);
        }
        return response()->json(['status' => 'error', 'message' => 'Failed to create the password']);
    }

    public function updateFcmToken(Request $request)
    {
        $validated = $request->validate([
            'fcm_token' => 'required|string',
        ]);
        try {
            $request->user()->update(['fcm_token' => $validated['fcm_token']]);
            return response()->json(['status' => 'success', 'message' => 'FMC token updated']);
        } catch (\Exception $e) {
            report($e);
            return response()->json(['status' => 'error', 'message' => 'Failed to update FMC token'], 500);
        }
    }
}
