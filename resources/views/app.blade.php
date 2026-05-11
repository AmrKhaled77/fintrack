<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'Laravel SPA') }}</title>
    <link rel="stylesheet" href="{{ asset('spa/app.css') }}">
</head>
<body>
    <div
        id="app"
        data-user-name="{{ auth()->user()->name ?? 'User' }}"
        data-user-email="{{ auth()->user()->email ?? '' }}"
        data-user-photo-url="{{ auth()->user()?->profile_photo_path ? route('profile.photo.show', ['v' => now()->timestamp]) : '' }}"
    ></div>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="{{ asset('spa/app.js') }}" defer></script>
</body>
</html>
