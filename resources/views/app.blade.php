@extends('layouts.app')

@section('title', config('app.name', 'FinTrack'))

@section('content')
    <div
        id="app"
        data-user-name="{{ auth()->user()->name }}"
        data-user-email="{{ auth()->user()->email }}"
        data-user-photo-url="{{ auth()->user()?->profile_photo_path ? route('profile.photo.show', ['v' => now()->timestamp]) : '' }}"
    ></div>
@endsection

@push('scripts')
    <script src="{{ asset('spa/app.js') }}" defer></script>
@endpush
