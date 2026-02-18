<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://192.168.5.31:5173',
        'http://192.168.5.31:3000',
        'http://192.168.5.31:2023',
        'http://192.168.5.45:3000',
        'http://192.168.5.45:2023',
        'http://192.168.5.45:5173',
        'http://192.168.5.234',
        'http://192.168.5.101:2023',
        'http://192.168.5.101:5173',
        'https://absensi.ngelaras.my.id',
        'https://po-kaos.ngelaras.my.id',
        'https://ngelaras.my.id',
    ],

    'allowed_origins_patterns' => [
        '/^http:\/\/192\.168\.\d+\.\d+:\d+$/',
        '/^http:\/\/localhost:\d+$/',
        '/^http:\/\/127\.0\.0\.1:\d+$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // ⬅️ Set to false for public API
];
