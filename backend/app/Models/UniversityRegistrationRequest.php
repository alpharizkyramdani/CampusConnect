<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UniversityRegistrationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_name',
        'email',
        'website',
        'address',
        'contact_person',
        'contact_phone',
        'document_url',
        'status',
        'notes',
    ];
}

