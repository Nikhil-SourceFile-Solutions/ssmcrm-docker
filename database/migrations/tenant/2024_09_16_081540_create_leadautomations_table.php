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
        Schema::create('leadautomations', function (Blueprint $table) {
            $table->id();
            $table->string('state')->nullable();
            $table->string('auto_leadcount')->nullable();
            $table->string('auto_bdecount')->nullable();
            $table->string('auto_updatecount')->nullable();
            $table->string('auto_status')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leadautomations');
    }
};
