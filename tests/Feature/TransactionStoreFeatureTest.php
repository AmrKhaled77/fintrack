<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TransactionStoreFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_a_transaction_via_json_api(): void
    {
        Http::fake();

        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/transactions', [
            'title' => 'Coffee',
            'amount' => 12.5,
            'type' => 'expense',
            'category' => 'Food',
            'date' => '2024-07-20',
        ]);

        $response->assertCreated()
            ->assertJsonFragment([
                'title' => 'Coffee',
                'type' => 'expense',
            ]);

        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'title' => 'Coffee',
            'type' => 'expense',
        ]);
    }
}
