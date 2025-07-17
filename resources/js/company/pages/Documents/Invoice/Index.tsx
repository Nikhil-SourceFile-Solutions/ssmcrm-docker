import { DataTable } from 'mantine-datatable';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import axios from 'axios';
import ViewInvoice from './ViewInvoice';
import { useAuth } from '../../../AuthContext';
import { IoSearchSharp } from 'react-icons/io5';
import { IoMdRefresh } from 'react-icons/io';
import SendInvoiceModel from './SendInvoiceModel';
import { IoEye } from "react-icons/io5";
import { FaDownload } from "react-icons/fa";
import { FaShareNodes } from "react-icons/fa6";
import { AiOutlineReload } from "react-icons/ai";
export default function Index() {
    const dispatch = useDispatch();
    useEffect(() => { dispatch(setPageTitle('Invoice Report')); });

    const { crmToken, apiUrl, logout } = useAuth()
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [data, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(false)


    const fetchInvoice = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/get-invoice",
                params: {
                    page: page,
                    pageSize: pageSize,
                    search: search,
                },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });
            if (response.data.status == "success") {
                setData(response.data.data);
            }
        } catch (error) {
            console.log(error)
            if (error?.response?.status == 401) logout()
        } finally {
            setIsLoading(false)
        }
    }


    const [reload, setReload] = useState(false);
    useEffect(() => {
        if (reload) {
            fetchInvoice();
            setReload(false);
        }
    }, [reload]);

    useEffect(() => {
        if (page !== 1) {
            setPage(1);
        } else {
            setReload(true);
        }
    }, [pageSize,]);

    useEffect(() => {
        if (!reload) {
            setReload(true);
        }
    }, [page]);



    const [isDownloading, setIsDownloading] = useState(false);
    const [did, setDid] = useState(null);
    const downloadInvoice = async (data) => {
        setDid(data.sale_id)
        setIsDownloading(true)
        try {

            const response = await
                axios({
                    url: apiUrl + '/api/download-invoice',
                    method: 'GET',
                    params: { id: data.sale_id },
                    responseType: 'blob',
                    headers: {
                        Authorization: 'Bearer ' + crmToken,
                    }
                }).then((response) => {
                    const href = URL.createObjectURL(response.data);
                    const link = document.createElement('a');
                    link.href = href;
                    link.setAttribute('download', 'invoice-' + data.invoice_id + '.pdf');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(href);
                });
            console.log(response)

        } catch (error) {
            if (error?.response?.status == 401) logout()
        } finally {
            setDid(null)
            setIsDownloading(false)
        }
    }

    const [invoiceModel, setInvoiceModel] = useState(false);
    const [invoiceData, setInvoiceData] = useState([])

    const sendInvoice = async (data) => {
        setInvoiceModel(true);
        setInvoiceData(data)
    }

    const [viewInvoice, setViewInvoice] = useState([])
    const [showInvoiceViewDrawer, setInvoiceViewShowDrawer] = useState(false)

    const view = async (data) => {
        setInvoiceViewShowDrawer(true);
        setViewInvoice(data)
    }



    return (
        <>
            <div className="panel flex-1 overflow-x-hidden h-full">

                <div className="flex items-center flex-wrap justify-between gap-2  mb-4.5">
                    <div className="flex">
                        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value) }} placeholder="Search by Number" className="form-input ltr:rounded-r-none rtl:rounded-l-none" />
                        <div onClick={() => { fetchInvoice() }} className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            <IoSearchSharp />
                        </div>
                    </div>
                    <button onClick={() => { fetchInvoice() }} className="bg-[#f4f4f4] rounded-md p-2  enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                        <IoMdRefresh className="w-5 h-5" />
                    </button>

                </div>

                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="whitespace-nowrap table-hover"
                        records={data?.data}
                        columns={[

                            {
                                accessor: 'Invoice Id',
                                render: ({ invoice_id }) => (
                                    <>
                                        <div className="flex gap-2">
                                            <button className="badge bg-black">
                                                {invoice_id}
                                            </button>
                                        </div>


                                    </>
                                ),
                            },
                            {
                                accessor: 'Name',
                                render: ({ first_name, last_name, email }) => (
                                    <div className='font-bold'>
                                        <p>{first_name} {last_name}<br />
                                            <small>{email}</small></p>
                                    </div>
                                ),
                            },

                            {
                                accessor: 'Phone',
                                title: "Phone | GST",
                                render: ({ phone, gst_no }) => (
                                    <div className='font-bold'>
                                        <p>
                                            {phone}<br />
                                            {gst_no ? <small>{`GST: ${gst_no}`}</small> : null}
                                        </p>
                                    </div>
                                ),
                            },
                            {
                                accessor: 'Sale Date',
                                render: ({ sale_date }) => (<b>{sale_date}</b>),
                            },
                            {
                                accessor: 'Amount',
                                render: ({ client_paid }) => (<b>
                                    {client_paid}</b>),
                            },

                            {
                                accessor: 'Action',
                                render: (data) => (
                                    <div className='flex gap-2'>
                                        <button className='btn btn-sm shadow' disabled={isDownloading} onClick={() => { downloadInvoice(data) }}>
                                            {isDownloading && did == data.sale_id ? <AiOutlineReload className='animate-spin' size={20} /> : <FaDownload size={15} />}

                                        </button>
                                        <button className='btn btn-sm shadow' onClick={() => { view(data) }} ><IoEye size={20} /></button>
                                        <button className='btn btn-sm shadow' onClick={() => { sendInvoice(data) }}><FaShareNodes size={20} />
                                        </button>
                                    </div>
                                ),
                            },

                        ]}
                        totalRecords={data?.totalItems}
                        recordsPerPage={data?.pageSize}
                        page={page}
                        fetching={isLoading}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        minHeight={200}
                        paginationText={({ totalRecords }) => `Showing  ${data?.from} to ${data?.to} of ${totalRecords} entries`}

                    />
                </div>
            </div>
            <SendInvoiceModel
                invoiceModel={invoiceModel}
                setInvoiceModel={setInvoiceModel}
                invoiceData={invoiceData}
                invoiceSetting={data?.invoiceSetting}
            />

            <ViewInvoice saleId={viewInvoice?.sale_id} invoiceSetting={data?.invoiceSetting} showInvoiceViewDrawer={showInvoiceViewDrawer} setInvoiceViewShowDrawer={setInvoiceViewShowDrawer} />
        </>

    )
}


