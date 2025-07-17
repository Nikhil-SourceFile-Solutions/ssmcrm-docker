<?php

namespace App\Traits\Company;

use App\Models\Company\Broadcast;
use App\Models\Company\Callback;
use App\Models\Company\User;

trait HomeTrait
{
    public function getSpecificData($specific = [])
    {
        $user = auth()->user();

        return match ($user->user_type) {
            'Admin' => $this->admin($user, $specific),
            'Accounts' => $this->accounts($user, $specific),
            'Analyst' => $this->analyst($user, $specific),
            'BDE' => $this->bde($user, $specific),
            'Team Leader' => $this->teamLeader($user, $specific),
            'Manager' => $this->manager($user, $specific),
            'HR' => $this->hr($user, $specific),
            'Complaince' => $this->complaince($user, $specific),
            'Networking' => $this->networking($user, $specific),
            default => [],
        };
    }


    protected function admin($user, $specific)
    {

        if (empty($specific))  return [
            'allCallbacks' => $this->callBacks($user),
            'broadCast' => $this->broadcast()
        ];

        $response = [];


        if (in_array("allCallbacks", $specific))  $response['allCallbacks'] = $this->callBacks($user);


        if (in_array("broadCast", $specific)) $response['broadCast'] = $this->broadcast();


        return $response;
    }

    protected function manager($user)
    {
        $allCallbacks = $this->callBacks($user);
    }

    protected function teamLeader($user)
    {
        $allCallbacks = $this->callBacks($user);
    }

    protected function bde($user)
    {
        $allCallbacks = $this->callBacks($user);
    }

    protected function accounts($user)
    {
        $allCallbacks = $this->callBacks($user);
    }

    protected function analyst($user)
    {
        $allCallbacks = $this->callBacks($user);
    }

    protected function hr($user)
    {
        $allCallbacks = $this->callBacks($user);
    }

    protected function complaince($user)
    {
        $allCallbacks = $this->callBacks($user);
    }

    protected function networking($user)
    {
        $allCallbacks = $this->callBacks($user);
    }


    protected function  broadcast()
    {
        $data['broadCast'] = Broadcast::latest()->pluck('message')->first();
    }


    protected function callBacks($user)
    {

        return Callback::join('leads', 'leads.id', 'callbacks.lead_id')
            ->whereDate('date_time', now()->today())
            ->where('date_time', '>=', now())
            ->where([['callbacks.user_id', $user->id], ['callbacks.status', false]])
            ->select('callbacks.id', 'leads.id as lead_id', 'callbacks.description', 'leads.first_name', 'callbacks.created_at', 'leads.last_name', 'leads.phone', 'date_time', 'leads.status')
            ->get();


        // return 
    }
}
