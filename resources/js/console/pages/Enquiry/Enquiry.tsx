import React, { Fragment, useRef } from 'react'
import { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle, setCrmToken, setEmployeeData } from '../../store/themeConfigSlice';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { downloadExcel } from 'react-export-table-to-excel';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import IconFile from '../../components/Icon/IconFile';
import IconPrinter from '../../components/Icon/IconPrinter';
import { IRootState } from '../../store';
import { FaRegEye } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import axios from 'axios';
import Swal from 'sweetalert2';
import Tippy from '@tippyjs/react';
import { RiLockPasswordLine } from "react-icons/ri";
import { Tab } from '@headlessui/react';
import { MdDeleteOutline } from "react-icons/md";
import { useAuth } from '../../AuthContext';


export default function Enquiry() {
    const dispatch = useDispatch();
    useEffect(() => { dispatch(setPageTitle('List Employee')); });

    const { crmToken, apiUrl,authUser,settingData } = useAuth()
    if (settingData?.set_crmnews) {
        console.log(settingData.set_crmnews == 'analyst,account')
    }
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState(0);
    const [filterUserType, setFilterUserType] = useState(0);
    const [search, setSearch] = useState('');
    useEffect(() => {
    }, [crmToken])

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [250, 500, 1000, 1500, 2000, 2500];;
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    useEffect(() => {
        fetchEmployee();
    }, [filterStatus, filterUserType, search, page])

    const [employees, setEmployee] = useState([])
    const [data, setData] = useState([]);
    const [response, setResponse] = useState(null);
    const fetchEmployee = async () => {
        setIsLoading(true);
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/products?page=" + page + "&pageSize=" + pageSize + "&filterStatus=" + filterStatus + "&filterUserType=" + filterUserType + "&search=" + search,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });
            if (response.data.status == 'success') {
                console.log('**** Fetching Employee Data *****')
                setEmployee(response.data.data.data)
                setData(response.data.data.data)
                setResponse(response.data.data);


            }

        } catch (error: any) {
            if (error.response.status == 401) dispatch(setCrmToken(''))
        } finally {
            setIsLoading(false);
        }
    }

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
    useEffect(() => { setPage(1); }, [pageSize]);

    useEffect(() => {

        dispatch(setPageTitle('Enquiry'));
    });

    return (
        <div>
            <div className="panel p-0 flex-1 overflow-x-hidden h-full">
                <div className="flex flex-col h-full">
                    <div className='panel'>
                        <div className='flex items-center justify-between mb-5'>
                            <h5 className="font-semibold text-lg dark:text-white-light">Enquiry List</h5>
                        </div>

                        <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">

                            <input type="text" name="search" value={search} id="" className="form-input w-auto" placeholder="Search..." onChange={(e: any) => setSearch(e.target.value)} />

                        </div>
                        <div className="datatables">
                            <DataTable
                                highlightOnHover
                                className="whitespace-nowrap table-hover"
                                records={employees}
                                columns={[
                                    {
                                        accessor: 'ID',
                                        sortable: true,
                                        render: ({ id }) => (
                                            <div className="flex flex-col gap-2">
                                                <div className="font-semibold">{id}</div>
                                            </div>
                                        ),
                                    },

                                    {
                                        accessor: 'Name',
                                        sortable: true,
                                        render: ({ pro_name }) => (
                                            <div>
                                                <div className="flex items-center gap-2">

                                                    <div>
                                                        <div className="font-semibold">{pro_name}</div>

                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    },


                                    {
                                        accessor: 'Email',
                                        sortable: true,
                                        render: ({ pro_per }) => (
                                            <div>
                                                <div className="flex items-center gap-2">

                                                    <div>
                                                        <div className="font-semibold">heloo@gmail.com</div>

                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        accessor: 'Phone',
                                        sortable: true,
                                        render: ({ pro_per }) => (
                                            <div>
                                                <div className="flex items-center gap-2">

                                                    <div>
                                                        <div className="font-semibold">9988776655</div>

                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        accessor: 'City',
                                        sortable: true,
                                        render: ({ pro_per }) => (
                                            <div>
                                                <div className="flex items-center gap-2">

                                                    <div>
                                                        <div className="font-semibold">bangalore</div>

                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    },



                                ]}
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
    )
}
