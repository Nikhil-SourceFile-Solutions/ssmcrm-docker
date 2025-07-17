<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>SFS CRM | Console</title>
    <meta name="robots" content="noindex">
    <link rel="shortcut icon" href="{{ asset('favicon.png') }}">
    <link href="https://fonts.googleapis.com/css?family=Nunito:400,600,700" rel="stylesheet">
     @foreach ($scripts as $item)
        {!! $item->script !!}
    @endforeach
    @viteReactRefresh
    @vite(['resources/js/console/main.tsx'])
</head>

<body>
    <noscript>
        <strong>Sourcefile Solutions Pvt Ltd</strong>
    </noscript>
    <div id="root"></div>
</body>

</html>
