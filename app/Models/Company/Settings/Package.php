<?php

namespace App\Models\Company\Settings;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    use HasFactory;
    protected $fillable=[
        'package_name',
        'incentive_percentage',
        'fixed_salary',
        'incentive_amount',
        'status'


    ];
}
