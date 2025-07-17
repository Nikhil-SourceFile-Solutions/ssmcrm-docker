<?php

namespace App\Http\Controllers\Company\Settings;

use App\Http\Controllers\Controller;
use App\Models\Company\Settings\Salary;
use Illuminate\Http\Request;

class SalaryController extends Controller
{
    public function index()
    {
       $salary=Salary::latest()->get();
       if($salary)
       return response()->json(['status'=>'success', 'salary'=>$salary]);
    else return response()->json(['status'=>'error', 'message'=>'No Salary Details Found']);
    }

    public function store(Request $request)
    {
        if($request->id) return $this->update($request);
        $validated=$request->validate([
            'select_package'=>'required|string',
            'fixed_salary'=>'required|string',
            'incentive_amount'=>'required|string',
            'incentive_percentage'=>'required|string',
            'status'=>'required|boolean'
        ]);

        $response=Salary::create($validated);

        if($response) return response()->json([
            'status'=>'success',
            'message'=>'Created Successfully',
            'salary'=>$validated
        ]);

        else return response()->json([
            'status'=>'Failed',
            'Message'=>'Failed To create Salary'
        ]);
    }

    public function update( $request)
    {
      $salary=Salary::find($request->id);
      if(!$salary) return response()->json(['status'=>'error', 'message'=>'Salary Details Not Found']);

      $validated=$request->validate([
        'select_package'=>'required|string',
        'select_employee'=>'required|string',
        'fixed_salary'=>'required|integer',
        'incentive_amount'=>'required|integer',
        'incentive_percentage'=>'required|integer',
        'status'=>'required|boolean'
      ]);

      $response=$salary->update($validated);
      if($response) return response()->json(['status'=>'success', 'message'=>'updated Successfully', 'salary'=>$validated]);


    }

    public function destroy(Salary $salary)
    {
        if($salary->delete())
        return response()->json(['status'=>'success','message'=>'Deleted successfully']);
    }

}
