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
        Schema::create('invoice_settings', function (Blueprint $table) {
            $table->id();

            $table->string('invoice_prefix')->nullable();
            $table->integer('invoice_start_from')->nullable();
            $table->string('invoice_type')->nullable();

            $table->string('invoice_template')->default('single-product-invoice');
            $table->text('template_data')->nullable();

            $table->string('company_name')->nullable();
            $table->text('address')->nullable();
            $table->text('email')->nullable();
            $table->text('phone')->nullable();
            $table->string('gst_no')->nullable();
            $table->string('sebi_no')->nullable();




            $table->boolean('is_send_invoice')->default(false);
            $table->boolean('send_invoice_via_sms')->default(false);
            $table->boolean('send_invoice_via_whatsapp')->default(false);
            $table->boolean('send_invoice_via_email')->default(false);

            $table->boolean('enabled_send_auto_invoice')->default(false);
            $table->boolean('enabled_send_sms_invoice')->default(false);
            $table->boolean('enabled_send_whatsapp_invoice')->default(false);
            $table->boolean('enabled_send_email_invoice')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_settings');
    }
};
