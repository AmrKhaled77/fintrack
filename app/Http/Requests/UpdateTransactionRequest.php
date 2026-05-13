<?php

namespace App\Http\Requests;

use App\Models\Transaction;

class UpdateTransactionRequest extends BaseTransactionRequest
{
    public function authorize(): bool
    {
        $transaction = $this->route('transaction');

        return $transaction instanceof Transaction
            && $this->user() !== null
            && (int) $transaction->user_id === (int) $this->user()->id;
    }
}
