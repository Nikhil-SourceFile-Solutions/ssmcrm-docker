<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Mail\Console\AlertMail;
use App\Models\Console\IpTrack;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Jenssegers\Agent\Facades\Agent;

class AuthController extends Controller
{


    public function checkLoginUser(Request $request)
    {

        $validated = $request->validate([
            'email_or_emp_id_or_phone' => 'required|string'
        ]);

        $user = User::where('email', $validated['email_or_emp_id_or_phone'])
            ->orWhere('phone', $validated['email_or_emp_id_or_phone'])
            ->first();

        if ($user) {
            if (!$user->status) return throw ValidationException::withMessages([
                'email_or_emp_id_or_phone' => ['No Permission!'],
            ]);
            return response()->json(['status' => 'success',  'user' => $user->owner, 'isPin' => $user->pin ? 1 : 0]);
        }


        try {
            info('Login Alert - User not found with ' . $validated['email_or_emp_id_or_phone']);
            Mail::to('nikhil@sourcefilesolutions.com')->send(new AlertMail('Login Alert', 'User not found with ' . $validated['email_or_emp_id_or_phone']));
        } catch (\Exception $e) {
            info('AuthController Mail sending failed: ' . $e->getMessage());
        }


        return throw ValidationException::withMessages([
            'email_or_emp_id_or_phone' => ['User Not Found!'],
        ]);
    }

    public function login(Request $request)
    {


        $validated = $request->validate([
            'email_or_emp_id_or_phone' => 'required||string',
            'password' => 'nullable|required_without:pin|string',
            'pin' => 'nullable|required_without:password|string',
        ]);

        $user = null;
        $user = User::where('email', $validated['email_or_emp_id_or_phone'])
            ->orWhere('phone', $validated['email_or_emp_id_or_phone'])
            ->first();




        if ($validated['pin']) {
            if (!$user || $user->pin != $validated['pin']) throw ValidationException::withMessages([
                'pin' => ['The provided credentials are incorrect.'],
            ]);
        } else {
            if (!$user || !Hash::check($validated['password'], $user->password)) {
                throw ValidationException::withMessages([
                    'password' => ['The provided credentials are incorrect.'],
                ]);
            }
        }


        $browser = Agent::browser();

        if (Agent::isMobile()) {
            $deviceType = 'Mobile';
        } else if (Agent::isDesktop()) {
            $deviceType = 'Desktop';
        } else if (Agent::isTablet()) {
            $deviceType = 'Tablet';
        } else if (Agent::isPhone()) {
            $deviceType = 'Phone';
        }

        $firstlogin = IpTrack::whereDate('created_at', now()->today())->where('action', 'Log In')->count();



        $lastLogin = IpTrack::where('user_id', $user->id)->count();

        $ipTrak = IpTrack::create([
            'user_id' => $user->id,
            'browser' => Agent::browser(),
            'browser_version' => Agent::version($browser),
            'device' => Agent::device(),
            'platform' => Agent::platform(),
            'device_type' => $deviceType,
            'is_robot' => Agent::isRobot(),
            'ip_address' => $request->ip(),
            'action' => 'Log In'
        ]);


        try {
            info('Login Alert - User Loggedin with ' . $validated['email_or_emp_id_or_phone'].' IP- '.$request->ip());
            Mail::to('nikhil@sourcefilesolutions.com')->send(new AlertMail('Login Alert', 'User Loggedin with ' . $validated['email_or_emp_id_or_phone'].' IP- '.$request->ip()));
        } catch (\Exception $e) {
            info('AuthController Mail sending failed: ' . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'token' => $user->createToken('Sourcefile CRM', ['role:web'])->plainTextToken,
            'user' => $user->only(['id', 'first_name', 'last_name', 'email', 'pin', 'phone']),
            'callbacks' => [],   //'callbacks' => $callbacks,
            'lastLogin' => $lastLogin,
        ]);
    }





    public function logout(Request $request)
    {
        $user = Auth::user();

        $browser = Agent::browser();

        if (Agent::isMobile()) {
            $deviceType = 'Mobile';
        } else if (Agent::isDesktop()) {
            $deviceType = 'Desktop';
        } else if (Agent::isTablet()) {
            $deviceType = 'Tablet';
        } else if (Agent::isPhone()) {
            $deviceType = 'Phone';
        }

        if ($user->tokens()->delete()) {
            IpTrack::create([
                'user_id' => $user->id,
                'browser' => Agent::browser(),
                'browser_version' => Agent::version($browser),
                'device' => Agent::device(),
                'platform' => Agent::platform(),
                'device_type' => $deviceType,
                'is_robot' => Agent::isRobot(),
                'ip_address' => $request->ip(),
                'action' => 'Log Out'
            ]);


              try {
            info('Login Alert - User logout with ' .auth()->user()->email.' IP- '.$request->ip());
            Mail::to('nikhil@sourcefilesolutions.com')->send(new AlertMail('Login Alert', 'User logout with ' .auth()->user()->email.' IP- '.$request->ip()));
        } catch (\Exception $e) {
            info('AuthController Mail sending failed: ' . $e->getMessage());
        }

            return response()->json(['status' => 'success']);
        }
        return response()->json(['status' => 'error']);
    }
}
