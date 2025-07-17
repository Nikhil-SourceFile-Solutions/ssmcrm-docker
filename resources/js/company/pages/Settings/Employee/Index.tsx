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
import { useToast } from '../../../ToastContext ';

import { Dialog, Transition, Tab } from '@headlessui/react';
import Authentication from './Authentication';

import { TbAuth2Fa } from "react-icons/tb";


function Index() {


    const dispatch = useDispatch();
    useEffect(() => { dispatch(setPageTitle('List Employee')); });

    const { settingData, crmToken, apiUrl, authUser } = useAuth()

    const { max_employee_count } = settingData;
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [fetchingError, setFetchingError] = useState(null);

    const [firstTime, setFirstTime] = useState(true);
    const [filterStatus, setFilterStatus] = useState(0);
    const [filterUserType, setFilterUserType] = useState(0);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    const [data, setData] = useState<any>([]);

    const [modal, setModal] = useState(false);

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
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });
            if (response.data.status == 'success') {
                console.log('**** Fetching Employee Data *****')
                setData(response.data.data)

                // (response.data.data)
                // setBranches(response.data.branches);

            }

        } catch (error: any) {
            if (error.response.status == 401) dispatch(setCrmToken(''))
            setFetchingError(error)
        } finally {
            setIsLoading(false);
            setFirstTime(false)
        }
    }

    const [reload, setReload] = useState(true);
    useEffect(() => {
        fetchEmployee()
    }, [page, reload])

    useEffect(() => {
        if (page != 1) setPage(1)
        else if (!firstTime) setReload(!reload)
    }, [pageSize, filterStatus, filterUserType])



    /////////////////////////////////////////////////////////////////////

    const [tab, setTab] = useState('employees');
    const [editData, setEditData] = useState([]);

    const editEmployee = (employee: any) => {
        if (employee) setEditData(employee)
        else setEditData([])
        setTab("add-employee")
    }

    const [showDrawer, setShowDrawer] = useState(false)

    const [selectedData, setSelectedData] = useState([]);

    const [model, setModel] = useState(false)

    const [warning, setWarning] = useState([]);
    const handleStatus = async (id) => {

        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/users-handle-status",
                params: {
                    id: id,
                },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") {

                addToast({
                    variant: 'success',
                    title: response.data.message,
                });
                fetchEmployee()

            } else if (response.data.status == "error") {

                if (response.data.action == "lead") {
                    setWarning(response.data.data)
                    setModal(true)

                    // const { totalLeads, closedWonLeads, followUpLeads, freeTrailLeads } = ;
                    // console.log(totalLeads, closedWonLeads, followUpLeads, freeTrailLeads)
                }
            }

        } catch (error) {

        } finally {

        }


    }

    const [modalAuth, setModalAuth] = useState(false);
    return (
        <div className="flex gap-5 relative  h-full">

            {
                authUser?.user_type == 'HR' ? null :
                    <div className={`panel w-[280px]`}>
                        <div className="flex flex-col h-full pb-2">
                            <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
                                <LeftTab />
                            </PerfectScrollbar>
                        </div>
                    </div>
            }


            <>

                {tab == "employees" ? (<div className="panel p-0 flex-1 overflow-x-hidden h-full">
                    <div className="flex flex-col h-full">
                        <div className='panel'>
                            <div className='flex items-center justify-between mb-5'>
                                <h5 className="font-semibold text-lg dark:text-white-light">Employee List</h5>
                                <div className=' flex gap-2' >
                                    <div className='m-auto '>
                                        {data?.activeEmployeecount >= max_employee_count ? (<span className='badge bg-[#fd0000] animate-pulse'>
                                            Employee limit [<b>{max_employee_count}</b>] reached Please Contact Admin.
                                        </span>) : (
                                            <div className='flex justify-between items-center gap-2'>
                                                <span className='badge bg-[#075E54]'>
                                                    Maximum Allowed Active Employees :  <b>{max_employee_count}</b>
                                                </span>
                                                <button type="submit" className="btn btn-primary btn-sm shadow"
                                                    onClick={() => { editEmployee(null) }
                                                    }>Add Employee</button>

                                            </div>)}
                                    </div>


                                    <button onClick={() => fetchEmployee()} className="bg-[#f4f4f4]  rounded-md p-2  enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                        <IoMdRefresh className="w-4 h-4" />
                                    </button>

                                </div>
                            </div>

                            {/* <div>
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
                                            </div> */}


                            <hr className="my-4 dark:border-[#191e3a]" />
                            <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                                <div className="flex items-center flex-wrap">
                                    <button type="button" className="btn btn-primary btn-sm m-1"
                                    // onClick={handleDownloadExcel}
                                    >
                                        <IconFile className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                        EXCEL
                                    </button>
                                    <button type="button"
                                        //  onClick={() => exportTable('print')}
                                        className="btn btn-primary btn-sm m-1">
                                        <IconPrinter className="ltr:mr-2 rtl:ml-2" />
                                        PRINT
                                    </button>
                                </div>
                                <div className="flex gap-4">
                                    <select className='form-select w-[240px]'
                                        onChange={(e: any) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                    <select className='form-select w-[240px]'
                                        onChange={(e: any) => setFilterUserType(e.target.value)}
                                    >
                                        <option value="">All</option>

                                        {data?.userTypes?.map((type) => (
                                            <option value={type}>{type}</option>
                                        ))}


                                    </select>
                                </div>
                                <div className=' flex justify-between gap-2' >
                                    <div className="flex">
                                        <input type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search by Name"
                                            className="form-input min-w-[220px] ltr:rounded-r-none rtl:rounded-l-none" />
                                        <div
                                            className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]"
                                            onClick={() => page == 1 ? setReload(!reload) : setPage(1)}
                                        >
                                            <IoSearchSharp />
                                        </div>
                                    </div>
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
                                                                <input type="checkbox"
                                                                    onChange={() => handleStatus(id)}
                                                                    className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" checked={status == 1 ? true : false} />
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
                                                    <Tippy content="2F Authentication" placement="bottom">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                {
                                                                    setSelectedData(userFullData)
                                                                    setModalAuth(true);
                                                                }
                                                            }}
                                                            className="btn btn-dark w-10 h-10 p-0 rounded-full"
                                                        >
                                                            <TbAuth2Fa size={25} />
                                                        </button>
                                                    </Tippy>

                                                    <Tippy content="Change Password" placement="bottom">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                {
                                                                    setSelectedData(userFullData)
                                                                    setModel(true);
                                                                }
                                                            }}
                                                            className="btn btn-dark w-10 h-10 p-0 rounded-full"
                                                        >
                                                            <RiLockPasswordLine />
                                                        </button>
                                                    </Tippy>

                                                    <Tippy content="View" placement="bottom">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                {
                                                                    setSelectedData(userFullData)
                                                                    setShowDrawer(true)
                                                                }
                                                            }}
                                                            className="btn btn-dark w-10 h-10 p-0 rounded-full">
                                                            <FaRegEye />
                                                        </button>
                                                    </Tippy>
                                                    {
                                                        userFullData?.user_type
                                                        !== "Admin" &&
                                                        <Tippy content="Edit" placement="bottom">
                                                            <button
                                                                className="btn btn-dark w-10 h-10 p-0 rounded-full"
                                                                onClick={() => editEmployee(userFullData)}
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


                    <Transition appear show={modal} as={Fragment}>
                        <Dialog as="div" open={modal} onClose={() => setModal(false)}>
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="fixed inset-0" />
                            </Transition.Child>
                            <div className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
                                <div className="flex items-start justify-center min-h-screen px-4">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-out duration-300"
                                        enterFrom="opacity-0 scale-95"
                                        enterTo="opacity-100 scale-100"
                                        leave="ease-in duration-200"
                                        leaveFrom="opacity-100 scale-100"
                                        leaveTo="opacity-0 scale-95"
                                    >
                                        <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-hidden my-8 w-full max-w-lg text-black dark:text-white-dark">
                                            <div className="flex bg-[#fbe5e6] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                                <div className="text-lg font-bold">Warning</div>

                                            </div>


                                            <div className="p-5">
                                                <h1 className='font-bold text-[#e95f2b]'>This employee holds leads!</h1>
                                                <p className='font-bold text-[#e95f2b]'>
                                                    Please transfer those leads to an active employee and then attempt to block this employee.
                                                </p>
                                                <div className='flex flex-wrap'>


                                                    {warning?.totalLeads ? (<div className='flex flex-col bg-danger/10 p-2.5 rounded w-fit m-2'>
                                                        <b>{warning?.totalLeads}</b>
                                                        <small className='font-extrabold text-[#777]'>Total Leads</small>
                                                    </div>) : null}


                                                    {warning?.closedWonLeads ? (<div className='flex flex-col bg-danger/10 p-2.5 rounded w-fit m-2'>
                                                        <b>{warning?.closedWonLeads}</b>
                                                        <small className='font-extrabold text-[#777]'>Closed Won Leads</small>
                                                    </div>) : null}

                                                    {warning?.followUpLeads ? (<div className='flex flex-col bg-danger/10 p-2.5 rounded w-fit m-2'>
                                                        <b>{warning?.followUpLeads}</b>
                                                        <small className='font-extrabold text-[#777]'>Follow Up Leads</small>
                                                    </div>) : null}

                                                    {warning?.freeTrailLeads ? (<div className='flex flex-col bg-danger/10 p-2.5 rounded w-fit m-2'>
                                                        <b>{warning?.freeTrailLeads}</b>
                                                        <small className='font-extrabold text-[#777]'>Free Trail Leads</small>
                                                    </div>) : null}

                                                </div>
                                                <div className="flex justify-end items-center mt-8">

                                                    <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => setModal(false)}>
                                                        Ok
                                                    </button>
                                                </div>
                                            </div>
                                        </Dialog.Panel>
                                    </Transition.Child>
                                </div>
                            </div>
                        </Dialog>
                    </Transition>

                </div>) :

                    <AddEmployee
                        tab={tab}
                        setTab={setTab}
                        editData={editData}
                        fetchEmployee={fetchEmployee}

                    />
                }



            </>

            <ChangePassword selectedData={selectedData} fetchEmployee={fetchEmployee} setModel={setModel} model={model} />

            <EmployeeView showDrawer={showDrawer} selectedData={selectedData} setShowDrawer={setShowDrawer} fetchEmployee={fetchEmployee} />

            <Authentication user={selectedData} modal={modalAuth} setModal={setModalAuth} />
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

export default Index
