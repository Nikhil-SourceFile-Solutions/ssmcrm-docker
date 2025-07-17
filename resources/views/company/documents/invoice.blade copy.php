<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    {{-- <link rel="stylesheet" href="styles.css"> --}}
    <style>
        * {
            margin: 0;
            padding: 0;
            /* box-sizing: border-box; */
            /* This is supported */
        }

        body {
            font-family: Arial, sans-serif;
            background-color: #fff;
            padding: 20px;
        }

        .invoice-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            border-radius: 10px;
            /* box-shadow is not supported, so you may need to omit this */
            border: 1px solid #ddd;
            /* Add a border as an alternative */
        }

        .invoice-header {
            /* Removed flexbox properties */
            display: table;
            width: 100%;
            border-bottom: 2px solid #f1f1f1;
            padding-bottom: 20px;
        }

        .company-logo {
            display: table-cell;
            vertical-align: middle;
            /* Align vertically */
        }

        .company-logo img {
            max-width: 150px;
        }

        .company-details {
            display: table-cell;
            text-align: right;
            vertical-align: middle;
            /* Align vertically */
        }

        .invoice-info {
            margin-top: 20px;
        }

        .invoice-info h1 {
            font-size: 24px;
            margin-bottom: 10px;
        }

        .info-block p {
            margin-bottom: 5px;
            line-height: 1.5;
        }

        .invoice-details table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        .invoice-details th,
        .invoice-details td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
        }

        .btn-service {
            padding: 5px 10px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-right: 5px;
            font-size: 12px;
        }

        .payment-summary {
            text-align: right;
            margin-top: 20px;
        }

        .payment-summary p,
        .payment-summary h3 {
            margin-bottom: 10px;
        }

        .invoice-footer {
            margin-top: 20px;
            border-top: 2px solid #f1f1f1;
            padding-top: 10px;
            font-size: 14px;
        }

        .myhr {
            border-bottom: 2px solid #f1f1f1;
            padding-top: 10px;
            font-size: 14px;
        }
    </style>
</head>

<body>
    <page size="A4" style="padding: 25px">
        <!-- background: #b5b5b5; -->
        <div>
            <div style="float: left; width: 60%; padding-left: 10px;">
                <h2>INVOICE
                    #{{ $data['setting']->invoice_prefix }}-{{ $data['setting']->invoice_start_from + $data['invoice']->id }}
                </h2>
                <div class="info-block">
                    <p>Issue For: {{ $data['invoice']->name }}</p>
                    <p>Billing Address:{{ $data['invoice']->address }}, {{ $data['invoice']->city }},
                        {{ $data['invoice']->state }}
                    </p>
                    <p>Email: {{ $data['invoice']->email }}</p>
                    <p>Phone: +91 {{ $data['invoice']->mobile }}</p>

                </div>
            </div>
            <div style="float: right; width: 40%; padding-left: 20px;">
                <div class="info-block">
                    <img src="https://{{ tenant('id') }}.{{ env('CRM_URL') }}/storage/{{ $data['setting']->logo }}"
                        width="200" alt="Logo Not Found">




                    <p>Address: {{ $data['sebi']->address }}</p>
                    <p>Email: {{ $data['sebi']->email }}</p>
                    <p>Phone: +91 {{ $data['sebi']->mobile }}</p>

                </div>
            </div>
        </div>


        <footer class="myhr">
            <h1 style="color: white">myhr</h1>

        </footer>

        <!-- Product/Service Table -->
        <section class="invoice-details">
            <table>
                <thead>
                    <tr>
                        <th>S.NO</th>
                        <th>PRODUCT</th>
                        <th>SERVICE</th>
                        <th>DURATION</th>
                        <th>PRICE</th>
                        <th>AMOUNT</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>1</td>
                        <td>{{ $data['sale']->product }}</td>
                        <td>
                            @php
                            $saleService = json_decode($data['sale']->sale_service);
                            @endphp

                            @if ($saleService)
                            @foreach ($saleService as $service)
                            <button class="btn-service"> {{ $service }} </button>
                            @endforeach
                            @endif
                        </td>

                        <td>
                            {{ \Carbon\Carbon::parse($data['sale']->sale_date)->format('Y-m-d') }} to
                            {{ \Carbon\Carbon::parse($data['sale']->due_date)->format('Y-m-d') }}
                        </td>

                        <td>{{ $data['sale']->client_paid }}.00</td>

                    </tr>
                </tbody>



            </table>
        </section>






        <section class="payment-summary">

            <h3>Grand Total:
                {{ $data['sale']->client_paid }}
            </h3>

            <?php

            use NumberToWords\NumberToWords;

            if (!function_exists('numberToWords')) {
                function numberToWords($number)
                {
                    $numberToWords = new NumberToWords();
                    $numberTransformer = $numberToWords->getNumberTransformer('en'); // 'en' for English
                    return $numberTransformer->toWords($number);
                }
            }
            ?>

            <?php
            $numericValue = $data['sale']->client_paid;
            $amountInWords = numberToWords($numericValue);
            ?>
            <div>
                <p>In Words: ({{ $amountInWords }} Only)</p>
            </div>

        </section>

        <!-- Footer / Payment Mode -->
        <footer class="invoice-footer">
            <p>MODE OF TRANSACTION: {{ $data['bank']->is_bank_upi == '2' ? 'BANK' : 'UPI' }}</p>
            @if ($data['bank']->is_bank_upi == 'bank')
            <div>
                <p>Bank Name:{{ $data['bank']->bank_name }} </p>
                <p>Account Number:{{ $data['bank']->account_number }} </p>
                <p>Holder Name:{{ $data['bank']->account_holder_name }} </p>
                <p>Account Type:{{ $data['bank']->account_type }} </p>
                <p>IFSC Code:{{ $data['bank']->ifsc_code }} </p>
            </div>
            @else
            <div>
                <p>Name:{{ $data['bank']->name }} </p>
                <p>UPI ID:{{ $data['bank']->upi }} </p>
            </div>
            @endif

        </footer>









    </page>

</body>

</html>