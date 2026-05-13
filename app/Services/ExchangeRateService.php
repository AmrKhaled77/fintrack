<?php

namespace App\Services;

use App\Exceptions\ExchangeRatesUnavailableException;
use Illuminate\Support\Facades\Http;

class ExchangeRateService
{
    /**
     * Fetch live EGP-based currency payload (same shape as the Assignment 1 CDN API).
     *
     * @return array{egp: array<string, float|int|string>, date?: string}
     *
     * @throws ExchangeRatesUnavailableException
     */
    public function fetchLiveEgpPayload(): array
    {
        $urls = array_values(array_filter([
            config('exchange_rates.primary_url'),
            config('exchange_rates.fallback_url'),
        ]));

        if ($urls === []) {
            throw ExchangeRatesUnavailableException::withPublicMessage(
                'Exchange rate service is not configured. Please contact support.'
            );
        }

        $timeout = max(1, (int) config('exchange_rates.timeout', 10));
        $apiKey = (string) config('exchange_rates.api_key', '');

        $lastError = null;

        foreach ($urls as $url) {
            try {
                $pending = Http::timeout($timeout)
                    ->acceptJson();

                if ($apiKey !== '') {
                    $pending = $pending->withHeaders(['X-API-Key' => $apiKey]);
                }

                $response = $pending->get($url);

                if (!$response->successful()) {
                    $lastError = 'HTTP '.$response->status();

                    continue;
                }

                $json = $response->json();
                if (!is_array($json) || !isset($json['egp']) || !is_array($json['egp'])) {
                    $lastError = 'Unexpected response format';

                    continue;
                }

                return $json;
            } catch (\Throwable $e) {
                $lastError = $e->getMessage();
            }
        }

        report(new \RuntimeException('Exchange rate API unreachable: '.($lastError ?? 'unknown')));

        throw ExchangeRatesUnavailableException::withPublicMessage(
            'We could not load exchange rates right now. Please try again in a few minutes.'
        );
    }
}
