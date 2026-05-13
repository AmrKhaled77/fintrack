<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $transactions = Transaction::query()
            ->where('user_id', $userId)
            ->when(
                $request->filled('type'),
                fn ($query) => $query->where('type', $request->string('type'))
            )
            ->when(
                $request->filled('category'),
                fn ($query) => $query->where('category', $request->string('category'))
            )
            ->when(
                $request->filled('from'),
                fn ($query) => $query->whereDate('date', '>=', $request->string('from'))
            )
            ->when(
                $request->filled('to'),
                fn ($query) => $query->whereDate('date', '<=', $request->string('to'))
            )
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get();

        return response()->json($transactions);
    }

    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['user_id'] = $request->user()->id;

        $transaction = Transaction::create($validated);

        return response()->json($transaction, 201);
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction): JsonResponse
    {
        $validated = $request->validated();
        $transaction->update($validated);

        return response()->json($transaction);
    }

    public function destroy(Request $request, Transaction $transaction): JsonResponse
    {
        abort_unless($transaction->user_id === $request->user()->id, 403);

        $transaction->delete();

        return response()->json(status: 204);
    }

    public function summary(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $income = Transaction::where('user_id', $userId)->where('type', 'income')->sum('amount');
        $expense = Transaction::where('user_id', $userId)->where('type', 'expense')->sum('amount');

        return response()->json([
            'total_income' => number_format((float) $income, 2, '.', ''),
            'total_expense' => number_format((float) $expense, 2, '.', ''),
            'balance' => number_format((float) ($income - $expense), 2, '.', ''),
        ]);
    }

    public function categoryTotals(Request $request): JsonResponse
    {
        $type = $request->string('type')->value();

        $query = Transaction::query()
            ->where('user_id', $request->user()->id)
            ->selectRaw('COALESCE(category, "Uncategorized") as category')
            ->selectRaw('SUM(amount) as total')
            ->groupBy('category')
            ->orderByDesc('total');

        if (in_array($type, ['income', 'expense'], true)) {
            $query->where('type', $type);
        }

        return response()->json($query->get());
    }
}
