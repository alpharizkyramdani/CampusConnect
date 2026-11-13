<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LibraryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'title',
        'author',
        'isbn_issn',
        'publisher',
        'publication_year',
        'category',
        'description',
        'cover_image',
        'file_url',
        'total_copies',
        'available_copies',
        'shelf_location',
        'is_digital_access',
        'borrow_count',
    ];

    protected $casts = [
        'publication_year' => 'integer',
        'total_copies' => 'integer',
        'available_copies' => 'integer',
        'is_digital_access' => 'boolean',
        'borrow_count' => 'integer',
    ];

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function loans()
    {
        return $this->hasMany(LibraryLoan::class, 'library_item_id');
    }
}

