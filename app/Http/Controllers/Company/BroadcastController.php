<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Broadcast;
use App\Models\Company\User;
use App\Traits\Company\NotificationTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class BroadcastController extends Controller
{
    use NotificationTrait;
    public function index()
    {
        $broadcast = Broadcast::join('users', 'users.id', 'broadcasts.user_id')->whereDate('broadcasts.created_at', now()->today())
            ->select('broadcasts.*', 'first_name', 'last_name', 'user_type')
            ->get();

        return response()->json(['status' => 'success', 'broadcasts' => $broadcast]);
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
        $validated = $request->validate([
            'message' => 'nullable|string',
        ]);

        $validated['user_id'] = auth()->user()->id;
        $response = Broadcast::create($validated);

        $response->new = true;

        if ($response) {

            $notification = [
                'title' => "New Broadcast",
                'body' => "$request->message",
            ];
            $data = [
                "action" => "new-broadcast",
                "message" => json_encode($response)
            ];

            $users = User::where([['id', '!=', auth()->user()->id], ['status', '=', true]])->pluck('id')->toArray();
            $this->sendNotification($notification, $data, $users);

            Cache::forget("latest-broadcast");
            $data = Cache::remember('latest-broadcast', 60, function () {
                $broadCast = Broadcast::whereDate('created_at', now())->latest()->first();
                if ($broadCast) {
                    $broadCast->new = true;
                }
                return $broadCast;
            });

            return response()->json([
                'message' => 'Broadcast Send Successfully!',
                'status' => 'success',

            ]);
        }
        return response()->json([
            'message' => 'Failed to send Broadcast',
            'status' => 'error',

        ]);
    }





    /**
     * Display the specified resource.
     */
    public function show(Broadcast $broadcast)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Broadcast $broadcast)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Broadcast $broadcast)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Broadcast $broadcast)
    {
        //
    }


    private function handleCache() {}
}
