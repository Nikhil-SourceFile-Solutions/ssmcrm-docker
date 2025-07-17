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
        Schema::create('upload_leads', function (Blueprint $table) {
            $table->id();
            $table->string('unique_id')->nullable();
            $table->integer('user_id')->default(1);
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('status')->nullable();
            $table->string('source')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->boolean('is_duplicte')->default(0);
            $table->boolean('is_invalid')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('upload_leads');
    }
};
