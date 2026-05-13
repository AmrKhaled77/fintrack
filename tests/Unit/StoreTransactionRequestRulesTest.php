<?php

namespace Tests\Unit;

use App\Http\Requests\StoreTransactionRequest;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class StoreTransactionRequestRulesTest extends TestCase
{
    #[Test]
    public function store_transaction_request_defines_validation_rules_for_core_fields(): void
    {
        $request = new StoreTransactionRequest;
        $rules = $request->rules();

        $this->assertArrayHasKey('title', $rules);
        $this->assertArrayHasKey('amount', $rules);
        $this->assertArrayHasKey('type', $rules);
        $this->assertArrayHasKey('date', $rules);
        $this->assertArrayHasKey('category', $rules);
    }
}
