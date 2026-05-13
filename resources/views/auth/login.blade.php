@extends('layouts.guest')

@section('title', 'Login · FinTrack')

@section('content')
    <div class="auth-card">
        <form class="auth-form" method="POST" action="{{ route('login') }}" id="login-form" novalidate>
            @csrf
            <h1>Login</h1>
            @if ($errors->any())
                <div class="alert-error" role="alert">
                    <ul class="error-list">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif
            <p id="login-client-error" class="error client-error" hidden></p>
            <div class="field">
                <input type="email" name="email" placeholder="Email" value="{{ old('email') }}" required autocomplete="email">
                @error('email')
                    <span class="field-error">{{ $message }}</span>
                @enderror
            </div>
            <div class="field">
                <input type="password" name="password" placeholder="Password" required autocomplete="current-password">
                @error('password')
                    <span class="field-error">{{ $message }}</span>
                @enderror
            </div>
            <button class="btn btn-auth" type="submit">Sign In</button>
            <div class="links">
                No account? <a href="{{ route('register') }}">Register</a>
            </div>
        </form>
    </div>
@endsection

@push('scripts')
    <script src="{{ asset('js/auth-forms.js') }}" defer></script>
@endpush
