<?php

namespace App\Http\Controllers\Company\Settings;

use App\Http\Controllers\Controller;
use App\Models\Company\Settings\Dropdown;
use App\Models\Company\Settings\LeadAutomation;
use Illuminate\Http\Request;

class LeadAutomationController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $pageSize = $request->get('pageSize', 10);
        $currentPage = $request->get('page', 1);
        $offset = ($currentPage - 1) * $pageSize;
        $search = $request->get('search', 0);
        $filterStatus = $request->get('filterStatus', 0);

        $query = LeadAutomation::query();


        if ($search) {
            $query->where('state', 'LIKE', '%' . $search . '%');
        }

        if ($filterStatus) {
            if ($filterStatus == "Active") $query->where('auto_status', true);
            else if ($filterStatus == 'Inactive') $query->where('auto_status', false);
            else if ($filterStatus == 'All') $query;
        }
        $totalItems = $query->count();
        $query->orderBy('created_at', 'desc');


        $itemsForCurrentPage = $query->offset($offset)->limit($pageSize)->latest()->get();


        $submittedByIds = $itemsForCurrentPage->pluck('submited_by')->unique();
        // $users = User::whereIn('id', $submittedByIds)->get()->keyBy('id');
        // $leads = Lead::whereIn('id', $submittedByIds)->get()->keyBy('id');


        // foreach ($itemsForCurrentPage as $data) {
        //     if ($data->is_online) $data->submited = $leads->get($data->submited_by);
        //     else  $data->submited = $users->get($data->submited_by);
        // }

        $from = $offset + 1;
        $to = min($offset + $pageSize, $totalItems);

        $data = [
            'data' => $itemsForCurrentPage,
            'currentPage' => $currentPage,
            'pageSize' => $pageSize,
            'totalItems' => $totalItems,
            'from' => $from,
            'to' => $to
        ];
        $response = [
            'status' => 'success',
            'data' => $data,
            "dropdowns" => Dropdown::where('type', 'State')->get()
        ];

        return response()->json($response);
    }
    public function index1(Request $request)
    {
        if ($request->filterStatus) {
            $leadautomation = LeadAutomation::join('dropdowns', 'dropdowns.id', 'lead_automations.state')
                ->where('lead_automations.auto_status', $request->filterStatus)
                ->where('dropdowns.value', 'like', '%' . $request->search . '%')
                ->select('value', 'lead_automations.*')
                ->latest()
                ->paginate($request->pageSize);
        } else {
            $leadautomation = LeadAutomation::
            join('dropdowns', 'dropdowns.id', 'lead_automations.value')
                ->where('dropdowns.value', 'like', '%' . $request->search . '%')
                ->select('value', 'lead_automations.*')
                ->
                latest()
                ->paginate($request->pageSize);
        }

        // $leadautomation = LeadAutomation::get();
        $dropdowns = Dropdown::where('type', 'State')->get();


        return response()->json(['status' => 'success', 'data' => $leadautomation, 'dropdowns' => $dropdowns]);
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
        if ($request->id) return $this->update($request);

        $validated = $request->validate([
            'state' => 'required|string|unique:lead_automations',
            'auto_leadcount' => 'required_if:auto_status,1|nullable|integer|min:1',
            'auto_bdecount' => 'required_if:auto_status,1|nullable|integer|min:1',
            'auto_updatecount' => 'required_if:auto_status,1|nullable|integer|min:1',
            'auto_status' => 'required|boolean'
        ]);



        $response = LeadAutomation::create($validated);

        if ($response) return response()->json([
            'message' => 'Lead automation added',
            'status' => 'success',

        ]);
        return response()->json([
            'message' => 'Failed',
            'status' => 'error',

        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(LeadAutomation $leadautomation)
    {
        return response()->json(['leadautomation' => $leadautomation]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(LeadAutomation $leadautomation)
    {
        return response()->json(['leadautomation' => $leadautomation]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update($request)
    {
        $leadautomation = LeadAutomation::find($request->id);
        if (!$leadautomation) return response()->json([
            'message' => 'Lead Automation not found',
            'status' => 'error',
        ]);

        $validated = $request->validate([
            'state' => 'required|string|unique:lead_automations,state,' . $leadautomation->id,
            'auto_leadcount' => 'required_if:auto_status,1|nullable|integer|min:1',
            'auto_bdecount' => 'required_if:auto_status,1|nullable|integer|min:1',
            'auto_updatecount' => 'required_if:auto_status,1|nullable|integer|min:1',
            'auto_status' => 'nullable|string'
        ]);

        $response = $leadautomation->update($validated);

        if ($response) return response()->json([
            'message' => 'Product Price Updated',
            'status' => 'success',

        ]);
        return response()->json([
            'message' => 'Failed',
            'status' => 'error',

        ]);
    }


    public function statusUpdate(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer'
        ]);

        $leadautomation = LeadAutomation::find($validated['id']);
        if (!$leadautomation) return response()->json(['auto_status' => 'error', 'leadautomation not found!']);
        $leadautomation->auto_status = !$leadautomation->auto_status;
        if ($leadautomation->save()) return response()->json(['status' => 'success', 'message' => 'leadautomation status Updated successfully', 'value' => $leadautomation->auto_status]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LeadAutomation $leadautomation)
    {
        $leadautomation->delete();
        return response()->json([
            'message' => 'Deleted successfully',
            'status' => 'success',
        ]);
    }
}
