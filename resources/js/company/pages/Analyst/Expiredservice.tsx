import { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle, setHideCols, setCrmToken } from '../../store/themeConfigSlice';
import Select from 'react-select';
import { NavLink, useNavigate } from 'react-router-dom';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { IRootState } from '../../store';
import axios from 'axios';
import { IoMdRefresh } from "react-icons/io";
import { FaWhatsapp } from 'react-icons/fa';

import Main from '../Development/Main';
import React from 'react';
import { useAuth } from '../../AuthContext';



export default function Index() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const hideCols = useSelector((state: IRootState) => state.themeConfig.hideCols);
    const { crmToken, apiUrl, logout } = useAuth()

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [filteredOwner, setFilteredOwner] = useState({ value: 1, label: "Admin" });
    const [filteredStatus, setFilteredStatus] = useState({ value: 0, label: "All" });
    const [ownerChanged, setOwnerChanged] = useState(0);
    const [filterType, setFilterType] = useState('');
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false)
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
    const [response, setResponse] = useState(null);

    useEffect(() => {
        setOwnerChanged(1)
        setFilteredStatus({ value: 0, label: "All" })
    }, [filteredOwner.value])

    useEffect(() => {
        if (!crmToken) navigate('/')
        else {
            dispatch(setPageTitle('View Leads'));
            // fetchLeads()
        }

    }, [page, filteredOwner.value, filteredStatus.value, pageSize]);

    // Lead View
    const [leads, setLeads] = useState([]);
    const [defaultStatus, setDefaultStatus] = useState({ value: " ", label: "All" });
    const [selectedRecords, setSelectedRecords] = useState<any>([]);
    const [showNotificationDrawer, setShowNotificationDrawer] = useState(false)

    useEffect(() => {

        if (filteredStatus || filteredOwner) setPage(1)

    }, [filteredOwner, filteredStatus])


    useEffect(() => {
        fetchProductprice();
    }, [page, pageSize, search])


    const [filterProducts, setFilterProducts] = useState('');
    const [sales, setSales] = useState([]);
    const [product, setProduct] = useState([]);
    const fetchProductprice = async () => {
        setIsLoading(true);
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/expired-sales?page=" + page + "&pageSize=" + pageSize + "&filterProducts=" + filterProducts + "&search=" + search,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });
            if (response.data.status == 'success') {
                setResponse(response.data.data);
                setSales(response.data.data.data)
                console.log('fuufufufufuf', response.data.products)
                if (!product.length) setProduct(response.data.products)
            }
        } catch (error: any) {
            console.log(error)
            if (error?.response?.status == 401) logout()
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <div className="panel p-0 flex-1 overflow-x-hidden h-full">
            <div className="flex flex-col h-full">
                <div className="panel shadow-none ">
                    <div className='flex justify-between gap-4'>
                        <div className='flex gap-3  w-full'>
                            <div>
                                <Select placeholder="Select Lead Status" onChange={(e: any) => {
                                    console.log(e)
                                    setFilterType(e.target);

                                }} defaultValue={defaultStatus} className='w-[230px] z-10'
                                    options={product?.map((service: any) => {
                                        return { value: service.pro_name, label: service.pro_name }
                                    })}
                                />
                            </div>
                            <input type="text" className="form-input w-auto" placeholder="Search By Number..." value={search} onChange={(e: any) => setSearch(e.target.value)} />
                        </div>


                        <div className='flex gap-3 justify-end  w-full'>
                            {selectedRecords.length ? (
                                <div className="flex items-center flex-wrap">
                                    <button type="button" className="btn btn-primary m-1" onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}>
                                        <FaWhatsapp className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                        Send Advice
                                    </button>
                                    {/* <NotificationBox showNotificationDrawer={showNotificationDrawer} selectedRecords={selectedRecords} leads={leads} setShowNotificationDrawer={setShowNotificationDrawer} /> */}

                                </div>

                            ) : ''}

                            {/* <NavLink to="/analyst/viewrecommendation" onClick={() => setShowNotificationDrawer(!showNotificationDrawer)} className="btn btn-secondary m-1">View Advice</NavLink> */}

                            <button disabled={isLoading ? true : false} onClick={() => fetchProductprice()} className="bg-[#f4f4f4] rounded-md p-2 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                <IoMdRefresh className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    {/* Data Table  */}

                    <div className="datatables  mt-4">
                        <DataTable
                            className="whitespace-nowrap table-hover"
                            records={sales}
                            columns={[
                                // {
                                //     accessor: 'id',
                                //     title: ' Id',
                                //     sortable: true,
                                // },
                                {
                                    accessor: 'first_name',
                                    title: 'Full Name',
                                    sortable: true,
                                    render: (lead: any) => {
                                        return (<span>{lead.first_name} {lead.last_name} </span>)
                                    },
                                },
                                {
                                    accessor: 'phone',
                                    title: 'Phone',
                                    sortable: true,
                                },
                                {
                                    accessor: 'client_type',
                                    title: 'Client Type',
                                    sortable: true,
                                },

                                {
                                    accessor: 'status',
                                    title: 'Status',
                                    sortable: true,
                                    render: (lead: any) => {
                                        return (
                                            lead.status == "Closed Won" ? <button type="button" className="btn btn-success btn-sm shadow-sm py-0.5">Create Sale</button> :

                                                <span className={`badge bg-[#1da740] text-center cursor-pointer py-0.5 w-full`} >{lead.status}</span>

                                        )
                                    },
                                },
                                // {
                                //     accessor: 'email',
                                //     title: 'Email',
                                //     sortable: true,
                                // },
                                {
                                    accessor: 'created_at',
                                    title: 'Date Time',
                                    sortable: true,
                                },
                            ]}

                            highlightOnHover
                            totalRecords={response?.total}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={setPageSize}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            minHeight={200}
                            fetching={isLoading}
                            loaderColor="blue"
                            loaderBackgroundBlur={4}
                            paginationText={({ from, to, totalRecords }) => `Showing  ${response?.form} to ${response.to} of ${totalRecords} entries`}
                            selectedRecords={selectedRecords}
                            onSelectedRecordsChange={setSelectedRecords}
                        />
                    </div>

                </div >
            </div >
        </div>
    )
}

