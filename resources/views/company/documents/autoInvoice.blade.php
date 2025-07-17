<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Invoice</title>
</head>

<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; width: 100%; ">
    <div style=" width: calc(100% - 40px); padding: 20px; border: 1px solid #ccc;  ">
        <!-- Header -->
        <table style="width: 100%; margin-bottom: 20px;">
            <tr>
                <td style="text-align: left;">
                    <h1 style="font-size: 18pt; color: #0073e6; margin: 0;">
                        {{-- <img src="{{ $logo }}" width="200" alt="Logo Not Found"> --}}
                    </h1>

                    {{-- <p style="margin: 0; font-size: 10pt; color: #555;">Your tagline here</p> --}}
                </td>
                <td style="text-align: right;width: 50%;">
                    <h2 style="font-size: 14pt; color: #333; margin: 0;">INVOICE
                        #{{ $invoicesetting->invoice_prefix }}-{{ $invoicesetting->invoice_start_from + $sale->id }}
                    </h2>
                    <p style="margin: 0; font-size: 10pt; color: #333;">Date: {{ $sale->created_at }}</p>
                    <p style="margin: 0; font-size: 10pt; color: #555;">Address: {{ $invoicesetting->address }}</p>
                    <p style="margin: 0; font-size: 10pt; color: #555;">Email: {{ $invoicesetting->email }}</p>
                    <p style="margin: 0; font-size: 10pt; color: #555;">Phone: {{ $invoicesetting->phone }}</p>
                    @if ($invoicesetting->gst_no)
                        <p style="margin: 0; font-size: 10pt; color: #555;">GSTIN:{{ $invoicesetting->gst_no }}</p>
                    @endif

                </td>



            </tr>
        </table>

        <!-- Invoice To -->
        <div style="margin-bottom: 20px;">
            <h4 style="margin: 0; font-size: 12pt; color: #333;">Invoice For:{{ $lead->first_name }}</h4>
            <p style="margin: 5px 0 0 0; font-size: 10pt; color: #555;">Billing Address:
                {{ $lead->city }}
                {{ $lead->state }}</p>

            <p style="margin: 0; font-size: 10pt; color: #555;">Email: {{ $lead->email }}</p>
            <p style="margin: 0; font-size: 10pt; color: #555;">Phone: +91 {{ $lead->phone }}</p>

        </div>

        <!-- Product Description Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
                <tr>

                    <th
                        style="border-style: none;  padding: 8px; background-color: #0073e6; color: #fff; font-size: 10pt;">
                        S No.</th>
                    <th
                        style="border-style: none;  padding: 8px; background-color: #0073e6; color: #fff; font-size: 10pt;">
                        PRODUCT</th>
                    <th
                        style="border-style: none;  padding: 8px; background-color: #0073e6; color: #fff; font-size: 10pt;">
                        SERVICE</th>
                    <th
                        style="border-style: none;  padding: 8px; background-color: #0073e6; color: #fff; font-size: 10pt;">
                        DURATION</th>
                    <th
                        style="border-style: none;  padding: 8px; background-color: #0073e6; color: #fff; font-size: 10pt; text-align:right">
                        PRICE</th>
                    <th
                        style="border-style: none;  padding: 8px; background-color: #0073e6; color: #fff; font-size: 10pt; text-align:right">
                        AMOUNT</th>
                </tr>
            </thead>
            <tbody>

                <tr>
                    <td style="border-style: none;  padding: 8px; font-size: 10pt;">1</td>
                    <td style="border-style: none;  padding: 8px; font-size: 10pt;">{{ $sale->product }}</td>
                    <td style="border-style: none;  padding: 8px; font-size: 10pt;">
                        @php
                            $saleService = json_decode($sale->sale_service);
                        @endphp

                        @if ($saleService)
                            @foreach ($saleService as $service)
                                <button class="btn-service"> {{ $service }} </button>
                            @endforeach
                        @endif
                    </td>
                    <td style="border-style: none;  padding: 8px; font-size: 10pt;">
                        {{ \Carbon\Carbon::parse($sale->sale_date)->format('Y-m-d') }} to
                        {{ \Carbon\Carbon::parse($sale->due_date)->format('Y-m-d') }}</td>
                    <td style="border-style: none;  padding: 8px; font-size: 10pt; text-align:right">
                        {{ $sale->client_paid }}
                    </td>
                    <td style="border-style: none;  padding: 8px; font-size: 10pt; text-align:right">
                        {{ $sale->inclusive_gst }}
                    </td>
                </tr>
                <tr>
                    <td colspan="5" style="border-style: none;  padding: 8px; font-size: 10pt; text-align:right">
                        Sub Total</td>

                    <td style="border-style: none;  padding: 8px; font-size: 10pt; text-align:right">
                        {{ $sale->inclusive_gst }}</td>
                </tr>




                <tr>

                    <td colspan="5" style="border-style: none;  padding: 8px; font-size: 10pt; text-align:right">
                        IGST (18%):</td>

                    <td style="border-style: none;  padding: 8px; font-size: 10pt; text-align:right">
                        {{ $sale->gst_value }}</td>
                </tr>


                <tr>
                    <td colspan="5"
                        style="border-style: none;  padding: 8px; font-size: 12pt; font-weight:800; text-align:right">
                        Grand Total</td>

                    <td style="border-style: none;  padding: 8px; font-size: 12pt; font-weight:800; text-align:right">
                        {{ $sale->client_paid }}</td>
                </tr>


            </tbody>
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
            $numericValue = $sale->client_paid;
            $amountInWords = numberToWords($numericValue);
            ?>

        </table>

        <div style="text-align:right; margin-bottom: 10px;"> In Words: ({{ $amountInWords }} Only)</div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 20px;">
            <p style="margin: 0; font-size: 10pt; color: #555;">Note:-This is system generated invoice no signature
                required</p>

        </div>
    </div>
</body>

</html>
