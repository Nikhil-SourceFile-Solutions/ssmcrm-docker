<?php

namespace App\Http\Controllers\Company\Settings;

use App\Http\Controllers\Controller;
use App\Models\Company\Settings\Dropdown;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class DropdownController extends Controller
{

    public function index(Request $request)
    {
        if ($request->filterType) {

            $dropdowns = Dropdown::where('type', $request->filterType)
                ->where('value', 'like', '%' . $request->search . '%')
                ->latest()
                ->paginate($request->pageSize);
        } else {
            $dropdowns = Dropdown::where('value', 'like', '%' . $request->search . '%')->latest()
                ->paginate($request->pageSize);
        }

        return response()->json(['status' => 'success', 'data' => $dropdowns]);
    }



    public function settingsDropdown(Request $request)
    {
        $dropdown = Dropdown::get();
        return response()->json(['status' => 'success', 'dropdowns' => $dropdown]);
    }



    public function store(Request $request)
    {
        if ($request->id) return $this->update($request);

        $validated = $request->validate([
            'type' => 'nullable|string',
            'value' => 'nullable|string',
            'status' => 'nullable|string'
        ]);

        $already = Dropdown::where([
            ['type', $validated['type']],
            ['value', $validated['value']]
        ])->first();
        if ($already) throw ValidationException::withMessages([
            'value' => ['Value already exist'],
        ]);

        if ($validated['type'] === 'Sale Status' && strcasecmp($validated['value'], 'Verified') === 0) {
            throw ValidationException::withMessages([
                'value' => ['You can not use this value: ' . $validated['value']],
            ]);
        }
        $response = Dropdown::create($validated);

        if ($response) {

            $this->handleCache();
            return response()->json([
                'message' => 'Dropdown Created',
                'status' => 'success',

            ]);
        }
        return response()->json([
            'message' => 'Failed',
            'status' => 'error',
        ]);
    }


    public function show(Dropdown $dropdown)
    {
        return response()->json(['dropdowns' => $dropdown]);
    }


    public function edit(Dropdown $dropdown)
    {
        return response()->json(['dropdowns' => $dropdown]);
    }


    public function update($request)
    {
        $dropdown = Dropdown::find($request->id);
        if (!$dropdown) return response()->json([
            'message' => 'Dropdown not found',
            'status' => 'error',
        ]);

        $validated = $request->validate([
            'type' => 'nullable|string',
            'value' => 'nullable|string',
            'status' => 'nullable|string'
        ]);

        $response = $dropdown->update($validated);

        if ($response) {
            $this->handleCache();
            return response()->json([
                'message' => 'Dropdown Updated',
                'status' => 'success',

            ]);
        }
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

        $dropdown = Dropdown::find($validated['id']);

        if (!$dropdown) return response()->json(['status' => 'error', 'dropdown not found!']);


        $dropdown->status = !$dropdown->status;

        if ($dropdown->save()) {
            $this->handleCache();
            return response()->json(['status' => 'success', 'message' => 'Dropdown Status Updated successfully', 'value' => $dropdown->status]);
        }
    }



    public function destroy(Dropdown $dropdown)
    {

        $isUsed = DB::table('sms_templates')
            ->where('sender_id', $dropdown->value)
            ->union(
                DB::table('products')->where('dropdown_id', $dropdown->id)
            )
            ->exists();

        if ($isUsed) {
            return response()->json([
                'message' => 'Dropdown cannot be deleted as it is being used in other tables.',
                'status' => 'error',
            ], 400);
        }

        if ($dropdown->delete()) {

            $this->handleCache();

            return response()->json([
                'message' => 'Deleted successfully',
                'status' => 'success',
            ]);
        }

        return response()->json([
            'message' => 'Failed to delete dropdown',
            'status' => 'error',
        ]);
    }



    private function handleCache()
    {
        Cache::forget("active-lead-status");
        Cache::forget("active-lead-sources");
        Cache::forget("active-states");
        Cache::forget("active-products");
        Cache::forget("lead-view-dropdodwn");
    }
}
