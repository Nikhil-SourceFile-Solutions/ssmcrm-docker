<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\ReferLead;
use Illuminate\Http\Request;

class LeadReferController extends Controller
{

    public function index()
    {
        $referlead = ReferLead::get();

        return response()->json(['status' => 'success', 'referLeads' => $referlead]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'to_id' => 'required|integer',
            'lead_id' => 'required|integer',
        ]);

        $validated['from_id'] = auth()->user()->id;

        $response = ReferLead::create($validated);

        if ($response) {

            $notification = [
                'title' => "New Broadcast",
                'body' => "$request->message",
            ];
            $data = [
                "action" => "new-broadcast",
                "message" => json_encode($response)
            ];

            return response()->json([
                'message' => 'Lead Refered Successfully!',
                'status' => 'success',

            ]);
        }
        return response()->json([
            'message' => 'Failed',
            'status' => 'error',

        ]);
    }
}
