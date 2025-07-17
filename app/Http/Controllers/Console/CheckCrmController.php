<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Models\Company\Lead;
use App\Models\Company\User;
use App\Models\Tenant;
use Illuminate\Http\Request;

class CheckCrmController extends Controller
{
    public function index()
    {

        $options = [
            ['title' => 'Lead', 'action' => 'lead'],
        ];

        return response()->json(['status' => 'success', 'options' => $options]);
    }


    public function check(Request $request)
    {

        $domain = $request->domain;

        $tenant = Tenant::find($domain);


        return match ($request->action) {
            'lead' => $this->checkLead($tenant),
                // 'get', 'head' =>  $this->handleGet(),
            default => throw new \Exception('Unsupported'),
        };
    }



    private function checkLead($tenant)
    {

        $data = $tenant->run(function () {
            $ids = User::whereIn('user_type', ['BDE', 'Admin', 'Team Leader', 'Manager'])->pluck('id')->toArray();
            $noOwnerLeads = Lead::whereNotIn('user_id', $ids)->pluck('phone')->toArray();
            $inactiveIds = User::where('status', false)->whereIn('user_type', ['BDE', 'Admin', 'Team Leader', 'Manager'])->pluck('id')->toArray();
            $inactiveOwnersLeads = Lead::whereIn('user_id', $inactiveIds)->pluck('phone')->toArray();
            return response()->json([
                'status' => 'success',
                'action' => 'lead',
                'noOwnerLeads' => $noOwnerLeads,
                'inactiveOwnersLeads' => $inactiveOwnersLeads
            ]);
        });

        return $data;


        // return $domain;
    }
}
