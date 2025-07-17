<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Lead;
use App\Models\Company\LeadRequest;
use App\Models\Company\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OneClickTransferController extends Controller
{
    public function getDataForOct()
    {
        $status = Lead::where('user_id', 1)->select('status')->distinct()->pluck('status');
        $states = Lead::where('user_id', 1)->select('state')->distinct()->pluck('state');
        $employees = User::where('status', true)->whereIn('user_type', ['BDE', 'Manager', 'Team Leader'])->select('id', 'first_name', 'last_name')->get();
        return response()->json(['status' => 'success', 'data' => ['statuses' => $status, 'states' => $states, 'employees' => $employees]]);
    }

    public function getLeadsCountForOct(Request $request)
    {
        $validated = $request->validate([
            'state' => 'required|string',
            'status' => 'required|string'
        ]);

        $leads = Lead::where([['user_id', 1], ['status', $validated['status']], ['state', $validated['state']]])->count();

        return response()->json(['status' => 'success', 'leads' => $leads]);
    }

    public function octLeads(Request $request)
    {

        $validated = $request->validate([
            'count' => 'required|integer|min:1',
            'state' => 'required|string',
            'status' => 'required|string',
            'employees' => 'required'
        ]);

        $users = json_decode($validated['employees']);

        if (empty($users)) {
            throw ValidationException::withMessages(['employees' => ['Employees are required.']]);
        }

        $leads = Lead::where([
            ['user_id', 1],
            ['status', $validated['status']],
            ['state', $validated['state']]
        ])->pluck('id')->toArray();

        if ($validated['count'] > count($leads)) {
            throw ValidationException::withMessages(['count' => ['Count should be below available leads.']]);
        }


        $userCount = count($users);
        $perLeadCount = floor($validated['count'] / $userCount);
        $leadsArray = array_chunk($leads, $perLeadCount, true);


        $users = User::whereIn('id', $users)->get();

        foreach ($users as $index => $user) {
            $ls = $leadsArray[$index] ?? [];
            if (!empty($ls)) {
                Lead::whereIn('id', $ls)->update(['user_id' => $user->id, 'moved_at' => now()]);

                $lead = Lead::whereIn('id', $ls)->first();
                if ($lead) {
                    $isRequested = LeadRequest::where([
                        ['user_id', $user->id],
                        ['state', $lead->state],
                        ['status', false]
                    ])->first();

                    if ($isRequested) {
                        $isRequested->update(['status' => true]);
                    }
                }
            }
        }

        return response()->json(['status' => 'success', 'message' => 'Leads transferred successfully!']);
    }
}
