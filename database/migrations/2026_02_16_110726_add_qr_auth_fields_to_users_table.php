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
            $table->string('qr_token')->unique()->nullable()->after('remember_token');
            $table->string('pin')->nullable()->after('qr_token');
            $table->integer('pin_attempts')->default(0)->after('pin');
            $table->timestamp('pin_locked_until')->nullable()->after('pin_attempts');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['qr_token', 'pin', 'pin_attempts', 'pin_locked_until']);
        });
    }
};
