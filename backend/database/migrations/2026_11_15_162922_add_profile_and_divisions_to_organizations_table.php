<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->string('website')->nullable()->after('description');
            $table->string('instagram')->nullable()->after('website');
            $table->string('contact_email')->nullable()->after('instagram');
            $table->json('divisions')->nullable()->after('contact_email');
        });
    }

    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn(['website', 'instagram', 'contact_email', 'divisions']);
        });
    }
};
