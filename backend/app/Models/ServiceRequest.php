<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'service_type_id',
        'user_id',
        'request_number',
        'notes',
        'attachment_url',
        'status',
        'admin_notes',
        'result_document_url',
        'doc_verification_code',
        'verification_hash',
        'is_verified_document',
        'processed_by',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
        ];
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function serviceType()
    {
        return $this->belongsTo(ServiceType::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function processor()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}

