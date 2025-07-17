<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Callback;
use App\Models\Company\Campaign\ApplicationCampaignLead;
use App\Models\Company\Lead;
use App\Models\Company\LeadRequest;
use App\Models\Company\LeadStatus;
use App\Models\Company\ReferLead;
use App\Models\Company\RiskProfile;
use App\Models\Company\Sale;
use App\Models\Company\SaleInvoice;
use App\Models\Company\SendBankDetails;
use App\Models\Company\Settings\Dropdown;
use App\Models\Company\Settings\Setting;
use App\Models\Company\TransferLead;
use App\Models\Company\User;
use App\Models\Company\WebsiteLink;
use App\Models\Console\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LeadController extends Controller
{

    public function create()
    {
        $dropdowns = Dropdown::whereIn('type', ['Lead Status', 'State', 'Investment Size', 'DND Status', 'Lot Size', 'Lead Products'])
            ->where('status', true)->select('id', 'type', 'value as value', 'value as label')->get();
        return response()->json(['status' => 'success', 'dropdowns' => $dropdowns]);
    }


    public function store(Request $request)
    {
        if ($request->id) return $this->update($request);

        $validated = $request->validate([
            'first_name' => 'nullable|string|max:250',
            'last_name' => 'nullable|string|max:250',
            'phone' => 'required|digits:10|unique:leads,phone',
            'app_otp' => 'nullable|digit:10',
            'second_phone' => 'nullable|digits:10|unique:leads,second_phone',
            'email' => 'nullable|email|max:250|unique:leads,email',
            'status' => 'required|string|max:250',
            'state' => 'required|string|max:200',
            'city' => 'nullable|string|max:250',
            'followup' => 'nullable|date',
            'free_trial' => 'nullable|date',
            'desc' => 'nullable|string|max:1000',
            'invest' => 'nullable|string|max:250',
            'lot_size' => 'nullable|string|max:250',
            'products' => 'nullable|string|max:2500',
            'dnd' => 'nullable|string|max:250',
        ]);

        $validated['user_id'] = auth()->user()->id;
        $validated['source'] = "Incomming";
        $validated['moved_at'] = now();

        $created = Lead::create($validated);

        if ($created) {
            return response()->json(['status' => 'success', 'message' => 'Lead created successfully!']);
        }

        return response()->json(['status' => 'error', 'message' => 'Failed to create Lead!']);
    }


    public function show($lead_id, Request $request)
    {

        $lead = null;

        if (auth()->user()->user_type == "Admin") $owner = $request->filterOwner;
        else  $owner = auth()->user()->id;

        if ($request->action) {

            $query = DB::table('leads');

            if ($owner)  $query->where('user_id', $owner);

            if ($request->filterState) $query->where('leads.state', $request->filterState);

            if ($request->filterStatus) {
                if ($request->filterStatus == "today-free-trial") $query->whereDate('free_trial', now()->today());
                else if ($request->filterStatus == "today-follow-up") $query->whereDate('followup', now()->today());
                else  $query->where('leads.status', $request->filterStatus);
            }
            if ($request->action == "nxt") $query->where('id', '<', $lead_id)->orderBy('id', 'desc');
            elseif ($request->action == "prv") $query->where('id', '>', $lead_id)->orderBy('id', 'asc');
            $lead =   $query->first();
        } else $lead = Lead::find($lead_id);


        if (!$lead) return response()->json(['status' => 'error', 'message' => 'No data found!']);



        $data = [];
        $data = ['id' => $lead->id];

        $settings =  Cache::get("company-settings");
        if (!$settings) {
            $settings = Setting::first();
            $crm = tenancy()->central(function ($tenant) {
                return Company::where('domain', $tenant->id)->select('branch_no', 'corporate_branch_name')->first();
            });
            $settings->branch_no = $crm->branch_no;
            Cache::forever("company-settings", $settings);
        }


        $data['owner'] = User::where('id', $lead->user_id)->select('first_name', 'last_name', 'email', 'user_type', 'status')->first();
        $data['lead'] = $lead;

$data['descriptions']=LeadStatus::where('lead_id',$lead->id)->latest()->select('changes','created_at')->get();

        $data['verification']['websiteEnabled'] = $settings->website_permission;

        if ($settings->website_permission) {

            $website = WebsiteLink::where('lead_id', $lead->id)->first();

            if (!$website) $website = WebsiteLink::create(['lead_id' => $lead->id, 'count' => 0]);
            $data['verification']['website'] =  $website;
        }

        $dropdowns =  Cache::get("lead-view-dropdodwn");

        if (!$dropdowns) {

            $dropdowns = Dropdown::whereIn('type', ['Lead Status', 'State', 'Investment Size', 'DND Status', 'Lot Size', 'Lead Products'])
                ->where('status', true)->select('id', 'type', 'value as value', 'value as label')->get();
            Cache::forever("lead-view-dropdodwn", $dropdowns);
        }

        $data['dropdowns'] = $dropdowns;

        $data['verification']['bankDetails'] = SendBankDetails::where('lead_id', $lead->id)->select('count')->get();

        $data['verification']['allowedSendLinks'] = json_decode($settings->allowed_to_send_links);
        if ($lead->status == "Closed Won") {






            $data['verification']['riskprofileEnabled'] = $settings->riskprofile_enabled;



            if ($settings->riskprofile_enabled) {

                $rp = RiskProfile::where('lead_id', $lead->id)->first();
                if (!$rp) $rp = RiskProfile::create(['lead_id' => $lead->id, 'count' => 0, 'token' =>  $this->generateUniqueToken('risk_profiles')]);

                $data['verification']['riskProfile'] = $rp;
            }



            $data['verification']['bank'] = [];
        }

        return response()->json(['status' => 'success', 'data' => $data]);
    }

    private function generateUniqueToken($table)
    {
        do {
            $token = Str::random(6);
            $exists = DB::table($table)->where('token', $token)->exists();
        } while ($exists);

        return $token;
    }

    public function update(Request $request)
    {
        $lead = Lead::find($request->id);
        if (!$lead) return response()->json(['status' => 'error', 'message' => 'Lead Not Found!']);

        $validated = $request->validate([
            'first_name' => 'nullable|string|max:250',
            'last_name' => 'nullable|string|max:250',
            'second_phone' => 'nullable|digits:10|unique:leads,second_phone,' . $lead->id,
            'email' => 'nullable|email|max:250|unique:leads,email,' . $lead->id,
            'status' => 'required|string|max:250',
            'state' => 'required|string|max:200',
            'city' => 'nullable|string|max:250',
            'followup' => $request->status === 'Follow Up' ? 'required|date' : 'nullable|date',
            'free_trial' => $request->status === 'Free Trial' ? 'required|date' : 'nullable|date',
            'desc' => 'nullable|string|max:1000',
            'invest' => 'nullable|string|max:250',
            'lot_size' => 'nullable|string|max:250',
            'products' => 'nullable|string|max:2500',
            'dnd' => 'nullable|string|max:250',
        ]);

        if ($lead->status == "Closed Won") $validated['status'] = 'Closed Won';
        if ($lead->status != $validated['status'] && !$lead->is_dialed) $validated['is_dialed'] = true;
        if ($validated['status'] != 'Follow Up') $validated['followup'] = $lead->followup;
        if ($validated['status'] != 'Free Trial') $validated['free_trial'] = $lead->free_trial;

        $updated = $lead->update($validated);
        return $updated ? response()->json(['status' => 'success', 'message' => 'Lead Updated Successfully!', 'lead' => $lead->refresh()])
            : response()->json(['status' => 'error', 'message' => 'Failed to update lead!']);
    }

    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string',
            'value' => 'required',
            'leads' => 'required'
        ]);

        $leads = json_decode($validated['leads']);

        if (!is_array($leads) || empty($leads)) {
            return response()->json(['status' => 'error', 'message' => 'Invalid or empty leads list']);
        }

        $action = $validated['action'];

        $value = $validated['value'];

        $fieldsToUpdate = [
            'owner' => 'user_id',
            'status' => 'status',
            'source' => 'source',
        ];

        if (!array_key_exists($action, $fieldsToUpdate)) {
            return response()->json(['status' => 'error', 'message' => 'Invalid action']);
        }

        $updateData = [$fieldsToUpdate[$action] => $value];
        if ($action === 'owner') {
            $updateData['moved_at'] = now();
        }

        $updated = Lead::whereIn('id', $leads)->update($updateData);


        if ($action === 'owner') {
            $lead = Lead::whereIn('id', $leads)->first();
            $isRequested = LeadRequest::where([['user_id', $value], ['state', $lead->state], ['status', false]])->first();
            if ($isRequested) $isRequested->update(['status' => true]);
        }

        if ($updated)  return response()->json(['status' => 'success', 'message' => "Lead $action updated successfully!"]);


        return response()->json(['status' => 'error', 'message' => "Failed to update lead $action"]);
    }

    public function destroy(Lead $lead)
    {
        if ($lead->status != 'Closed Won') {

            if ($lead->delete()) {
                return response()->json(['status' => 'success', 'message' => 'lead deleted successfully!']);
            } else return response()->json(['status' => 'error', 'message' => 'Failed to delete lead']);
        }

        return response()->json(['status' => 'error', 'message' => 'Closed Won Lead can not able to delete!']);
    }

    public function updateLeadStatus(Request $request)
    {
        $lead = Lead::find($request->id);
        if (!$lead) return response()->json(['status' => 'error', 'message' => 'Lead Not found!']);
        $validated = $request->validate([
            'status' => 'required|string',
        ]);
        if ($validated['status'] == 'Free Trial') {
            $validated2 = $request->validate(['free_trial' => 'required|date', 'products' => 'required']);
            $validated = [...$validated, ...$validated2];
        }
        if ($validated['status'] == 'Follow Up') {
            $validated2 = $request->validate(['followup' => 'required|date']);
            $validated = [...$validated, ...$validated2];
        }
        if ($lead->status != $validated['status'])  $validated['is_dialed'] = true;
        $updated = $lead->update($validated);
        if ($updated) return response()->json(['status' => 'success', 'message' => 'Lead status updated!', 'data' => $lead]);
        return response()->json(['status' => 'error', 'message' => 'Failed to update Lead Status']);
    }

    public function leadStatuses($id)
    {
        $lead = Lead::find($id);
        if (!$lead) return response()->json(['status' => 'error', 'message' => 'Lead Not Found']);
        $leadStatuses = LeadStatus::join('users', 'users.id', 'lead_statuses.user_id')
            ->where([['lead_id', $id]])->select('first_name', 'last_name', 'lead_statuses.*')->latest('lead_statuses.created_at')->get();
        return response()->json(['status' => 'success', 'leadStatuses' => $leadStatuses]);
    }

    public function saleLeadUpdate(Request $request)
    {
        $lead = Lead::find($request->lead_id);

        if (!$lead) return response()->json(['status' => 'error', 'message' => 'Lead Not Found!']);

        $validated = $request->validate([
            'first_name' => 'required|string|max:200',
            'last_name' => 'nullable|string|max:200',
            'email' => 'nullable|email|max:200',
            'second_phone' => 'nullable|digits:10',
            'state' => 'nullable|string'
        ]);

        $updated = $lead->update($validated);

        if ($updated) return response()->json(['status' => 'success', 'message' => 'Lead Updated Successfully!', 'lead' => $lead]);

        return response()->json(['status' => 'error', 'message' => 'Failed to Update Lead']);
    }

    public function massDelete(Request $request)
    {

        $leads = $request->leads ? json_decode($request->leads) : null;

        if ($leads) {

            $deletedIds = Lead::where('status', '!=', 'Closed Won')
                ->whereIn('id', $leads)
                ->pluck('id')->toArray();
            $deleted =  Lead::where('status', '!=', 'Closed Won')
                ->whereIn('id', $leads)
                ->delete();

            if ($deleted) return $this->deleteLeadData($deletedIds);


            return response()->json(['status' => 'success', 'deleted_ids' => $deletedIds, 'message' => 'No leads able to delete']);
        }

        return response()->json(['status' => 'error', 'message' => 'No leads specified']);
    }

    protected function deleteLeadData($lead_ids)
    {
        ApplicationCampaignLead::whereIn('lead_id', $lead_ids)->delete();
        Callback::whereIn('lead_id', $lead_ids)->delete();
        LeadStatus::whereIn('lead_id', $lead_ids)->delete();
        ReferLead::whereIn('lead_id', $lead_ids)->delete();
        TransferLead::whereIn('lead_id', $lead_ids)->delete();

        return response()->json(['status' => 'success', count($lead_ids) . ' Leads deleted Successfully!']);
    }
}
