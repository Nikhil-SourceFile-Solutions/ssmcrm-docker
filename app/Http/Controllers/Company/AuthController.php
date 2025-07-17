<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Branch;
use App\Models\Company\IpTrack;
use App\Models\Company\Sale;
use App\Models\Company\User;
use App\Traits\Company\NotificationTrait;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Jenssegers\Agent\Facades\Agent;
use Laravel\Sanctum\PersonalAccessToken;
use PragmaRX\Google2FA\Google2FA;

class AuthController extends Controller
{

    use NotificationTrait;
    public function checkLoginUser(Request $request)
    {
        $validated = $request->validate([
            'email_or_emp_id_or_phone' => 'required|string'
        ]);

        $user = User::whereRaw('LOWER(email) = ?', [strtolower($validated['email_or_emp_id_or_phone'])])
            ->orWhere('employee_id', $validated['email_or_emp_id_or_phone'])
            ->orWhere('phone_number', $validated['email_or_emp_id_or_phone'])
            ->first();

        if ($user) {

            if (!$user->status) return throw ValidationException::withMessages([
                'email_or_emp_id_or_phone' => ['No Permission!'],
            ]);

            if ($user->user_type == 'Admin') {
                $branches = Branch::select('id', 'status', 'branch_name')->get();
            } else {
                $branches = Branch::select('id', 'status', 'branch_name')->where('id', $user->branch_id)->get();
            }
            return response()->json(['status' => 'success', 'branches' => $branches,  'user' => $user->first_name . ' ' . $user->last_name, 'is2FA' => $user->is_2fa_enabled ? 1 : 0, 'isPin' => $user->pin ? 1 : 0]);
        }
        return throw ValidationException::withMessages([
            'email_or_emp_id_or_phone' => ['User Not Found!'],
        ]);
    }

