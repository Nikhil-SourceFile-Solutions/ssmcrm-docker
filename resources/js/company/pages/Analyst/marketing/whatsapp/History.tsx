import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { IoCloseSharp } from "react-icons/io5";
import PerfectScrollbar from 'react-perfect-scrollbar';
import { IRootState } from '../../../../store';
import { useSelector, useDispatch } from 'react-redux'
import Swal from 'sweetalert2';
import { setCallBacktData, setCrmToken } from '../../../../store/themeConfigSlice';
import { useAuth } from '../../../../AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';

import { IoMdRefresh } from 'react-icons/io';
import { DataTable } from 'mantine-datatable';



import { FaIndianRupeeSign } from 'react-icons/fa6';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';


export default function History({ historyDrawer, setHistoryDrawer }) {

    const { logout, authUser, crmToken, apiUrl, settingData } = useAuth();


    const [data, setData] = useState<any>([]);
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState<any>(null);



    const [isLoading, setIsLoading] = useState(true);
    const [fetchingError, setFetchingError] = useState<any>(null);

    useEffect(() => {
        if (historyDrawer) fetchSales()
    }, [page, pageSize, historyDrawer])



    const getFormattedTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // Extracts date in 'YYYY-MM-DD' format
    };
    const [dateRange, setDateRange] = useState([getFormattedTodayDate(), getFormattedTodayDate()]);


    const dateFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });


    useEffect(() => {
        if (page == 1) fetchSales()
        else setPage(1)
    }, [dateRange])



    const fetchSales = async () => {
        setIsLoading(true); setFetchingError(0)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + '/api/get-marketing-whatsapp-campigns',
                params: {
                    page: page,
                    pageSize: pageSize,
                    dateRange: JSON.stringify(dateRange),
                    search: search
                },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setData(response.data.data)



            }

        } catch (e) {
            if (e?.response?.status == 401) logout()
            if (e?.response?.status) setFetchingError(e?.response)
        } finally {
            setIsLoading(false)
        }
    }




    return (

        <>
            <div>
                <div className={`${(historyDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setHistoryDrawer(false)}></div>

                <nav
                    className={`${(historyDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                        } bg-white fixed ltr:-right-[90%] rtl:-left-[90%] top-0 bottom-0 w-full max-w-[90%] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black `}
                >
                    <div className="flex flex-col h-screen overflow-hidden">
                        <div className="w-full text-center  p-4 bg-[#3b3f5c] text-white rounded-b-md">
                            <button type="button" className="px-4 py-4 absolute top-0 ltr:right-0 rtl:left-0  dark:text-white" onClick={() => setHistoryDrawer(false)}>
                                <IoCloseSharp className=" w-5 h-5" color='white' />
                            </button>
                            <h3 className="mb-1 dark:text-white font-bold text-[18px]">WhatsApp Marketing Campaign History</h3>
                        </div>
                        <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">



                            <div className="panel p-0">
                                {fetchingError ? <Error e={fetchingError} fetchSales={fetchSales} /> : (
                                    <>
                                        <div className='flex justify-between gap-4  p-4'>
                                            <div className='flex gap-3  w-full'>

                                                <div className="flex min-w-[275px]">
                                                    <input type="text" placeholder="Search Sale by Campaign Name" className="form-input ltr:rounded-r-none rtl:rounded-l-none" onChange={(e) => setSearch(e.target.value)} />
                                                    <div className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]"
                                                        onClick={() => page == 1 ? fetchSales() : setPage(1)
                                                        }>
                                                        <FaSearch />
                                                    </div>
                                                </div>

                                                <div>
                                                    <Flatpickr
                                                        options={{
                                                            mode: 'range',
                                                            dateFormat: 'Y-m-d',
                                                            position: 'auto left',
                                                        }}
                                                        value={dateRange}
                                                        className="form-input w-[240px]"
                                                        onChange={(CustomDate) => {
                                                            const date = CustomDate.map((dateStr) => {
                                                                const formattedDate = dateFormatter.format(new Date(dateStr));
                                                                return formattedDate.split('/').reverse().join('-');
                                                            });
                                                            if (date.length == 2) setDateRange(date)
                                                        }
                                                        }
                                                    />
                                                </div>


                                            </div>
                                            <div className='flex gap-3 justify-end  w-full'>
                                                <button disabled={isLoading ? true : false} onClick={() => fetchSales()} className="bg-[#f4f4f4] rounded-md p-2 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                                    <IoMdRefresh className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>



                                        <div className="datatables p-4">
                                            <DataTable
                                                className="whitespace-nowrap table-hover"
                                                records={data?.data}

                                                columns={

                                                    [
                                                        {
                                                            accessor: 'campaign_name',
                                                            title: 'Campaign Name',
                                                            cellsClassName: "font-bold"
                                                        },


                                                        {
                                                            accessor: 'final_template',
                                                            title: 'Template',
                                                            cellsClassName: "font-bold",
                                                            render: ({ final_template, template_name }) => {
                                                                return (
                                                                    <div className='max-w-[400px]' style={{ textWrap: "wrap" }}>
                                                                        <h1><b>{template_name}</b></h1>
                                                                        <span className='font-bold text-[12px] text-[#506690]'>{final_template}</span>
                                                                    </div>
                                                                )
                                                            },
                                                        },

                                                        {
                                                            accessor: 'count',
                                                            title: 'Count',
                                                            cellsClassName: "font-bold"
                                                        },



                                                        {
                                                            accessor: 'created_at',
                                                            title: 'Date Time',
                                                            cellsClassName: "font-bold"
                                                        },


                                                    ]}


                                                totalRecords={data.totalItems}
                                                recordsPerPage={pageSize}
                                                page={page}
                                                onPageChange={(p) => setPage(p)}
                                                recordsPerPageOptions={PAGE_SIZES}
                                                onRecordsPerPageChange={setPageSize}
                                                minHeight={500}
                                                fetching={isLoading}
                                                loaderSize="xl"
                                                loaderColor="green"
                                                loaderBackgroundBlur={1}
                                                paginationText={({ totalRecords }) => `Showing  ${data?.from} to ${data.to} of ${totalRecords} entries`}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                        </section>

                    </div>
                </nav>
            </div>
        </>
    )
}








const Error = ({ e, fetchSales }: any) => {

    console.log(e)

    return (<div className="">
        <div className="relative">
            <img
                src={0 ? '/assets/images/error/500-dark.svg' : '/assets/images/error/500-light.svg'}
                alt="500"
                className="mx-auto -mt-10 w-full max-w-xs object-cover md:-mt-14 md:max-w-xl"
            />
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
