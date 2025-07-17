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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('admin_email')->nullable();
            $table->string('account_email')->nullable();
            $table->string('compliance_email')->nullable();
            $table->string('crm_name')->nullable();
            $table->string('crm_title')->nullable();
            $table->text('crm_link')->nullable();
            $table->text('crm_ip')->nullable();
            $table->text('crm_phones')->nullable();
            $table->text('broadcast_permission')->nullable();
            $table->text('crm_news')->nullable();
            $table->text('crm_website_details')->nullable();
            $table->text('logo')->nullable();
            $table->text('favicon')->nullable();
            $table->boolean('auto_expiry_enabled')->default(0);
            $table->boolean('lead_automation_enabled')->default(0);
            $table->boolean('invoice_enabled')->default(0);
            $table->boolean('payment_permission')->default(0);
            $table->boolean('transfer_permission')->default(0);
            $table->boolean('refer_permission')->default(0);
            $table->string('max_employee_count')->default(10);
            $table->string('security_numbers')->nullable();
            $table->boolean('sales_verification_enabled')->default(0);
            $table->boolean('has_manager_verification')->default(0);
            $table->boolean('has_complaince_verification')->default(0);
            $table->boolean('has_accounts_verification')->default(0);

            $table->string('who_can_verify_sales', 500)->default(json_encode([]));
            $table->string('who_can_verify_complaince_verification', 500)->default(json_encode([]));
            $table->string('who_can_approve_expire_pause_sales', 500)->default(json_encode([]));
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
