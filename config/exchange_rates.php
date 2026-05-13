<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third-party currency API (Assignment 1 compatible)
    |--------------------------------------------------------------------------
    |
    | Public EGP rates JSON. Override URLs or add an API key if your provider
    | requires authentication (sent as X-API-Key when EXCHANGE_RATES_API_KEY is set).
    |
    */

    'primary_url' => env('EXCHANGE_RATES_PRIMARY_URL')
        ?: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/egp.json',

    'fallback_url' => env('EXCHANGE_RATES_FALLBACK_URL')
        ?: 'https://latest.currency-api.pages.dev/v1/currencies/egp.json',

    'api_key' => env('EXCHANGE_RATES_API_KEY', ''),

    'timeout' => (int) env('EXCHANGE_RATES_TIMEOUT', 10),

    'cache_error_key' => 'exchange_rates_user_facing_error',

    'cache_error_ttl_minutes' => (int) env('EXCHANGE_RATES_ERROR_CACHE_MINUTES', 30),
];
