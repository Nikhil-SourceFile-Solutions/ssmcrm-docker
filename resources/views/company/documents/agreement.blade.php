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
        <div style="text-align: center;margin-bottom: 0;margin-top: 10px;"><img
                src="https://{{ tenant('id') }}.{{ env('CRM_URL') }}{{'/storage/'.$settings->logo }}" width="250" alt=""></div>
        <h1 style="text-align: center;margin-bottom: 0;font-size: 25px;">{{ $sebi->company_name }}</h1>
        <p style="text-align: center;margin-bottom: 0;"> <b> SEBI Registered Investment Advisers Registration No.
            {{ $sebi->sebi_no }}
            </b><br>Investment Advisory Services Agreement</p>


        <div style="border: 2px solid #9eb1c140;padding: 15px;margin-top: 15px;">
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
                        <th style="width: 30%;">
                            <p style="text-align: start;margin: 0;">SUBSCRIPTION DETAILS</p>
                        </th>

                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="width: 40%;">
                            <p style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;color: #5b999b;">
                                Name</p>
                            <p style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;">
                                {{ $agreement->full_name }}</p>
                        </td>
                        <td style="width: 30%;">
                            <p style="text-align: start;margin: 0;font-size: 12px;font-weight: bold;color: #5b999b;">
                                Product Name</p>
                            <p style="text-align: start;margin: 0;font-size: 12px;font-weight: bold;">
                                {{ $agreement->product }}
                            </p>
                        </td>
                        <td style="width: 30%;">
                            <p style="text-align: right;margin: 0;font-size: 12px;font-weight: bold;color: #5b999b;">
                                Subscription start
                                date</p>
                            <p style="text-align: right;margin: 0;font-size: 12px;font-weight: bold;">
                                {{ $agreement->start_date }}
                                {{-- ->format('F d Y') --}}
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="width: 40%;">
                            <p style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;color: #5b999b;">
                                Email</p>
                            <p style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;">
                                {{ $agreement->email ? $agreement->email : 'NA' }}</p>
                        </td>
                        <td style="width: 30%;">
                            <p style="text-align: start;margin: 0;font-size: 12px;font-weight: bold;color: #5b999b;">
                                Subscription frequency</p>
                            <p style="text-align: start;margin: 0;font-size: 12px;font-weight: bold;">
                                {{ $agreement->product_duration ? $agreement->product_duration : 'NA' }}</p>
                        </td>
                        <td style="width: 30%;">
                            <p style="text-align: right;margin: 0;font-size: 12px;font-weight: bold;color: #5b999b;">
                                Subscription Type</p>
                            <p style="text-align: right;margin: 0;font-size: 12px;font-weight: bold;">
                                 {{ $agreement->sale_service ? $agreement->sale_service : 'NA' }}</p>
                        </td>
                    </tr>

                    <tr>
                        <td style="width: 40%;">
                            <p style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;color: #5b999b;">PAN
                            </p>
                            <p style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;">
                                {{ $agreement->pan }}</p>
                        </td>
                        <td style="width: 30%;">
                            <p style="text-align: start;margin: 0;font-size: 12px;font-weight: bold;color: #5b999b;">
                                Subscription fee</p>
                            <p style="text-align: start;margin: 0;font-size: 12px;font-weight: bold;">
                                {{ $agreement->client_paid }}
                            </p>
                        </td>

                    </tr>

                    {{-- <tr>
                        <td style="width: 40%;">
                            <p style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;color: #5b999b;">Age
                            </p>
                            <p style="text-align: left;margin: 0;font-size: 12px;font-weight: bold;">
                                {{ $agreement->age() }}
                            </p>
                        </td>

                    </tr> --}}
                </tbody>




            </table>

            <div
                style="width: 100%;
                            margin-top: 10px;
                            border-collapse: separate;
                            border-spacing: 0 1em;border-top: 2px solid;">
                <h2
                    style="margin: 0;
                font-size: 18px;
                margin-top: 15px;
                text-align: center;">
                    Agreement Terms</h2>

                <!--<p style="text-align: left;margin: 10px 0px;font-size: 13px;font-weight: bold;padding: 5px 40px;">-->
                <!--    <span style="font-size: 16px">THIS INVESTMENT ADVISORY SERVICES AGREEMENT</span> (the-->
                <!--    <span style="font-size: 14px">“Agreement”</span> ) is made on-->
                <!--    this …………………..,-->
                <!--</p>-->
                <!--<p style="text-align: center;font-weight: bold;">BETWEEN</p>-->

                <!--<p style="text-align: left;margin: 10px 0px;font-size: 13px;font-weight: bold;padding: 5px 40px;">-->
                <!--    Growthlift Investment Advisories Pvt Ltd, a registered investment advisor with SEBI Registration No.-->
                <!--    INA200014283 having office at office at No 3 Educational Insitution, Jayadeva, Bangalore, Karnataka,-->
                <!--    560078, (hereinafter referred to as the <span style="font-size: 14px;">“INVESTMENT ADVISOR”</span>-->
                <!--    which expression shall-->
                <!--    unless excluded-->
                <!--    by or repugnant to the context, be deemed to include its administrators and permitted assigns) of-->
                <!--    the <span style="font-size: 14px;">FIRST PART</span>-->
                <!--<p style="text-align: center;font-weight: bold;">And</p>-->


                <!--<p style="text-align: left;margin: 10px 0px;font-size: 13px;font-weight: bold;padding: 5px 40px;">-->
                <!--    Mr/Ms. ………................... (Client), a resident of …………… ………………………… ……………(Address of client)-->
                <!--    (hereinafter referred to as the <span style="font-size: 14px;">“CLIENT”</span> which expression-->
                <!--    shall unless it be repugnant-->
                <!--    to the-->
                <!--    context or be deemed to mean and include, its administrators & permitted assigns) of the-->
                <!--    <span style="font-size: 14px;">SECOND-->
                <!--        PART</span>;-->
                <!--</p>-->

                <!--<p style="text-align: left;margin: 10px 0px;font-size: 14px;font-weight: bold;padding: 5px 40px;">-->
                <!--    Both INVESTMENT ADVISOR and the CLIENT shall also hereinafter individually referred to as Party &-->
                <!--    collectively as Parties.-->
                <!--</p>-->


                <!--<p style="text-align: left;margin: 10px 0px;font-size: 13px;font-weight: bold;padding: 5px 40px;">-->
                <!--    Whereas the CLIENT is desirous of availing the advisory services in respect of the analysis of the-->
                <!--    investment portfolio from the Investment Advisor on the terms & conditions as described hereinafter.-->
                <!--</p>-->


                <ol style="
                padding-inline-start: 30px;
            ">
                    <li style="font-weight: bold;font-size: 15px;">
                        <div>
                            APPOINTMENT OF THE INVESTMENT ADVISER:
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    1 In accordance with the applicable laws, client hereby appoints, entirely at his
                                    / her / its risk, the Investment Adviser to provide the required services in
                                    accordance with the terms and conditions of the agreement as mandated under
                                    Regulation19(1)(d) of the Securities and Exchange Board of India (Investment
                                    Advisers) Regulations, 2013.</li>
                            </ul>
                        </div>
                    </li>


                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            CONSENT OF THE CLIENT
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    2.1 “I / We have read and understood the terms and conditions of Investment Advisory
                                    services provided by the Investment Adviser along with the fee structure and
                                    mechanism for charging and payment of fee.”</li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    2.2 “Based on our written request to the Investment Adviser, an opportunity was
                                    provided by the Investment Adviser to ask questions and interact with ‘person(s)
                                    associated with the investment advice”.</li>
                            </ul>
                        </div>
                    </li>



                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            DECLARATION FROM THE INVESTMENT ADVISER
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    3.1 Investment Adviser shall neither render any investment advice nor charge any fee
                                    until the client has signed this agreement.</li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    3.2 Investment Adviser shall not manage funds and securities on behalf of the client
                                    and that it shall only receive such sums of monies from the client as are necessary
                                    to discharge the client’s liability towards fees owed to the Investment Adviser.
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    3.3 Investment Adviser shall not, in the course of performing its services to the
                                    client, hold out any investment advice implying any assured returns or minimum
                                    returns or target return or percentage accuracy or service provision till
                                    achievement of target returns or any other nomenclature that gives the impression to
                                    the client that the investment advice is risk-free and/or not susceptible to market
                                    risks and or that it can generate returns with any level of assurance.
                                </li>
                            </ul>
                        </div>
                    </li>



                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            FEES SPECIFIED UNDER INVESTMENT ADVISER REGULATIONS AND RELEVANT CIRCULARS ISSUED THEREUNDER
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    4.1 Regulation 15 A of the amended IA Regulations provide that Investment Advisers
                                    shall be entitled to charge fees from a client in the manner as specified by SEBI,
                                    accordingly Investment Advisers shall charge fees from the clients in either of the
                                    two modes:
                                    <p style="font-size: 14px">(A) Assets under Advice (AUA) mode </p>

                                    <ol>
                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            a) The maximum fees that may be charged under this mode shall not exceed 2.5
                                            percent of AUA per annum per client across all services offered by IA. </li>

                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            a) b) IA shall charge fees from a client under any one mode i.e. (A) or (B)
                                            on an annual basis. The change of mode shall be effected only after 12
                                            months of on boarding/last change of mode. </li>

                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            c) If agreed by the client, IA may charge fees in advance. However, such
                                            advance shall not exceed fees for 2 quarters. </li>

                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            d) In the event of pre-mature termination of the IA services in terms of
                                            agreement, the client shall be refunded the fees for unexpired period.
                                            However, IA may retain a maximum breakage fee of not greater than one
                                            quarter fee. </li>
                                    </ol>

                                    <p>
                                    <p style="font-size: 14px">(A) Assets under Advice (AUA) mode </p>

                                    <p>The maximum fees that may be charged under this mode shall not exceed INR
                                        1,25,000 per annum per client across all services offered by IA. </p>
                                    </p>
                                </li>


                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    4.2 General conditions under both modes
                                    <ol>
                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            a) In case “family of client” is reckoned as a single client, the fee as
                                            referred above shall be charged per “family of client”.
                                        </li>

                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            b) IA shall charge fees from a client under any one mode i.e. (A) or (B) on
                                            an annual basis. The change of mode shall be effected only after 12 months
                                            of on boarding/last change of mode. </li>

                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            c) If agreed by the client, IA may charge fees in advance. However, such
                                            advance shall not exceed fees for 2 quarters. </li>

                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            d) In the event of pre-mature termination of the IA services in terms of
                                            agreement, the client shall be refunded the fees for unexpired period.
                                            However, IA may retain a maximum breakage fee of not greater than one
                                            quarter fee. </li>


                                    </ol>


                                </li>
                            </ul>
                        </div>
                    </li>







                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            FEES APPLICABLE TO THE CLIENT AND BILLING
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    5.1 Details of Fees to be charged are following:


                                    <ol>
                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            (i) The quantum and manner of payment of fees for investment advice rendered
                                        </li>

                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            (ii) Fee modalities and periodicity, by attaching a detailed fee schedule to
                                            the agreement; </li>

                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            (iii) Illustration(s) on how the fee will be determined; </li>

                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            (iv) whether payment to be made in advance; </li>

                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            (v) type of documents evidencing receipt of payment of fee; </li>

                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            (vi) Periodicity of billing with clear date and service period. </li>
                                    </ol>


                                </li>


                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    5.2 The payment of fees shall be through any mode which shows traceability of funds.
                                    Such modes may include account payee crossed cheque/ Demand Drafts or by way of
                                    direct credit to the bank accounts through NEFT/ RTGS/ IMPS/ UPI or any other mode
                                    specified by SEBI from time to time. However, the fees shall not be in cash.
                                </li>



                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    5.3 Investment Advisor shall receive all considerations by way of remuneration or
                                    compensation or in any other form from the client only and not from any person other
                                    than the client being advised, in respect of the underlying securities or investment
                                    products for which the advice is or to be provided.
                                </li>
                            </ul>
                        </div>
                    </li>






                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            SCOPE OF SERVICE
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    6.1 Investment Advisor may provide some or all of the following services to the
                                    Client:

                                    <ol>
                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            6.1.1 The Services be limited to devising an Investment Plan and advising
                                            the Client with respect to Portfolio strategy and investment and divestment
                                            of Securities and Funds held by the Client, on a non-exclusive basis for an
                                            agreed fee structure as per Clause 5 in the agreement.
                                        </li>

                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            6.1.2 The Investment Advisor’s authority over the Client’s investments shall
                                            only extend to services as described above. The actual investment shall be
                                            undertaken by the Client. </li>

                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            6.1.3 The Client has the sole discretion to decide on whether to act upon
                                            the advice tendered by the Investment Advisor and the Investment Advisor
                                            shall have no power, authority, responsibility or obligation to ensure or
                                            cause the client to act upon the advice tendered by investment advisor
                                            pursuant to this agreement.</li>

                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            6.1.4 The Investment Adviser shall always act in a fiduciary capacity
                                            towards the Client at all times.</li>

                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            6.1.5 Develop investment recommendations based on goals & risk profile and
                                            assist in implementing these recommendations. </li>

                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            6.1.6 Provide advice with respect to the investment in equity, mutual funds,
                                            insurance, commodities and other financial assets, as needed, and assist in
                                            implementing recommendations.</li>

                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            6.1.7 Provide advice and recommendations in any other areas of financial
                                            planning in which Advisor or Client identifies a need.</li>
                                    </ol>


                                </li>


                            </ul>
                        </div>
                    </li>




                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            7. DUTIES & FUNCTIONS OF THE INVESTMENT ADVISER
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    7.1 Investment Advisor shall provide Investment Advisory Services to the Client
                                    during the term of this Agreement on investment in all financial/investment products
                                    under all regulated authorities as is permitted under applicable laws and
                                    regulations governing Investment Advisor & the financial industry. The services
                                    rendered by the Investment Advisor are non-binding non-recourse advisory in nature
                                    and the final decision on the type of instruments; the proportion of exposure and
                                    tenure of the investments shall be taken by the Client at its discretion.
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    7.2 Investment Advisor shall act in a fiduciary capacity as one of the advisors to
                                    the Client with respect to managing its investment-related portfolio holistically &
                                    will be providing all back end supporting services. Investment Advisor shall act in
                                    a bonafide manner for the benefit and in the interest of the Client.
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    7.3 Investment Advisor shall be in compliance with the SEBI (Investment Advisers)
                                    Regulations, 2013 and its amendments, rules, circulars and notifications.
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    7.4 Investment Advisor shall be in compliance with the eligibility criteria as
                                    specified under the IA Regulations at all times.
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    7.5 Pursuant to the SEBI (INVESTMENT ADVISERS) REGULATIONS, 2013 guidelines with
                                    respect to Risk Profiling and Suitability Assessment, Investment Advisor shall
                                    conduct proper risk profiling and risk assessment for each of the clients. As per
                                    risk analysis, risk capacity, risk aversion & client requirement, the Investment
                                    Advisor needs to ensure that correct product/service as per client risk tolerance
                                    capacity is being offered, which is suitable for client.
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    7.6 Investment Advisor shall provide reports to clients on potential and current
                                    investments if requested
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    7.7 Investment Advisor shall maintain client-wise KYC, advice, risk assessment,
                                    analysis reports of investment advice and suitability, terms and conditions
                                    document, rationale of advice, related books of accounts and a register containing
                                    list of clients along with dated investment advice in compliance with the SEBI
                                    (Investment Advisers) Regulations, 2013.
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    7.8 Investment Advisor shall get annual compliance audit conducted as per the SEBI
                                    (Investment Advisers) Regulations, 2013.
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    7.9 Investment Advisor undertakes to abide by the Code of Conduct as specified in
                                    the Third Schedule of the SEBI (Investment Advisers) Regulations, 2013. Investment
                                    Advisor shall not receive any consideration in any form, if the client desires to
                                    avail the services of intermediary recommended by Investment Advisor.
                                </li>
                            </ul>
                        </div>
                    </li>




                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            INVESTMENT OBJECTIVE AND GUIDELINES
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    8.1 Investment Advisor would provide investment advice with respect to investment in
                                    equity, mutual funds, insurance, commodities and other financial assets, as needed.
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    8.2 Investment Advisor undertakes to recommend direct implementation of advice i.e.
                                    through direct schemes/ direct codes, and other client specifications / restrictions
                                    on investments, if any.
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    8.3 Investment Advisor shall provide investment advice based on the risk profiling
                                    conducted for the client, total budgeted investment amount of the client and time
                                    period for deployment as informed by the client
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    8.4 Investment Advisor shall communicate the tax related aspects pertaining to
                                    investment advice and as applicable on the investment adviser’s fee, if any.
                                </li>


                            </ul>
                        </div>
                    </li>


                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            RISK FACTORS
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    9.1 Investments in securities are subject to market risks and there is no assurance
                                    or guarantee that the objective of the investments will be achieved;
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    9.2 Past performance of the investment adviser does not indicate its future
                                    performance.
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    9.3 The performance of the investments/products may be affected by changes in
                                    Government policies, general levels of interest rates and risks associated with
                                    trading volumes, liquidity and settlement systems in equity and debt markets.
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    9.4 Investments in the products which the Clients have opted are subject to wide
                                    range of risks which inter alia also include but not limited to economic slowdown,
                                    volatility & illiquidity of the stocks, poor corporate performance, economic
                                    policies, changes of Government and its policies, acts of God, acts of war, civil
                                    disturbance, sovereign action and /or such other acts/ circumstance beyond the
                                    control of Investment Advisor or any of its Associates.
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    9.5 The names of the products/nature of investments do not in any manner indicate
                                    their prospects or returns. The performance in the equity may be adversely affected
                                    by the performance of individual companies, changes in the market place and industry
                                    specific and macro-economic factors.
                                </li>



                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    9.6 Investments in debt instruments and other fixed income securities are subject to
                                    default risk, liquidity risk and interest rate risk. Interest rate risk results from
                                    changes in demand and supply for money and other macroeconomic factors and creates
                                    price changes in the value of the debt instruments.
                                </li>

                            </ul>
                        </div>
                    </li>


                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            VALIDITY OF ADVISORY SERVICES
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    10.1 The validity of this agreement starts from the date of signing and will
                                    continue to be in force till any of the parties terminate it by giving 1 months’
                                    notice period.
                                </li>
                            </ul>
                        </div>
                    </li>


                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            AMENDMENTS
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    11.1 The Investment Adviser and the client shall be entitled to make amendments to
                                    this agreement after mutual agreement. This Agreement may be amended or revised only
                                    by an instrument endorsed by the Client and by Investment Advisor.
                                </li>
                            </ul>
                        </div>
                    </li>


                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            TERMINATION
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    12.1 This Agreement may be terminated under the following circumstances, namely-

                                    <ol>
                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            (a) Voluntary / mandatory termination by the Investment Adviser.
                                        </li>
                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            (b) Voluntary / mandatory termination by the client.
                                        </li>
                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            (c) Suspension/Cancellation of registration of Investment Adviser by SEBI.
                                        </li>
                                        <li
                                            style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                            (d) Any other action taken by other regulatory body/ Government authority.
                                        </li>
                                    </ol>


                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    12.2 In case of a voluntary termination of the agreement, the client would be
                                    required to give a 30 days prior written notice while the Investment Adviser would
                                    be required to give a 30 days prior written notice.
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    12.3 In case of suspension of the certificate of registration of the IA, the client
                                    may terminate the agreement.
                                </li>
                            </ul>
                        </div>
                    </li>

                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            IMPLICATIONS OF AMENDMENTS AND TERMINATION
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    13.1 Notwithstanding any such termination, all rights, liabilities and obligations
                                    of the parties arising out of or in respect of transactions entered into prior to
                                    the termination of this relationship shall continue to subsist and vest in/be
                                    binding on the respective parties or his/its respective heirs, executors,
                                    administrators, legal representatives or successors, as the case may be;
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    13.2 In case the clients are not satisfied with the services being provided by the
                                    investment adviser and want to terminate/ stop Investment Advisory services or the
                                    investor adviser is unable to provide Investment Advisory services, either party
                                    shall have a right to terminate Investment Advisory relationship at any time subject
                                    to refund of advisory fee after deducting one quarters fee as breakage fee in case
                                    termination is initiated by the clients and refund of the proportionate advisory fee
                                    in case termination is initiated by Investment Adviser.
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    13.3 The Investment Advisor would provide transition support, if requested, to the
                                    client in the event of termination
                                </li>
                            </ul>
                        </div>
                    </li>


                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            RELATIONSHIP WITH RELATED PARTIES
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    14.1 Investment Adviser is carrying on its activities independently, at an
                                    arms-length basis from all other activities
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    14.2 Investment Advisor does not have any conflict of interest of the investment
                                    advisory activities with its relationship with related parties, such conflict of
                                    interest shall be disclosed to the client as and when they arise.
                                </li>

                            </ul>
                        </div>
                    </li>

                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            INVESTMENT ADVISER ENGAGED IN OTHER ACTIVITIES
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    15.1 Investment Adviser maintains an arms-length relationship between its activities
                                    as an investment adviser and other activities and shall ensure that this arm’s
                                    length relationship would be maintained throughout the tenure of advisory service
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    15.2 Investment Adviser shall not provide any distribution services, for securities
                                    and investment products, either directly or through their group to an advisory
                                    client.
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    15.3 Investment Adviser shall not provide investment advisory services, for
                                    securities and investment products, either directly or through their group to the
                                    distribution client;
                                </li>

                            </ul>
                        </div>
                    </li>


                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            REPRESENTATION TO CLIENT
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    16.1 Investment Advisor shall ensure that it will take all consents and permissions
                                    from the client prior to undertaking any actions in relation to the securities or
                                    investment product advised by the investment adviser.
                                </li>
                            </ul>
                        </div>
                    </li>


                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            NO RIGHT TO SEEK POWER OF ATTORNEY
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    17.1 The Investment Adviser shall not seek any power of attorney or authorizations
                                    from its clients for implementation of investment advice.
                                </li>
                            </ul>
                        </div>
                    </li>


                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            NO CONFLICT OF INTEREST
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    18.1 Investment Advisor does not have any conflict of interest of the investment
                                    advisory activities, such conflict of interest shall be disclosed to the client as
                                    and when they arise.
                                </li>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    18.2 Investment adviser shall not derive any direct or indirect benefit out of the
                                    client’s securities/investment products.
                                </li>
                            </ul>
                        </div>
                    </li>

                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            MAINTENANCE OF ACCOUNTS AND CONFIDENTIALITY
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    19.1 Investment Advisor shall be responsible for maintenance of client accounts and
                                    data as mandated under the SEBI (Investment Advisers) Regulations, 2013
                                </li>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    19.2 Investment Advisor shall not divulge any confidential information about its
                                    client, which has come to its knowledge, without taking prior permission of its
                                    client, except where such disclosures are required to be made in compliance with any
                                    law for the time being in force
                                </li>
                            </ul>
                        </div>
                    </li>


                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            LIABILITY OF INVESTMENT ADVISER
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    20.1 Investment Adviser shall not incur any liability by reason of any loss, which a
                                    client may suffer by reason of any depletion in the value of the assets under
                                    advice, which may result by reason of fluctuation in asset value, or by reason of
                                    non-performance or under-performance of the securities/funds or any other market
                                    conditions.
                                </li>

                            </ul>
                        </div>
                    </li>

                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            REPRESENTATIONS AND COVENANTS:
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    21.1 Investment Advisor is registered with SEBI as Investment Advisor with
                                    Registration No. INA200014283. The investment adviser got its registration on
                                    12:00:00 AM and is engaged in advisory services as approved under SEBI (Investment
                                    Advisers) Regulations, 2013.
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    21.2 Investment Adviser shall ensure that the adviser, principal officer and persons
                                    associated with the investment advice, maintains the qualification and certification
                                    throughout the validity of advisory service.
                                </li>

                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    21.3 Investment Adviser shall ensure that the approvals and consents as mentioned in
                                    clause 21.1 & 21.2 remains valid throughout the advisory service.
                                </li>
                            </ul>
                        </div>
                    </li>


                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            DEATH OR DISABILITY OF CLIENT:
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    22.1 The death or incapacity of the Client shall not terminate the authority of
                                    Investment Adviser granted herein until Investment Adviser receives actual notice of
                                    such death or incapacity. Upon such notice client’s executor, guardian, successor,
                                    nominee, attorney-in-fact or other authorized representative must engage Investment
                                    Adviser in order to continue to service client’s accounts.
                                </li>


                            </ul>
                        </div>
                    </li>

                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            SETTLEMENT OF DISPUTES AND PROVISION FOR ARBITRATION
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    23.1 No suit, prosecution or other legal proceeding shall lie against the Investment
                                    adviser for any damage caused or likely to be caused by anything which is done in
                                    good faith or intended to be done under the provisions of the Securities and
                                    Exchange Board of India (Investment Advisers) Regulations, 2013.
                                </li>


                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    23.2 This Agreement is subject to the rules and regulations as are or may be framed/
                                    issued by the Central Government, the Reserve Bank of lndia (RBI), SEBI and/or any
                                    other competent authority, from time to time
                                </li>


                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    23.3 All disputes, differences, claims and questions whatsoever arising from this
                                    Agreement between the Client and Investment Advisor and/or their respective
                                    representatives touching these presents shall be in accordance with and subject to
                                    the provisions of The Arbitration and Conciliation Act, 1996, or any statutory
                                    modification or re-enactment thereof for the time being in force. Such Arbitration
                                    proceedings shall be held at Bangalore and the language of Arbitration will be
                                    English.
                                </li>

                            </ul>
                        </div>
                    </li>

                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            ADHERENCE TO GRIEVANCE REDRESSAL TIMELINES
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    24.1 Investment Adviser shall be responsible to resolve the grievances within the
                                    timelines specified under SEBI circulars.
                                </li>

                            </ul>
                        </div>
                    </li>


                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            SEVERABILITY
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    25.1 If any provision of this Agreement shall be held or made invalid by a court
                                    decision, statute, rule or otherwise, the remainder of this Agreement shall not be
                                    affected thereby
                                </li>

                            </ul>
                        </div>
                    </li>

                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            FORCE MAJEURE
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    26.1 The Investment Adviser shall not be liable for delays or errors occurring by
                                    reason of circumstances beyond its control, including but not limited to acts of
                                    civil or military authority, national emergencies, work stoppages, fire, flood,
                                    catastrophe, acts of God, insurrection, war, riot, or failure of communication or
                                    power supply
                                </li>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    26.2 In the event of equipment breakdowns beyond its control, the Investment Advisor
                                    shall take reasonable steps to minimize service interruptions but shall have no
                                    liability with respect thereto
                                </li>
                            </ul>
                        </div>
                    </li>

                    <li style="font-weight: bold;font-size: 15px;margin-top: 15px;">
                        <div>
                            MISCELLANEOUS
                            <ul>
                                <li style="text-align: left;font-size: 13px;font-weight: bold;padding: 5px 0px;">
                                    27.1 Each party agrees to perform such further actions and execute such further
                                    agreements as are necessary to effectuate the purposes hereof
                                </li>

                            </ul>
                        </div>
                    </li>




                </ol>

                <p>Agreed and Accepted</p>
                <table style="width: 100%;">
                    <thead>
                        <tr>
                            <th>E-Sign by Aadhar</th>
                            <th>----</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="text-align: center;">Client Signature(s)</td>
                            <td style="text-align: center;">Mr.Balaji <br>For Growthlift Investment Advisories Pvt Ltd
                            </td>
                        </tr>
                    </tbody>
                </table>

                <p>Date:</p>
            </div>

            <div
                style="text-align: center;padding: 5px;
            border: 2px solid;margin: 0px 30px;border-color: #5f9ea059;">
                <h3 style="font-size: 30px; margin-bottom: 0px;margin-top: 5px;">Growthlift Investment Advisories Pvt
                    Ltd</h3>
                <p style="font-size: 15px;font-weight: bold;padding: 0px;margin: 3px;color: #626262;">SEBI Registered
                    Investment
                    Advisers
                    Registration No. INA200014283 </p>
                <p style="font-size: 15px;font-weight: bold;padding: 0px;margin: 3px;color: #626262;">(Type of
                    Registration-
                    Non-Individual,
                    Validity of Registration- Perpetual)</p>
                <p style="font-size: 15px;font-weight: bold;padding: 0px;margin: 3px;color: #626262;">Address: No 3
                    Educational
                    Insitution,
                    Jayadeva, Bangalore, Karnataka, 560078</p>
                <p style="font-size: 15px;font-weight: bold;padding: 0px;margin: 3px;color: #626262;">Contact No: 91
                    63634 79682,
                    Email:
                    support@growthlift.co.in</p>
                <p style="font-size: 15px;font-weight: bold;padding: 0px;margin: 3px;color: #626262;">SEBI
                    regional/local office
                    address - Jeevan
                    Mangal Building, Hayes Rd, off, Residency Rd
                </p>
                <p style="font-size: 15px;font-weight: bold;padding: 0px;margin: 3px;color: #626262;">Shanthala Nagar,
                    Ashok Nagar,
                    Bengaluru,
                    Karnataka
                    560025</p>
                <p style="font-size: 15px;font-weight: bold;padding: 0px;margin: 3px;color: #626262;">Principal
                    Officer: Mr.Balaji,
                    Contact No: 91
                    63634 79682, Email: support@growthlift.co.in</p>
            </div>

        </div>



    </page>

</html>
