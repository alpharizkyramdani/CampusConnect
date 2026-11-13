<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campus_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->string('name');
            $table->enum('category', [
                'faculty',
                'department',
                'library',
                'laboratory',
                'auditorium',
                'classroom',
                'canteen',
                'parking',
                'facility',
                'administration',
                'mosque',
                'sports'
            ])->default('faculty');
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('photo_url')->nullable();
            $table->unsignedTinyInteger('floor_count')->default(1);
            $table->json('facilities_available')->nullable(); // ["WiFi", "AC", "Lift", "Disability Access", "Musholla"]
            $table->string('opening_hours', 100)->nullable(); // e.g. "07:30 - 17:00"
            $table->string('contact_phone', 30)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['university_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campus_locations');
    }
};

