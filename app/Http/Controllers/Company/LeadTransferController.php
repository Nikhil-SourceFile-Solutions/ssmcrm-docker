<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Lead;
use App\Models\Company\TransferLead;
use Illuminate\Http\Request;

class LeadTransferController extends Controller
{

    public function store(Request $request)
    {
        $validated = $request->validate([
            'to_id' => 'required|integer',
            'lead_id' => 'required|integer',
        ]);

        $validated['from_id'] = auth()->user()->id;
        $response = TransferLead::create($validated);
        if ($response) {
            return response()->json([
                'message' => 'Lead Transfered Successfully!',
                'status' => 'success',
            ]);
        }
        return response()->json([
            'message' => 'Failed',
            'status' => 'error',

        ]);
    }

    public function approvedTrasferedData(Request $request)
    {

        $validated = $request->validate([
            'action' => 'required|boolean',
            'transfer_lead_id' => 'required|integer',
        ]);

        $transfer_lead = TransferLead::find($validated['transfer_lead_id']);

        if (!$transfer_lead) return response()->json([
            'status' => 'error',
            'message' => 'Lead Transefer Data not found'
        ]);

        if ($transfer_lead->is_approved) return response()->json([
            'status' => 'error',
            'message' => 'Lead Transefer already approved'
        ]);

        $lead = Lead::where([['user_id', $transfer_lead->from_id], ['id', $transfer_lead->lead_id]])->first();

        if (!$lead) return response()->json([
            'status' => 'error',
            'message' => 'Lead Not Found'
        ]);
        $transfer_lead->is_approved = $validated['action'];

        if ($transfer_lead->save()) {
            $lead->user_id = $transfer_lead->to_id;
            if ($lead->save()) return response()->json([
                'status' => 'success',
                'message' => 'Lead Transfer Action Completed'
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Lead Transfer Action Failed'
        ]);
    }
}
