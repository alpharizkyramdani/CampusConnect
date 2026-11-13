<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LibraryLoan extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'library_item_id',
        'user_id',
        'loan_code',
        'borrow_date',
        'due_date',
        'return_date',
        'status',
        'fine_amount',
        'admin_notes',
    ];

    protected $casts = [
        'borrow_date' => 'date',
        'due_date' => 'date',
        'return_date' => 'date',
        'fine_amount' => 'integer',
    ];

    public function item()
    {
        return $this->belongsTo(LibraryItem::class, 'library_item_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }
}

