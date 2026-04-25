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
        Schema::table('events', function (Blueprint $box) {
            $box->string('recurrence_type')->default('none')->after('color'); // none, daily, weekly, monthly
            $box->integer('recurrence_interval')->default(1)->after('recurrence_type');
            $box->json('recurrence_days')->nullable()->after('recurrence_interval'); // ['Mon', 'Wed']
            $box->date('recurrence_until')->nullable()->after('recurrence_days');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $box) {
            $box->dropColumn(['recurrence_type', 'recurrence_interval', 'recurrence_days', 'recurrence_until']);
        });
    }
};
