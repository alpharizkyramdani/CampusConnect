<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicCourse extends Model
{
    use HasFactory;

    protected $fillable = [
        'semester_id',
        'user_id',
        'course_code',
        'course_name',
        'sks',
        'grade',
        'grade_point',
        'attendance_percentage',
        'lecturer_name',
    ];

    protected $casts = [
        'sks' => 'integer',
        'grade_point' => 'float',
        'attendance_percentage' => 'float',
    ];

    public function semester()
    {
        return $this->belongsTo(AcademicSemester::class, 'semester_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

