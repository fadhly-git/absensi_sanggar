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
        Schema::table('keuangans', function (Blueprint $table) {
            // Menghapus kolom jika ada
            if (Schema::hasColumn('keuangans', 'saldo_terakhir')) {
                $table->dropColumn('saldo_terakhir');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('keuangans', function (Blueprint $table) {
            // Jika ingin bisa di-rollback, tambahkan kembali kolomnya
            $table->decimal('saldo_terakhir', 15, 2)->nullable()->after('uang_keluar');
        });
    }
};