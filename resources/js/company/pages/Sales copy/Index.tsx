import React, { useEffect, useState } from 'react'
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../AuthContext';
import { setPageTitle } from '../../store/themeConfigSlice';
import { IoMdRefresh } from 'react-icons/io';
import { DataTable } from 'mantine-datatable';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import Show from './Show';
import { FaLock, FaSearch } from "react-icons/fa";
import { FaIndianRupeeSign, FaUnlockKeyhole } from 'react-icons/fa6';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
export default function Index() {

    const { logout, authUser, crmToken, apiUrl, settingData } = useAuth();

    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => { dispatch(setPageTitle('Sales')); });

    const [filterOwner, setFilterOwner] = useState(localStorage.getItem('saleFilterOwner') || '0');
    const [filterStatus, setFilterStatus] = useState(localStorage.getItem('saleFilterStatus') || '0');
    const [allSaleOwners, setAllSaleOwners] = useState<any>([]);

    const [firstTime, setFirstTime] = useState(1);

    const [salesStatuses, setSalesStatuses] = useState([]);

    const [data, setData] = useState<any>([]);
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState<any>(null);

    const [settings, setSettings] = useState();

    const [isLoading, setIsLoading] = useState(true);
    const [fetchingError, setFetchingError] = useState(null);

    useEffect(() => {
        fetchSales()
    }, [page, pageSize])


    useEffect(() => {
        if (page == 1) fetchSales()
        else setPage(1)
    }, [filterOwner, filterStatus])

    const fetchSales = async () => {
        setIsLoading(true); setFetchingError(0)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + '/api/get-sales',
                params: {
                    page: page,
                    pageSize: pageSize,
                    filterOwner: filterOwner,
                    filterStatus: filterStatus,
                    firstTime: firstTime,
                    search: search
                },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setData(response.data.data)

                if (firstTime) {
                    setSettings(response.data.settings)
                    setAllSaleOwners(response.data.allSaleOwners)
                    setSalesStatuses(response.data.saleStatuses)
                }

            }

            console.log(response)
        } catch (e) {
            if (e?.response?.status) setFetchingError(e?.response)
        } finally {
            setIsLoading(false)
        }
    }



    const UserName = ({ first_name, last_name, phone }) => {
        const fullName = `${first_name}${last_name ? ` ${last_name}` : ''}`;
        const trimmedName = fullName.substring(0, 15);
        const tippyContent = `${first_name}${last_name ? ` ${last_name}` : ''}`;
        return (
            <Tippy content={tippyContent}>
                <div>
                    <b>{trimmedName}</b> <br />
                    <b>{phone}</b>
                </div>
            </Tippy>
        );
    };
    return (
        <div className="panel p-0 flex-1 overflow-x-hidden h-full">
            <div className="flex flex-col h-full">


                <div className="panel p-0">
                    {fetchingError ? <Error e={fetchingError} fetchSales={fetchSales} /> : (
                        <>
                            <div className='flex justify-between gap-4  p-4'>
                                <div className='flex gap-3  w-full'>

                                    <div className="flex min-w-[275px]">
                                        <input type="text" placeholder="Search Sale By Phone or Name" className="form-input ltr:rounded-r-none rtl:rounded-l-none" onChange={(e) => setSearch(e.target.value)} />
                                        <div className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]"
                                            onClick={() => page == 1 ? fetchSales() : setPage(1)
                                            }>
                                            <FaSearch />
                                        </div>
                                    </div>
                                    <div>

                                        {authUser?.user_type == "Admin" || authUser.user_type == "Accounts" || authUser.user_type == "HR" || authUser.user_type == "Complaince" ? (
                                            <Select
                                                placeholder="Select Sale Owner"
                                                onChange={(e: any) => {
                                                    setFilterOwner(e.value);
                                                    localStorage.setItem("saleFilterOwner", e.value);
                                                }}
                                                className='w-[230px] z-10'
                                                value={allSaleOwners?.find((s: any) => s.value == filterOwner)}
                                                options={[
                                                    { label: 'All Users', value: 0 },
                                                    ...allSaleOwners?.map((owner: any) => ({
                                                        label: owner.first_name + ' ' + owner.last_name,
                                                        value: owner.id
                                                    }))
                                                ]}
                                            />
                                        ) : null}

                                    </div>
                                    <div>
                                        <Select placeholder="Select Sale Status" onChange={(e: any) => {
                                            setFilterStatus(e.value)
                                            localStorage.setItem("saleFilterStatus", e.value);
                                        }} className='w-[230px] z-10' value={salesStatuses?.find((s: any) => s.value == filterStatus)} options={salesStatuses}

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
                                                accessor: 'id',
                                                title: 'Sale Id',
                                                // hidden: hideCols.includes('id'),
                                                cellsClassName: "font-bold"
                                            },

                                            ...(authUser.user_type == "Admin" || authUser.user_type == "Accounts" || authUser.user_type == "HR" || authUser.user_type == "Complaince" ? [
                                                {
                                                    accessor: 'owner',
                                                    title: 'Owner',
                                                    // hidden: hideCols.includes('owner'),
                                                    cellsClassName: "font-bold"
                                                }
                                            ] : []),

                                            {
                                                accessor: 'first_name',
                                                title: 'Client',

                                                render: ({ first_name, last_name, phone }) => {
                                                    return (

                                                        <UserName first_name={first_name} last_name={last_name} phone={phone} />


                                                    )
                                                },
                                            },


                                            ...(settingData.company_type && (authUser.user_type == "Admin" || authUser.user_type == "Accounts" || authUser.user_type == "HR" || authUser.user_type == "Complaince") ? [{
                                                accessor: 'last_name',
                                                title: 'Verifications & Documents',

                                                render: ({ is_manager_verified, is_account_verified, is_complaince_verified }) => {
                                                    return (
                                                        <div className='flex gap-2'>
                                                            <div>

                                                                {(settings.has_manager_verification || settings.has_complaince_verification || settings.has_accounts_verification) ? (
                                                                    <div className='flex gap-1 justify-between'>

                                                                        {settings.has_manager_verification ? (<span className={`badge ${is_manager_verified ? 'bg-[#2ab717]' : 'bg-red-500'} `}>Manager</span>) : null}

                                                                        {settings.has_complaince_verification ? (<span className={`badge ${is_complaince_verified ? 'bg-[#2ab717]' : 'bg-red-500'} `}>Complaince</span>) : null}

                                                                        {settings.has_accounts_verification ? (<span className={`badge ${is_account_verified ? 'bg-[#2ab717]' : 'bg-red-500'} `}>Accounts</span>) : null}

                                                                    </div>
                                                                ) : null}



                                                            </div>
                                                            <div className=' btn btn-dark shadow'>
                                                                Invoice
                                                            </div>

                                                        </div>

                                                    )
                                                },
                                            }] : []),



                                            {
                                                accessor: 'status',
                                                title: 'Status',
                                                render: (lead: any) => {
                                                    return (

                                                        <div className='flex gap-1'>
                                                            {lead.is_service_activated ? (
                                                                <FaUnlockKeyhole style={{ color: 'green', fontSize: 20 }} />
                                                            ) : (
                                                                <FaLock style={{ color: 'red', fontSize: 20 }} />
                                                            )}
                                                            <div>
                                                                {lead.status == "Closed Won" ? <button type="button" className="btn btn-success btn-sm shadow-sm py-0.5">Create Sale</button> :
                                                                    <span className={`badge ${lead.status == "Pending" ? 'bg-[#ff9800]' :
                                                                        lead.status == "Approved" ? 'bg-[#2ab717]' : lead.status == "Expired" ? 'bg-red-500' : lead.status == "Verified" ? 'bg-info' : 'bg-dark'} text-center cursor-pointer py-0.5 w-full`} >{lead.status}</span>}
                                                            </div>
                                                        </div>
                                                    )
                                                },
                                            },

                                            {
                                                accessor: 'product',
                                                title: 'Product',
                                                cellsClassName: 'max-w-[200px] truncate',
                                                render: ({ product, client_paid, is_bank_upi, bank_name, upi, }) => {
                                                    return (<div>
                                                        <b>{product}</b> <br />
                                                        <span>{is_bank_upi == 'bank' ? bank_name : upi} <br />

                                                            <b className='flex text-[15px] mt-1 text-success'><FaIndianRupeeSign size={18} />

                                                                <b>{client_paid}</b>

                                                            </b>
                                                        </span>
                                                    </div>)
                                                }
                                            },


                                            {
                                                accessor: 'sale_date',
                                                title: 'Date',
                                                render: ({ sale_date, start_date, due_date }) => {
                                                    return (
                                                        <div>
                                                            <div className='flex  gap-2'>
                                                                <span>Start</span>
                                                                <span className='font-semibold'>{start_date}</span>
                                                            </div>
                                                            <div className='flex  gap-2'>
                                                                <span>Sale</span>
                                                                <span className='font-semibold'>{sale_date}</span>
                                                            </div>
                                                            <div className='flex  gap-2'>
                                                                <span>End</span>
                                                                <span className='font-semibold'>{due_date}</span>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            },
                                        ]}


                                    onCellClick={({ record }) => {
                                        navigate('/sales/show', {
                                            state: {
                                                sale_id: record.id,
                                                filterOwner: filterOwner,
                                                filterStatus: filterStatus,
                                            }
                                        });
                                    }}
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


            </div>
        </div>
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
