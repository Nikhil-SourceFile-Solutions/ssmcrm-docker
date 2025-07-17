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
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->integer('branch_id')->default(1);
            $table->string('user_id')->default(1);
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->unique();
            $table->string('second_phone')->nullable();
            $table->string('status')->nullable();
            $table->string('invest')->nullable();
            $table->date('free_trial')->nullable();
            $table->date('followup')->nullable();
            $table->string('source')->nullable();
            $table->string('dnd')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('products', 2500)->nullable();
            $table->string('lot_size')->nullable();
            $table->string('desc', 1000)->nullable();
            $table->boolean('is_dialed')->default(0);
            $table->date('moved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
