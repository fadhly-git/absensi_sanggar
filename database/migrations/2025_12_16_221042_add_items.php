<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained(); // Produk apa

            // Snapshot Data (Disimpan statis saat transaksi terjadi)
            $table->string('size_label'); // Contoh: "XL"
            $table->enum('category', ['kids', 'adults']); // Contoh: "adults"
            $table->enum('sleeve_type', ['short', 'long']); // Lengan

            // Dimensi (Biar kalau user komplain, ada buktinya dia pesan ukuran berapa dulu)
            $table->integer('width_cm');
            $table->integer('length_cm');

            // Hitungan Duit
            $table->integer('price_at_moment'); // Harga satuan saat beli
            $table->integer('quantity'); // Jumlah
            $table->integer('subtotal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropForeign(['product_id']);

            // Drop kolom-kolom yang ditambahkan
            $table->dropColumn([
                'order_id',
                'product_id',
                'size_label',
                'category',
                'sleeve_type',
                'width_cm',
                'length_cm',
                'price_at_moment',
                'quantity',
                'subtotal',
            ]);
        });
    }
};
