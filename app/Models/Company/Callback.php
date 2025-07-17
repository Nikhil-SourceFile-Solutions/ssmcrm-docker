<?php

namespace App\Models\Company;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Callback extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function getCreatedAtAttribute($value)
    {
        return $value ? Carbon::parse($value)->timezone('Asia/Kolkata')->format('Y-m-d H:i:s a') : null;
    }

    protected function casts(): array
    {
        return [
            'date_time' => 'datetime',
        ];
    }
}
