<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Callback;
use App\Models\Company\Lead;
use App\Traits\Company\HomeTrait;
use Illuminate\Http\Request;

class CallbackController extends Controller
{

    use HomeTrait;

    public function getCallbacks()
    {
        $callbacks =  Callback::join('leads', 'leads.id', 'callbacks.lead_id')
            ->whereDate('date_time', now()->today())
            ->where([['callbacks.user_id', auth()->user()->id], ['callbacks.status', false]])
            ->select('callbacks.id', 'leads.id as lead_id', 'callbacks.description', 'leads.first_name', 'callbacks.created_at', 'leads.last_name', 'leads.phone', 'date_time', 'leads.status')
            ->oldest('date_time')
            ->get();

        foreach ($callbacks as $call) {
            $call->time = $call->date_time->format('H:i');
            $call->is_past = $call->date_time->isPast();
        }

        return response()->json(['status' => 'success', 'callbacks' => $callbacks]);
    }



    public function callbackByLead($leadId)
    {
        $callbacks = Callback::where('lead_id', $leadId)->latest()->get();
        return response()->json(['status' => 'success', 'callbacks' => $callbacks]);
    }

    public function closeCallback($id)
    {
        $callback = Callback::find($id);
        if (!$callback) return response()->json(['status' => 'error', 'message' => 'callback not found!']);
        $callback->status = true;

        if ($callback->save()) {
            $specificData = $this->getSpecificData(['allCallbacks']);
            return response()->json([
                'status' => 'success',
                'message' => 'Callback Closed successfully!',
                'callback' => $callback,
                'allCallbacks' => $specificData['allCallbacks'] ?? [],

            ]);
        }
        return response()->json(['status' => 'error', 'message' => 'Failed to close callback!']);
    }




    public function store(Request $request)
    {
        $validated = $request->validate([
            'date_time' => 'required',
            'description' => 'nullable|string',
            'lead_id' => 'required',
        ]);

        $validated['user_id'] = auth()->user()->id;

        Callback::where('lead_id', $validated['lead_id'])->update(['status' => true]);
        $created = Callback::create($validated);

        if ($created) {
            $specificData = $this->getSpecificData(['allCallbacks']);
            return response()->json([
                'status' => 'success',
                'message' => 'Callback Created Successfully!',
                'callBacks' => Callback::where('lead_id', $validated['lead_id'])->latest()->get(),
                'allCallbacks' => $specificData['allCallbacks'] ?? [],
            ]);
        }

        return response()->json(['status' => 'error', 'message' => 'Failed to create Callback']);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        //
    }
}
