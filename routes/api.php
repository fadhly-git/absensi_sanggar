<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DataController;

Route::get('/data', [DataController::class, 'store']);

Route::get('data/index', [DataController::class, 'index']);