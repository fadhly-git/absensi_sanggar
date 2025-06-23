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
        Schema::create('siswas', function (Blueprint $table) {
            $table->id(); // Sesuai dengan `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT
            $table->string('nama');
            $table->text('alamat');
            $table->boolean('status'); // Sesuai dengan `tinyint(1)`
            $table->softDeletes(); // Membuat kolom `deleted_at` untuk soft delete (best practice)
            $table->timestamps(); // Membuat kolom `created_at` dan `updated_at`

            // Penambahan index berdasarkan analisis sebelumnya untuk optimasi
            $table->index('nama');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('siswas');
    }
};