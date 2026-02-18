<x-mail::message>
{{-- Logo --}}
<div style="align-items: center; text-align: center; margin: 0 auto;">
    <div style="background-color: #252525; padding: 10px; border-radius: 15px; display: inline-block; text-align: center; margin: 0 auto;">
        <img src="http://fadhlyrzaq.ct.ws/public/img/logo.png" alt="{{ config('app.name') }} Logo" style="width: 150px; margin: 0 auto; display: block;">
    </div>
</div>

{{-- Greeting --}}
@if (! empty($greeting))
# {{ $greeting }}
@else
@if ($level === 'error')
# @lang('Whoops!')
@else
# @lang('Hello!')
@endif
@endif

{{-- Intro Lines --}}
@foreach ($introLines as $line)
{{ $line }}

@endforeach

{{-- Action Button --}}
@isset($actionText)
<?php
    $color = match ($level) {
        'success', 'error' => $level,
        default => 'primary',
    };
?>
<x-mail::button :url="$actionUrl" :color="$color">
{{ $actionText }}
</x-mail::button>
@endisset

{{-- Outro Lines --}}
@foreach ($outroLines as $line)
{{ $line }}

@endforeach

{{-- Salutation --}}
@if (! empty($salutation))
{{ $salutation }}
@else
@lang('Regards,')<br>
{{ config('app.name') }}
@endif

{{-- Subcopy --}}
@isset($actionText)
<x-slot:subcopy>
@lang(
    "Jika Anda mengalami masalah saat mengklik tombol \":actionText\", salin dan tempel URL di bawah ini\n" .
    "ke dalam peramban web Anda:",
    [
        'actionText' => $actionText,
    ]
) <span class="break-all">[{{ $displayableActionUrl }}]({{ $actionUrl }})</span>
</x-slot:subcopy>
@endisset
</x-mail::message>
