<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminPengurusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::where('id', 4)->update(['role' => 'admin']);
        \App\Models\User::where('id', 5)->update(['role' => 'pengurus']);
        \App\Models\User::where('id', 6)->update(['role' => 'pengurus']);
        \App\Models\User::where('id', 7)->update(['role' => 'admin']);
    }
}
