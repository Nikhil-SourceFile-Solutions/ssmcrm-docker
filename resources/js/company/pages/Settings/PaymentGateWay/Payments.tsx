import React, { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IRootState } from '../../../store';
import Razorpay from './Razorpay';
import Paytm from './Paytm';
import Phonepe from './Phonepe';
import Bank from './Bank';
import PageLoader from '../../../components/Layouts/PageLoader';
import QrCode from './QrCode';
import LeftTab from '../LeftTab';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useAuth } from '../../../AuthContext';

const Payments = () => {
    const dispatch = useDispatch();
    useEffect(() => { dispatch(setPageTitle('Payments')); });
    const { settingData, crmToken, apiUrl } = useAuth()


    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (!crmToken) navigate('/')
        else {
            dispatch(setPageTitle('Payments'));
            fetchPayments()
        }
    }, [crmToken])
    const [tab, setTab] = useState(settingData?.company_type == 0 ? 'Banks' : 'Razorpay');
    const [paymentGateways, setPaymentGateways] = useState([]);

    const fetchPayments = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/payment-gateways",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });
            if (response.data.status == "success") {
                setPaymentGateways(response.data.paymentGateways);
            }

        } catch (error) {

        } finally {
            setIsLoading(false)
        }
    }


    return (
        <div className="flex gap-5 relative  h-full">
            <div className={`panel w-[280px]`}>
                <div className="flex flex-col h-full pb-2">
                    <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
                        <LeftTab />
                    </PerfectScrollbar>
                </div>
            </div>
            <div className="panel p-0 flex-1 overflow-x-hidden h-full">
                <div className="flex flex-col h-full">

                    {isLoading ? <div className="panel h-[calc(100vh-200px)]"><PageLoader /></div> : (
                        <div className='panel'>
                            <div className='flex items-center justify-between mb-5'>
                                <h5 className="font-semibold text-lg dark:text-white-light">Payment Integration</h5>
                                <div className='flex gap-5'>


                                    <button type="button" className={`btn ${tab == "Banks" ? 'btn-dark' : 'btn-primary'} `} onClick={() => setTab('Banks')}>Banks</button>
                                    <button type="button" className={`btn ${tab == "QrCode" ? 'btn-dark' : 'btn-primary'} `} onClick={() => setTab('QrCode')}>Qr Code</button>




                                </div>
                            </div>
                            <hr className="my-4 dark:border-[#191e3a]" />
                            <div className='mb-5 space-y-5'>
                                {tab == 'Paytm' ? <Paytm
                                    paymentGateways={paymentGateways}
                                    setPaymentGateways={setPaymentGateways}
                                />
                                    : tab == 'PhonePe' ? <Phonepe
                                        paymentGateways={paymentGateways}
                                        setPaymentGateways={setPaymentGateways}
                                    />
                                        : tab == 'Banks' ? <Bank />
                                            : tab == 'QrCode' ? <QrCode />

                                                : null}

                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Payments;
