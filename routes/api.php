<?php

use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::prefix('transactions')->group(function (): void {
    Route::get('/', [TransactionController::class, 'index']);
    Route::post('/', [TransactionController::class, 'store']);
    Route::put('/{transaction}', [TransactionController::class, 'update']);
    Route::delete('/{transaction}', [TransactionController::class, 'destroy']);
    Route::get('/summary', [TransactionController::class, 'summary']);
    Route::get('/category-totals', [TransactionController::class, 'categoryTotals']);
});
