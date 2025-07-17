<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Invoice</title>
    <style>
        html,
        body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: Helvetica;
        }

        * {
            margin: 0;
            padding: 0;
        }

        .invoice-container {
            border: 1px solid #ddd;
            min-height: 100vh;
            max-width: 800px;
            padding: 10px;
            margin: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        .left-section {
            width: 65%;
            vertical-align: top;
        }

        .right-section {
            width: 35%;
            vertical-align: top;
        }

        .terms-section {
            width: 65%;
            vertical-align: top;
        }

        .payment-section {
            width: 35%;
            vertical-align: top;
        }

        .logo {
            max-width: 100%
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

        thead th:first-child {
            border-top-left-radius: 10px;
        }

        thead th:last-child {
            border-top-right-radius: 10px;
        }

        .product-table {
            border-collapse: collapse;
        }

        .terms-section-font {
            font-size: 14px
        }

        .product-table th,
        .product-table td {
            border: 1px solid rgb(99, 99, 99);
            /* border-style: dotted; */
            border-collapse: collapse;
            padding: 15px;
            text-align: center;
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
            /* min-height: 80vh; */
            /* background: antiquewhite; */
            padding: 10px
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

        .left-div {
            width: 50%;
            float: left;
            padding: 10px;
            background: aliceblue;
        }

        .right-div {
            width: 50%;
            float: left;
        }

        .clearfix {
            clear: both;
        }
    </style>
</head>

<body>
    <div class="invoice-container">
        <div class="content">

            <div>
                <img class="logo" style="max-width: 250px;max-height:200px" src={{ $logo }} alt="">
            </div>

            <table style="margin-top: 30px">
                <tr>
                    <td class="left-section">
                        <p><strong>{{ $invoiceData['company_name'] }}</strong></p>
                        <br>
                        <p>Address: {{ $invoiceData['address'] }}</p>
                        <p>Email : {{ $invoiceData['email'] }}</p>
                        <p>Phone : {{ $invoiceData['phone'] }}</p>
                        <p>GSTIN: {{ $invoiceData['gst_no'] }}</p>
                        <br>
                        <p>SEBI REGISTERED NO.: {{ $invoiceData['sebi_no'] }} </p>
                    </td>
                    <td class="right-section">
                        <div style="margin-bottom: 25px;">
                            <h1 style="color: darkcyan">INVOICE</h1>
                        </div>

                        <p style="margin-bottom: 5px;">
                            <strong
                                style="width: 100px; display: inline-block;vertical-align: top;">Date:</strong>{{ $invoiceData['date'] }}
                        </p>

                        <p style="margin-bottom: 5px;">
                            <strong style="width: 100px; display: inline-block;vertical-align: top;">Due
                                Date:</strong>{{ $invoiceData['date'] }}
                        </p>
                        <p style="margin-bottom: 5px;">
                            <strong style="width: 100px; display: inline-block;vertical-align: top;">Invoice
                                No.:</strong>#{{ $invoiceData['invoice_id'] }}
                        </p>
                    </td>
                </tr>
            </table>


            <div style="margin: 20px 0px;">
                <h3 style="color: darkcyan;">BILL TO:</h3>
            </div>


            <div>
                <div style="margin-bottom: 5px;">
                    <strong style="width: 95px; display: inline-block;vertical-align: top;">Name:</strong>
                    <span>{{ $userData['name'] }}</span>
                </div>

              @if($userData['phone']) 
                        <div style="margin-bottom: 5px;">
                    <strong style="width: 95px; display: inline-block;vertical-align: top;">Phone:</strong>
                    <span>+91 {{ $userData['phone'] }}</span>
                </div>
                           @endif
                           
                             @if($userData['email']) 
                           <div style="margin-bottom: 5px;">
                    <strong style="width: 95px; display: inline-block;vertical-align: top;">Email:</strong>
                    <span>{{ $userData['email'] }}</span>
                </div>
                           @endif

                <div style="margin-bottom: 5px;">
                    <strong style="width: 95px; display: inline-block;vertical-align: top;">Address:</strong>
                    <span>{{ $userData['address_one'] }}</span>
                </div>

                <div style="margin-bottom: 5px;">
                    <strong style="width: 95px; display: inline-block;vertical-align: top;">City:</strong>
                    <span>{{ $userData['address_two'] }}</span>
                </div>

               
                
                
                    
                           
                          @if($userData['gst_no']) 
                           <div style="margin-bottom: 5px;">
                    <strong style="width: 95px; display: inline-block;vertical-align: top;">GST:</strong>
                    <span>{{ $userData['gst_no'] }}</span>
                </div>
                           @endif
                           
            </div>


            <table style="margin-top: 25px;" class="product-table ">
                <thead>
                    <tr>
                        <th>S.No.</th>
                        <th>Description</th>
                        <th>From Date</th>
                        <th>To Date</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>{{ $sale->product }}</td>
                        <td>{{ $sale->start_date }}</td>
                        <td>{{ $sale->due_date }}</td>
                        <td>Rs {{ $sale->client_paid }}</td>
                    </tr>
                </tbody>
            </table>
            <div style="margin: 25px 0px;">
                <h4>Terms & Conditions:</h4>
            </div>
            <table>
                <tr>
                    <td class="terms-section">

                        <div style="border: 2px solid #00000033;padding: 10px;width: 95%;border-radius: 5px;">
                            <ul class="terms-section-font" style="list-style: none;">
                                <li>Making payment is proving you are agreeing all T&c,and all other terms.</li>
                                <li>Please note our services are non refundable.</li>
                                <li>Please read and understand all legal formalites.</li>
                                <li>Its mandatory to complete risk profit</li>
                                <li>Investment is subject to market risk.</li>
                            </ul>
                        </div>

                        <div style="margin-top: 20px;">
                            <p> Payment mode : Online</p>
                            <br>
                            <p>Bank/UPI: @if ($bank->is_bank_upi == 'bank')
                                    Bank Account
                                @else
                                    UPI
                                @endif
                            </p>
                            <br>

                            @if ($bank->is_bank_upi == 'bank')
                                <p style="margin-bottom: 5px;">
                                    <span
                                        style="width: 150px; display: inline-block;vertical-align: top;">Bank:</span>{{ $bank->bank_name }}
                                </p>
                                <p style="margin-bottom:3px;">
                                    <span
                                        style="width: 150px; display: inline-block;vertical-align: top;">Holder:</span>{{ $bank->account_holder_name }}
                                </p>
                                <p style="margin-bottom:3px;">
                                    <span style="width: 150px; display: inline-block;vertical-align: top;">Account
                                        Type:</span>{{ $bank->account_type }}
                                </p>
                                <p style="margin-bottom:3px;">
                                    <span style="width: 150px; display: inline-block;vertical-align: top;">A/c
                                        Number:</span>{{ $bank->account_number }}
                                </p>
                                <p style="margin-bottom:3px;">
                                    <span style="width: 150px; display: inline-block;vertical-align: top;">A/c
                                        IFSC Code:</span>{{ $bank->ifsc_code }}
                                </p>
                                <p style="margin-bottom:3px;">
                                    <span style="width: 150px; display: inline-block;vertical-align: top;">A/c
                                        Branch:</span>{{ $bank->branch }}
                                </p>
                            @else
                                <p>UPI: {{ $bank->upi }}</p>
                            @endif
                        </div>


                    </td>
                    <td class="payment-section">
                        <div style="margin-left: 30px;">

                            <p style="margin-bottom: 5px;">
                                <strong style="width: 100px; display: inline-block;vertical-align: top;">Sub
                                    Total:</strong>{{ $sale->inclusive_gst }}

                            </p>

                            @foreach ($sale->gst as $gst)
                                <p style="margin-bottom: 5px;">
                                    <strong
                                        style="width: 100px; display: inline-block;vertical-align: top;">{{ $gst[0] }}:</strong>{{ $gst[1] }}
                                </p>
                            @endforeach



                            <p style="margin-bottom: 5px;">
                                <strong style="width: 100px; display: inline-block;vertical-align: top;">Grand
                                    Total:</strong>{{ $sale->client_paid }}
                            </p>




                        </div>
                    </td>
                </tr>
            </table>



            <div style="margin-top: 10px;text-align: center;">
                <p>Note: its auto generated invoice hence does not requires any signature or stamp</p>

            </div>


        </div>

    </div>
</body>

</html>
