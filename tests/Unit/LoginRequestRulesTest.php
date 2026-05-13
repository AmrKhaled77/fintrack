<?php

namespace Tests\Unit;

use App\Http\Requests\LoginRequest;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class LoginRequestRulesTest extends TestCase
{
    #[Test]
    public function login_request_requires_email_and_password(): void
    {
        $rules = (new LoginRequest)->rules();

        $this->assertArrayHasKey('email', $rules);
        $this->assertArrayHasKey('password', $rules);
        $this->assertContains('required', $rules['email']);
        $this->assertContains('required', $rules['password']);
    }
}
