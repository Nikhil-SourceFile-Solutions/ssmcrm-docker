<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Under Construction</title>
     @foreach ($scripts as $item)
        {!! $item->script !!}
    @endforeach
    <link rel="stylesheet" href="styles.css">

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(to right, #4facfe, #00f2fe);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            text-align: center;
            overflow: hidden;
            position: relative;
        }

        .container {
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            width: 90%;
            max-width: 500px;
            position: relative;
            z-index: 1;
        }

        h1 {

            margin-bottom: 10px;
            color: #333;
        }

        p {
            margin-bottom: 20px;
            font-size: 1.1em;
        }

        .bubbles {
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            pointer-events: none;
        }

        .bubble {
            position: absolute;
            bottom: -100px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            opacity: 0.6;
            animation: bubble 10s infinite;
        }

        .bubble:nth-child(1) {
            width: 60px;
            height: 60px;
            left: 10%;
            animation-delay: 0s;
        }

        .bubble:nth-child(2) {
            width: 80px;
            height: 80px;
            left: 30%;
            animation-delay: 2s;
        }

        .bubble:nth-child(3) {
            width: 50px;
            height: 50px;
            left: 50%;
            animation-delay: 1s;
        }

        .bubble:nth-child(4) {
            width: 90px;
            height: 90px;
            left: 70%;
            animation-delay: 3s;
        }

        .bubble:nth-child(5) {
            width: 70px;
            height: 70px;
            left: 85%;
            animation-delay: 4s;
        }

        @keyframes bubble {
            0% {
                transform: translateY(0) scale(1);
                opacity: 1;
            }

            50% {
                transform: translateY(-200px) scale(1.2);
                opacity: 0.7;
            }

            100% {
                transform: translateY(-400px) scale(0);
                opacity: 0;
            }
        }
    </style>

<body>
    <div class="container">
        <h1>Site Under Construction</h1>

    </div>
    <div class="bubbles">
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
        <div class="bubble"></div>
    </div>
</body>

</html>
