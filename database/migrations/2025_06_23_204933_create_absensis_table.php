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
        Schema::create('absensis', function (Blueprint $table) {
            $table->id();

            // Foreign key ke tabel siswas
            $table->foreignId('id_siswa')
                  ->constrained('siswas') // Nama tabel yang direferensikan
                  ->onUpdate('cascade')
                  ->onDelete('cascade'); // Jika siswa dihapus, absensinya juga terhapus

            $table->date('tanggal');
            $table->text('notes')->nullable();
            $table->boolean('bonus')->default(false); // Sesuai dengan `tinyint(1)`
            $table->timestamps();

            // Index komposit untuk pencarian cepat berdasarkan siswa dan tanggal
            $table->index(['id_siswa', 'tanggal']);
            $table->index('tanggal'); // Menghapus index duplikat dan menyisakan satu yang relevan
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('absensis');
    }
};