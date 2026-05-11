<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Login</title>
    <style>
        body { margin: 0; font-family: Arial, sans-serif; background: #f3f4f6; }
        .wrap { min-height: 100vh; display: grid; place-items: center; padding: 16px; }
        .card { width: 100%; max-width: 380px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
        h1 { margin-top: 0; }
        .field { margin-bottom: 12px; }
        input { width: 100%; box-sizing: border-box; border: 1px solid #d1d5db; border-radius: 8px; padding: 10px 12px; }
        .btn { width: 100%; border: 0; border-radius: 8px; padding: 10px 12px; background: #111827; color: #fff; cursor: pointer; }
        .links { margin-top: 10px; text-align: center; font-size: 14px; }
        .error { color: #dc2626; font-size: 14px; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="wrap">
        <form class="card" method="POST" action="/login">
            @csrf
            <h1>Login</h1>
            @if ($errors->any())
                <div class="error">{{ $errors->first() }}</div>
            @endif
            <div class="field">
                <input type="email" name="email" placeholder="Email" value="{{ old('email') }}" required>
            </div>
            <div class="field">
                <input type="password" name="password" placeholder="Password" required>
            </div>
            <button class="btn" type="submit">Sign In</button>
            <div class="links">
                No account? <a href="/register">Register</a>
            </div>
        </form>
    </div>
</body>
</html>
