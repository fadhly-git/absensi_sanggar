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
        Schema::table('users', function (Blueprint $table) {
            // Drop unique index dulu
            $table->dropUnique('users_qr_token_unique');
        });

        Schema::table('users', function (Blueprint $table) {
            // Ubah qr_token dari VARCHAR(255) ke VARCHAR(500) untuk menampung encrypted token
            // Encrypted token Laravel bisa sampai 400-500 karakter
            $table->string('qr_token', 500)->nullable()->change();
        });

        Schema::table('users', function (Blueprint $table) {
            // Tambahkan unique index lagi
            $table->unique('qr_token', 'users_qr_token_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_qr_token_unique');
        });

        Schema::table('users', function (Blueprint $table) {
            // Kembalikan ke VARCHAR(255)
            $table->string('qr_token', 255)->nullable()->change();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unique('qr_token', 'users_qr_token_unique');
        });
    }
};
