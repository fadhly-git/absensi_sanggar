<?php

namespace Database\Seeders;

use Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use League\Csv\Reader;

class UsersImportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $csvPath = database_path('seeders/data/users_import.csv');
        $csv = Reader::createFromPath($csvPath, 'r');
        $csv->setHeaderOffset(0);

        foreach ($csv as $record) {
            \App\Models\User::updateOrCreate(
                ['nis' => $record['nis']],
                [
                    'name' => $record['nama'],
                    'email' => $record['email'],
                    'password' => Hash::make($record['password']),
                    'role' => $record['role'],
                    'nis' => $record['nis'],
                    // tambahkan kolom lain jika ada di tabel users
                ]
            );
        }
    }
}
