<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

abstract class BaseTransactionRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:100'],
            'amount' => ['required', 'numeric', 'min:0'],
            'type' => ['required', Rule::in(['income', 'expense'])],
            'category' => ['nullable', 'string', 'max:50'],
            'date' => ['required', 'date'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Please enter a title for this transaction.',
            'title.max' => 'The title may not be longer than 100 characters.',
            'amount.required' => 'Please enter an amount.',
            'amount.numeric' => 'The amount must be a valid number.',
            'amount.min' => 'The amount cannot be negative.',
            'type.required' => 'Please choose whether this is income or expense.',
            'type.in' => 'The type must be either income or expense.',
            'category.max' => 'The category may not be longer than 50 characters.',
            'date.required' => 'Please select a date for this transaction.',
            'date.date' => 'Please enter a valid date.',
        ];
    }
}
