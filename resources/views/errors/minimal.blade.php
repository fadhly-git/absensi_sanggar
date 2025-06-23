<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="{{ asset('css/errors.css') }}">
        <link rel="icon" href="/img/logo.png" type="image/x-icon">

        <title>@yield('title')</title>

        <!-- Google font -->
        <link href="https://fonts.googleapis.com/css?family=Cabin:400,700" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css?family=Montserrat:900" rel="stylesheet">

    </head>
    <body>
        <div id="notfound">
            <div class="notfound">
                <div class="notfound-404">
                    <h3>Oops! @yield('text')</h3>
                    <h1><span>@yield('code-one')</span><span>@yield('code-two')</span><span>@yield('code-three')</span></h1>
                </div>
                <h2>@yield('message')</h2>

                <a href="/" class="button btn-home">Go Home</a>
                <a href="#" class="button">Contact us</a>
            </div>
        </div>
    </body>
</html>
