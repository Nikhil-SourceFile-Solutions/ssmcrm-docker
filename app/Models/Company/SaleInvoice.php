<?php

namespace App\Models\Company;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleInvoice extends Model
{
    use HasFactory;
    protected $fillable = [
        'lead_id',
        'sale_id',
        'name',
        'email',
        'mobile',
        'address',
        'city',
        'state',
        'gst_no',
        'is_igst'
    ];

    public function getCreatedAtAttribute($value)
    {
        return Carbon::parse($value, 'UTC')->format('Y-m-d');
    }
}
