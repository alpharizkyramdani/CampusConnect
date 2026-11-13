<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CareerApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'opportunity_id',
        'user_id',
        'cv_url',
        'cover_letter',
        'portfolio_link',
        'status',
        'feedback',
        'submitted_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    public function opportunity()
    {
        return $this->belongsTo(CareerOpportunity::class, 'opportunity_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

