<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
        }

        .container {
            padding: 25px;
        }

        h3 {
            margin: 0 0 10px;
            font-size: 18px;
            font-family: monospace;
            padding: 4px 10px;
            background-color: #f4f4f4;
            display: inline-block;
        }

        p {
            margin: 5px 0;
            font-size: 14px;
            line-height: 1.5;
        }

        .section {
            margin-bottom: 20px;
        }

        .details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .details img {
            width: 175px;
            height: 175px;
            border: 1px solid #ddd;
        }

        .address p {
            margin: 3px 0;
        }

        hr {
            border: 1px solid #ccc;
            margin: 20px 0;
        }

        .table-container {
            margin-top: 10px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }

        table td {
            padding: 5px;
            vertical-align: top;
        }

        table img {
            width: 225px;
            border: 1px solid #ddd;
        }

        .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 30px;
        }

        .footer img {
            width: 100px;
            margin: 10px;
        }

        @page {
            margin: 0;
        }

        @media print {
            body {
                margin: 0;
                box-shadow: none;
            }
        }
    </style>
</head>

<body>
    <div class="container">

        <div style="    border: 2px #050505;
    border-style: dotted;
    padding: 10px;">
            <div style="text-align: center;">

                @if ($logo)
                    <img style="max-width: 250px" src="{{ $logo }}">
                @endif

                <h1>Know Your Customer</h1>
            </div>
            <h3>PERSONAL DETAILS</h3>


            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <!-- Details Section -->
                    <td style="width: 65%; vertical-align: top; padding-right: 10px;">

                        @if ($kyc->first_name)
                            <strong style="color:#a60c6a;">First Name:</strong>
                            <strong>{{ $kyc->first_name }}</strong> &nbsp;
                            @if (!$kyc->last_name)
                                <br>
                            @endif
                        @endif

                        @if ($kyc->last_name)
                            <strong style="color:#a60c6a;">Last Name:</strong>
                            <strong>{{ $kyc->last_name }}</strong><br>
                        @endif

                        @if ($kyc->phone)
                            <strong style="color:#a60c6a;">Phone:</strong>
                            <strong>{{ $kyc->phone }}</strong> &nbsp;
                            @if (!$kyc->email)
                                <br>
                            @endif
                        @endif

                        @if ($kyc->email)
                            <strong style="color:#a60c6a;">Email:</strong>
                            <strong>{{ $kyc->email }}</strong><br>
                        @endif

                        @if ($kyc->father_or_spouse_name)
                            <strong style="color:#a60c6a;">Father’s/Spouse Name:</strong>
                            <strong>{{ $kyc->father_or_spouse_name }}</strong><br>
                        @endif

                        @if ($kyc->gender)
                            <strong style="color:#a60c6a;">Gender:
                            </strong><strong>{{ $kyc->gender }}</strong> &nbsp;

                            @if ($kyc->date_of_birth)
                                <br>
                            @endif
                        @endif


                        @if ($kyc->date_of_birth)
                            <strong style="color:#a60c6a;">Date of Birth:</strong>
                            <strong>{{ $kyc->date_of_birth }}</strong><br>
                        @endif



                        @if ($kyc->marital_status)
                            <strong style="color:#a60c6a;">Marital Status:
                            </strong><strong>{{ $kyc->marital_status }}</strong><br>
                        @endif

                        @if ($kyc->residential_status)
                            <strong style="color:#a60c6a;">Residential Status:
                            </strong><strong>{{ $kyc->residential_status }}</strong><br>
                        @endif

                        @if ($kyc->nationality)
                            <strong style="color:#a60c6a;">Nationality:
                            </strong><strong>{{ $kyc->nationality }}</strong><br>
                        @endif

                        @if ($kyc->pan)
                            <strong style="color:#a60c6a;">PAN:
                            </strong><strong>{{ $kyc->pan }}</strong> &nbsp;
                            @if (!$kyc->aadhaar_number)
                                <br>
                            @endif

                        @endif

                        @if ($kyc->aadhaar_number)
                            <strong style="color:#a60c6a;">Aadhaar:</strong>
                            <strong>{{ $kyc->aadhaar_number }}</strong><br>
                        @endif

                    </td>

                    @if ($kyc->photo)
                        <td style="width: 35%; text-align: center;">
                            <img src="{{ url( $kyc->photo) }}" alt="Photo"
                                style="max-width: 100%; height: auto; border: 1px solid #ccc; padding: 5px;">
                        </td>
                    @endif



                </tr>
            </table>


            <hr>

            @if ($kyc->permanent_address_1 || $kyc->current_address_1)
                <h3>ADDRESS DETAILS</h3>
                <div class="address">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>

                            @if ($kyc->permanent_address_1)
                                <td style="width: 50%; border-right: 1px solid #ccc; padding-right: 10px;">
                                    <h4><strong style="color:#a60c6a;">Permanent Address</strong></h4>
                                    <p><strong>{{ $kyc->permanent_address_1 }}
                                            {{ $kyc->permanent_address_2 }}</strong>
                                    </p>
                                    <p><strong>{{ $kyc->permanent_address_city }}</strong>,<strong>{{ $kyc->permanent_address_state }}</strong>,
                                        <strong>{{ $kyc->permanent_address_country }}</strong> -
                                        <strong>{{ $kyc->permanent_address_pincode }}</strong>
                                </td>
                            @endif


                            @if ($kyc->current_address_1)
                                <td style="width: 50%; padding-left: 10px;">
                                    <h4><strong style="color:#a60c6a;">Current Address</strong></h4>
                                    <p><strong>{{ $kyc->current_address_1 }} {{ $kyc->current_address_2 }}</strong>
                                    </p>
                                    <p><strong>{{ $kyc->current_address_city }}</strong>,<strong>{{ $kyc->current_address_state }}</strong>,
                                        <strong>{{ $kyc->current_address_country }}</strong> -
                                        <strong>{{ $kyc->current_address_pincode }}</strong>


                                    </p>
                                </td>
                            @endif

                            <!-- Current Address -->

                        </tr>
                    </table>

                </div>

                <hr>
            @endif




            @if (
                $kyc->politician_by_profession ||
                    $kyc->years_of_experience_in_trading ||
                    $kyc->risk_appetite ||
                    $kyc->annual_turnover ||
                    $kyc->age_declaration)
                <h3>KYC: UNDERTAKING AND DECLARATION</h3>
                <div class="section">

                    @if ($kyc->politician_by_profession)
                        <p><strong style="color:#a60c6a;">Politician by profession:</strong>
                            <strong>{{ $kyc->politician_by_profession ?: 'Not Filled' }}</strong>
                        </p>
                    @endif

                    @if ($kyc->years_of_experience_in_trading)
                        <p><strong style="color:#a60c6a;">Years of experience in Trading:</strong>
                            <strong>{{ $kyc->years_of_experience_in_trading ?: 'Not Filled' }}</strong>
                        </p>
                    @endif

                    @if ($kyc->risk_appetite)
                        <p><strong style="color:#a60c6a;">Risk appetite:</strong>
                            <strong>{{ $kyc->risk_appetite ?: 'Not Filled' }}</strong>
                        </p>
                    @endif

                    @if ($kyc->annual_turnover)
                        <p><strong style="color:#a60c6a;">Annual Turnover:</strong>
                            <strong>{{ $kyc->annual_turnover ?: 'Not Filled' }}</strong>
                        </p>
                    @endif


                    @if ($kyc->age_declaration)
                        <p><strong style="color:#a60c6a;">My Age:</strong>
                            <strong>{{ $kyc->age_declaration ?: 'Not Filled' }}</strong>
                        </p>
                    @endif

                </div>

                <hr>
            @endif




            @if ($kyc->pan_document || $kyc->aadhaar_front_document || $kyc->aadhar_back_document)
                <div class="table-container">

                    <h3>DOCUMENTS</h3>
                    <table>
                        <tr>
                            @if ($kyc->pan_document)
                                <td><img src="{{ url( $kyc->pan_document) }}" alt="PAN Card"></td>
                            @endif

                            @if ($kyc->aadhaar_front_document)
                                <td><img src="{{ url( $kyc->aadhaar_front_document) }}"
                                        alt="Aadhaar Front">
                                </td>
                            @endif

                            @if ($kyc->aadhar_back_document)
                                <td><img src="{{ url( $kyc->aadhar_back_document) }}" alt="Aadhaar Back">
                                </td>
                            @endif


                        </tr>
                        <tr>
                            @if ($kyc->pan_document)
                                <td><b>PAN CARD</b></td>
                            @endif

                            @if ($kyc->aadhaar_front_document)
                                <td><b>AADHAAR FRONT</b></td>
                            @endif

                            @if ($kyc->aadhar_back_document)
                                <td><b>AADHAAR BACK</b></td>
                            @endif
                        </tr>
                    </table>
                </div>
            @endif



            @if ($kyc->is_online)
                <hr>
                <h3>DECLARATION</h3>
                <p>I hereby declare that the details furnished above are true and correct to the best of my
                    knowledge and
                    belief and I undertake to inform you of any changes therein, immediately. In case any of the
                    above
                    information is found to be false or untrue or misleading or misrepresenting, I am aware that I
                    may be
                    held liable for it.</p>
            @endif

            <div class="footer">
                <div>
                    @if ($kyc->signature)
                        <img src="{{ $kyc->signature }}" alt="Signature">
                        <p><b>Signature</b></p>
                    @endif

                </div>
                <div>
                    <p><strong>{{ $kyc->created_at }}</strong></p>
                    <p>Date & Time</p>
                </div>
            </div>
        </div>
    </div>
</body>

</html>
