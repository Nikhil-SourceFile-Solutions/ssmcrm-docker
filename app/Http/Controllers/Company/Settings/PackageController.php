<?php

namespace App\Http\Controllers\Company\Settings;

use App\Http\Controllers\Controller;
use App\Models\Company\Settings\Package;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function index()
    {
        $package=Package::latest()->get();

        return response()->json([
            'status'=>'success',
            'package'=>$package
        ]);
    }

    public function store(Request $request)
    {
        if($request->id) return $this->update($request);
        $validated= $request->validate([
            'package_name'=>'required|string',
            'incentive_percentage'=>'required|integer',
            'fixed_salary'=>'required|integer',
            'incentive_amount'=>'required|integer',
            'status'=>'required|boolean',
        ]);

        $response=Package::create($validated);

        if($response)
        return response()->json([
            'status'=>'success',
            'message'=>'Package Created Successfully',
            'package'=>$response
        ]);
        else
        return response()->json([
            'status'=>'error',
            'message'=>'failed to Add package'
        ]);
    }

    public function update($request)
    {
        $package=Package::find($request->id);
        if(!$package) return response()->json([
            'status'=>'Failed',
            'message'=>'package not found'
        ]);

        $validated=$request->validate([
            'package_name'=>'required|string',
            'incentive_percentage'=>'required|integer',
            'fixed_salary'=>'required|integer',
            'incentive_amount'=>'required|integer',
            'status'=>'required|boolean',
        ]);

        $response= $package->update($validated);

        if($response)
        return response()->json([
            'status'=>'success',
            'message'=>'Package Updated Successfully',
            'package'=>$validated

        ]);

        else return response()->json([
            'status'=>'Failed',
            'message'=>'failed To Update Package'
        ]);
    }

    public function destroy(Package $package)
    {
        if($package->delete())
        return response()->json([
            'status'=>'success',
            'message'=>'Deleted Successfulyy'
        ]);
    }
}
