<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use League\Csv\Reader;

class SiswaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $csvPath = database_path('seeders/data/tahun_masuk_siswa.csv');
        $csv = Reader::createFromPath($csvPath, 'r');
        $csv->setHeaderOffset(0);
        foreach ($csv as $row) {
            \App\Models\Siswa::where('id', $row['id_siswa'])
                ->firstOrFail() // Ensure the siswa exists
                ->update([
                    'id' => $row['id_siswa'],
                    'tanggal_terdaftar' => $row['tanggal_terdaftar'] ? \Carbon\Carbon::parse($row['tanggal_terdaftar']) : null,
                ]);
        }
    }
}
