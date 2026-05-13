<?php

namespace App\Exceptions;

use RuntimeException;

class ExchangeRatesUnavailableException extends RuntimeException
{
    public static function withPublicMessage(string $message): self
    {
        return new self($message);
    }
}
