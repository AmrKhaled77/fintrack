@extends('layouts.guest')

@section('title', 'Register · FinTrack')

@section('content')
    <div class="auth-card">
        <form class="auth-form" method="POST" action="{{ route('register') }}" id="register-form" novalidate>
            @csrf
            <h1>Register</h1>
            @if ($errors->any())
                <div class="alert-error" role="alert">
                    <ul class="error-list">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif
            <p id="register-client-error" class="error client-error" hidden></p>
            <div class="field">
                <input type="text" name="name" placeholder="Name" value="{{ old('name') }}" required autocomplete="name">
                @error('name')
                    <span class="field-error">{{ $message }}</span>
                @enderror
            </div>
            <div class="field">
                <input type="email" name="email" placeholder="Email" value="{{ old('email') }}" required autocomplete="email">
                @error('email')
                    <span class="field-error">{{ $message }}</span>
                @enderror
            </div>
            <div class="field">
                <input type="password" name="password" placeholder="Password (min 8 chars)" required autocomplete="new-password">
                @error('password')
                    <span class="field-error">{{ $message }}</span>
                @enderror
            </div>
            <div class="field">
                <input type="password" name="password_confirmation" placeholder="Confirm password" required autocomplete="new-password">
            </div>
            <button class="btn btn-auth" type="submit">Create Account</button>
            <div class="links">
                Have an account? <a href="{{ route('login') }}">Login</a>
            </div>
        </form>
    </div>
@endsection

@push('scripts')
    <script src="{{ asset('js/auth-forms.js') }}" defer></script>
@endpush
