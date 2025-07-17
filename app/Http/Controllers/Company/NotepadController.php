<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Notepad;
use Illuminate\Http\Request;

class NotepadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filterTag = $request->input('filterTag');
        $filterFavourite = $request->input('filterFavourite');

        $query = Notepad::where('user_id', auth()->user()->id);
        if ($filterTag) {
            $query->where('tag', $filterTag);
        }
        if ($filterFavourite) {
            $query->where('is_favourite', $filterFavourite);
        }
        $notes = $query->latest()->get();
        return response()->json(['status' => 'success', 'notes' => $notes]);
    }




    public function store(Request $request)
    {
        if ($request->id) return $this->update($request);

        $validated = $request->validate([
            'title' => 'required|string',
            'tag' => 'nullable|string',
            'description' => 'required|string|max:2500',
            'is_favourite' => 'nullable|string',
        ]);

        $validated['user_id'] = auth()->user()->id;

        $response = Notepad::create($validated);

        if ($response) return response()->json([
            'message' => 'Notepad Created',
            'status' => 'success',
            'note' => $response,
            'action' => 'add'

        ]);
        return response()->json([
            'message' => 'Failed',
            'status' => 'error',

        ]);
    }


    public function update($request)
    {
        $notepad = Notepad::find($request->id);
        if (!$notepad) return response()->json([
            'message' => 'notepad not found',
            'status' => 'error',
        ]);

        $validated = $request->validate([
            'title' => 'required|string',
            'tag' => 'nullable|string',
            'description' => 'required|string|max:2500',
            'is_favourite' => 'nullable|string',
        ]);

        $response = $notepad->update($validated);

        if ($response) return response()->json([
            'message' => 'notepad Updated',
            'status' => 'success',
            'note' => $notepad,
            'action' => 'update'

        ]);
        return response()->json([
            'message' => 'Failed',
            'status' => 'error',

        ]);
    }


    public function destroy($id)
    {
        $notepad = Notepad::find($id);


        if (!$notepad) return response()->json(['status' => 'error', 'message' => 'Notepad not found']);
        if ($notepad->delete()) return response()->json([
            'message' => 'deleted successfully',
            'status' => 'success',
        ]);
        return response()->json(['status' => 'success', 'message' => 'Failed to delete Notepad!']);
    }
}
