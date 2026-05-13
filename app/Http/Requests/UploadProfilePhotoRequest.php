<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadProfilePhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'profile_photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'profile_photo.required' => 'Please choose an image to upload.',
            'profile_photo.image' => 'The file must be a valid image.',
            'profile_photo.mimes' => 'Use JPG, PNG, or WEBP only.',
            'profile_photo.max' => 'The image may not be larger than 2 MB.',
        ];
    }
}
