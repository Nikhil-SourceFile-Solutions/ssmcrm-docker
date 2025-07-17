<?php

namespace App\Models\Company;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Lead extends Model
{
    use HasApiTokens, HasFactory;

    protected $guarded = [];


    public function getCreatedAtAttribute($value)
    {
        return Carbon::parse($value, 'UTC')->setTimezone('Asia/Kolkata')->format('Y-m-d');
    }
}
