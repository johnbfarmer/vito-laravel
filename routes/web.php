<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VitalStatsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::resource('vital-stats', VitalStatsController::class)
    ->only(['index', 'update', 'destroy', 'edit'])
    ->middleware(['auth']);

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/vital-stats/fetch', [VitalStatsController::class, 'fetch'])->name('vital-stats.fetch');
    Route::get('/vital-stats/pull', [VitalStatsController::class, 'indexAjax'])->name('vital-stats.pull');
    Route::get('/vital-stats/this-month', [VitalStatsController::class, 'thisMonth'])->name('vital-stats.this-month');
    Route::get('/vital-stats/weeks', [VitalStatsController::class, 'weeks'])->name('vital-stats.weeks');
    Route::get('/vital-stats/month/{yearMonth}', [VitalStatsController::class, 'month'])->name('vital-stats.month');
});

require __DIR__.'/auth.php';
