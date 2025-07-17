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
        Schema::create('send_bank_details', function (Blueprint $table) {
            $table->id();
            $table->integer('lead_id')->unique();
            $table->integer('count')->default(0);
            $table->boolean('is_bank')->default(1)->nullable();
            $table->boolean('is_upi')->default(1)->nullable();
            $table->string('bank')->nullable();
            $table->string('bank_template_id')->nullable();
            $table->string('upi_template_id')->nullable();
            $table->text('bank_final_template')->nullable();
            $table->text('upi_final_template')->nullable();
            $table->string('bankfields')->nullable();
            $table->string('upifields')->nullable();

            $table->boolean('is_viewed')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('send_bank_details');
    }
};
