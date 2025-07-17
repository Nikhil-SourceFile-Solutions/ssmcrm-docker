<?php

namespace App\Models\Company;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IpTrack extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function getCreatedAtAttribute($value)
    {


        return Carbon::parse($value)->timezone('Asia/Kolkata')->format('d M Y, H:i:s A');
    }
}
