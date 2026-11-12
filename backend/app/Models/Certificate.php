<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'event_id',
        'user_id',
        'certificate_number',
        'title',
        'recipient_name',
        'issue_date',
        'file_url',
        'verify_hash',
        'issued_by',
    ];

    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
        ];
    }

    public function university()
    {
        return $this->belongsTo(University::class)->withTrashed();
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function issuer()
    {
        return $this->belongsTo(User::class, 'issued_by');
    }
}

