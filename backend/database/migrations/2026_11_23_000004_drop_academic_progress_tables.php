<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('academic_courses');
        Schema::dropIfExists('academic_semesters');
    }

    public function down(): void
    {
        // Dropped permanently to streamline scope
    }
};
