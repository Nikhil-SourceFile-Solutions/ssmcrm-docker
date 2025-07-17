<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }

        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header img {
            max-width: 250px;
            max-height: 150px;
            width: auto;
            height: auto;
        }

        .header h1 {
            font-size: 28px;
            color: #333;
            margin-top: 10px;
        }

        h5 {
            font-size: 20px;
            color: #333;
            margin-top: 10px;
        }

        p {
            font-size: 16px;
            color: #555;
            line-height: 1.6;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            font-size: 14px;
            color: #888;
        }

        .footer a {
            color: #007BFF;
            text-decoration: none;
        }

        .footer a:hover {
            text-decoration: underline;
        }

        @media (max-width: 600px) {
            .container {
                padding: 15px;
            }

            .header h1 {
                font-size: 24px;
            }

            h5 {
                font-size: 18px;
            }

            p {
                font-size: 14px;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <img src="{{ $logo }}" alt="Company Logo">
            <h1>Complete Your KYC</h1>
        </div>

        <h5>Hi {{ $client }},</h5>

        <p>Thank you for choosing our services.</p>

        <a href="{{ $link }}">Click Here</a>
        <br>
        <br>
        <a href="{{ $link }}">{{ $link }}</a>
        <div class="footer">
            <p>If you have any questions, feel free to contact us.</p>
            {{-- <a href="mailto:info@company.com"></a> --}}
        </div>
    </div>
</body>

</html>
