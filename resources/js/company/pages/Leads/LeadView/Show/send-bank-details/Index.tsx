import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { IoCloseSharp } from 'react-icons/io5'
import { useAuth } from '../../../../../AuthContext';
import PageLoader from '../../../../../components/Layouts/PageLoader';
import { NavLink } from 'react-router-dom';
import WhatsApp from './WhatsApp';
import Sms from './Sms';

export default function Index({ bankModel, setBankModel, lead_id }) {

    const {crmToken, apiUrl} = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState([]);
    const [fetchingError, setFetchingError] = useState<any>(null);

    const fetchBankDetailsData = async () => {
        setIsLoading(true)
        setFetchingError(null)
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + '/api/get-send-babk-details-data',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setData(response.data.data);
            }
        } catch (error) {
            if (error?.response?.status) setFetchingError(error?.response)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (bankModel) fetchBankDetailsData();
    }, [bankModel]);

    const [tab, setTab] = useState<any>('whatsapp');

    return (
        <div>
            <div className={`${(bankModel && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setBankModel(false)}></div>

            <nav
                className={`${(bankModel && 'ltr:!right-0 rtl:!left-0') || ''
                    } bg-white fixed ltr:-right-[750px] rtl:-left-[750px] top-0 bottom-0 w-full max-w-[750px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black `}
            >
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className="w-full text-center  p-4 bg-[#3b3f5c] text-white rounded-b-md">
                        <button type="button" className="px-4 py-4 absolute top-0 ltr:right-0 rtl:left-0  dark:text-white" onClick={() => setBankModel(false)}>
                            <IoCloseSharp className=" w-5 h-5" color='white' />
                        </button>
                        <h3 className="mb-1 dark:text-white font-bold text-[18px]">Send Bank Details</h3>
                    </div>
                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">


                        {isLoading ? (
                            <PageLoader />
                        ) : fetchingError ? (
                            <Error e={fetchingError} fetchSales={fetchBankDetailsData} />
                        ) : (
                            <>
                                {Array.isArray(data?.whatsAppTemplates) ? (
                                    <>
                                        {data.whatsAppTemplates.length > 0 ? (
                                            <div className="mx-4">

                                                <div className='flex gap-4 justify-end'>
                                                    <button
                                                        className={`${tab == "whatsapp" && 'text-secondary !outline-none before:!w-full'}
                            before:inline-block' relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`}
                                                        onClick={() => setTab('whatsapp')} type='button'>
                                                        Whatsapp
                                                    </button>
                                                    <button
                                                        className={`${tab == "sms" && 'text-secondary !outline-none before:!w-full'}
                            before:inline-block' relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`}
                                                        onClick={() => setTab('sms')}
                                                        type='button'
                                                    >
                                                        SMS
                                                    </button>

                                                </div>
                                                {tab === "whatsapp" ? <WhatsApp lead_id={lead_id} templates={data.whatsAppTemplates} payments={data?.payments} setBankModel={setBankModel} /> :
                                                    tab === "sms" ? <Sms lead_id={lead_id} templates={data.smsTemplates} payments={data?.payments} setBankModel={setBankModel} /> : null}
                                            </div>
                                        ) : (
                                            <div>No template found</div>
                                        )}
                                    </>
                                ) : (
                                    <div>No template found</div>
                                )}
                            </>
                        )}

                    </section>

                </div>
            </nav>
        </div>
    )
}


const Error = ({ e, fetchSales }: any) => {

    console.log(e)

    return (<div className="">
        <div className="relative">

            <div className='text-center '>
                <b className='text-3xl'>{e.status}</b>
                <p className="mt-5 text-bold text-base dark:text-white text-center">{e.statusText}</p>
            </div>
            <div className='flex justify-center gap-5'>
                <NavLink to="/" className="btn btn-gradient !mt-7  border-0 uppercase shadow-none">
                    Back to Home
                </NavLink>

                <button className='btn btn-info  !mt-7  border-0 uppercase shadow-none' onClick={() => fetchSales()}>
                    Re Try
                </button>
            </div>
        </div>
    </div>)

}
