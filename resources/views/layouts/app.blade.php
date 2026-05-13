<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', config('app.name', 'FinTrack'))</title>
    <link rel="stylesheet" href="{{ asset('spa/app.css') }}">
    @stack('styles')
</head>
<body>
    @include('partials.header')
    @include('partials.exchange-api-banner')
    <main class="layout">
        @yield('content')
    </main>
    @include('partials.footer')
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    @stack('scripts')
</body>
</html>
