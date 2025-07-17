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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->integer('lead_id');
            $table->integer('user_id');
            $table->string('status');
            $table->string('bank')->nullable();
            $table->string('client_type')->nullable();
            $table->string('sale_service')->nullable();
            $table->string('sale_upload_reciept')->nullable();
            $table->date('sale_date')->nullable();
            $table->date('start_date')->nullable();
            $table->date('due_date')->nullable();
            $table->integer('product_id')->nullable();
            $table->string('product')->nullable();
            $table->string('product_duration')->nullable();
            $table->decimal('product_price', 12, 2)->nullable();
            $table->boolean('is_custom_price')->default(false);
            $table->decimal('sale_price', 12, 2)->nullable();
            $table->decimal('client_paid', 12, 2)->nullable();
            $table->decimal('offer_price', 12, 2)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_manager_verified')->default(false);
            $table->boolean('is_account_verified')->default(false);
            $table->boolean('is_complaince_verified')->default(false);
            $table->boolean('is_approved')->default(false);
            $table->boolean('is_service_activated')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
