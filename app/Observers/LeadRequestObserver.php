<?php

namespace App\Observers;

use App\Models\Company\LeadRequest;
use App\Traits\Company\NotificationTrait;

class LeadRequestObserver
{
    use NotificationTrait;
    /**
     * Handle the LeadRequest "created" event.
     */
    public function created(LeadRequest $leadRequest): void
    {
        $pendingLeadCount = LeadRequest::where('status', false)->count();
        if ($leadRequest->status) {
            // Info Admin and User - Automation Handles thie request

            $notification = [
                'title' => 'Automation Handled Lead Request',
                'body' => $leadRequest->state . ' - ' . $leadRequest->count . ' lead request automation accepted!',
            ];
            $data = [
                "action" => "lead-request",
                "value" => "1",
                "state" => $leadRequest->state,
                "totalRequest" => "$pendingLeadCount"
            ];

            $this->sendNotification($notification, $data, [1]);



            $notification = [
                'title' => 'Lead Request Accepted',
                'body' => $leadRequest->state . ' - ' . $leadRequest->count . ' lead request accepted!',
            ];
            $data = [
                "action" => "lead-request",
                "value" => "1",
                "state" => $leadRequest->state
            ];
            $this->sendNotification($notification, $data, [$leadRequest->user_id]);
        } else {

            //Info to Admin New Request

            $notification = [
                'title' => 'New Lead Request',
                'body' => $leadRequest->state . ' - ' . $leadRequest->count . ' leads requested by ' . auth()->user()->first_name,
            ];
            $data = [
                "action" => "lead-request",
                "value" => "1",
                "state" => $leadRequest->state,
                "totalRequest" => "$pendingLeadCount"
            ];
            $this->sendNotification($notification, $data, [1]);
        }
    }

    /**
     * Handle the LeadRequest "updated" event.
     */
    public function updated(LeadRequest $leadRequest): void
    {
       
        if ($leadRequest->status) {

            $notification = [
                'title' => 'Lead Request Accepted',
                'body' => $leadRequest->state . ' - ' . $leadRequest->count . ' lead request accepted!',
            ];
            $data = [
                "action" => "lead-request",
                "value" => "1",
                "state" => $leadRequest->state
            ];
            $this->sendNotification($notification, $data, [$leadRequest->user_id]);
        }
    }

    /**
     * Handle the LeadRequest "deleted" event.
     */
    public function deleted(LeadRequest $leadRequest): void
    {
        //
    }

    /**
     * Handle the LeadRequest "restored" event.
     */
    public function restored(LeadRequest $leadRequest): void
    {
        //
    }

    /**
     * Handle the LeadRequest "force deleted" event.
     */
    public function forceDeleted(LeadRequest $leadRequest): void
    {
        //
    }
}