    public function login(Request $request)
    {


        $validated = $request->validate([
            'email_or_emp_id_or_phone' => 'required|string',
            'otp' => 'nullable',
            'pin' => 'nullable',
            'password' =>  'nullable',
        ]);

        $user = null;

        $user = User::where('email', $validated['email_or_emp_id_or_phone'])
            ->orWhere('employee_id', $validated['email_or_emp_id_or_phone'])
            ->orWhere('phone_number', $validated['email_or_emp_id_or_phone'])
            ->first();

        if (!$user) throw ValidationException::withMessages([
            'pin' => ['The provided credentials are incorrect.'],
            'password' => ['The provided credentials are incorrect.'],
            'otp' => ['The provided credentials are incorrect.'],
        ]);


        if ($user->is_2fa_enabled) {
            $validated = $request->validate([
                'otp' => 'required|digits:6',
                'pin' => 'nullable',
                'password' => 'nullable',
            ]);
        } else {
            $validated = $request->validate([
                'password' => 'nullable|required_without:pin|string',
                'pin' => 'nullable|required_without:password|string',
                'otp' => 'nullable',
            ]);
        }






        if ($validated['otp']) {

            if ($user->otp_expiry_time && Carbon::parse($user->otp_expiry_time)->isPast()) {
                throw ValidationException::withMessages([
                    'otp' => ['CRM OTP validation time has expired'],
                ]);
            }
            $google2fa = new Google2FA();

            if (!$google2fa->verifyKey($user->google2fa_secret, $validated['otp'])) {
                throw ValidationException::withMessages([
                    'otp' => ['Invalid OTP'],
                ]);
            }
        } else if ($validated['pin']) {
            if ($user->pin != $validated['pin']) throw ValidationException::withMessages([
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

        if (!$firstlogin)  $this->__HANDLE_TODAY();

        $lastLogin = IpTrack::where('user_id', $user->id)->count();

        $track =  IpTrack::create([
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


        if ($user->user_type != 'Admin') {
            $notification = [
                'title' => "CRM Login",
                'body' => $user->first_name . ' ' . $user->last_name . ' just logged into the CRM',
            ];

            $data = [
                "action" => "auth",
                "message" => json_encode([
                    'action' => 'login',
                    'title' => "CRM Login",
                    'user' => $user->only(['id', 'email', 'user_type', 'pin', 'phone_number']),
                    'track' => $track->only(['browser', 'ip_address']),
                    'message' => $user->first_name . ' ' . $user->last_name . ' just logged into the CRM',
                    'time' => now()
                ])
            ];

            $ids = User::whereIn('user_type', ['Admin', 'HR'])->where('status', true)->pluck('id')->toArray();
            $this->sendNotification($notification, $data, $ids);
        }


        // $callbacks =  Callback::join('leads', 'leads.id', 'callbacks.lead_id')
        //     ->whereDate('date_time', now()->today())
        //     ->where([['callbacks.user_id', $user->id], ['callbacks.status', false]])
        //     ->select('callbacks.id', 'leads.id as lead_id', 'callbacks.description', 'leads.first_name', 'callbacks.created_at', 'leads.last_name', 'leads.phone', 'date_time', 'leads.status')
        //     ->oldest('date_time')
        //     ->get();

        // foreach ($callbacks as $call) {
        //     $call->time = $call->date_time->format('H:i');
        //     $call->is_past = $call->date_time->isPast();
        // }

        // 'callbacks' =>  $callbacks,  
        // 'branches'=>Company::get(),

        $user->fcm_token = null;
        $user->save();

        return response()->json([
            'status' => 'success',
            'token' => $user->createToken('Sourcefile CRM', ['role:web'])->plainTextToken,
            'user' => $user->only(['id', 'owner', 'first_name', 'last_name', 'email', 'user_type', 'pin', 'phone_number', 'langauge_known',]),
            'lastLogin' => $lastLogin,
        ]);
    }


    public function verify2FA(Request $request)
    {
        $validated = $request->validate([
            'otp' => 'required|numeric',
            'email_or_emp_id_or_phone' => 'required||string',
        ]);



        $user = User::where('email', $validated['email_or_emp_id_or_phone'])
            ->orWhere('employee_id', $validated['email_or_emp_id_or_phone'])
            ->orWhere('phone_number', $validated['email_or_emp_id_or_phone'])
            ->first();

        $google2fa = new Google2FA();



        if ($google2fa->verifyKey($user->google2fa_secret, $request->otp)) {

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

            if (!$firstlogin)  $this->__HANDLE_TODAY();

            $lastLogin = IpTrack::where('user_id', $user->id)->count();

            $track =  IpTrack::create([
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


            if ($user->user_type != 'Admin') {
                $notification = [
                    'title' => "CRM Login",
                    'body' => $user->first_name . ' ' . $user->last_name . ' just logged into the CRM',
                ];

                $data = [
                    "action" => "auth",
                    "message" => json_encode([
                        'action' => 'login',
                        'title' => "CRM Login",
                        'user' => $user->only(['id', 'email', 'user_type', 'pin', 'phone_number']),
                        'track' => $track->only(['browser', 'ip_address']),
                        'message' => $user->first_name . ' ' . $user->last_name . ' just logged into the CRM',
                        'time' => now()
                    ])
                ];

                $ids = User::whereIn('user_type', ['Admin', 'HR'])->where('status', true)->pluck('id')->toArray();
                $this->sendNotification($notification, $data, $ids);
            }


            $user->fcm_token = null;
            $user->save();

            return response()->json([
                'status' => 'success',
                'token' => $user->createToken('Sourcefile CRM', ['role:web'])->plainTextToken,
                'user' => $user->only(['id', 'owner', 'first_name', 'last_name', 'email', 'user_type', 'pin', 'phone_number', 'langauge_known',]),
                'lastLogin' => $lastLogin,
            ]);
        } else throw ValidationException::withMessages([
            'password' => ['Invalid OTP'],
        ]);
    }

    public function logoutAllUsers()
    {
        PersonalAccessToken::where('id', '!=', 1)
            ->where('tokenable_id', '!=', auth()->user()->id)
            ->delete();


        User::where('id', '!=', 1)->update(['fcm_token' => null]);

        return response()->json(['status' => 'success', 'message' => 'All users have been logged out successfully!']);
    }


    public function logout(Request $request)
    {
        $user = User::find(auth()->user()->id);

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

            $track = IpTrack::create([
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

            if ($user->user_type != 'Admin') {
                $notification = [
                    'title' => "CRM Logout",
                    'body' => $user->first_name . ' ' . $user->last_name . ' has just logged out of the CRM',
                ];

                $data = [
                    "action" => "auth",
                    "message" => json_encode([
                        'action' => 'logout',
                        'title' => "CRM Logout",
                        'user' => $user->only(['id', 'email', 'user_type', 'pin', 'phone_number']),
                        'track' => $track->only(['browser', 'ip_address']),
                        'message' => $user->first_name . ' ' . $user->last_name . ' has just logged out of the CRM',
                        'time' => now()
                    ])
                ];

                $ids = User::whereIn('user_type', ['Admin', 'HR'])->where('status', true)->pluck('id')->toArray();
                $this->sendNotification($notification, $data, $ids);
            }

            $user->fcm_token = null;
            $user->save();

            return response()->json(['status' => 'success']);
        }
        return response()->json(['status' => 'error']);
    }

    protected function __HANDLE_TODAY()
    {
        Sale::where('is_service_activated', true)->whereNotNull('due_date')->where('due_date', '<=', Carbon::yesterday()->endOfDay())
            ->update([
                'status' => 'Expired',
                'is_service_activated' => false,
            ]);
    }
}
