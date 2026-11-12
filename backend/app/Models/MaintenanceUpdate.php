<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceUpdate extends Model
{
    use HasFactory;

    protected $fillable = [
        'maintenance_report_id',
        'user_id',
        'status',
        'notes',
    ];

    public function report()
    {
        return $this->belongsTo(MaintenanceReport::class, 'maintenance_report_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
