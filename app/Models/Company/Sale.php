<?php

namespace App\Models\Company;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;
    protected $guarded = [];


    public function getSaleDateAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('d M Y') : '';
    }

    public function getStartDateAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('d M Y') : '';
    }

    public function getDueDateAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('d M Y') : '';
    }

    // public function getCreatedAtAttribute($value)
    // {
    //     return Carbon::parse($value)->format('Y-m-d H:i:s');
    // }
    public function getCreatedAtAttribute($value)
    {
        return Carbon::parse($value, 'UTC')->setTimezone('Asia/Kolkata')->format('Y-m-d');
    }


    // public function getCreatedAtAttribute($value)
    // {
    //     return Carbon::parse($value)->diffForHumans();
    // }

    // Carbon::parse('2021-03-20T00:19:07.000000Z')->format('Y-m-d H:i:s')
}
