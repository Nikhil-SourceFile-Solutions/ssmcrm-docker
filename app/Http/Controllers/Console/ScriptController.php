<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Models\Console\Script;
use Illuminate\Http\Request;

class ScriptController extends Controller
{

    public function index()
    {
        return response()->json(['status' => 'success', 'scripts' => Script::latest()->get()]);
    }


    public function create()
    {
        //
    }


    public function store(Request $request)
    {

        if ($request->id) return $this->update($request);
        $validated = $request->validate([
            'name' => 'required|string|max:250',
            'script' => 'required|max:5000',
            'status' => 'required|boolean'
        ]);

        $created = Script::create($validated);

        if ($created) return response()->json(['status' => 'success', 'message' => 'New Script Added']);

        return response()->json(['status' => 'error', 'message' => 'Failed to add new script']);
    }


    public function show(Script $script)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Script $script)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update($request)
    {

        $script = Script::find($request->id);

        if (!$script) return response()->json(['status' => 'error', 'message' => 'script not found']);

        $validated = $request->validate([
            'name' => 'required|string|max:250',
            'script' => 'required|max:5000',
            'status' => 'required|boolean'
        ]);

        $updated = $script->update($validated);

        if ($updated) return response()->json(['status' => 'success', 'message' => 'Script Updated']);

        return response()->json(['status' => 'error', 'message' => 'Failed to update script']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $script = Script::find($id);

        if (!$script) return response()->json(['status' => 'error', 'message' => 'script not found']);


        if ($script->delete()) return response()->json(['status' => 'success', 'message' => 'Script deleted']);

        return response()->json(['status' => 'error', 'message' => 'Failed to delete script']);
    }
}
