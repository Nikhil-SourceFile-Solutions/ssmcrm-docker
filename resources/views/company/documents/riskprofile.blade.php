<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Document</title>

    <style>
        page {

            display: block;
            margin: 0;
            font-family: sans-serif;
        }


        .page-break {
            page-break-after: always;
        }

        page[size="A4"] {
            /* width: 21cm; */
            height: 26;
        }

        @media print {

            body,
            page {
                margin: 0;
                box-shadow: 0;

            }
        }

        @page {
            margin: 0px;

        }
    </style>
</head>

<body>
    <page size="A4" style="padding: 25px">
        <h1 style="text-align: center;margin: 0;font-size: 25px;">Investment Adviser Risk Profile</h1>
        <p style="text-align: center;margin-bottom: 0;"> <b> {{ $riskprofile->created_at }}
            </b></p>
        <div style="text-align: center;margin-bottom: 0;margin-top: 10px;"><img
               
                src="https://{{ tenant('id') }}.{{ env('CRM_URL') }}{{'/storage/'.$settings->logo }}"
                
                width="250" alt=""></div>
                
                

        <div style="border: 2px solid #9eb1c140;padding: 15px;margin-top: 25px;">
            <h2 style="margin: 0;font-size: 16px;">ADVISER DETAILS</h2>
            <table style="width: 100%;margin-top: 10px;">
                <tbody>
                    <tr>
                        <td style="width: 40%;">
                            <p style="text-align: left;margin: 0;font-size: 12px;color: #5b999b;font-weight: bold;">Name
                            </p>
                        </td>
                        <td style="width: 30%;">
                            <p style="text-align: start;margin: 0;font-size: 12px;color: #5b999b;font-weight: bold;">
                                Email</p>
                        </td>
                        <td style="width: 30%;">
                            <p style="text-align: right;margin: 0;font-size: 12px;color: #5b999b;font-weight: bold;">
                                SEBI Registration</p>
                        </td>
                    </tr>
                </tbody>
                <tbody>
                    <tr>
                        <td style="width: 40%;">
                            <p style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;">
                                {{ $sebi->company_name }}
                            </p>
                        </td>
                        <td style="width: 30%;">
                            <p style="text-align: start;margin: 0;font-size: 12px;font-weight: bold;">
                                {{ $sebi->email }}</p>
                        </td>
                        <td style="width: 30%;">
                            <p style="text-align: right;margin: 0;font-size: 12px;font-weight: bold;">
                                {{ $sebi->sebi_no }}</p>
                        </td>
                    </tr>
                </tbody>

            </table>

            <table
                style="width: 100%;
                            margin-top: 10px;
                            border-collapse: separate;
                            border-spacing: 0 1em;border-top: 2px solid;">
                <thead>
                    <tr>
                        <th style="width: 40%;">
                            <p style="text-align: left;margin: 0;">CLIENT DETAILS </p>
                        </th>


                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="width: 40%;">
                            <p style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;color: #5b999b;">
                                Name</p>
                            <p style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;">
                                {{ $riskprofile->full_name }}</p>
                        </td>
                        <td style="width: 30%;">
                            <p style="text-align: start;margin: 0;font-size: 12px;font-weight: bold;color: #5b999b;">
                                Phone</p>
                            <p style="text-align: start;margin: 0;font-size: 12px;font-weight: bold;">
                                {{ $riskprofile->phone }}</p>
                        </td>
                        <td style="width: 30%;">
                            <p style="text-align: right;margin: 0;font-size: 12px;font-weight: bold;color: #5b999b;">
                                Email</p>
                            <p style="text-align: right;margin: 0;font-size: 12px;font-weight: bold;">
                                {{ $riskprofile->email ? $riskprofile->email : 'NA' }}</p>
                        </td>
                    </tr>

                    <tr>
                        <td style="width: 40%;">
                            <p style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;color: #5b999b;">
                                Pan</p>
                            <p style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;">
                                {{ $riskprofile->pan }}</p>
                        </td>
                        <td style="width: 30%;">
                            <p style="text-align: start;margin: 0;font-size: 12px;font-weight: bold;color: #5b999b;">
                                DOB</p>
                            <p style="text-align: start;margin: 0;font-size: 12px;font-weight: bold;">
                                {{ $riskprofile->dob }}

                            </p>
                        </td>
                        <td style="width: 30%;">
                            <p style="text-align: right;margin: 0;font-size: 12px;font-weight: bold;color: #5b999b;">
                                Age</p>
                            <p style="text-align: right;margin: 0;font-size: 12px;font-weight: bold;">
                                {{ $riskprofile->dob ? $riskprofile->dob : 'NA' }}
                            </p>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div
                style="width: 100%;
                            margin-top: 10px;
                            border-collapse: separate;
                            border-spacing: 0 1em;border-top: 2px solid;height:600px">
                <h2 style="margin: 0;font-size: 16px;margin-top: 15px;">Risk Profile</h2>


              



                @foreach ($answers as $index => $answer)
                    <div style="margin: 10px 0px;">
                        <p style="text-align: left;margin: 5px 0px;font-size: 12px;font-weight: bold;color: #5b999b;">
                            {{ $index + 1 }}. {{ $answer->question }}
                        </p>

                        <p style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;">
                            &nbsp;&nbsp;&nbsp;&nbsp;Answer: {{ $answer->option->option }}
                        </p>
                    </div>
                @endforeach


                <h2 style="margin: 0;font-size: 16px;margin-top: 15px;">Risk Assessment</h2>

                <table style="width: 100%;margin-top: 10px;">
                    <tbody>
                        <tr>
                            <td style="width: 40%;">
                                <p style="text-align: left;margin: 0;font-size: 12px;color: #5b999b;font-weight: bold;">
                                    Your Risk
                                </p>
                            </td>
                            <td style="width: 30%;">
                                <p
                                    style="text-align: start;margin: 0;font-size: 12px;color: #5b999b;font-weight: bold;">
                                    Score</p>
                            </td>

                        </tr>
                    </tbody>
                    <tbody>
                        <tr>
                            <td style="width: 40%;">
                                <img 
                              
                                 src="https://{{ tenant('id') }}.{{ env('CRM_URL') }}{{'/storage/'.$risk_assessment->risk_image }}"
                                style="width: 200px"
                                    alt="{{ $risk_assessment->risk_name }}">

                            </td>
                            <td style="width: 30%;">
                                <p style="text-align: start;margin: 0;font-size: 50px;font-weight: bold;">
                                    {{ $riskprofile->score }}
                                </p>
                            </td>

                        </tr>
                    </tbody>

                </table>
            </div>

        </div>
        <div class="page-break"></div>
        <div style="border: 2px solid #9eb1c140;padding: 15px;margin-top: 15px;">
            <div style="padding: 15px;">
                <div style="width: 100%;
               ">
                    <h2 style="margin: 10px 0px;font-size: 12px;font-weight: bold;color: #5b999b;">Description:-
                    </h2>
                    <p style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;">
                        {{ $risk_assessment->description }} </p>


                    <h2 style="margin: 10px 0px;font-size: 12px;font-weight: bold;color: #5b999b;">Suitable Asset
                        Allocation:-
                    </h2>
                    <p style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;">
                        {{ $risk_assessment->allocation }}
                    </p>
                </div>
            </div>


            <div style="padding: 15px;">
                <div style="width: 100%;

               ">
                    <h2 style="margin: 0;font-size: 14px;margin-top: 15px;">PRODUCT SUITABILITY GUIDELINES</h2>

                    <p style="text-align: left;margin: 10px 0px;font-size: 12px;font-weight: bold;font-weight: bold;">
                        The suitability of an
                        investment for a particular person is at the very heart of the investment
                        process. This is a fundamental concept both from a legal perspective and in terms of putting an
                        investor's money to work sensibly and prudently. When money is invested unsuitably, there is a
                        high probability of unacceptable losses (or equally negative, very low returns) and considerable
                        distress for the investor.</p>

                    <p style="text-align: left;margin: 10px 0px;font-size: 12px;font-weight: bold;">A suitable
                        investment is
                        defined as one that is appropriate in terms of an investor's willingness and ability (personal
                        circumstances) to take on a certain level of risk. Both criteria must be met. If an investment
                        is to be suitable, it is not enough to state that an investor is risk friendly. They must also
                        be in a financial position to take certain chances. It is also necessary to understand the
                        nature of the risks and the possible consequences.</p>
                    <p style="text-align: left;margin: 10px 0px;font-size: 12px;font-weight: bold;">
                        Suitability is constantly in flux. As indicated above, what is suitable for someone who is 30
                        years old is very different from what that person will need when they are 60. Getting married,
                        having children, getting a big raise, or losing a job altogether should prompt a reconsideration
                        of suitability. As usual, this boils down to risk and liquidity. If someone will need their
                        money soon, it may not be able to be tied up in stocks or other longer-term investments. For
                        those who want to get the best out of their money over the long run, something like government
                        bonds might be suitable.</p>

                    <h2 style="margin: 0;font-size: 14px;margin-top: 15px;">Risk Profile Suitability</h2>

                    <p style="text-align: left;margin: 10px 0px;font-size: 12px;font-weight: bold;">
                        Based on the risk profile questionnaire it is observed that your Risk Score is <span
                            style="font-size: 14px;color: brown;">
                            {{ $riskprofile->score }}</span>, which fall
                        under <span style="font-size: 14px;color: brown;">
                            {{ $risk_assessment->risk_name }}
                        </span>
                        category. Based on the risk profile, recommended
                        asset allocation is mentioned in
                        the table above and the same has been explained and communicated to you. </p>

                    <p style="text-align: left;margin: 10px 0px;font-size: 12px;font-weight: bold;">
                        As per the discussion the investible corpus of the client is currently invested in different
                        asset classes and want us to advise on the portion of assets invested in Equity/ Equity
                        derivatives. Accordingly, the client is on-boarded for advisory service with respect to the
                        portion of assets invested in Equity/ Equity derivatives.</p>

                    <h2 style="margin: 0;font-size: 14px;margin-top: 15px;">Client’s Declaration - Suitability
                        Assessment</h2>
                    <p style="text-align: left;margin: 10px 0px;font-size: 12px;font-weight: bold;">
                        The client declares -</p>
                    <div>
                        <ul>
                            <li>
                                <p style="text-align: left;margin: 10px 0px;font-size: 12px;font-weight: bold;">
                                    Investment
                                    Advisor has communicated to me the Risk appetite score as calculated
                                    from the risk profile questionnaire. The risk score and corresponding appetite has
                                    been explained to me by the Investment advisor. I understand the risks involved with
                                    the investment based on the advice provided by the investment advisor. </p>
                            </li>

                            <li style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;">
                                <p>I have all the information about the products, risk factors etc and have gone
                                    through all the relevant information about the product being advised and have sought
                                    requisite clarification about the same.
                                </p>
                            </li>

                            <li style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;">
                                <p>I intend to subscribe to the services, as offered by the investment advisor after
                                    understanding all the risk factors and my risk appetite.</p>
                            </li>

                            <li style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;">
                                <p>I intend to subscribe to the services, as offered by the investment advisor after
                                    understanding all the risk factors and my risk appetite.</p>
                            </li>

                            <li style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;">
                                <p>I intend to subscribe to the services, as offered by the investment advisor after
                                    understanding all the risk factors and my risk appetite.</p>
                            </li>

                            <li style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;">
                                <p>The Investment adviser will not be held responsible for any direct or indirect
                                    losses due to execution of advice.</p>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>

    </page>

</html>
