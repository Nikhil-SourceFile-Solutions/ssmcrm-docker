import React, { useEffect, useState } from 'react'
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../../AuthContext';
import { setPageTitle } from '../../../store/themeConfigSlice';
import { IoMdRefresh } from 'react-icons/io';
import { DataTable } from 'mantine-datatable';
import axios from 'axios';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Show from './Show';
import { FaLock, FaSearch } from "react-icons/fa";
import { FaIndianRupeeSign, FaUnlockKeyhole } from 'react-icons/fa6';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
export default function Index() {

    const { logout, authUser, crmToken, apiUrl } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => { dispatch(setPageTitle('Sales')); });

     const location = useLocation();
      const { prevPage } = location.state || {};

    const [filterOwner, setFilterOwner] = useState(localStorage.getItem('saleFilterOwner') || '0');
    const [filterStatus, setFilterStatus] = useState(localStorage.getItem('saleFilterStatus') || '0');
    const [allSaleOwners, setAllSaleOwners] = useState<any>([]);
    const [firstTime, setFirstTime] = useState(1);

    const allSaleStatus: any = [
        { label: 'All', value: 0 },
        { label: 'Pending', value: 'Pending' },
        { label: 'Verified', value: 'Verified' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Expired', value: 'Expired' },
        { label: 'Paused', value: 'Paused' },


    ];

    const [data, setData] = useState<any>([]);
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState<any>(null);

    const [settings, setSettings] = useState();

    const [l, sL] = useState(true);
    const [fe, sFe] = useState(1);

    useEffect(() => {
        fL()
    }, [page, pageSize])


    useEffect(() => {
        if (page == 1) fL()
        else setPage(1)
    }, [filterOwner, filterStatus])

    const fL = async () => {
        sL(true); sFe(0)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + '/api/get-accounts-sales',
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
                }

            }

            console.log(response)
        } catch (e) {
            if (e?.response?.status) sFe(e?.response)
        } finally {
            sL(false)
        }
    }


    const [selectedLead, setSelectedLead] = useState(null);
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

                {selectedLead ? <Show selectedLead={selectedLead} setSelectedLead={setSelectedLead} fL={fL} /> : (
                    <div className="panel p-0">
                        {fe ? <Error e={fe} fL={fL} /> : (

                            <>

                                <div className='flex justify-between gap-4  p-4'>
                                    <div className='flex gap-3  w-full'>
                                        {/* <div>
                                            <input type="text" className="form-input " placeholder="" />
                                        </div> */}

                                        <div className="flex min-w-[275px]">
                                            <input type="text" placeholder="Search Sale by phone number" className="form-input ltr:rounded-r-none rtl:rounded-l-none" onChange={(e) => setSearch(e.target.value)} />
                                            <div className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]"
                                                onClick={() => page == 1 ? fL() : setPage(1)
                                                }>
                                                <FaSearch />
                                            </div>
                                        </div>
                                        <div>
                                            <Select
                                                placeholder="Select Lead Owner"
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
                                        </div>
                                        <div>
                                            <Select placeholder="Select Sale Status" onChange={(e: any) => {
                                                setFilterStatus(e.value)
                                                localStorage.setItem("saleFilterStatus", e.value);
                                            }} className='w-[230px] z-10' value={allSaleStatus?.find((s: any) => s.value == filterStatus)} options={allSaleStatus}

                                            />
                                        </div>
                                    </div>
                                    <div className='flex gap-3 justify-end  w-full'>
                                        <button disabled={l ? true : false} onClick={() => fL()} className="bg-[#f4f4f4] rounded-md p-2 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                            <IoMdRefresh className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>



                                <div className="datatables p-4">
                                    <DataTable
                                        className="whitespace-nowrap table-hover"
                                        records={data?.data}

                                        columns={[
                                            {
                                                accessor: 'id',
                                                title: 'Sale Id',
                                                // hidden: hideCols.includes('id'),
                                                cellsClassName: "font-bold"
                                            },
                                            {
                                                accessor: 'owner',
                                                title: 'Owner',
                                                // hidden: hideCols.includes('owner'),
                                                cellsClassName: "font-bold"
                                            },
                                            {
                                                accessor: 'first_name',
                                                title: 'Full Name',

                                                render: ({ first_name, last_name, phone }) => {
                                                    return (

                                                        <UserName first_name={first_name} last_name={last_name} phone={phone} />


                                                    )
                                                },
                                            },

                                            {
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
                                            },

                                            {
                                                accessor: 'status',
                                                title: 'Status4444444444',
                                                render: (lead: any) => {
                                                    return (

                                                        <div>

                                                            {lead.is_service_activated ? (
                                                                <FaUnlockKeyhole style={{ color: 'green', fontSize: 20 }} />
                                                            ) : (
                                                                <FaLock style={{ color: 'red', fontSize: 20 }} />
                                                            )}

                                                            {lead.status == "Closed Won" ? <button type="button" className="btn btn-success btn-sm shadow-sm py-0.5">Create Sale</button> :
                                                                <span className={`badge ${lead.status == "Pending" ? 'bg-[#ff9800]' :
                                                                    lead.status == "Approved" ? 'bg-[#2ab717]' : lead.status == "Expired" ? 'bg-red-500' : lead.status == "Verified" ? 'bg-info' : 'bg-dark'} text-center cursor-pointer py-0.5 w-full`} >{lead.status}</span>}
                                                        </div>
                                                    )
                                                },
                                            },

                                            {
                                                accessor: 'product',
                                                title: 'Product',
                                                cellsClassName: 'max-w-[200px] truncate',
                                                render: ({ product, bank, client_paid }) => {
                                                    return (<div>
                                                        <b>{product}</b> <br />
                                                        <b>{bank}</b> <br />
                                                        <b className='flex items-center text-success'><FaIndianRupeeSign size={14} /> {client_paid}</b>
                                                    </div>)
                                                }
                                            },



                                            {
                                                accessor: 'sale_date',
                                                title: 'Date',
                                                render: ({ sale_date, start_date, due_date }) => {
                                                    return (
                                                        <div>
                                                            <div className='flex justify-between gap-2'>
                                                                <span>Start</span>
                                                                <span className='font-semibold'>{start_date}</span>
                                                            </div>
                                                            <div className='flex justify-between gap-2'>
                                                                <span>Sale</span>
                                                                <span className='font-semibold'>{sale_date}</span>
                                                            </div>
                                                            <div className='flex justify-between gap-2'>
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
                                        sortStatus={{ columnAccessor: 'id', direction: 'asc' }}
                                        minHeight={500}
                                        fetching={l}
                                        loaderSize="xl"
                                        loaderColor="green"
                                        loaderBackgroundBlur={1}
                                        paginationText={({ totalRecords }) => `Showing  ${data?.from} to ${data.to} of ${totalRecords} entries`}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}

            </div>
        </div>
    )
}



















const Error = ({ e, fL }: any) => {

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

                <button className='btn btn-info  !mt-7  border-0 uppercase shadow-none' onClick={() => fL()}>
                    Re Try
                </button>
            </div>
        </div>
    </div>)

}
