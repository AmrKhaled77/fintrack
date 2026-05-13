<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\UploadProfilePhotoRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

class AuthController extends Controller
{
    private function profilePhotoUrl(User $user): ?string
    {
        if (!$user->profile_photo_path) {
            return null;
        }

        return route('profile.photo.show', ['v' => now()->timestamp]);
    }

    public function showLogin(): View
    {
        return view('auth.login');
    }

    public function login(LoginRequest $request): RedirectResponse
    {
        $credentials = $request->validated();

        if (!Auth::attempt($credentials)) {
            return back()
                ->withErrors(['email' => 'We could not find an account with that email and password combination.'])
                ->onlyInput('email');
        }

        $request->session()->regenerate();

        return redirect()->intended('/dashboard');
    }

    public function showRegister(): View
    {
        return view('auth.register');
    }

    public function register(RegisterRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect('/dashboard');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }

    public function uploadProfilePhoto(UploadProfilePhotoRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = $request->user();

        if ($user->profile_photo_path) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        $path = $validated['profile_photo']->store('profile-photos', 'public');
        $user->profile_photo_path = $path;
        $user->save();

        return response()->json([
            'message' => 'Profile photo updated.',
            'photo_url' => $this->profilePhotoUrl($user),
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validated();

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if (isset($validated['profile_photo'])) {
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }

            $user->profile_photo_path = $validated['profile_photo']->store('profile-photos', 'public');
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated.',
            'name' => $user->name,
            'email' => $user->email,
            'photo_url' => $this->profilePhotoUrl($user),
        ]);
    }

    public function showProfilePhoto(Request $request)
    {
        $user = $request->user();

        abort_unless($user->profile_photo_path, 404);
        abort_unless(Storage::disk('public')->exists($user->profile_photo_path), 404);

        return response()->file(Storage::disk('public')->path($user->profile_photo_path));
    }
}
