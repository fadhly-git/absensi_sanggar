<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\AbsensiController as absensi;
use Inertia\Inertia;

class LandingPageCon extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $absensiController = new absensi();
        // Ambil parameter query
        $date = $request->query('date'); // Nilai: "2025-03"
        $params = $request->query('params'); // Nilai: "bulan"
        // Jika request kosong, render halaman welcome tanpa redirect
        if (empty($date) && empty($params)) {
            return Inertia::render('welcome');
        }else{
            $data = $absensiController->generateWeeklyReport(request());
            return Inertia::render('welcome', [
                'siswa' => $data,
            ]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
