import React, { Fragment } from 'react'
import { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle, setCrmToken } from '../../../store/themeConfigSlice';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { downloadExcel } from 'react-export-table-to-excel';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import IconFile from '../../../components/Icon/IconFile';
import IconPrinter from '../../../components/Icon/IconPrinter';
import { FaRegEye } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import axios from 'axios';
import AddEmployee from './AddEmployee';
import Swal from 'sweetalert2';
import EmployeeView from './EmployeeView';
import Tippy from '@tippyjs/react';
import { RiLockPasswordLine } from "react-icons/ri";
import ChangePassword from './ChangePassword';
import PerfectScrollbar from 'react-perfect-scrollbar';
import LeftTab from '../LeftTab';
import { useAuth } from '../../../AuthContext';
import { IoMdRefresh } from 'react-icons/io';
import { IoSearchSharp } from 'react-icons/io5';
export default function Index() {
    const dispatch = useDispatch();
    useEffect(() => { dispatch(setPageTitle('List Employee')); });

    const { settingData, crmToken, apiUrl, authUser } = useAuth()

    if (settingData?.set_crmnews) {
        console.log(settingData.set_crmnews == 'analyst,account')
    }
    // const employeeData = useSelector((state: IRootState) => state.themeConfig.employeeData);
    const [fetchingError, setFetchingError] = useState(null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState(0);
    const [filterUserType, setFilterUserType] = useState(0);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [activeEmployee, setActiveEmployee] = useState([])

    useEffect(() => {
        fetchEmployee();
    }, [filterStatus, filterUserType, page, pageSize])
    const [branches, setBranches] = useState([])
    const [employees, setEmployee] = useState([])
    const [data, setData] = useState([]);
    const [response, setResponse] = useState(null);


    const fetchEmployee = async () => {
        setIsLoading(true);
        setFetchingError(null)

        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/users",
                params: {
                    page: page,
                    pageSize: pageSize,
                    search: search,
                    filterStatus: filterStatus,
                    filterUserType: filterUserType

                },
                // ?page=" + page + "&pageSize=" + pageSize + "&filterStatus=" + filterStatus + "&filterUserType=" + filterUserType + "&search=" + search,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });
            if (response.data.status == 'success') {
                console.log('**** Fetching Employee Data *****')
                console.log(response.data.data)

                setData(response.data.data)

                setActiveEmployee(response.data.activeEmployeecount)
                setBranches(response.data.branches);



            }

        } catch (error: any) {
            if (error.response.status == 401) dispatch(setCrmToken(''))
            setFetchingError(error)
        } finally {
            setIsLoading(false);

        }
    }
    const [employeeLeads, setEmployeeLeads] = useState([]);
    const [leadStatus, setLeadStatus] = useState([]);
    const [leadsCount, setLeadsCount] = useState([])
    const [isDisabled, setIsDisabled] = useState(false);

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/get-employee-leads/" + data.id,
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
            }

        } catch (error: any) {
            if (error.response.status == 401) dispatch(setCrmToken(''))
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isDisabled)
            fetchLeads();
    }, [isDisabled]);
    const updateStatus = (userId: number, status: boolean) => {
        setIsDisabled(!isDisabled)
        console.log(userId)
        if (!userId) return false;

        Swal.fire({
            title: 'Are you sure?',
            text: `You want to ${status === true ? 'Block' : 'Activate'} this employee`,
            icon: 'question',
            confirmButtonText: 'Yes',
            cancelButtonText: "No",
            html: `
                <p style="color: red; margin-bottom:10px">Here Are Leads Details</p>
                <ul style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; list-style: none; padding: 0; margin-top: 20px;">
                    <li style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold;">
                        Total Leads: <span>${leadsCount}</span>
                    </li>
                    <li style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold;">
                        Closed Won: <span>${leadStatus?.['Closed Won']}</span>
                    </li>
                    <li style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold;">
                        Follow Up: <span>${leadStatus?.['Follow Up']}</span>
                    </li>
                    <li style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold;">
                        Free Trial: <span>${leadStatus?.['Free Trial']}</span>
                    </li>
                    <li style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold;">
                        Fresh: <span>${leadStatus?.Fresh}</span>
                    </li>
                    <li style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold;">
                        New: <span>${leadStatus?.New}</span>
                    </li>
                </ul>
            `,
            showLoaderOnConfirm: true,
            showCancelButton: true,
            buttonsStyling: false, // Disable default styling
            customClass: {
                confirmButton: 'custom-confirm-button', // Red for "Yes"
                cancelButton: 'custom-cancel-button' // Primary color for "No"
            },
            preConfirm: async () => {
                try {
                    const response = await axios({
                        method: 'post',
                        url: apiUrl + "/api/user-update-status",
                        data: { id: userId },
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + crmToken,
                        },
                    });

                    if (response.data.status == "success") {
                        Swal.fire({
                            icon: response.data.status,
                            text: response.data.message,
                            padding: '2em',
                            customClass: 'sweet-alerts',
                        });
                        fetchEmployee();
                        const index = employees.findIndex((e) => e.id == response.data.employee.id)
                        if (response.data.employee) {
                            const newrecord: any = [...employees];
                            newrecord[index] = response.data.employee
                            setEmployee(newrecord)
                        }
                    } else if (response.data.status == "error") {
                        Swal.fire({
                            icon: response.data.status,
                            text: response.data.message,
                            padding: '2em',
                            customClass: 'sweet-alerts',
                        });
                    }
                } catch (error: any) {
                    console.log(error)
                    if (error.response.status == 401) dispatch(setCrmToken(''))
                }
            },
        });
    }

    useEffect(() => { setPage(1); }, [pageSize]);

    function handleDownloadExcel() {
        const header = ['#', 'Emp id', 'First Name', 'Last Name', 'Email', 'Phone', 'User Type', 'Status'];
        downloadExcel({
            fileName: 'employees',
            sheet: 'react-export-table-to-excel',
            tablePayload: {
                header,
                body: data?.data.map((person: any, index) => ({
                    a: index + 1,
                    b: person.employee_id,
                    c: person.first_name,
                    d: person.last_name,
                    e: person.email,
                    f: person.phone_number,
                    g: person.user_type,
                    h: person.status == 1 ? 'Active' : 'Blocked',
                })),
            },
        });
    }

    const exportTable = (type: any) => {
        let columns: any = ['id', 'Emp id', 'First Name', 'Last Name', 'Email', 'Phone', 'User Type', 'Status'];
        let records = data?.data.map((person: any, index) => ({
            id: index + 1,
            "Emp id": person.employee_id,
            "First Name": person.first_name,
            "Last Name": person.last_name,
            "Email": person.email,
            "Phone": person.phone_number,
            "User Type": person.user_type,
            "Status": person.status == 1 ? 'Active' : 'Blocked',
        }));
        let filename = 'employees';
        let newVariable: any;
        newVariable = window.navigator;
        if (type === 'print') {
            var rowhtml = '<p>' + filename + '</p>';
            rowhtml +=
                '<table style="width: 100%; " cellpadding="0" cellcpacing="0"><thead><tr style="color: #515365; background: #eff5ff; -webkit-print-color-adjust: exact; print-color-adjust: exact; "> ';
            columns.map((d: any) => {
                rowhtml += '<th>' + capitalize(d) + '</th>';
            });
            rowhtml += '</tr></thead>';
            rowhtml += '<tbody>';
            records.map((item: any) => {
                rowhtml += '<tr>';
                columns.map((d: any) => {
                    let val = item[d] ? item[d] : '';
                    rowhtml += '<td>' + val + '</td>';
                });
                rowhtml += '</tr>';
            });
            rowhtml +=
                '<style>body {font-family:Arial; color:#495057;}p{text-align:center;font-size:18px;font-weight:bold;margin:15px;}table{ border-collapse: collapse; border-spacing: 0; }th,td{font-size:12px;text-align:left;padding: 4px;}th{padding:8px 4px;}tr:nth-child(2n-1){background:#f7f7f7; }</style>';
            rowhtml += '</tbody></table>';
            var winPrint: any = window.open('', '', 'left=0,top=0,width=1000,height=600,toolbar=0,scrollbars=0,status=0');
            winPrint.document.write('<title>Print</title>' + rowhtml);
            winPrint.document.close();
            winPrint.focus();
            winPrint.print();
        }
    };

    const capitalize = (text: any) => {
        return text
            .replace('_', ' ')
            .replace('-', ' ')
            .toLowerCase()
            .split(' ')
            .map((s: any) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');
    };

    const [tab, setTab] = useState('employees')
    const [showDrawer, setShowDrawer] = useState(false);
    const [selectedData, setSelectedData] = useState([])
    const handleDrawer = (data) => {
        setSelectedData(data);
        setShowDrawer(true)
    }
    const [a, b] = useState('');
    const [editData, setEditData] = useState('');
    const editEmployee = (employee: any) => {
        setEditData(employee)
        setTab("add-employee")
    }

    const MAX_EMPLOYEES = settingData?.max_employee_count;
    const addEmployee = () => {

        if (settingData.crm_link) {
            setEditData('')
            setTab("add-employee")
        } else {
            Swal.fire({
                title: 'CRM Link Missing',
                text: 'Please add crm link in General Settings to Continue',
                padding: '2em',
                customClass: 'sweet-alerts',
            });
        }

    }
    const [changePasswordModel, setChangePasswordModel] = useState(false)

    return (

        <div className="flex gap-5 relative  h-full">
            <div className={`panel w-[280px]`}>
                <div className="flex flex-col h-full pb-2">
                    <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
                        <LeftTab />
                    </PerfectScrollbar>
                </div>
            </div>
            <>
                {tab == "employees" ? <>
                    {
                        // isLoading?<CommonLoader/>:
                        fetchingError ? (<Error error={fetchingError} fetchEmployee={fetchEmployee} />) :
                            (
                                <div className="panel p-0 flex-1 overflow-x-hidden h-full">
                                    <div className="flex flex-col h-full">
                                        <EmployeeView showDrawer={showDrawer} data={data} selectedData={selectedData} setShowDrawer={setShowDrawer} employees={employees} fetchEmployee={fetchEmployee} />
                                        <div className='panel'>
                                            <div className='flex items-center justify-between mb-5'>
                                                <h5 className="font-semibold text-lg dark:text-white-light">Employee List</h5>
                                                <div className=' flex gap-2' >


                                                    {activeEmployee >= MAX_EMPLOYEES ? <p className='text-red-700' >Employee limit reached Please Contact Admin.</p> :
                                                        <button type="submit" className="btn btn-primary"
                                                            onClick={() => { addEmployee() }
                                                            }>Add Employee</button>
                                                    }
                                                    <button onClick={() => { fetchEmployee() }} className="bg-[#f4f4f4] rounded-md p-2  enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                                        <IoMdRefresh className="w-5 h-5" />
                                                    </button>

                                                </div>
                                            </div>

                                            <div>
                                                {
                                                    authUser?.user_type == 'Admin' &&
                                                    <div>
                                                        {
                                                            branches?.filter((branch) => branch.admin == null).map((branch) => (
                                                                <div className='bg-[#fbe5e6] p-2 rounded mb-2'>
                                                                    <p> There is no Admin Found for <b>{branch.branch_name} </b> Branch</p>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                }
                                            </div>


                                            <hr className="my-4 dark:border-[#191e3a]" />
                                            <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                                                <div className="flex items-center flex-wrap">
                                                    <button type="button" className="btn btn-primary btn-sm m-1" onClick={handleDownloadExcel}>
                                                        <IconFile className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                                        EXCEL
                                                    </button>
                                                    <button type="button" onClick={() => exportTable('print')} className="btn btn-primary btn-sm m-1">
                                                        <IconPrinter className="ltr:mr-2 rtl:ml-2" />
                                                        PRINT
                                                    </button>
                                                </div>
                                                <div className="flex gap-4">
                                                    <select className='form-select w-[240px]' onChange={(e: any) => setFilterStatus(e.target.value)}>
                                                        <option value="">All</option>
                                                        <option value="Active">Active</option>
                                                        <option value="Inactive">Inactive</option>
                                                    </select>
                                                    <select className='form-select w-[240px]' onChange={(e: any) => setFilterUserType(e.target.value)}>
                                                        <option value="">All</option>
                                                        <option value='Admin'>Admin</option>
                                                        <option value='BDE'>BDE</option>
                                                        <option value='Accounts'>Accounts</option>
                                                        <option value='Team Leader'>Team Leader</option>
                                                        <option value='Manager'>Manager</option>
                                                        <option value='HR'>HR</option>
                                                    </select>
                                                </div>
                                                <div className=' flex justify-between gap-2' >
                                                    <div className="flex">
                                                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Name" className="form-input min-w-[220px] ltr:rounded-r-none rtl:rounded-l-none" />
                                                        <div
                                                            className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]"
                                                            onClick={() => page == 1 ? fetchEmployee() : setPage(1)}
                                                        >
                                                            <IoSearchSharp />
                                                        </div>
                                                    </div>
                                                    {/* <input type="text" name="search" value={search} id="" className="form-input w-auto" placeholder="Search..." onChange={(e: any) => setSearch(e.target.value)} /> */}

                                                </div>
                                            </div>
                                            <div className="datatables">
                                                <DataTable
                                                    highlightOnHover
                                                    className="whitespace-nowrap table-hover"
                                                    records={data?.data}
                                                    columns={[
                                                        {
                                                            accessor: 'Emp. ID',
                                                            sortable: true,
                                                            render: ({ employee_id, branch_name }) => (
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="font-semibold">{employee_id}</div>
                                                                    <h1>{branch_name ? branch_name : ''}</h1>
                                                                </div>
                                                            ),
                                                        },
                                                        {
                                                            accessor: 'Name',
                                                            sortable: true,
                                                            render: ({ first_name, last_name, langauge_known }) => (
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <img src={`https://ui-avatars.com/api/?name=${first_name}&background=random`} className="w-9 h-9 rounded-full max-w-none" alt="user-profile" />

                                                                        <div>
                                                                            <div className="font-semibold">{first_name} {last_name}</div>
                                                                            {
                                                                                // langauge_known ?JSON.parse(langauge_known):[]
                                                                                // JSON.parse(langauge_known)?.join(',')
                                                                                // : []
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ),
                                                        },
                                                        {
                                                            accessor: 'email',
                                                            sortable: true,
                                                            render: ({ email, manager, leader, manager_id, team_leader_id }) => (
                                                                <div className="">
                                                                    <div className="font-semibold">{email}</div>
                                                                    <div className=' flex gap-2' >


                                                                        {
                                                                            manager_id &&
                                                                            <Tippy content={manager} placement="bottom">
                                                                                <h1 className="badge badge-outline-info w-fit">Manager</h1>
                                                                            </Tippy>
                                                                        }
                                                                        {
                                                                            team_leader_id &&
                                                                            <Tippy content={leader} placement="bottom">
                                                                                <h1 className="badge badge-outline-info w-fit">Team Leader</h1>
                                                                            </Tippy>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            ),
                                                        },

                                                        {
                                                            accessor: 'Mobile Number',
                                                            sortable: true,
                                                            render: ({ phone_number }) => {
                                                                const formatPhoneNumber = (number) => {
                                                                    const digitsOnly = number.replace(/\D/g, ''); // Remove non-digit characters
                                                                    if (digitsOnly?.length !== 10) {
                                                                        return number; // Return the original number if it's not 10 digits
                                                                    }
                                                                    return digitsOnly.split('').map((digit, index) =>
                                                                        index <= 5 ? 'x' : digit
                                                                    ).join('');
                                                                };

                                                                return (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="font-semibold">{settingData?.crm_phone ? formatPhoneNumber(phone_number) : phone_number}</div>
                                                                    </div>
                                                                );
                                                            },
                                                        },
                                                        {
                                                            accessor: 'Type',
                                                            sortable: true,
                                                            render: ({
                                                                user_type }) => (
                                                                <div className="flex flex-col gap-2">
                                                                    <span className="badge badge-outline-primary w-fit">{user_type}</span>
                                                                </div>
                                                            ),
                                                        },
                                                        {
                                                            accessor: 'Status',
                                                            sortable: true,
                                                            render: ({ status, id, user_type }) => (
                                                                <div className="flex flex-col gap-2">
                                                                    {
                                                                        user_type == 'Admin' ? <label className="w-12 h-6 relative">
                                                                            <input type="checkbox" disabled className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" checked={status == 1 ? true : false} />
                                                                            <span className={`
                                                            outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                                        </label>
                                                                            : <label className="w-12 h-6 relative">
                                                                                <input type="checkbox" onChange={() => updateStatus(id, status)} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" checked={status == 1 ? true : false} />
                                                                                <span className={`
                                                            outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                                            </label>
                                                                    }
                                                                </div>
                                                            ),
                                                        },
                                                        {
                                                            accessor: 'Action',
                                                            sortable: true,
                                                            render: (userFullData) => (
                                                                <div className="flex gap-2">
                                                                    <NavLink to="#" state={{ params: userFullData }}>

                                                                        <Tippy content="Change Password" placement="bottom">
                                                                            <button
                                                                                type="button"

                                                                                onClick={() => {
                                                                                    {

                                                                                        b(userFullData.id)
                                                                                        setChangePasswordModel(true);
                                                                                    }
                                                                                }}
                                                                                className="btn btn-dark w-10 h-10 p-0 rounded-full"
                                                                            >
                                                                                <RiLockPasswordLine />
                                                                            </button>
                                                                        </Tippy>
                                                                    </NavLink>
                                                                    <NavLink to="#" state={{ params: userFullData }}>
                                                                        <Tippy content="View" placement="bottom">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    {
                                                                                        handleDrawer(userFullData)
                                                                                        setShowDrawer(true)
                                                                                    }
                                                                                }}
                                                                                className="btn btn-dark w-10 h-10 p-0 rounded-full">
                                                                                <FaRegEye />
                                                                            </button>
                                                                        </Tippy>
                                                                    </NavLink>
                                                                    {
                                                                        userFullData?.user_type
                                                                        !== "Admin" &&
                                                                        <Tippy content="Edit" placement="bottom">
                                                                            <button
                                                                                className="btn btn-dark w-10 h-10 p-0 rounded-full"
                                                                                onClick={() => { editEmployee(userFullData) }}
                                                                            >
                                                                                <FaEdit />
                                                                            </button>
                                                                        </Tippy>
                                                                    }
                                                                </div>
                                                            ),
                                                        },
                                                    ]}

                                                    totalRecords={data.totalItems}
                                                    recordsPerPage={pageSize}
                                                    page={page}
                                                    onPageChange={(p) => setPage(p)}
                                                    recordsPerPageOptions={PAGE_SIZES}
                                                    onRecordsPerPageChange={setPageSize}
                                                    sortStatus={{ columnAccessor: 'id', direction: 'asc' }}
                                                    minHeight={500}
                                                    fetching={isLoading}
                                                    loaderSize="xl"
                                                    loaderColor="green"
                                                    loaderBackgroundBlur={1}
                                                    paginationText={({ totalRecords }) => `Showing  ${data?.from} to ${data.to} of ${totalRecords} entries`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <ChangePassword lead={a} fetchEmployee={fetchEmployee} setChangePasswordModel={setChangePasswordModel} changePasswordModel={changePasswordModel} />


                                </div>
                            )
                    }

                </> :

                    tab == "add-employee" ? <AddEmployee
                        tab={tab}
                        setTab={setTab}
                        editData={editData}
                        fetchEmployee={fetchEmployee}

                    />
                        : null}

            </>

        </div>

    )


}

const Error = ({ error, fetchEmployee }) => {
    return (<>

        <div className='bg-[#ece7f7] w-full h-[calc(80vh-80px)] flex flex-col items-center justify-center text-center space-y-4'>
            <h1 className='text-5xl font-extrabold'>{error?.status}</h1>
            <p><b>{error?.message}</b></p>
            <p><b>{error?.response?.statusText}</b></p>
            <div className='space-x-4'>
                <NavLink to={'/'} className='bg-blue-500 text-white px-4 py-2 rounded'>Back to Home</NavLink>
                <button className='bg-green-500 text-white px-4 py-2 rounded' onClick={() => fetchEmployee()}>Re Try</button>
            </div>
        </div>
    </>)
}



