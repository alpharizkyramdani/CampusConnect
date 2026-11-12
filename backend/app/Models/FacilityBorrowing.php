<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FacilityBorrowing extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'department_id',
        'facility_id',
        'user_id',
        'quantity',
        'purpose',
        'borrow_date',
        'return_due_date',
        'actual_return_date',
        'status',
        'admin_notes',
        'approved_by',
        'handed_over_by',
        'received_by',
        'return_condition',
    ];

    protected function casts(): array
    {
        return [
            'borrow_date' => 'datetime',
            'return_due_date' => 'datetime',
            'actual_return_date' => 'datetime',
        ];
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function handedOverBy()
    {
        return $this->belongsTo(User::class, 'handed_over_by');
    }

    public function receivedBy()
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}

