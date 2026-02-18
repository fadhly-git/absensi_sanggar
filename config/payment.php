<?php

return [
    'school' => [
        'name' => env('SCHOOL_NAME', 'My School'),
        'address' => env('SCHOOL_ADDRESS', '123 Main St, Anytown, USA'),
        'logo' => env('SCHOOL_LOGO', '/images/logo.png'),
    ],
    'whatsapp' => env('WHATSAPP_NUMBER', '+1234567890'),

    'bank_accounts' => [
        [
            'id' => 'bca',
            'bank_name' => 'BCA',
            'account_number' => env('BANK_BCA_NUMBER', '1234567890'),
            'account_holder' => env('BANK_BCA_HOLDER', 'My School'),
            'logo' => '/images/banks/bca.webp',
            'is_active' => true,
        ],
        [
            'id' => 'mandiri',
            'bank_name' => 'MANDIRI',
            'account_number' => env('BANK_MANDIRI_NUMBER', '987654321'),
            'account_holder' => env('BANK_MANDIRI_HOLDER', 'My School'),
            'logo' => '/images/banks/mandiri.png',
            'is_active' => true,
        ],
        [
            'id' => 'bri',
            'bank_name' => 'BRI',
            'account_number' => env('BANK_BRI_NUMBER', '1122334455'),
            'account_holder' => env('BANK_BRI_HOLDER', 'My School'),
            'logo' => '/images/banks/bri.png',
            'is_active' => true,
        ]
    ],
];
