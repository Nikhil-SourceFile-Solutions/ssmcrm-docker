import React, { Fragment, useEffect, useRef, useState } from 'react'
import { IRootState } from '../../../store';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { setCrmToken, setPageTitle } from '../../../store/themeConfigSlice';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';

const EmployeeView = ({ showDrawer, setShowDrawer, selectedData, fetchEmployee }) => {


    const params = selectedData

    const dispatch = useDispatch();
    useEffect(() => { dispatch(setPageTitle('List Employee')); });

    const { settingData, crmToken, apiUrl } = useAuth()

    const [tab, setTab] = useState('employeeDetails');
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    useEffect(() => {
        if (tab == 'activity') {
            setTab(tab)
        }
        if (tab == 'login') {
            setTab(tab)

        }
    })



    useEffect(() => {
        if (showDrawer) fetchData();
    }, [showDrawer]);
    const [qrCode, setQrCode] = useState("");

    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/users/create",
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == 'success') {

                // setData(response.data.users)
            }
        } catch (error) {
            alert(error);

        }
    }


    useEffect(() => {
        if (showDrawer)
            getEmployeeLeads();
    }, [showDrawer]);

    const [isLoading, setIsLoading] = useState(false);
    const [employeeLeads, setEmployeeLeads] = useState([]);
    const [leadStatus, setLeadStatus] = useState([]);
    const [leadsCount, setLeadsCount] = useState([])

    const getEmployeeLeads = async () => {
        setIsLoading(true);
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/get-employee-leads/" + params.id,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });
            if (response.data.status == 'success') {
                console.log('**** Fetching Leads Data based on Employee *****')
                console.log(response)
                setEmployeeLeads(response.data.data)
                setLeadStatus(response.data.status_counts)
                setLeadsCount(response.data.lead_count)
                setQrCode(response.data.qrCodeUrl)
            }

        } catch (error: any) {
            if (error.response.status == 401) dispatch(setCrmToken(''))
        } finally {
            setIsLoading(false);
        }
    }


    const deleteEmployee = (params: any) => {
        Swal.fire({
            icon: "question",
            title: 'Are You Sure',
            confirmButtonText: 'Yes',
            text: 'You will not be able to retrieve it',

            showLoaderOnConfirm: true,
            customClass: 'sweet-alerts',
            preConfirm: async () => {
                try {
                    const response = await axios({
                        method: 'delete',
                        url: apiUrl + "/api/users/" + params.id,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + crmToken,
                        },
                    });


                    if (response.data.status == 'success') {
                        fetchEmployee()
                        setShowDrawer(false);
                        Swal.fire({
                            title: response.data.message,
                            toast: true,
                            position: 'top',
                            showConfirmButton: false,
                            showCancelButton: false,
                            width: 450,
                            timer: 2000,
                            customClass: {
                                popup: "color-success"
                            }
                        });
                    } else if (response.data.status == 'error') {
                        Swal.fire({
                            icon: response.data.status,
                            title: response.data.title,
                            text: response.data.message,
                            padding: '2em',
                            customClass: 'sweet-alerts',
                        });
                    }
                } catch (error: any) {
                    console.log(error)
                }
            },
        });
    }



    return (
        <div>
            <div className={`${(showDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setShowDrawer(!showDrawer)}></div>
            <nav
                className={`${(showDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                    } bg-white fixed ltr:-right-[800px] rtl:-left-[800px] top-0 bottom-0 w-full max-w-[600px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4`}
            >
                <div className="flex flex-col h-screen overflow-hidden">


                    <div className="panel flex-1 overflow-x-hidden h-full">
                        <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                            <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar">
                                <div className="mb-5">
                                    <div className="mb-5 flex items-center justify-between">
                                        <div className="flex items-center w-max">
                                            <div className="flex-none">
                                                {params?.first_name && (
                                                    <div >
                                                        <img className="rounded-md w-10 h-10 object-cover" src={`https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${params?.first_name}`} alt="userProfile" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ltr:ml-2 rtl:mr-2">
                                                <div className="font-semibold">{params?.first_name}</div>
                                                <div className="text-sx text-white-dark">{params?.phone_number}</div>
                                            </div>
                                        </div>
                                        <div className='flex gap-4'>
                                            <button className={`${tab == "employeeDetails" && 'text-secondary !outline-none before:!w-full'} before:inline-block' relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`}
                                                onClick={() => setTab('employeeDetails')}>Employee </button>
                                            <button className={`${tab == "activity" && 'text-secondary !outline-none before:!w-full'} before:inline-block' relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`}
                                                onClick={() => setTab('activity')}> Logs </button>
                                        </div>
                                    </div>
                                    <hr />
                                    {tab == 'employeeDetails' ?
                                        <div className='space-y-5 mb-5 mt-5'>

                                            {qrCode ? <img src={qrCode} alt="QR Code" /> : <p>Loading QR Code...</p>}
                                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label >Branch Name</label>

                                                    <input type="text" className="form-input"
                                                        defaultValue={params?.branch_name}
                                                        disabled
                                                    />

                                                </div>
                                                <div>
                                                    <label >Employee ID</label>
                                                    <input type="text" className="form-input"
                                                        defaultValue={params?.employee_id}
                                                        disabled
                                                    />
                                                </div>
                                                <div>
                                                    <label >First Name</label>
                                                    <input type="text"
                                                        className="form-input"
                                                        defaultValue={params?.first_name}
                                                        disabled
                                                    />
                                                </div>
                                                <div>
                                                    <label >Last Name</label>
                                                    <input type="text"
                                                        className="form-input"
                                                        defaultValue={params?.last_name}
                                                        disabled
                                                    />
                                                </div>
                                                <div>
                                                    <label >Email Address</label>
                                                    <input type="text"
                                                        className="form-input"
                                                        defaultValue={params?.email}
                                                        disabled
                                                    />
                                                </div>
                                                <div>
                                                    <label >Phone Number</label>
                                                    <input type="text"
                                                        className="form-input"
                                                        defaultValue={params?.phone_number}
                                                        disabled
                                                    />
                                                </div>

                                                <div className="relative">
                                                    <label >CRM  password</label>
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        className="form-input pr-10"
                                                        name="password"
                                                        disabled
                                                        defaultValue={params.show_password}
                                                    />

                                                    <span
                                                        onClick={togglePasswordVisibility}
                                                        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer pt-6"
                                                    >
                                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                    </span>
                                                </div>
                                                <div className="relative">
                                                    <label >CRM  Pin</label>
                                                    <input
                                                        type='text'
                                                        placeholder="Enter CRM Pin"
                                                        className="form-input pr-10"
                                                        name="password"
                                                        disabled
                                                        defaultValue={params.pin}
                                                    />
                                                </div>
                                                <div>

                                                    <label >Speaking Language </label>
                                                    <input
                                                        type='text'
                                                        placeholder="No Language Selected"
                                                        className="form-input pr-10"
                                                        disabled
                                                        defaultValue={params.langauge_known}
                                                    />
                                                </div>
                                                <div>
                                                    <label >User Type</label>
                                                    <input
                                                        type='text'
                                                        placeholder="No Language Selected"
                                                        className="form-input pr-10"
                                                        disabled
                                                        defaultValue={params?.user_type}
                                                    />

                                                </div>


                                                {
                                                    params?.user_type == 'BDE' ?
                                                        <div>
                                                            <label >Team Lead</label>
                                                            <input
                                                                type='text'
                                                                className="form-input pr-10"
                                                                disabled
                                                                defaultValue={params?.leader}
                                                            />
                                                        </div> : null
                                                }

                                                {
                                                    params?.user_type == 'Team Leader' || params.user_type == 'BDE' ?
                                                        <div>
                                                            <label >Manager</label>

                                                            <input
                                                                type='text'
                                                                className="form-input pr-10"
                                                                disabled
                                                                defaultValue={params?.manager}
                                                            />

                                                        </div> : null

                                                }
                                                <div>
                                                    <label >Status</label>

                                                    <input
                                                        type='text'
                                                        className="form-input pr-10"
                                                        disabled
                                                        defaultValue={params.status == 1 ? 'Active' : 'Inactive'}
                                                    />


                                                </div>

                                            </div>

                                            {/* {
                                                params.user_type == 'Admin' ? '' : <div className='flex justify-center'>
                                                    <button type='button' className='btn btn-sm btn-danger' onClick={() => { deleteEmployee(params) }}  >Delete Employee</button>
                                                </div>

                                            } */}
                                        </div>
                                        : tab == 'activity' ?
                                            <Logs user_id={selectedData?.id} showDrawer={showDrawer} /> : null

                                    }
                                </div>
                            </section>
                        </div>
                    </div>

                </div>
            </nav>
        </div>
    )
}



import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import IconFile from '../../../components/Icon/IconFile';
import { downloadExcel } from 'react-export-table-to-excel';
import { useAuth } from '../../../AuthContext';
import { userInfo } from 'os';
import { Header } from '@mantine/core';
const Logs = ({ user_id, showDrawer }) => {

    const { settingData, crmToken, apiUrl } = useAuth()

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [filterUser, setFilterUser] = useState('');
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, [page, pageSize, filterUser, search, users])

    useEffect(() => {
        if (showDrawer) fetchLogs();
    }, [showDrawer, user_id, page, pageSize, filterUser, search, users])
    const [employeeLogs, setEmployeeLogs] = useState([])
    const [response, setResponse] = useState('')
    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const response = await axios({
                method: 'get',

                url: apiUrl + "/api/employee-logs?page=" + page + "&pageSize=" + pageSize,

                params: { id: user_id },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });
            if (response.data.status == 'success') {
                setEmployeeLogs(response.data.logs.data)
                setResponse(response.data.logs)
            }

        } catch (error: any) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }
    function handleDownloadExcel() {
        const header = ['#', 'Emp id', 'Ip Address', 'Device', 'browser', 'browser version', 'platform', 'is_robot', 'Date'];
        downloadExcel({
            fileName: 'employeeLogs',
            sheet: 'react-export-table-to-excel',
            tablePayload: {
                header,
                body: employeeLogs.map((person: any, index) => ({
                    a: index + 1,
                    b: person.id,
                    c: person.ip_address,
                    d: person.device,
                    e: person.browser,
                    f: person.browser_version,
                    g: person.platform,
                    h: person.is_robot,
                    i: person.created_at,
                    // j: person.status == 1 ? 'Active' : 'Blocked',
                })),
            },
        });
    }
    return (
        <div className='space-y-5 mb-5 mt-5'>
            <button type="button" className="btn btn-primary btn-sm m-1" onClick={handleDownloadExcel}>
                <IconFile className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                EXCEL
            </button>
            <div className="datatables">
                <DataTable
                    highlightOnHover
                    className="whitespace-nowrap table-hover"
                    records={employeeLogs}
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
                            accessor: 'Action',
                            sortable: true,
                            render: ({ action }) => (
                                <div className="flex flex-col gap-2">
                                    {action == "Log In" ? <span className='badge badge-outline-success text-center'>Log In</span> : <span className='badge badge-outline-danger text-center'>Log Out</span>}

                                </div>
                            ),
                        },
                        {
                            accessor: 'IP Address',
                            sortable: true,
                            render: ({ ip_address }) => (
                                <div className="flex items-center gap-2">
                                    <div className="font-semibold">{ip_address}</div>
                                </div>
                            ),
                        },
                        {
                            accessor: 'Browser',
                            sortable: true,
                            render: ({ browser, browser_version }) => (
                                <div className="flex items-center gap-2">
                                    <div className="font-semibold">{browser} <br /> {browser_version}</div>
                                </div>
                            ),
                        },
                        {
                            accessor: 'device',
                            sortable: true,
                            render: ({ device, device_type }) => (
                                <div className="flex items-center gap-2">
                                    <div className="font-semibold">{device} <br />{device_type}</div>
                                </div>
                            ),
                        },
                        {
                            accessor: 'platform',
                            sortable: true,
                            render: ({ platform }) => (
                                <div className="flex items-center gap-2">
                                    <div className="font-semibold">{platform}</div>
                                </div>
                            ),
                        },
                        {
                            accessor: 'is_robot',
                            sortable: true,
                            render: ({ is_robot }) => (
                                <div className="flex items-center gap-2">
                                    <div className="font-semibold">{is_robot ? 'Robot' : 'Human'}</div>
                                </div>
                            ),
                        },
                        {
                            accessor: 'Date Time',
                            sortable: true,
                            render: ({ created_at }) => (
                                <div className="flex items-center gap-2">
                                    <div className="font-semibold">{created_at}</div>
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
                    // selectedRecords={selectedRecords}
                    // onSelectedRecordsChange={setSelectedRecords}
                    minHeight={200}
                    fetching={isLoading}
                    loaderColor="blue"
                    loaderBackgroundBlur={4}
                    paginationText={({ from, to, totalRecords }) => `Showing  ${response?.form} to ${response.to} of ${totalRecords} entries`}
                />
            </div>

        </div>
    )
}
export default EmployeeView;
