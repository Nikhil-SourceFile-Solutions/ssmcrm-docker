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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('image')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('company_name')->nullable();
            $table->string('account_no')->nullable();
            $table->string('account_type')->nullable();
            $table->string('ifsc_code')->nullable();
            $table->boolean('status')->default(0);
            $table->string('payment_mode')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
