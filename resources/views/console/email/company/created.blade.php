<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Company Created</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }

        .alert {
            background-color: #fff;
            border-left: 5px solid #ffcc00;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            text-align: left;
        }

        .icon {
            display: block;
            width: 50px;
            height: 50px;
            margin: 0 auto 10px;
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0% {
                transform: scale(1);
            }

            50% {
                transform: scale(1.1);
            }

            100% {
                transform: scale(1);
            }
        }

        h2 {
            margin-top: 0;
            color: #333;
        }

        p {
            color: #555;
        }

        .footer {
            margin-top: 20px;
            font-size: 0.8em;
            color: #888;
            text-align: center;
        }

        .data {
            margin-top: 20px;
            font-size: 0.9em;
            color: #333;
        }

        .action-button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #ffcc00;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s;
            text-align: center;
        }

        .action-button:hover {
            background-color: #e6b800;
        }
    </style>
</head>

<body>
    <div class="alert">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffcc00"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8c0-5-3-6-6-6s-6 1-6 6c0 5-3 6-3 10h18c0-4-3-5-3-10z" />
            <path d="M9 21h6" />
            <circle cx="12" cy="21" r="1" />
        </svg>
        <h2>Compnay Created</h2>


        New Company Created by <b>{{ auth()->user()->first_name . ' ' . auth()->user()->last_name }}</b> with following
        details</p>

        <div class="data">
            <p><strong>Domain: </strong>{{ $company->domain }}</p>
            <p><strong>Customer Name: </strong>{{ $company->customer_name }}</p>
            <p><strong>Customer Email: </strong>{{ $company->customer_email }}</p>
            <p><strong>Customer Phone: </strong>{{ $company->customer_phone }}</p>
            <p><strong>Company Name: </strong>{{ $company->company_name }}</p>
        </div>

        <div style="text-align: center;">
            <a href="https:{{ $company->domain }}.thefinsap.com" class="action-button">View CRM</a>
        </div>
    </div>
    <div class="footer">
        <p>&copy; {{ now()->year() }} Thefinsap. All rights reserved.</p>
    </div>
</body>

</html>
