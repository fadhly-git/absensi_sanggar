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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_code')->unique();
            $table->foreignId('student_id')
              ->nullable()
              ->constrained('siswas')
              ->onDelete('set null');
            // Jika Tamu: isi manual
            $table->string('guest_name')->nullable();
            $table->string('guest_phone')->nullable();

            // --- DATA TRANSAKSI ---
            $table->integer('total_amount'); // Total Rupiah
            $table->enum('status', ['pending', 'paid', 'processing', 'completed', 'cancelled'])
                ->default('pending');

            // Bukti Bayar (Disimpan path gambarnya)
            $table->string('payment_proof')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
