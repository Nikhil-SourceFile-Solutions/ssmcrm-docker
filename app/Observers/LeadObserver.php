<?php

namespace App\Observers;

use App\Models\Company\Lead;
use App\Models\Company\LeadStatus;

class LeadObserver
{

    public function created(Lead $lead): void
    {
        //
    }

    /**
     * Handle the Lead "updated" event.
     */
    public function updated(Lead $lead): void
    {
        if ($lead->wasChanged()) {
            $changedValues = $lead->getChanges();
            unset($changedValues['updated_at']);
            if (array_key_exists('is_dialed', $changedValues)) {
                unset($changedValues['is_dialed']);
            }
            $changes = [];
            foreach ($changedValues as $key => $newValue) {
                $originalValue = $lead->getOriginal($key);
                $a = ['field' => $key, 'original' => $originalValue, 'new' => $newValue];
                array_push($changes, $a);
            }
            LeadStatus::create([
                'lead_id' => $lead->id,
                'user_id' => auth()->user()->id,
                'status' => $lead->status,
                'is_status_changed' => $lead->wasChanged('status'),
                'changes' => json_encode($changes),
            ]);
        }
    }

    /**
     * Handle the Lead "deleted" event.
     */
    public function deleted(Lead $lead): void
    {
        //
    }

    /**
     * Handle the Lead "restored" event.
     */
    public function restored(Lead $lead): void
    {
        //
    }

    /**
     * Handle the Lead "force deleted" event.
     */
    public function forceDeleted(Lead $lead): void
    {
        //
    }
}
