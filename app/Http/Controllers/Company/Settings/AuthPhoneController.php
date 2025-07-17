<?php

namespace App\Http\Controllers\Company\Settings;

use App\Http\Controllers\Controller;
use App\Models\Company\Settings\AuthPhone;
use Illuminate\Http\Request;

class AuthPhoneController extends Controller
{
    public function index()
    {
        $phones = AuthPhone::first();

        return response()->json(['status' => 'success', 'phones' => $phones]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sms_phone' => 'nullable|digits:10',
            'whatsapp_phone' => 'nullable|digits:10'
        ]);

        $phones = AuthPhone::first();

        if ($phones) {
            return $this->update($phones, $validated);
        }

        $created = AuthPhone::create($validated);

        if ($created) {


            return response()->json(['status' => 'success', 'message' => 'Authentication Phones Added', 'phones' => $created]);
        }

        return response()->json(['status' => 'error', 'message' => 'Failed to Add Authentication Phones']);
    }

    public function update(AuthPhone $phones, array $validated)
    {
        $updated = $phones->update($validated);

        if ($updated) {
            return response()->json(['status' => 'success', 'message' => 'Authentication Phones Updated', 'phones' => $phones]);
        }

        return response()->json(['status' => 'error', 'message' => 'Failed to Update Authentication Phones']);
    }
}
