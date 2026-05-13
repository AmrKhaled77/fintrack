<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ExchangeRateDataFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_exchange_rates_json_endpoint_returns_upstream_payload_when_http_succeeds(): void
    {
        Http::fake([
            '*' => Http::response([
                'egp' => ['usd' => 0.02, 'eur' => 0.03],
                'date' => '2024-05-01',
            ], 200),
        ]);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/exchange-rates/data')
            ->assertOk()
            ->assertJsonPath('date', '2024-05-01')
            ->assertJsonPath('egp.usd', 0.02);

        $this->assertNull(Cache::get(config('exchange_rates.cache_error_key')));
    }

    public function test_exchange_rates_json_endpoint_returns_503_and_caches_message_when_upstream_invalid(): void
    {
        Http::fake([
            '*' => Http::response(['missing' => 'egp'], 200),
        ]);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/exchange-rates/data')
            ->assertStatus(503)
            ->assertJsonStructure(['message']);

        $this->assertIsString(Cache::get(config('exchange_rates.cache_error_key')));
    }
}
