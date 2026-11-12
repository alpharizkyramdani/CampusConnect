<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkProgram extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'name',
        'description',
        'start_date',
        'end_date',
        'budget',
        'status',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }
}
