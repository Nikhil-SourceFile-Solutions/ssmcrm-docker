<?php

namespace App\Http\Controllers\Company\Settings;

use App\Http\Controllers\Controller;
use App\Models\Company\Branch;
use App\Models\Company\IpTrack;
use App\Models\Company\Lead;
use App\Models\Company\Settings\Dropdown;
use App\Models\Company\Settings\Setting;
use App\Models\Company\User;
use App\Models\Console\Company;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FA\Google2FA;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class EmployeeController extends Controller
{

    public function index(Request $request)
    {
        $selectedbranch = getSelectedBranch($request);

        $filterUserType = $request->filterUserType;
        $filterStatus = $request->filterStatus;
        $search = $request->search;
        $pageSize = $request->get('pageSize', 10);
        $currentPage = $request->get('page', 1);
        $offset = ($currentPage - 1) * $pageSize;
        $query = User::query();

        if ($selectedbranch) $query->where('branch_id', $selectedbranch);
        if ($search) $query
            ->where('first_name', 'like', '%' . $request->search . '%')
            ->orWhere('last_name', 'like', '%' . $request->search . '%')
            ->orWhere(DB::raw("CONCAT(first_name, ' ', last_name)"), 'like', '%' . $request->search . '%');

        if ($filterUserType) $query->where('user_type', $filterUserType);

        if ($filterStatus) $query->where('users.status', $filterStatus == 'Active' ? 1 : 0);

        $totalItems = $query->count();



        $itemsForCurrentPage = $query->join('branches', 'branches.id', 'users.branch_id')
            ->offset($offset)
            ->limit($pageSize)
            ->select('users.*', 'branches.branch_name')
            ->orderBy('users.created_at', 'desc')
            ->get();


        $from = $offset + 1;
        $to = min($offset + $pageSize, $totalItems);

        foreach ($itemsForCurrentPage as $item) {
            if ($item->manager_id) {

                $manager = User::find($item->manager_id);

                $item->manager = $manager ? $manager->first_name . ' ' . $manager->last_name : 'N/A';
            }
            if ($item->team_leader_id) {
                $leader = User::find($item->team_leader_id);
                $item->leader = $leader ?  $leader->first_name . ' ' . $leader->last_name : 'N/A';
            }
        }

        $branches = Branch::where('status', true)->select('id', 'status', 'branch_name')->whereNot('id', 1)->get();
        foreach ($branches as $branch) {
            $branch->admin = User::where([['user_type', 'Branch Admin'], ['branch_id', $branch->id]])->first();
        }

        // return $branches;

        return response()->json([
            'status' => 'success',
            'data' =>  [
                'data' => $itemsForCurrentPage,
                'currentPage' => $currentPage,
                'pageSize' => $pageSize,
                'totalItems' => $totalItems,
                'from' => $from,
                'to' => $to,
                'activeEmployeecount' => User::where('status', true)->count(),
                'branches' => $branches,
                'userTypes' => ['Accounts', 'Branch Admin', 'Analyst', 'Manager', 'Floor Manager', 'Team Leader', 'BDE', 'HR', 'Networking', 'Complaince']
            ]
        ]);
    }



    public function employeeLogs(Request $request)
    {
        $user = User::find($request->id);
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        }
        $logs = IpTrack::where('user_id', $user->id)->latest()->paginate($request->pageSize);
        return response()->json([
            'status' => 'success',
            'logs' => $logs
        ]);
    }

    public function create()
    {
        $languages = Dropdown::where([['type', 'Speaking Languages'], ['status', true]])->pluck('value')->toArray();
        $userTypes = ['Accounts', 'Branch Admin', 'Analyst', 'Manager', 'Floor Manager', 'Team Leader', 'BDE', 'HR', 'Networking', 'Complaince'];
        $managersAndLeaders = User::whereIn('user_type', ['Manager', 'Team Leader'])->select('id', 'first_name', 'last_name', 'manager_id', 'user_type')->get();
        $branches = Branch::where('status', true)->get();
        return response()->json(['status' => 'success', 'data' => ['languages' => $languages, 'userTypes' => $userTypes, 'managersAndLeaders' => $managersAndLeaders, 'branches' => $branches]]);
    }

    private function getCompanyName()
    {
        $settings =  Cache::get("company-settings");
        if (!$settings) {
            $settings = Setting::first();
            $crm = tenancy()->central(function ($tenant) {
                return Company::where('domain', $tenant->id)->select('branch_no', 'corporate_branch_name')->first();
            });
            $settings->branch_no = $crm->branch_no;
            Cache::forever("company-settings", $settings);
        }

        return $settings->crm_name ?? "SFS CRM";
    }

    public function getMfa(Request $request)
    {
        $user = User::find($request->id);

        if (!$user) return response()->json(['status' => 'error', 'message' => 'User Not Found!']);
        $google2fa = new Google2FA();
        if (!$user->google2fa_secret) {
            $user->google2fa_secret = $google2fa->generateSecretKey();
            $user->save();
        }


        $qrCodeUrl = $google2fa->getQRCodeUrl(
            $this->getCompanyName(),
            $user->email,
            $user->google2fa_secret
        );

        $qrCode = QrCode::format('svg')->merge(public_path('favicon.png'), 30, true)->size(200)->generate($qrCodeUrl);
        $qrCodeBase64 = 'data:image/svg+xml;base64,' . base64_encode($qrCode);

        $lastLogin =  IpTrack::where([['user_id', $user->id], ['action', 'Log In']])->latest()->first();


        $otpExpiryTime = $user->otp_expiry_time ? Carbon::parse($user->otp_expiry_time) : null;
        $now = Carbon::now();

        if ($otpExpiryTime && $otpExpiryTime->isFuture()) {
            $remainingSeconds = $now->diffInSeconds($otpExpiryTime);
        } else {
            $remainingSeconds = 0;
        }


        return response()->json(['status' => 'success', 'user' => $user, 'qrCode' => $qrCodeBase64, 'lastLogin' => $lastLogin, 'remainingSeconds' => $remainingSeconds]);
    }


    public function storeMfa(Request $request)
    {


        $validated = $request->validate([
            'is_2fa_enabled' => 'required|boolean',
            'otp_expiry_time' => 'required|numeric'
        ]);

        if ($validated['is_2fa_enabled']) {
            $validated['otp_expiry_time'] = Carbon::now()->addMinutes((int) $validated['otp_expiry_time']);
        } else {
            $validated['otp_expiry_time'] = null;
        }


        $user = User::find($request->id);

        if (!$user) return response()->json(['status' => 'error', 'message' => 'User Not Fount!']);


        if ($user->update($validated)) {
            $user->tokens()->delete();

            $otpExpiryTime = $user->otp_expiry_time ? Carbon::parse($user->otp_expiry_time) : null;
            $now = Carbon::now();

            if ($otpExpiryTime && $otpExpiryTime->isFuture()) {
                $remainingSeconds = $now->diffInSeconds($otpExpiryTime);
            } else {
                $remainingSeconds = 0;
            }

            return response()->json(['status' => 'success', 'message' => 'Updated successfully!', 'remainingSeconds' => $remainingSeconds]);
        }

        return response()->json(['status' => 'ERROR', 'message' => 'Failed to Update!']);
    }



    public function store(Request $request)
    {
        if ($request->id) return $this->update($request);
        $validated = $request->validate([
            'employee_id' => 'nullable|string|unique:users,employee_id',
            'first_name' => 'nullable|string',
            'last_name' => 'nullable|string',
            'email' => 'required|unique:users',
            'password' => 'required|string',
            'phone_number' => 'nullable|digits:10|unique:users,phone_number',
            'user_type' => 'nullable|string',
            // 'branch_id' => 'required|integer',
            'manager_id' => 'nullable|string',
            'team_leader_id' => 'nullable|string',
            'langauge_known' => 'nullable|string',
            'status' => 'required|boolean'
        ]);

        if (auth()->user()->user_type == 'Admin') {
            $validated2 = $request->validate(['branch_id' => 'required|integer']);
            $validated = [...$validated, ...$validated2];
        } else {
            $validated['branch_id'] = auth()->user()->branch_id;
        }

        $validated['password'] = Hash::make($validated['password']);
        $validated['show_password'] = $request->password;

        $google2fa = new Google2FA();
        $validated['google2fa_secret'] = $google2fa->generateSecretKey();;
        $response = User::create($validated);

        if ($response) {
            $this->handleCache();
            return response()->json([
                'message' => 'Employee Created',
                'status' => 'success',
            ]);
        }
        return response()->json([
            'message' => 'Failed',
            'status' => 'error',
        ]);
    }

    public function setNewPin(Request $request)
    {
        $validated = $request->validate([
            'pin' => 'required|digits:4|same:pin_confirmation',
            'pin_confirmation' => 'required',
        ]);

        $user = auth()->user();

        $user->pin = $validated['pin'];

        if ($user->save()) return response()->json(['status' => 'success', 'message' => 'pin created successfully!', 'user' => $user]);

        return response()->json(['status' => 'error', 'message' => 'Failed to create pin!']);
    }

    public function show(User $user)
    {

        $google2fa = new Google2FA();

        $secret = $user->google2fa_secret;

        $qrCodeUrl = $google2fa->getQRCodeUrl(
            $this->getCompanyName(),
            $user->email,
            $secret
        );

        return response()->json(['employee' => $user, 'qrCodeUrl' => $qrCodeUrl]);
    }

    public function edit(User $user)
    {
        //
        return response()->json(['employee' => $user]);
    }


    public function updateFcmToken(Request $request)
    {
        $validated = $request->validate([
            'fcm_token' => 'required|string',
        ]);
        try {
            $request->user()->update(['fcm_token' => $validated['fcm_token']]);
            return response()->json(['status' => 'success', 'message' => 'FMC token updated']);
        } catch (\Exception $e) {
            report($e);
            return response()->json(['status' => 'error', 'message' => 'Failed to update FMC token'], 500);
        }
    }
    /**
     * Update the specified resource in storage.
     */
    public function update($request)
    {
        $employee = User::find($request->id);
        if (!$employee)    return response()->json([
            'message' => 'Employee not found',
            'status' => 'error',
        ]);

        $validated = $request->validate([
            'employee_id' => 'nullable|string|unique:users,employee_id,' . $employee->id,
            'first_name' => 'nullable|string',
            'last_name' => 'nullable|string',
            'email' => 'required|email|unique:users,email,' . $employee->id,
            'password' => 'required|string',
            'phone_number' => 'nullable|digits:10|unique:users,phone_number,' . $employee->id,
            'user_type' => 'nullable|string',
            'branch_id' => 'required|integer',
            'status' => 'nullable|boolean',

            'manager_id' => 'nullable|string',
            'team_leader_id' => 'nullable|string',
            'langauge_known' => 'nullable|string',
        ]);

        // if ($validated['user_type'] == 'Team Leader' || $validated['user_type'] == 'BDE') {
        //     $validated2 = $request->validate(['manager_id' => 'required|integer']);
        //     $validated = [...$validated, ...$validated2];
        // }
        // if ($validated['user_type'] == 'BDE') {
        //     $validated3 = $request->validate(['team_leader_id' => 'required|integer']);
        //     $validated = [...$validated, ...$validated3];
        // }

        $validated['password'] = Hash::make($validated['password']);
        $validated['show_password'] = $request->password;

        if ($validated['user_type'] == 'Team Leader') {
            $validated['team_leader_id'] = null;
        } else if ($validated['user_type'] != 'BDE') {
            $validated['manager_id'] = null;
            $validated['team_leader_id'] = null;
        }
        $response = $employee->update($validated);

        if ($response) {
            $this->handleCache();
            return response()->json([
                'message' => 'Employee Updated',
                'status' => 'success',
                'data' => $employee

            ]);
        }
        return response()->json([
            'message' => 'Failed',
            'status' => 'error',

        ]);
    }




    public function updateUserProfile(Request $request)
    {
        // Find the employee by ID
        $employee = User::find($request->id);

        // Check if the employee exists
        if (!$employee) {
            return response()->json([
                'message' => 'Employee not found',
                'status' => 'error',
            ]);
        }

        // Validate the incoming request data
        $validated = $request->validate([
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone_number' => 'nullable|digits:10|unique:users,phone_number,' . $employee->id,

        ]);

        // Update the employee with the validated data
        $response = $employee->update($validated);

        // Return appropriate response based on the update status
        if ($response) {
            $this->handleCache();
            return response()->json([
                'message' => 'Profile updated successfully',
                'status' => 'success',
                'data' => $employee
            ]);
        } else {
            return response()->json([
                'message' => 'Update failed',
                'status' => 'error',
            ]);
        }
    }


    public function updateStatus(Request $request)
    {
        $employee = User::find($request->id);

        if (!$employee) return response()->json(['status' => 'error', 'message' => 'Emplyoee not found!']);

        $employee->status = !$employee->status;

        if ($employee->save()) {
            $this->handleCache();
            $result = $employee->status ? 'Activated' : 'Blocked';
            return response()->json(['status' => 'success', 'message' => "Emplyoee $result successfully!", 'activeEmployeecount' => User::get()->where('status', true)->count(), 'employee' => $employee]);
        }
        return response()->json(['status' => 'error', 'message' => 'Failed to update user status']);
    }


    public function updatePassword(Request $request)
    {
        // Validate the request
        $validated = $request->validate([
            'id' => 'required|integer',
            'password' => 'nullable|required_without:pin|string|min:6|confirmed',
            'pin' => 'nullable|required_without:password|string|digits:4|confirmed',
        ]);

        // Find the user
        $user = User::find($validated['id']);
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User Not Found']);
        }

        // Track what was updated
        $updatedFields = [];
        $showPassword = null; // To store the plaintext password temporarily
        $showPin = null;      // To store the plaintext PIN temporarily

        // Update password if provided
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
            $user->show_password = $validated['password'];
            $updatedFields['password'] = 'Password updated successfully';
        }

        // Update PIN if provided
        if (!empty($validated['pin'])) {
            $showPin = $validated['pin']; // Save the plaintext PIN
            $user->pin = $validated['pin'];
            $updatedFields['pin'] = 'PIN updated successfully';
        }

        // Clear FCM token and save changes
        $user->fcm_token = null;
        $updateCredentials = $user->save();

        // Check if the update was successful
        if ($updateCredentials) {
            if ($user->id != 1) {
                $user->tokens()->delete();
            }

            return response()->json([
                'status' => 'success',
                'message' => "Credentials updated successfully!",
                'employee' => $user,

            ]);
        }

        return response()->json(['status' => 'error', 'message' => 'Failed to update the credentials']);
    }



    public function updatePasswordPinByEmployee(Request $request)
    {
        // Validate the request
        $validated = $request->validate([
            'id' => 'required|integer',
            'old_password' => 'nullable|required_with:password|string',
            'password' => 'nullable|required_without:pin|string|min:6|confirmed',
            'old_pin' => 'nullable|required_with:pin|string|digits:4',
            'pin' => 'nullable|required_without:password|string|digits:4|confirmed',
        ]);

        // Find the user
        $user = User::find($validated['id']);
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User Not Found']);
        }

        // Verify the old password if provided
        if (!empty($validated['password'])) {
            if (!Hash::check($validated['old_password'], $user->password)) {
                return response()->json(['status' => 'error', 'message' => 'Old password is incorrect']);
            }
            $user->password = Hash::make($validated['password']);
        }

        // Verify the old PIN if provided
        if (!empty($validated['pin'])) {
            if ($validated['old_pin'] !== $user->pin) {
                return response()->json(['status' => 'error', 'message' => 'Old PIN is incorrect']);
            }
            $user->pin = $validated['pin'];
        }

        // Clear FCM token and save changes
        $user->fcm_token = null;
        $updateCredentials = $user->save();

        // Check if the update was successful
        if ($updateCredentials) {
            if ($user->id == 1) {
                $user->tokens()->delete();
            }

            return response()->json([
                'status' => 'success',
                'message' => "Credentials updated successfully!",
                'employee' => $user,
            ]);
        }

        return response()->json(['status' => 'error', 'message' => 'Failed to update the credentials']);
    }




    public function createNewPassword(Request $request)
    {
        $validated = $request->validate([
            'password' => 'required|string',
            'password_confirmation' => 'required_with:password|same:password',
        ]);

        // Find the user (you can modify this if needed, e.g., if you're not using auth()->user())
        $user = auth()->user();

        // Create a new password
        $user->password = Hash::make($validated['password']);

        // Clear the FCM token (if necessary)
        $user->fcm_token = null;

        // Save the user with the new password
        $savePassword = $user->save();

        if ($savePassword) {
            // Delete existing tokens (for security, ensuring a fresh login is required)


            return response()->json([
                'status' => 'success',
                'message' => 'Password created successfully!',
                'employee' => $user,
            ]);
        }

        return response()->json(['status' => 'error', 'message' => 'Failed to create the password']);
    }




    public function  getManagerTeamleader()
    {
        $users = User::whereIn('user_type', ['Manager', 'Team Leader'])->where('status', true)
            ->select('id', 'first_name', 'last_name', 'user_type', 'manager_id', 'team_leader_id')->get();
        return response()->json([
            'status' => 'success',
            'users' => $users
        ]);
    }

    public function getEmployeeLeadsIndividually($userId)
    {
        if (auth()->user()->user_type != 'Admin') return [];
        $leads = Lead::join('users', 'users.id', '=', 'leads.user_id')
            ->where('leads.user_id', $userId)
            ->select(
                'leads.*',
                'users.first_name as user_first_name',
                'users.last_name as user_last_name',
                'users.email as user_email',
                'users.user_type as user_type'
            )
            ->get();

        $leadCount = $leads->count();
        $statusCounts = $leads->groupBy('status')->map(function ($group) {
            return $group->count();
        });
        $newFree = $statusCounts->get('Free Trial', 0);
        $newClosed = $statusCounts->get('Closed Won', 0);
        $newFollow = $statusCounts->get('Follow Up', 0);
        $newCount = $statusCounts->get('New', 0);
        $freshCount = $statusCounts->get('Fresh', 0);



        $google2fa = new Google2FA();

        $user = User::find($userId);
        $secret = $user->google2fa_secret;

        $qrCodeUrl = $google2fa->getQRCodeUrl(
            $this->getCompanyName(),
            $user->email,
            $secret
        );



        $qrCode = QrCode::format('svg')->size(200)->generate($qrCodeUrl);

        // return $qrCode;
        // $qrCodeBase64 = 'data:image/svg+xml;base64,' . base64_encode($qrCode);
        $qrCodeBase64 = 'data:image/svg+xml;base64,' . base64_encode($qrCode);

        return response()->json([
            'status' => 'success',
            'lead_count' => $leadCount,
            'leads' => $leads,
            'status_counts' => [
                'Fresh' => $freshCount,
                'New' => $newCount,
                'Closed Won' => $newClosed,
                'Follow Up' => $newFollow,
                'Free Trial' => $newFree
            ],
            'qrCodeUrl' => $qrCodeBase64 // Now it's properly formatted for React
        ]);
    }





    public function destroy(User $user)
    {
        if ($user->id == "1") return response()->json(['status' => 'error', 'message' => 'The main admin cannot delete.']);

        if ($user->delete()) {
            $this->handleCache();

            return response()->json(['status' => 'success', 'message' => 'Employee Deleted successfully!']);
        }
        return response()->json(['status' => 'error', 'message' => 'Failed to delete employee!']);
    }


    public function getLeadOwners(Request $request)
    {
        $owners = User::whereIn('user_type', ['BDE', 'Team Leader', 'Manager'])->where('status', true)->select('id', 'first_name', 'last_name')->get();


        return response()->json(['status' => 'success', 'owners' => $owners]);
    }



    public function handleStatus(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer'
        ]);

        $user = User::find($validated['id']);

        if (!$user) return response()->json(['status' => 'error', 'message' => 'User Not Found!', 'action' => 'failed']);


        if ($user->user_type == "Admin") return response()->json(['status' => 'error', 'message' => 'Admin status cant change', 'action' => 'failed']);

        if ($user->status) {

            $leads = Lead::where('user_id', $user->id)->get();

            $closedWonLeads = $leads->where('status', 'Closed Won')->count();

            $followUpLeads = $leads->where('status', 'Follow Up')->count();

            $freeTrailLeads = $leads->where('status', 'Free Trial')->count();

            if ($leads->count()) return response()->json(['status' => 'error', 'action' => 'lead', 'data' => ['totalLeads' => $leads->count(), 'closedWonLeads' => $closedWonLeads, 'followUpLeads' => $followUpLeads, 'freeTrailLeads' => $freeTrailLeads]]);
        }

        $user->status = !$user->status;

        if ($user->save()) {

            $this->handleCache();
            return response()->json(['status' => 'success', 'message' => 'Employee Status changed Successfully!']);
        }

        return response()->json(['status' => 'error', 'message' => 'Failed to Change Employee Status', 'action' => 'failed']);
    }

    private function handleCache()
    {

        Cache::forget("active-lead-owners");
    }
}
