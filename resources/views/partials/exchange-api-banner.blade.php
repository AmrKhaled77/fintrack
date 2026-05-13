@if (!empty($exchangeRatesErrorMessage))
    <div class="exchange-api-banner" role="alert">
        <p>{{ $exchangeRatesErrorMessage }}</p>
    </div>
@endif
