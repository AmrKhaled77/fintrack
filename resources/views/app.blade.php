<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'Laravel SPA') }}</title>
    <link rel="stylesheet" href="{{ asset('spa/app.css') }}">
</head>
<body>
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="{{ asset('spa/app.js') }}" defer></script>
</body>
</html>
