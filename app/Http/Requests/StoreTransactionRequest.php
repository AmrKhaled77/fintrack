<?php

namespace App\Http\Requests;

class StoreTransactionRequest extends BaseTransactionRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }
}
