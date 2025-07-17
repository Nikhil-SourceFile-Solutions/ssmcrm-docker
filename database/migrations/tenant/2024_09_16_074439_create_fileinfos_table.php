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
        Schema::create('fileinfos', function (Blueprint $table) {
            $table->id();
            $table->string('unique_id');
            $table->integer('total');
            $table->boolean('is_to_employee');
            $table->integer('user_id')->default(1);
            $table->integer('inserted')->nullable();
            $table->integer('duplicate')->nullable();
            $table->integer('invalid')->nullable();
            $table->boolean('is_moved')->default(false);
            $table->boolean('is_moving')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fileinfos');
    }
};
