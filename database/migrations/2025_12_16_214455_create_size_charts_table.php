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
        Schema::create('size_charts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->enum('category', ['kids', 'adults']);
            $table->string('size_label');
            // Data Visualizer (Dalam cm)
            $table->integer('width_cm'); // Lebar
            $table->integer('length_cm'); // Panjang

            // Harga Berbeda Lengan Pendek vs Panjang
            $table->integer('price_short_sleeve');
            $table->integer('price_long_sleeve');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('size_charts');
    }
};
