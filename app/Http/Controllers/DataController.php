<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DataController extends Controller
{
    // public function index(Request $request)
    // {
    //     $date = $request->input('date');

    //     // Menjalankan prosedur tersimpan
    //     try {
    //         $result = DB::select('CALL spRptAbsensiData(?)', ['2025-03']);
    //         return response()->json([
    //             'data' => $result
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Error executing stored procedure:', ['error' => $e->getMessage()]);
    //     }
    // }
    // public function store(Request $request)
    // {
    //     $date = $request->input('date');

    //     // Menjalankan prosedur tersimpan
    //     try {
    //         $result = DB::select('CALL spRptAbsensiData(?)', [$date]);
    //         return response()->json($result);
    //     } catch (\Exception $e) {
    //         Log::error('Error executing stored procedure:', ['error' => $e->getMessage()]);
    //         return response()->json(['message' => 'Error executing stored procedure', 'error' => $e->getMessage()], 500);
    //     }
    // }
}
