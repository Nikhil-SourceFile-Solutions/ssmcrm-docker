<?php

namespace App\Models\Company\Settings;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salary extends Model
{
    use HasFactory;

    protected $fillable=[
        'select_package',
        'select_employee',
        'fixed_salary',
        'incentive_amount',
        'incentive_percentage',
        'status'
    ];
}
