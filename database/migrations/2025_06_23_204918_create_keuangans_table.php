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
        Schema::create('keuangans', function (Blueprint $table) {
            $table->id();

            // PERBAIKAN KRITIS: Mengubah tipe data dari VARCHAR ke DECIMAL
            $table->decimal('saldo_terakhir', 15, 2);
            $table->decimal('uang_masuk', 15, 2);
            $table->decimal('uang_keluar', 15, 2);

            $table->string('keterangan_masuk');
            $table->string('keterangan_keluar');
            $table->date('tanggal');
            $table->softDeletes(); // Membuat kolom `deleted_at` untuk soft delete
            $table->timestamps();

            // Penambahan index untuk optimasi
            $table->index('tanggal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('keuangans');
    }
};