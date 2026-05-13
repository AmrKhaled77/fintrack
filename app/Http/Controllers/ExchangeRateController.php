<?php

namespace App\Http\Controllers;

use App\Exceptions\ExchangeRatesUnavailableException;
use App\Services\ExchangeRateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ExchangeRateController extends Controller
{
    public function __construct(
        private readonly ExchangeRateService $exchangeRates,
    ) {}

    /**
     * Proxies the third-party currency API through Laravel (server-side HTTP).
     */
    public function data(): JsonResponse
    {
        $cacheKey = (string) config('exchange_rates.cache_error_key');

        try {
            $payload = $this->exchangeRates->fetchLiveEgpPayload();
            Cache::forget($cacheKey);

            return response()->json($payload);
        } catch (ExchangeRatesUnavailableException $e) {
            $ttlMinutes = max(1, (int) config('exchange_rates.cache_error_ttl_minutes', 30));
            Cache::put($cacheKey, $e->getMessage(), now()->addMinutes($ttlMinutes));

            return response()->json([
                'message' => $e->getMessage(),
            ], 503);
        }
    }
}
