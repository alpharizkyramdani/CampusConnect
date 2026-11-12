<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'title',
        'description',
        'category',
        'start_date',
        'end_date',
        'color',
        'is_all_day',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'is_all_day' => 'boolean',
        ];
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }
}
