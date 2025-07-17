<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Invoice</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            font-size: 14px
        }

        .invoice-container {

            border: 1px solid #ddd;
            min-height: 100vh;
            max-width: 800px;
            padding-left: 20px;
            padding-right: 20px
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        .left-section {
            width: 50%;
            vertical-align: top;
        }

        .logo {
            max-width: 100%
        }

        .right-section {
            width: 50%;
            vertical-align: top;
            text-align: right;
        }

        .product-left-section {
            width: 15%;
            vertical-align: top;
        }

        .product-right-section {
            width: 100%;
            vertical-align: top;
        }

        .to-section {
            border-right: dotted;
            border-width: 2px;
            border-color: #b8b6b6;
        }

        .product-table {
            margin-top: 25px;
            padding: 4px;
        }

        th,
        td {

            /* border-bottom: 1px solid #ddd; */
            text-align: left;
        }

        .invoice-header {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin-top: 15px;
            color: #456e6f;
            margin-bottom: 15px;
        }

        .content {
            min-height: 80vh;
        }

        .footer {
            text-align: center;
            padding: 10px;
            border-top: 1px solid #ddd;
            background: #e8e8e8;
            width: 100%;
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
        }
    </style>
</head>

<body>
    <div class="invoice-container">
        <div class="invoice-header">INVOICE</div>
        <div class="content">
            <table style=" ">
                <tr>
                    <td class="left-section">
                        <img class="logo" style="max-width: 200px" src="{{ $logo }}" alt="">

                        <div class="to-section">
                            <p style="line-height: 20px;"> <strong style="color: #456e6f">Invoice For:</strong></p>
                            <p style="line-height: 5px;"><strong>{{ $userData['name'] }}</strong></p>
                            <p style="margin: 0;margin-bottom:5px"> {{ $userData['address_one'] }}</p>
                            <p style="margin: 0;margin-bottom:5px"> {{ $userData['address_two'] }}</p>
                            <p style="margin: 0;margin-bottom:5px">Phone: +91 {{ $userData['phone'] }}</p>
                            <p style="margin: 0;margin-bottom:5px">Email: {{ $userData['email'] }}</p>
                        </div>
                    </td>
                    <td class="right-section">
                        <p style="line-height: 20px;color:#456e6f"> <strong>INVOICE
                                #{{ $invoiceData['invoice_id'] }}</strong></p>
                        <P style="line-height: 10px;">Date: {{ $invoiceData['date'] }}</P>

                        @if ($invoiceData['company_name'])
                            <P style="margin: 0;margin-bottom:5px">{{ $invoiceData['company_name'] }}</P>
                        @endif

                        @if ($invoiceData['sebi_no'])
                            <P style="margin: 0;margin-bottom:5px">SEBI:{{ $invoiceData['sebi_no'] }}</P>
                        @endif

                        @if ($invoiceData['address'])
                            <P style="margin: 0;margin-bottom:5px">{{ $invoiceData['address'] }}</P>
                        @endif

                        @if ($invoiceData['email'])
                            <P style="margin: 0;margin-bottom:5px">{{ $invoiceData['email'] }}</P>
                        @endif

                        @if ($invoiceData['phone'])
                            <P style="margin: 0;margin-bottom:5px">{{ $invoiceData['phone'] }}</P>
                        @endif

                        @if ($invoiceData['gst_no'])
                            <P style="margin: 0;margin-bottom:5px">GSTN:{{ $invoiceData['gst_no'] }}</P>
                        @endif
                    </td>
                </tr>
            </table>


            <div
                style="margin-top: 25px;  border-top: dotted;
            border-width: 2px;padding-top: 15px;
            border-color: #b8b6b6;">
                <strong style="color: #456e6f">Product and Service(s) Details:</strong>
            </div>

            <table style="margin-top: 10px;">


                <tr>
                    <td style="padding: 0" class="product-left-section">
                        <p style="margin: 0 0 10px 0"><strong style="color: #456e6f">Product</strong></p>
                    </td>
                    <td style="padding: 0" class="product-right-section">
                        <p style="margin: 0 0 10px 0"><strong>{{ $sale->product }}</strong></p>
                    </td>
                </tr>

                <tr>
                    <td style="padding: 0" class="product-left-section">
                        <p style="margin: 0 0 10px 0"><strong style="color: #456e6f"> Services</strong></p>
                    </td>
                    <td style="padding: 0" class="product-right-section">
                        <div>
                            <p style="margin: 0 0 10px 0">
                                @php
                                    $saleService = json_decode($sale->sale_service);
                                @endphp

                                @if ($saleService)

                                    @foreach ($saleService as $service)
                                        <span
                                            style="background: #f0f1f0;
padding: 2px;
margin-right: 4px;
border-radius: 3px;">
                                            <strong> {{ $service }} </strong></span>
                                    @endforeach
                                @endif
                            </p>
                        </div>
                    </td>
                </tr>

                <tr>
                    <td style="padding: 0" class="product-left-section">
                        <p style="margin: 0 0 10px 0"><strong style="color: #456e6f">Duration</strong></p>
                    </td>
                    <td style="padding: 0" class="product-right-section">
                        <p style="margin: 0 0 10px 0">
                            <strong>{{ \Carbon\Carbon::parse($sale->sale_date)->format('Y-m-d') }} to
                                {{ \Carbon\Carbon::parse($sale->due_date)->format('Y-m-d') }}</strong>
                        </p>
                    </td>
                </tr>

                <tr>
                    <td style="padding: 0" class="product-left-section">
                        <p style="margin: 0 0 10px 0"><strong style="color: #456e6f">Price</strong></p>
                    </td>
                    <td style="padding: 0" class="product-right-section">
                        <p style="margin: 0 0 10px 0"><strong> {{ $sale->client_paid }}</strong></p>
                    </td>
                </tr>


                <tr>
                    <td class="product-left-section">

                    </td>
                    <td class="product-right-section">
                        <div style="margin-top: 10px;">
                            <div style="float: left; width: 16%;color: #456e6f">Subtotal</div>
                            <span style="float: right; width: 84%; "> :
                                <strong>{{ $sale->inclusive_gst }}</strong></span>
                            <div style="clear: both;"></div>
                        </div>

                    </td>
                </tr>

                @foreach ($sale->gst as $gst)
                    <tr>
                        <td class="product-left-section">

                        </td>
                        <td class="product-right-section">

                            <div style="margin-top: 10px;">
                                <div style="float: left; width: 16%;color: #456e6f"> {{ $gst[0] }}</div>
                                <span style="float: right; width: 84%; "> :<strong>
                                        {{ $gst[1] }}</strong></span>
                                <div style="clear: both;"></div>
                            </div>

                        </td>
                    </tr>
                @endforeach




                <tr>
                    <td class="product-left-section">

                    </td>
                    <td class="product-right-section">
                        <div style="margin-top: 10px;">
                            <div style="float: left; width: 16%;color: #456e6f">Grand Total</div>
                            <span style="float: right; width: 84%; "> :
                                <strong>{{ $sale->client_paid }}</strong></span>
                            <div style="clear: both;"></div>
                        </div>
                    </td>
                </tr>
            </table>

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
            
            $numericValue = $sale->client_paid;
            $amountInWords = numberToWords($numericValue);
            ?>

            <div>
                <p>In Words: ({{ $amountInWords }} Only)
                </p>
            </div>


            <div class="footer">
                Note:-This is system generated invoice no signature required
            </div>
        </div>

    </div>
</body>

</html>
