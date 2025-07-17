<?php

namespace App\Http\Controllers\Company;


use App\Http\Controllers\Controller;
use App\Models\Company\Lead;
use App\Models\Company\Leadautomation;
use App\Models\Company\LeadRequest;
use App\Models\Company\Settings\Setting;
use Illuminate\Http\Request;

class LeadRequestController extends Controller
{
    public function leadRequestState()
    {
        $states = Lead::whereNot('status', 'Closed Won')->where('user_id', 1)->select('state')->groupBy('state')
            ->get();
        return response()->json(['status' => 'success', 'states' => $states]);
    }

    public function leadRequest(Request $request)
    {
        $validated = $request->validate([
            'state' => 'required|string',
            'count' => 'required|integer'
        ]);
        $leads = Lead::where([['user_id', 1], ['state', $validated['state']]])->count();

        if (!$validated['count']) return response()->json(['status' => 'error', 'message' => 'No Lead available Now! Try after sometimes']);

        $already = LeadRequest::where([['user_id', auth()->user()->id], ['state', $validated['state']], ['status', false]])->first();

        if ($already) return response()->json(['status' => 'error', 'message' => 'Your previous request is pending!']);

        $validated['user_id'] = auth()->user()->id;

        $settings = Setting::first();

       

        if ($settings->lead_automation_enabled) {
            $automation = Leadautomation::where('state', $validated['state'])->first();
            if ($automation && $automation->auto_status) {
                $validated['status'] = true;
                Lead::where([['user_id', 1], ['state', $validated['state']]])
                    ->take($automation->auto_updatecount)->update(['user_id' => auth()->user()->id]);
            } else $validated['status'] = false;
        }

        $created = LeadRequest::create($validated);
        if ($created) {
            return response()->json(['status' => 'success', 'message' => 'Lead request send successfully']);
        }
        return response()->json(['status' => 'error', 'message' => 'Failed to send lead request']);
    }
    public function cancel(Request $request)
    {
        $leadRequest = LeadRequest::find($request->id);

        if (!$leadRequest) return response()->json(['status' => 'error', 'message' => 'Lead request not Found!']);

        $updated =  $leadRequest->update(['status' => true]);

        if ($updated) return response()->json(['status' => 'success', 'message' => 'Lead Request Canceld successfully!']);

        return response()->json(['status' => 'error', 'message' => 'Failed to cancel lead request']);
    }
}
