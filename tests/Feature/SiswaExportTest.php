<?php

use App\Models\Siswa;
use App\Exports\SiswaExport;
use Maatwebsite\Excel\Facades\Excel;

test('siswa export contains only active students', function () {
    // Create test data
    $activeSiswa1 = Siswa::factory()->create([
        'nama' => 'Student Aktif 1',
        'alamat' => 'Alamat 1',
        'status' => 1
    ]);
    
    $activeSiswa2 = Siswa::factory()->create([
        'nama' => 'Student Aktif 2', 
        'alamat' => 'Alamat 2',
        'status' => 1
    ]);
    
    $inactiveSiswa = Siswa::factory()->create([
        'nama' => 'Student Non-Aktif',
        'alamat' => 'Alamat 3',
        'status' => 0
    ]);

    // Get active students
    $activeStudents = Siswa::where('status', 1)->get();
    
    // Create export
    $export = new SiswaExport($activeStudents);
    
    // Check collection contains only active students
    $collection = $export->collection();
    
    expect($collection)->toHaveCount(2);
    expect($collection->pluck('nama')->toArray())->toContain('Student Aktif 1', 'Student Aktif 2');
    expect($collection->pluck('nama')->toArray())->not->toContain('Student Non-Aktif');
});

test('siswa export headings are correct', function () {
    $export = new SiswaExport(collect([]));
    $headings = $export->headings();
    
    expect($headings)->toBe(['Nama Siswa', 'Alamat', 'Status']);
});

test('siswa export maps data correctly', function () {
    $siswa = Siswa::factory()->create([
        'nama' => 'Test Student',
        'alamat' => 'Test Address',
        'status' => 1
    ]);
    
    $export = new SiswaExport(collect([]));
    $mapped = $export->map($siswa);
    
    expect($mapped)->toBe(['Test Student', 'Test Address', 'Aktif']);
});

test('siswa export maps inactive status correctly', function () {
    $siswa = Siswa::factory()->create([
        'nama' => 'Inactive Student',
        'alamat' => 'Test Address',
        'status' => 0
    ]);
    
    $export = new SiswaExport(collect([]));
    $mapped = $export->map($siswa);
    
    expect($mapped)->toBe(['Inactive Student', 'Test Address', 'Non-Aktif']);
});