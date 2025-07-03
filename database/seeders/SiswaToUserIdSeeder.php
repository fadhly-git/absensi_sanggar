<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use League\Csv\Reader;

class SiswaToUserIdSeeder extends Seeder
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
            // Cari user berdasarkan NIS
            $user = User::where('nis', $record['nis'])->first();
            if ($user) {
                // Update user_id di tabel siswas
                \App\Models\Siswa::where('id', $record['id_siswa'])->update([
                    'user_id' => $user->id
                ]);
            }
        }
    }
}
