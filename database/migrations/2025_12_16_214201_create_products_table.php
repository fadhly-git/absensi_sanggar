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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Contoh: "Kaos Olahraga 2025"
            $table->text('description')->nullable();
            $table->string('image_url')->nullable(); // Foto mockup utama
            $table->boolean('is_active')->default(true); // Untuk buka/tutup PO
            $table->dateTime('po_deadline')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
