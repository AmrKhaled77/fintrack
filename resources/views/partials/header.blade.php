@php
    $path = request()->path();
@endphp
<header class="topbar">
    <div class="brand">Fin<span>Track</span></div>
    <nav class="nav">
        <a
            href="/dashboard"
            data-link
            class="nav-link{{ $path === 'dashboard' ? ' active' : '' }}"
        >Dashboard</a>
        <a
            href="/exchange-rates"
            data-link
            class="nav-link{{ $path === 'exchange-rates' ? ' active' : '' }}"
        >Exchange Rates</a>
    </nav>
    <div class="user-menu">
        <span class="user-name">Hello, {{ auth()->user()->name }}</span>
        <button type="button" class="avatar" id="avatar-upload-trigger" title="Edit profile">
            @if (auth()->user()?->profile_photo_path)
                <img src="{{ route('profile.photo.show', ['v' => now()->timestamp]) }}" alt="Profile" class="avatar-image">
            @else
                <span class="avatar-text">{{ \Illuminate\Support\Str::upper(\Illuminate\Support\Str::substr(auth()->user()->name, 0, 2)) }}</span>
            @endif
        </button>
        <form method="POST" action="{{ route('logout') }}" class="logout-form">
            @csrf
            <button type="submit" class="logout">Logout</button>
        </form>
    </div>
</header>
