import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import 'flatpickr/dist/flatpickr.css';
import axios from 'axios';
import { toWords } from 'number-to-words';
import { useAuth } from '../../../AuthContext';
import PageLoader from '../../../components/Layouts/PageLoader';

export default function ViewInvoice({ saleId, invoiceSetting, showInvoiceViewDrawer, setInvoiceViewShowDrawer }: any) {

    const { settingData, crmToken, apiUrl, logout } = useAuth();

    useEffect(() => {
        if (showInvoiceViewDrawer && saleId) fetchInvoice()
    }, [saleId, showInvoiceViewDrawer])


    const [data, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchInvoice = async () => {
        setIsLoading(true)
        setData([])
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/sale-invoices/" + saleId,

                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") {
                setData(response.data.data)
            }



        } catch (error) {

            console.log(error)
            if (error?.response?.status == 401) logout()
        } finally {
            setIsLoading(false)
        }
    }



    const capitalizeWords = (str) => {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    };



    const digitsToworld = (amount) => {
        if (amount && amount <= 10000000) {
            const wordsResult = toWords(amount);
            const capitalizedWords = capitalizeWords(wordsResult);
            return capitalizedWords;
        }
    }


    const [isDownloading, setIsDownloading] = useState(false);

    const downloadInvoice = async () => {

        setIsDownloading(true)
        try {

            const response = await
                axios({
                    url: apiUrl + '/api/download-invoice',
                    method: 'GET',
                    params: { id: data?.invoice?.sale_id },
                    responseType: 'blob',
                    headers: {
                        Authorization: 'Bearer ' + crmToken,
                    }
                }).then((response) => {
                    const href = URL.createObjectURL(response.data);
                    const link = document.createElement('a');
                    link.href = href;
                    link.setAttribute('download', 'invoice-' + data.invoice.invoice_id + '.pdf');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(href);
                });
            console.log(response)

        } catch (error) {
            if (error?.response?.status == 401) logout()
        } finally {
            setIsDownloading(false)
        }
    }



    return (
        <div>
            <div className={`${(showInvoiceViewDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setInvoiceViewShowDrawer(false)}></div>

            <nav className={`${(showInvoiceViewDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                } bg-white fixed ltr:-right-[900px] rtl:-left-[900px] top-0 bottom-0 w-full max-w-[900px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4`}
            >

                {isLoading ? <PageLoader /> : (
                    <div className="flex flex-col h-screen overflow-hidden">

                        <div className="w-full text-center">
                            <div className="p-1 flex sm:flex-row flex-col w-full sm:items-center gap-4">
                                <div className="ltr:mr-3 rtl:ml-3 flex items-center">
                                    <h5 className="font-semibold text-lg dark:text-white-light">View Invoice</h5>
                                </div>
                                <div className="flex items-center justify-center sm:justify-end sm:flex-auto flex-1">

                                    <button onClick={() =>
                                        downloadInvoice()

                                    } disabled={isDownloading} className='btn btn-success mr-[15px] btn-sm'>{isDownloading ? 'Please Wait' : 'Download'}</button>

                                </div>
                            </div>
                            <hr className="my-4 dark:border-[#191e3a]" />
                        </div>
                        <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar">
                            <div className="panel  border mb-10">
                                <div className="flex justify-between flex-wrap gap-4">
                                    <div>
                                        <div className="text-2xl font-semibold uppercase">Invoice <span className='text-[16px]'>
                                            {data.invoice.invoice_id}
                                        </span></div>
                                        <div>Date:{data?.invoice?.sale_date}</div>
                                    </div>

                                    <div className="shrink-0">
                                        <img src={`${apiUrl}/storage/${settingData?.logo}`} alt="img" className="w-[200px] ltr:ml-auto rtl:mr-auto" />
                                    </div>
                                </div>
                                <div className="gap-4">
                                    <div className="ltr:text-left rtl:text-right">
                                        <div className="space-y-1 mt-6 text-dark dark:text-[#d0d2d6] ">
                                            <div>Issue For: {data?.invoice?.first_name} {data?.invoice?.last_name}</div>
                                            {data?.invoice?.address_one && <div>{data?.invoice?.address_one}</div>}
                                            <div>{data?.invoice?.address_two}</div>
                                            <div>{data?.invoice?.email}</div>
                                            <div>+91 {data?.invoice?.phone}</div>
                                            {data?.invoice?.gst_no && <div>GST: {data?.invoice?.gst_no}</div>}
                                        </div>
                                    </div>
                                    <div className="ltr:text-right rtl:text-left">
                                        <div className="space-y-1 mt-6 text-dark dark:text-[#d0d2d6]">
                                            <div>{invoiceSetting?.company_name}</div>
                                            <div>{invoiceSetting?.address}</div>
                                            <div>{invoiceSetting?.email}</div>
                                            <div> {invoiceSetting?.phone}</div>
                                            {invoiceSetting?.gst_no && <div>GSTIN : {invoiceSetting?.gst_no}</div>}
                                            {invoiceSetting?.sebi_no && <div>GSTIN : {invoiceSetting?.sebi_no}</div>}
                                        </div>
                                    </div>
                                </div>
                                <hr className="border-white-light dark:border-[#1b2e4b] my-6" />
                                <div className="table-responsive mt-6">
                                    <table className="table-striped">
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
                                            <tr >
                                                <td>1</td>
                                                <td>{data?.invoice?.product}</td>
                                                <td >
                                                    {data?.invoice?.sale_service ? JSON.parse(data?.invoice?.sale_service).map((item, index) => (
                                                        <span key={index} className='badge ml-2  badge-outline-primary'>
                                                            {item}
                                                        </span>
                                                    )) : null}
                                                </td>
                                                <td>{data?.invoice?.sale_date} <br />{data?.invoice?.due_date}</td>
                                                <td >{Number(data?.invoice?.client_paid).toFixed(2)}</td>
                                                <td >{data?.invoice?.inclusive_gst}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="grid sm:grid-cols-2 grid-cols-1 px-4 mt-6">
                                    <div></div>
                                    <div className="ltr:text-right rtl:text-left space-y-2">
                                        <div className="flex items-center">
                                            <div className="flex-1">Sub Total</div>
                                            <div className="w-[37%]">{Number(data?.invoice?.inclusive_gst).toFixed(2)}</div>
                                        </div>



                                        <div className="flex items-center font-semibold text-lg">
                                            <div className="flex-1">Grand Total</div>
                                            <div className="w-[37%]">{(Number(data?.invoice?.client_paid)).toFixed(2)}</div>
                                        </div>

                                        <div className=' float-right' >
                                            <div className=""><b>In Words </b>({digitsToworld(data?.invoice?.client_paid)} Only)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </nav>
        </div>
    )
}
