import React, { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setCrmToken, setPageTitle } from '../../store/themeConfigSlice';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { IRootState } from '../../store';
import axios from 'axios';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useAuth } from '../../AuthContext';
import { IoMdRefresh } from "react-icons/io";
import { IoSearchSharp } from 'react-icons/io5';

const RegisterdClient = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { crmToken, apiUrl } = useAuth()

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [filterType, setFilterType] = useState('');
    const [search, setSearch] = useState('');
    const [applications, setApplications] = useState([])
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
    useEffect(() => {
        if (!crmToken) navigate('/')
        else {
            dispatch(setPageTitle('Application'));
            fetchRegisterdUserApplication()
        }
    }, [page, pageSize, search, filterType]);

    const [isLoading, setIsLoading] = useState(false)


    const [response, setResponse] = useState(null);

    const fetchRegisterdUserApplication = async () => {
        setIsLoading(true)
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/app/v1/signup-data?page=" + page + "&pageSize=" + pageSize + "&search=" + search,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") {
                console.log("*** Fetching Application User ***")
                setResponse(response.data.data);
                setApplications(response.data.data.data)

            }

        } catch (error) {

        } finally {
            setIsLoading(false)
        }
    }

    // const searchSetting=()=>{
    //     if (page !== 1) {
    //         setPage(1);
    //     } else {
    //         setIsLoading(true);
    //     }
    //     setSearch(search)
    // }


    return (
        <>
            <div className=" p-0 flex-1 overflow-x-hidden h-full">
                <div className="flex flex-col h-full">
                    <div className='panel'>
                        <div className='flex items-center justify-between mb-1'>
                            <h5 className="font-semibold text-lg dark:text-white-light">Registerd User</h5>
                            <div className='flex items-center justify-between gap-2'>
                            <div className="flex">
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Name" className="form-input ltr:rounded-r-none rtl:rounded-l-none" />
                        <div  className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            <IoSearchSharp />
                        </div>
                    </div>
                                {/* <input type="text" className="form-input w-auto" placeholder="Search By Name..." value={search} onChange={(e: any) => setSearch(e.target.value)} /> */}
                                <button onClick={() => { fetchRegisterdUserApplication() }} className="bg-[#f4f4f4] rounded-md p-2 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                    <IoMdRefresh className="w-5 h-5" />
                                </button>
                            </div>

                        </div>
                        <hr className="my-4 dark:border-[#191e3a]" />
                        <div className='mb-5'>
                            <div className="datatables">
                                <DataTable
                                    className="whitespace-nowrap table-hover"
                                    records={applications}
                                    columns={[
                                        {
                                            accessor: 'id',
                                            sortable: true,
                                            render: ({ id }) => (
                                                <div className="flex flex-col gap-2">
                                                    <div className="font-semibold">{id}</div>
                                                </div>
                                            ),
                                        },
                                        {
                                            accessor: 'name',
                                            title: 'Name',
                                            sortable: true,
                                            render: ({ name }) => (
                                                <div className="flex items-center gap-2">
                                                    <div className="font-semibold">{name}</div>
                                                </div>
                                            ),
                                        },

                                        {
                                            accessor: 'phone',
                                            title: 'Phone',
                                            sortable: true,
                                            render: ({ phone }) => (
                                                <div className="flex items-center gap-2">
                                                    <div className="font-semibold">{phone}</div>
                                                </div>
                                            ),
                                        },
                                        {
                                            accessor: 'email',
                                            title: 'Email',
                                            sortable: true,
                                            render: ({ email }) => (
                                                <div className="flex items-center gap-2">
                                                    <div className="font-semibold">{email}</div>
                                                </div>
                                            ),
                                        },
                                        {
                                            accessor: 'state',
                                            title: 'state',
                                            sortable: true,
                                            render: ({ state }) => (
                                                <div className="flex items-center gap-2">
                                                    <div className="font-semibold">{state}</div>
                                                </div>
                                            ),
                                        },
                                        {
                                            accessor: 'pincode',
                                            title: 'pincode',
                                            sortable: true,
                                            render: ({ pincode }) => (
                                                <div className="flex items-center gap-2">
                                                    <div className="font-semibold">{pincode}</div>
                                                </div>
                                            ),
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
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterdClient;
