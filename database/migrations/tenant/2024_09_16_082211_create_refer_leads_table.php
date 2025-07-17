<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('refer_leads', function (Blueprint $table) {
            $table->id();
            $table->integer('to_id');
            $table->integer('from_id');
            $table->integer('lead_id');
            $table->boolean('is_view')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refer_leads');
    }
};
