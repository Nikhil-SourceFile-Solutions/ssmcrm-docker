<?php

namespace App\Http\Controllers\Company\Settings;

use App\Http\Controllers\Controller;
use App\Models\Company\IpTrack;
use App\Models\Company\User;
use Illuminate\Http\Request;

class IpTrackController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->users) $users = User::select('id', 'first_name', 'last_name')->get();
        else $users = 0;

        if ($request->filterUser) {
            $iptracks = IpTrack::join('users', 'users.id', 'ip_tracks.user_id')
                ->where('user_id', $request->filterUser)
                ->where(
                    function ($query) use ($request) {
                        return $query
                            ->where('first_name', 'like', '%' . $request->search . '%')
                            ->orWhere('email', 'like', '%' . $request->search . '%')
                            ->orWhere('phone_number', 'like', '%' . $request->search . '%');
                    }
                )->select('users.first_name', 'users.email', 'users.last_name', 'ip_tracks.*')
                ->latest()
                ->paginate($request->pageSize);
        } else {
            $iptracks = IpTrack::join('users', 'users.id', 'ip_tracks.user_id')
                ->where('first_name', 'like', '%' . $request->search . '%')
                ->orWhere('email', 'like', '%' . $request->search . '%')
                ->orWhere('phone_number', 'like', '%' . $request->search . '%')
                ->select('users.first_name', 'users.email', 'users.last_name', 'ip_tracks.*')
                ->latest()
                ->paginate($request->pageSize);
        }

        return response()->json(['status' => 'success', 'data' => $iptracks, 'users' => $users]);
    }
}
