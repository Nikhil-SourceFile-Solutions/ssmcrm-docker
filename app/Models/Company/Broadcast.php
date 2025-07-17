<?php

namespace App\Models\Company;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Broadcast extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function getCreatedAtAttribute($value)
    {
        return Carbon::parse($value, 'UTC')->setTimezone('Asia/Kolkata')->format('h:i:s a');
    }
}
