import React, { useCallback, useMemo, useRef } from 'react'
import { useState, useEffect } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setHideCols, setPageTitle } from '../../../store/themeConfigSlice';
import Select from 'react-select';
import { DataTable } from 'mantine-datatable';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Dropdown from '../../../components/Dropdown';
import IconCaretDown from '../../../components/Icon/IconCaretDown';
import { IRootState } from '../../../store';
import axios from 'axios';
import { IoMdRefresh } from "react-icons/io";
import 'flatpickr/dist/themes/material_blue.css';
import CreateSale from './CreateSale';
import InlineLeadStatus from './InlineLeadStatus';
import Swal from 'sweetalert2';
import LeadRequest from './LeadRequest';
import BulkUpdate from './BulkUpdate';
import { useAuth } from '../../../AuthContext';
import OneClickTransfer from './OneClickTransfer';
import { PiCursorClickLight, PiPhoneCallBold } from "react-icons/pi";
import { useLocation, useNavigate } from 'react-router-dom';
import Main from '../../Development/Main';
import MainLeft from '../../LeftNav/MainLeft';
import { NavLink } from 'react-router-dom';
import { FaCalendarAlt, FaSearch } from "react-icons/fa";

import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';

import { FaCalendarDays } from "react-icons/fa6";
import { FaCalendarXmark } from "react-icons/fa6";
import { IoSearchSharp } from 'react-icons/io5';
export default function Index() {

    const { logout, crmToken, authUser, apiUrl, selectedBranch } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { fOwner, fStatus, fState } = location.state || {};

    console.log("fOwner", fOwner)
    useEffect(() => {
        dispatch(setPageTitle('View Leads'))
    }, [])

    const dispatch = useDispatch();
    const hideCols = useSelector((state: IRootState) => state.themeConfig.hideCols);

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [filterOwner, setFilterOwner] = useState(fOwner != undefined ? fOwner : localStorage.getItem('leadFilterOwner') || '0');
    const [filterStatus, setFilterStatus] = useState(fStatus != undefined ? fStatus : localStorage.getItem('leadFilterStatus') || '0');
    const [filterState, setFilterState] = useState(fState != undefined ? fState : localStorage.getItem('leadFilterState') || '0');
    const [data, setData] = useState<any>([]);
    const [firstTime, setFirstTime] = useState(1);
    const [allLeadOwners, setAllLeadOwners] = useState<any>([]);
    const [allLeadStatus, setAllLeadStatus] = useState<any>([]);
    const [allLeadStates, setAllLeadStates] = useState<any>([]);
    const [allLeadProducts, setAllLeadProducts] = useState<any>([]);
    const [dateRange, setDateRange] = useState(null);

    // const [dateRange, setDateRange] = useState(getTodayDateRange());
    function getTodayDateRange() {
        const today = new Date();

        // Format YYYY-MM-DD
        const yearFull = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(today.getDate()).padStart(2, '0');

        const fullDate = `${yearFull}-${month}-${day}`;

        // Format YY-MM-DD
        const yearShort = String(today.getFullYear()).slice(2);
        const shortDate = `${yearShort}-${month}-${day}`;

        return [fullDate, shortDate];
    }

    // const [leadStatus, setleadStatus] = useState<any>([]); // For Inline status update
    const [leadSources, setLeadSources] = useState<any>([]); // For Inline status update
    const [tableLoading, setTableLoading] = useState(true);
    // const [complateOwners, setComplateOwners] = useState<any>([]);
    const options = useMemo(() => [
        { label: 'All States', value: 0 },
        ...allLeadStates?.map((state: string) => ({ label: state, value: state })),
    ], [allLeadStates]);

    const handleSelectChange = useCallback((e: { value: number }) => {
        setFilterState(e.value);
        localStorage.setItem("leadFilterState", e.value.toString());
    }, []);

    const status = useMemo(() => [
        { label: 'All Status', value: 0 },
        { label: "Today's Free Trial", value: 'today-free-trial' },
        { label: "Today's Follow Up", value: 'today-follow-up' },
        ...allLeadStatus?.map((status: string) => ({ label: status, value: status })),
    ], [allLeadStatus]);

    const handleStatusChange = useCallback((e: { value: number }) => {
        setFilterStatus(e.value);
        localStorage.setItem("leadFilterStatus", e.value.toString());
    }, []);

    const [fetchingError, setFetchingError] = useState(null);
    const fetchLeads = async (a = 0) => {
        console.log("Fetching Leads........", a)
        setTableLoading(true)
        setFetchingError(null)
        try {
            const response = await axios({
                method: 'get',

                url: apiUrl + '/api/get-leads',
                params: {
                    page: page,
                    pageSize: pageSize,
                    filterOwner: filterOwner,
                    filterStatus: filterStatus,
                    filterState: filterState,
                    search: search,
                    dateRange: dateRange ? JSON.stringify(dateRange) : 0,
                    firstTime: a ? a : firstTime
                },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                    SelectedBranch: selectedBranch
                },
            });
            //
            if (response.data.status == "success") {
                setData(response.data.data)

                if (firstTime || a) {
                    setAllLeadOwners(response.data.allLeadOwners)
                    setAllLeadStatus(response.data.allLeadStatus)
                    setLeadSources(response.data.leadSources)
                    setAllLeadStates(response.data.allLeadStates)
                    setAllLeadProducts(response.data.allLeadProducts)

                    setFirstTime(0)
                }
                // setSelectedLead(0)
            } else setData([]);

        } catch (error) {
            if (error?.response?.status == 401) logout()
            console.log(error)
            setFetchingError(error)

        } finally {
            setTableLoading(false)
        }
    }


    const [reload, setReload] = useState(false);
    useEffect(() => {
        if (reload) {
            fetchLeads();
            setReload(false);
        }
    }, [reload]);

    useEffect(() => {
        if (page !== 1) {
            setPage(1);
        } else {
            setReload(true);
        }
    }, [filterOwner, filterStatus, filterState, pageSize, dateRange]);

    useEffect(() => {
        if (!reload) {
            setReload(true);
        }
    }, [page]);

    useEffect(() => {
        if (!firstTime) {
            setFirstTime(1)
            if (page !== 1) {
                setPage(1);
            } else {
                setReload(true);
            }
        }
    }, [selectedBranch])

    const showHideColumns = (col: any, value: any) => hideCols.includes(col) ? dispatch(setHideCols(hideCols.filter((d: any) => d !== col))) : dispatch(setHideCols([...hideCols, col]));

    const cols = [
        { accessor: 'id', title: 'Lead Id', editable: true },
        { accessor: 'owner', title: 'Owner', editable: true },
        { accessor: 'full_name', title: 'Full Name', editable: false },
        { accessor: 'email', title: 'Email', editable: true },
        { accessor: 'phone', title: 'Phone', editable: false },
        { accessor: 'second_phone', title: 'Second Phone', editable: true },
        { accessor: 'status', title: 'Status', editable: false },
        { accessor: 'invest', title: 'Invest', editable: true },
        { accessor: 'free_trial', title: 'First Trail', editable: true },
        { accessor: 'followup', title: 'Follow Up', editable: true },
        { accessor: 'source', title: 'Source', editable: true },
        { accessor: 'dnd', title: 'DND', editable: true },
        { accessor: 'city', title: 'City', editable: true },
        { accessor: 'state', title: 'State', editable: false },
        { accessor: 'products', title: 'Products', editable: true },
        { accessor: 'desc', title: 'Description', editable: true },

        // { accessor: 'rp_status', title: 'RP Status', editable: true },
        { accessor: 'created_at', title: 'Craeted At', editable: true },
        { accessor: 'updated_at', title: 'Updated At', editable: true },
    ];

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, accessor: string) => {
        setHideCols(event.target.value);
        showHideColumns(accessor, event.target.checked);
    };

    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    // Datatable Completed
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [statusModel, setStatusModel] = useState<any>(false);
    const [saleModel, setSaleModel] = useState<any>(false);
    const [leadModel, setLeadModel] = useState<any>(false);
    const [requestModal, setRequestModal] = useState<any>(false);
    const [bulkUpdateModal, setBulkUpdateModal] = useState<any>(false);

    const [octModal, setOtcModal] = useState<any>(false);

    const updateLeadStatus = (lead: any) => {
        if (lead.status == "Closed Won") {
            setSaleModel(true)
            setSelectedLead(lead)
        } else {
            setSelectedLead(lead)
            setStatusModel(true)
        }
    }


    const UserName = ({ first_name, last_name }) => {
        const fullName = `${first_name}${last_name ? ` ${last_name}` : ''}`;
        const trimmedName = fullName.substring(0, 15);
        const tippyContent = `${first_name}${last_name ? ` ${last_name}` : ''}`;
        return (
            <Tippy content={tippyContent}>
                <b>{trimmedName}</b>
            </Tippy>
        );
    };


    const handleMassDelete = () => {
        Swal.fire({
            icon: 'info',
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: 'sweet-alerts',
        }).then(async (result) => {
            if (result.value) {
                try {
                    const response = await axios({
                        method: 'delete',
                        url: apiUrl + '/api/leads-mass-delete',
                        params: { leads: JSON.stringify(selectedRecords.map((row: any) => row.id)) },
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: "Bearer " + crmToken,
                        },
                    });
                    if (response.data.status === "success") {
                        setSelectedRecords([])
                        fetchLeads()
                    }
                }
                catch (error) {
                    console.log(error)
                }
                finally {

                }
            }
        });

    }

    return (

        <>
            <MainLeft>

                <>
                    {fetchingError ? <Error error={fetchingError} fetch={fetchLeads} /> : (
                        <>

                            <div className="p-0 flex-1 overflow-x-hidden h-full">
                                <div className="flex flex-col h-full">
                                    <div className="panel">
                                        <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                                            <div className="flex min-w-[230px] ">
                                                <input type="text" placeholder="Search by phone" className="form-input ltr:rounded-r-none rtl:rounded-l-none" onChange={(e) => setSearch(e.target.value)} />
                                                <div className="bg-[#eee] cursor-pointer flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]"
                                                    onClick={() => page == 1 ? fetchLeads() : setPage(1)
                                                    }>
                                                    <FaSearch />
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                {
                                                    authUser?.user_type == 'Admin' ? <div>
                                                        <div>
                                                            <Select placeholder="Select Lead Owner"
                                                                onChange={(e: any) => {
                                                                    setFilterOwner(e.value)
                                                                    localStorage.setItem("leadFilterOwner", e.value);
                                                                }} className='w-[230px] z-10 ' value={allLeadOwners?.find((s: any) => s.value == filterOwner)} options={allLeadOwners} />
                                                        </div>
                                                    </div> : null
                                                }

                                            </div>
                                            <div className="flex gap-4">
                                                <Select
                                                    placeholder="Select Lead State"
                                                    onChange={handleSelectChange}
                                                    className='w-[230px] z-10 '
                                                    value={options.find((s) => s.value === filterState)}
                                                    options={options}
                                                />
                                            </div>
                                            <div className="flex gap-4">

                                                <Select
                                                    placeholder="Select Lead Status"
                                                    onChange={handleStatusChange}
                                                    className='w-[230px] z-10 '
                                                    value={status.find((s) => s.value === filterStatus)}
                                                    options={status}
                                                />

                                            </div>

                                        </div>
                                        <hr className='my-4' />

                                        <div className='flex justify-between gap-4 items-center'>
                                            <div className="relative">
                                                <Flatpickr
                                                    options={{
                                                        mode: 'range',
                                                        dateFormat: 'Y-m-d',
                                                        position: 'auto left',
                                                    }}
                                                    value={dateRange}
                                                    className="form-input w-[240px] pr-10" // Add padding to avoid overlap with icon
                                                    onChange={(selectedDates) => {
                                                        const date = selectedDates.map(dateObj => {
                                                            const year = dateObj.getFullYear();
                                                            const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                                                            const day = String(dateObj.getDate()).padStart(2, '0');
                                                            return `${year}-${month}-${day}`;
                                                        });
                                                        if (date.length === 2) setDateRange(date);
                                                    }}
                                                />



                                                <span className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer">
                                                    {dateRange?.length == 2 ? <FaCalendarXmark className="h-5 w-5 text-gray-600 " color='red' onClick={() => setDateRange(null)} /> : <FaCalendarDays className="h-5 w-5 text-gray-600" />}
                                                </span>

                                            </div>

                                            <div className='flex gap-3 justify-end '>
                                                {authUser.user_type == "Admin" ? (
                                                    <>
                                                        <Tippy content="One Click Transfer" placement="bottom">
                                                            <button type="button" className="btn btn-secondary shadow" onClick={() => setOtcModal(true)}>
                                                                <PiCursorClickLight className="w-5 h-5 ltr:mr-2 rtl:ml-2" /> O.C.T</button>
                                                        </Tippy>

                                                        {selectedRecords.length ? (
                                                            <>
                                                                <button type="button" className="btn btn-outline-primary" onClick={() => {
                                                                    if (selectedRecords.length) setBulkUpdateModal(true)
                                                                    else alert('Please select atleast one record')
                                                                }}>Data Transfer</button>

                                                                <button type="button" className="bg-[#ff0000] btn text-white" onClick={() => {
                                                                    if (selectedRecords.length) handleMassDelete()
                                                                    else alert('Please select atleast one record')
                                                                }}>Mass Delete</button>
                                                            </>
                                                        ) : null}
                                                    </>
                                                ) : <button type="button" className="btn btn-outline-primary" onClick={() => setRequestModal(true)}>Lead Request</button>}

                                                <div className="dropdown mr-1">
                                                    <Dropdown
                                                        // placement={`'bottom-start'}`}
                                                        btnClassName="!btn btn-dark flex items-center border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-4 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                                        button={
                                                            <>
                                                                <span className="ltr:mr-1 rtl:ml-1">Edit Table </span>
                                                                <IconCaretDown className="w-5 h-5" />
                                                            </>
                                                        }
                                                    >
                                                        <ul className="!min-w-[200px]">
                                                            {cols.map((col) => (
                                                                <li key={col.accessor} className="flex flex-col">
                                                                    <div className="flex items-center px-4 py-1">
                                                                        <label className="cursor-pointer mb-0">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={!hideCols.includes(col.accessor)}
                                                                                className="form-checkbox text-dark"
                                                                                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                                                                    handleCheckboxChange(event, col.accessor)
                                                                                }
                                                                                disabled={!col.editable}
                                                                            />
                                                                            <span className="ltr:ml-2 rtl:mr-2">{col.title}</span>
                                                                        </label>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </Dropdown>
                                                </div>

                                                <button disabled={tableLoading ? true : false} onClick={() => fetchLeads()} className="bg-[#f4f4f4] rounded-md p-2 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                                    <IoMdRefresh className="w-5 h-5" />
                                                </button>
                                            </div>



                                        </div>
                                        <div className="datatables mt-4">
                                            <DataTable
                                                className="whitespace-nowrap table-hover"
                                                records={data?.data}

                                                columns={[
                                                    {
                                                        accessor: 'id',
                                                        title: 'Lead Id',
                                                        hidden: hideCols.includes('id'),
                                                    },
                                                    {
                                                        accessor: 'owner',
                                                        title: 'Owner',
                                                        hidden: hideCols.includes('owner'),
                                                    },
                                                    {
                                                        accessor: 'first_name',
                                                        title: 'Full Name',
                                                        hidden: hideCols.includes('first_name'),
                                                        render: ({ first_name, last_name }) => {
                                                            return (

                                                                <UserName first_name={first_name} last_name={last_name} />

                                                            )
                                                        },
                                                    },




                                                    {
                                                        accessor: 'status',
                                                        title: 'Status',
                                                        hidden: hideCols.includes('status'),
                                                        render: (lead: any) => {
                                                            return (
                                                                lead.status == "Closed Won" ? <button type="button" className="btn btn-success btn-sm shadow-sm py-0.5">Create Sale</button> :
                                                                    <span className={`badge bg-[#1d67a7] text-center cursor-pointer py-0.5 w-full`} >{lead.status}</span>
                                                            )
                                                        },
                                                    },
                                                    {
                                                        accessor: 'email',
                                                        title: 'Email',
                                                        hidden: hideCols.includes('email'),
                                                    },
                                                    {
                                                        accessor: 'phone',
                                                        title: 'Phone',
                                                        hidden: hideCols.includes('phone'),

                                                        render: ({ phone, is_dialed }: any) => {
                                                            return (
                                                                <><b className='inline-flex items-center gap-1'>{phone} {is_dialed ? <PiPhoneCallBold color='green' /> : ''}</b></>
                                                            )
                                                        },
                                                    },

                                                    {
                                                        accessor: 'second_phone',
                                                        title: 'Second Phone',
                                                        hidden: hideCols.includes('second_phone'),
                                                    },
                                                    {
                                                        accessor: 'invest',
                                                        title: 'Invest',
                                                        hidden: hideCols.includes('invest'),
                                                    },
                                                    {
                                                        accessor: 'free_trial',
                                                        title: 'First Trail',
                                                        hidden: hideCols.includes('free_trial'),
                                                    },

                                                    {
                                                        accessor: 'followup',
                                                        title: 'Followup',
                                                        hidden: hideCols.includes('followup'),
                                                    },
                                                    {
                                                        accessor: 'source',
                                                        title: 'Source',
                                                        hidden: hideCols.includes('source'),
                                                    },
                                                    {
                                                        accessor: 'dnd',
                                                        title: 'DND',
                                                        hidden: hideCols.includes('dnd'),
                                                    },
                                                    {
                                                        accessor: 'city',
                                                        title: 'City',
                                                        hidden: hideCols.includes('city'),
                                                    },
                                                    {
                                                        accessor: 'state',
                                                        title: 'State',
                                                        hidden: hideCols.includes('state'),
                                                    },
                                                    {
                                                        accessor: 'products',
                                                        title: 'Products',
                                                        hidden: hideCols.includes('products'),
                                                    },
                                                    {
                                                        accessor: 'desc',
                                                        title: 'Desc',
                                                        hidden: hideCols.includes('desc'),
                                                    },


                                                    {
                                                        accessor: 'created_at',
                                                        title: 'Created At',
                                                        hidden: hideCols.includes('created_at'),
                                                    },
                                                    {
                                                        accessor: 'updated_at',
                                                        title: 'Updated At',
                                                        hidden: hideCols.includes('updated_at'),
                                                    },
                                                ]}


                                                onCellClick={({ record, column }) => {
                                                    if (column.accessor === "status") {
                                                        updateLeadStatus(record);
                                                    } else if (column.accessor === "phone") {
                                                        navigator.clipboard.writeText(record.phone)
                                                            .then(() => {
                                                                Swal.fire({
                                                                    icon: "success",
                                                                    title: "Number Copied!",
                                                                    toast: true,
                                                                    position: 'top',
                                                                    showConfirmButton: false,
                                                                    width: 450,
                                                                    timer: 2000,
                                                                    customClass: {
                                                                        popup: "color-success"
                                                                    }
                                                                });
                                                            })
                                                            .catch(err => {
                                                                console.error('Failed to copy: ', err);
                                                            });
                                                    } else {
                                                        navigate('/leads/viewleads/show', {
                                                            state: {
                                                                lead_id: record.id,
                                                                filterOwner: filterOwner,
                                                                filterStatus: filterStatus,
                                                                filterState: filterState,
                                                                multyLead: 1,
                                                            }
                                                        });
                                                    }
                                                }}


                                                totalRecords={data.totalItems}
                                                recordsPerPage={pageSize}
                                                page={page}
                                                onPageChange={(p) => setPage(p)}
                                                recordsPerPageOptions={PAGE_SIZES}
                                                onRecordsPerPageChange={setPageSize}
                                                sortStatus={{ columnAccessor: 'id', direction: 'asc' }}
                                                // onSortStatusChange={setSortStatus}
                                                selectedRecords={selectedRecords}
                                                onSelectedRecordsChange={setSelectedRecords}
                                                isRecordSelectable={() => authUser.user_type == 'Admin'}
                                                minHeight={500}
                                                fetching={tableLoading}
                                                loaderSize="xl"
                                                loaderColor="green"
                                                loaderBackgroundBlur={1}
                                                paginationText={({ totalRecords }) => `Showing  ${data?.from} to ${data.to} of ${totalRecords} entries`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <InlineLeadStatus
                                statusModel={statusModel}
                                setStatusModel={setStatusModel}
                                selectedLead={selectedLead}
                                leadStatus={allLeadStatus}
                                allLeadProducts={allLeadProducts}
                                fetchLeads={fetchLeads}

                            />

                            <CreateSale
                                createSaleDrawer={saleModel}
                                setCreateSaleDrawer={setSaleModel}
                                selectedLead={selectedLead}
                            />

                            ,

                            {/* <Show
                                leadModel={leadModel}
                                setLeadModel={setLeadModel}
                                selectedLead={selectedLead}
                                setSelectedLead={setSelectedLead}
                                data={data}
                                setData={setData}
                                fetchLeads={fetchLeads}
                                setSaleModel={setSaleModel}
                                owners={allLeadOwners}
                                page={page}
                                setPage={setPage}
                                tableLoading={tableLoading}
                            /> */}

                            <LeadRequest requestModal={requestModal} setRequestModal={setRequestModal} />

                            <BulkUpdate bulkUpdateModal={bulkUpdateModal}
                                setBulkUpdateModal={setBulkUpdateModal}
                                leadOwners={allLeadOwners}
                                leadStatuses={allLeadStatus}
                                leadSources={leadSources}
                                selectedRecords={selectedRecords}
                                fetchLeads={fetchLeads}
                                setSelectedRecords={setSelectedRecords}
                                setFirstTime={setFirstTime}
                            />

                            <OneClickTransfer octModal={octModal} setOtcModal={setOtcModal} />
                        </>
                    )}
                </>


            </MainLeft>
        </>

    )

}

const Error = ({ error, fetch }) => {
    return (<>

        <div className='bg-[#ece7f7] w-full h-[calc(80vh-80px)] flex flex-col items-center justify-center text-center space-y-4'>
            <h1 className='text-5xl font-extrabold'>{error?.status}</h1>
            <p><b>{error?.message}</b></p>
            <p><b>{error?.response?.statusText}</b></p>
            <div className='space-x-4'>
                <NavLink to={'/'} className='bg-blue-500 text-white px-4 py-2 rounded'>Back to Home</NavLink>
                <button className='bg-green-500 text-white px-4 py-2 rounded' onClick={() => fetch()}>Re Try</button>
            </div>
        </div>
    </>)
}






