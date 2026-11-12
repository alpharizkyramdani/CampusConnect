<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facility extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'department_id',
        'category_id',
        'name',
        'code',
        'description',
        'photo_url',
        'condition',
        'total_quantity',
        'available_quantity',
        'location',
    ];

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function category()
    {
        return $this->belongsTo(FacilityCategory::class, 'category_id');
    }

    public function borrowings()
    {
        return $this->hasMany(FacilityBorrowing::class);
    }

    public function movements()
    {
        return $this->hasMany(InventoryMovement::class);
    }
}

