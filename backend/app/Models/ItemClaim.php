<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemClaim extends Model
{
    use HasFactory;

    protected $fillable = [
        'lost_found_item_id',
        'user_id',
        'proof_description',
        'proof_photo_url',
        'status',
        'reviewed_by',
        'review_notes',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }

    public function item()
    {
        return $this->belongsTo(LostFoundItem::class, 'lost_found_item_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
