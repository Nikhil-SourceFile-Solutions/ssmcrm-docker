import React, { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { MdDelete, MdDeleteOutline } from 'react-icons/md';
import { FaEdit, FaRegEye } from 'react-icons/fa';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { Tab } from '@headlessui/react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { IoMdRefresh } from 'react-icons/io';
import { useAuth } from '../../../AuthContext';
import { setBranches, setCrmToken, setPageTitle } from '../../../store/themeConfigSlice';
import LeftTab from '../LeftTab';

const Branches = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { crmToken, apiUrl } = useAuth()

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [filterType, setFilterType] = useState('');
    const [search, setSearch] = useState('');
    const [branches, setBranch] = useState([])
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
    useEffect(() => {
        if (!crmToken) navigate('/')
        else {
            dispatch(setPageTitle('Branches'));
            fetchBranches()
        }
    }, [page, pageSize, search, filterType]);

    const [isLoading, setIsLoading] = useState(false)

    const [defaultParams] = useState({
        id: '',
        branch_name: '',
        branch_location: '',
        name: '',
        email: '',
        mobile_no: '',
        status: 0
    });

    // useEffect(() => {
    //     fetchBranches();
    // }, [page, pageSize, search, filterType])

    const [response, setResponse] = useState(null);
    const [fetchingError, setFetchingError] = useState(null);


    const fetchBranches = async () => {
        setIsLoading(true)
        setFetchingError(null)
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/branches?page=" + page + "&pageSize=" + pageSize + "&filterType=" + filterType + "&search=" + search,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") {
                console.log("*** Fetching Branch Data ***")
                setResponse(response.data.data);
                setBranch(response.data.data.data)

            }

        } catch (error) {
            setFetchingError(error)
        } finally {
            setIsLoading(false)
        }
    }

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});
    const validate = () => {
        setErros({});
        let errors = {};


        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };
    const [btnLoading, setBtnLoading] = useState(false);

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
    };
    const AddBranches = async (data: any) => {
        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/branches",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {
                showMessage(response.data.message)
                setParams(defaultParams)
                fetchBranches()
                setShowDropdownDrawer(false);
                dispatch(setBranches(response.data.branches))
            } else { alert("Failed") }

        } catch (error: any) {
            console.log(error)
            if (error.response.status == 401) dispatch(setCrmToken(''))
            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                    console.log(serveErrors[key][0])
                }
                setErros(serverErrors);
                Swal.fire({
                    title: "Server Validation Error! Please Solve",
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    showCancelButton: false,
                    width: 450,
                    timer: 2000,
                    customClass: {
                        popup: "color-danger"
                    }
                });
            }
        } finally {
            setBtnLoading(false)
        }
    };
    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("id", params.id);
        data.append("branch_name", params.branch_name);
        data.append("branch_location", params.branch_location);
        data.append("name", params.name);
        data.append("email", params.email);
        data.append("mobile_no", params.mobile_no);
        data.append("status", params.status);
        AddBranches(data);
    };
    const UpdateBranch = (data: any) => {
        setErros({});
        if (data) {
            setParams({
                id: data.id,
                branch_name: data.branch_name,
                branch_location: data.branch_location,
                name: data.name,
                email: data.email,
                mobile_no: data.mobile_no,
                status: data.status ? "1" : "0"
            });
            setShowDropdownDrawer(true)
        }
    }


    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    const distroy = (branches: any) => {
        Swal.fire({
            icon: 'warning',
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
                        url: apiUrl + '/api/branches/' + branches.id,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: "Bearer " + crmToken,
                        },
                    });
                    if (response.data.status === "success") {
                        // Swal.fire({ title: response.data.title, text: response.data.message, icon: 'success', customClass: 'sweet-alerts' });
                        showMessage(response.data.message)
                        fetchBranches()
                    }
                    if (response.data.status === "error") {
                        // Swal.fire({ title: response.data.title, text: response.data.message, icon: 'success', customClass: 'sweet-alerts' });
                        showMessage(response.data.message)
                        fetchBranches()
                    }
                }
                catch (error) {
                    if (error.response && error.response.status === 400) {
                        showMessage("Cannot delete the Branch as it is being used.");
                    } else {
                        showMessage("Error deleting product.");
                    }
                }
                finally {

                }
            }
        });

    }
    const updateStatus = async (id: number) => {

        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + '/api/branch-status-update',
                data: { id: id },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                const newDropdowns = [...branches],
                    index = branches.findIndex((n: any) => n.id == id);
                newDropdowns[index] = {
                    ...newDropdowns[index],
                    status: response.data.value
                },
                    setBranch(newDropdowns);
                    dispatch(setBranches(response.data.branches))
                Swal.fire({
                    title: response.data.message,
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    showCancelButton: false,
                    width: 500,
                    timer: 2000,
                    customClass: {
                        popup: "color-success"
                    }
                });
            }
        } catch (error) {

        }

    }
    const [showDropdownDrawer, setShowDropdownDrawer] = useState(false)

    return (
        <>

            <div className="flex gap-5 relative  h-full">
                <div className={`panel w-[280px]`}>
                    <div className="flex flex-col h-full pb-2">
                        <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
                            <LeftTab />
                        </PerfectScrollbar>
                    </div>
                </div>
                {
                    fetchingError ? <Error error={fetchingError} fetchBranches={fetchBranches} /> : (
                        <div className=" p-0 flex-1 overflow-x-hidden h-full">
                            <div className="flex flex-col h-full">
                                <div className='panel'>
                                    <div className='flex items-center justify-between mb-1'>
                                        <h5 className="font-semibold text-lg dark:text-white-light">Branch List</h5>

                                        <div className='flex gap-4'>

                                            <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e: any) => setSearch(e.target.value)} />

                                            <button className='btn btn-sm btn-primary' onClick={() => setShowDropdownDrawer(!showDropdownDrawer)}>Add Branch</button>
                                            <button onClick={() => { fetchBranches() }} className="bg-[#f4f4f4] rounded-md p-2  enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                                <IoMdRefresh className="w-5 h-5" />
                                            </button>
                                            <div className={`${(showDropdownDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setShowDropdownDrawer(!showDropdownDrawer)}>
                                            </div>
                                            <nav className={`${(showDropdownDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                                                } bg-white fixed ltr:-right-[500px] rtl:-left-[500px] top-0 bottom-0 w-full max-w-[500px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4 pt-0`}>
                                                <div className="flex flex-col h-screen overflow-hidden">
                                                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">
                                                        <form autoComplete="off" action="" method="post" className='p-0'>
                                                            <div className="mb-5">
                                                                <Tab.Group>
                                                                    <div className='flex justify-between mb-4 ' >
                                                                        <div className='text-lg bold' >Branch</div>
                                                                        {/* {params.id ? <button type='button' onClick={() => setParams(defaultParams)} className='btn btn-sm btn-primary'>Add Dropdown</button> : ''} */}
                                                                    </div>
                                                                    <hr className='mb-5' />
                                                                    <Tab.Panels>
                                                                        <Tab.Panel>
                                                                            <div className='mb-5 space-y-5'>

                                                                                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">

                                                                                    <div>
                                                                                        <label >Branch name</label>
                                                                                        <input type="text" placeholder="Enter Branch Name" className="form-input"
                                                                                            name='branch_name'

                                                                                            value={params.branch_name}
                                                                                            onChange={(e) => changeValue(e)}
                                                                                        />
                                                                                        {errors?.branch_name ? <div className="text-danger mt-1">{errors.branch_name}</div> : ''}
                                                                                    </div>
                                                                                </div>

                                                                                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">

                                                                                    <div>
                                                                                        <label >Location</label>
                                                                                        <input type="text" placeholder="Enter Location" className="form-input"
                                                                                            name='branch_location'
                                                                                            value={params.branch_location}
                                                                                            onChange={(e) => changeValue(e)}
                                                                                        />
                                                                                        {errors?.branch_location ? <div className="text-danger mt-1">{errors.branch_location}</div> : ''}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">

                                                                                    <div>
                                                                                        <label > name</label>
                                                                                        <input type="text" placeholder="Enter Name" className="form-input"
                                                                                            name='name'
                                                                                            value={params.name}
                                                                                            onChange={(e) => changeValue(e)}
                                                                                        />
                                                                                        {errors?.name ? <div className="text-danger mt-1">{errors.name}</div> : ''}
                                                                                    </div>
                                                                                </div>

                                                                                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">

                                                                                    <div>
                                                                                        <label >Email</label>
                                                                                        <input type="text" placeholder="Enter Email Id" className="form-input"
                                                                                            name='email'
                                                                                            value={params.email}
                                                                                            onChange={(e) => changeValue(e)}
                                                                                        />
                                                                                        {errors?.email ? <div className="text-danger mt-1">{errors.email}</div> : ''}
                                                                                    </div>
                                                                                </div>

                                                                                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">

                                                                                    <div>
                                                                                        <label >Mobile Number</label>
                                                                                        <input type="text" placeholder="Enter Mobile Number" className="form-input"
                                                                                            name='mobile_no'
                                                                                            // maxLength={10}
                                                                                            value={params.mobile_no}
                                                                                            onChange={(e) => changeValue(e)}
                                                                                        />
                                                                                        {errors?.mobile_no ? <div className="text-danger mt-1">{errors.mobile_no}</div> : ''}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                                                    <div>
                                                                                        <label >Status</label>
                                                                                        <select name="status" className="form-select text-white-dark" onChange={(e) => changeValue(e)} value={params.status ? params.status : ''}>
                                                                                            <option value={''}>Select Status</option>
                                                                                            <option value={1}>Active</option>
                                                                                            <option value={0}>Inactive</option>
                                                                                        </select >
                                                                                        {errors?.status ? <div className="text-danger mt-1">{errors.status}</div> : ''}
                                                                                    </div >
                                                                                </div >
                                                                                <button type="button" onClick={() => formSubmit()} disabled={btnLoading} className="btn bg-[#1d67a7] text-white ltr:ml-4 rtl:mr-4">
                                                                                    {btnLoading ? 'Please wait' : params.id ? 'Update Branch' : 'Add Branch'}
                                                                                </button>
                                                                            </div >
                                                                        </Tab.Panel>
                                                                    </Tab.Panels>
                                                                </Tab.Group>
                                                            </div>
                                                        </form>
                                                    </section>
                                                </div>
                                            </nav>
                                        </div>
                                    </div>
                                    <hr className="my-4 dark:border-[#191e3a]" />
                                    <div className='mb-5'>
                                        <div className="datatables">
                                            <DataTable
                                                className="whitespace-nowrap table-hover"
                                                records={branches}
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
                                                        accessor: 'branch_name',
                                                        title: 'Branch Name',
                                                        sortable: true,
                                                        render: ({ branch_name }) => (
                                                            <div className="flex items-center gap-2">
                                                                <div className="font-semibold">{branch_name}</div>
                                                            </div>
                                                        ),
                                                    },
                                                    {
                                                        accessor: 'branch_location',
                                                        title: 'Location',
                                                        sortable: true,
                                                        render: ({ branch_location }) => (
                                                            <div className="flex items-center gap-2">
                                                                <div className="font-semibold">{branch_location}</div>
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
                                                        accessor: 'mobile_no',
                                                        title: 'Mobile Number',
                                                        sortable: true,
                                                        render: ({ mobile_no }) => (
                                                            <div className="flex items-center gap-2">
                                                                <div className="font-semibold">{mobile_no}</div>
                                                            </div>
                                                        ),
                                                    },
                                                    {
                                                        accessor: 'status',
                                                        sortable: true,
                                                        render: ({ id, status }) => (
                                                            <div className="flex flex-col gap-2">
                                                                {
                                                                    id==1?'':

                                                                <label className="w-12 h-6 relative">
                                                                    <input type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" onChange={(e) => {
                                                                        updateStatus(id)
                                                                    }} id="custom_switch_checkbox1" checked={status ? true : false} />
                                                                    <span className={`outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
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
                                                                    <button type="button" onClick={() => { UpdateBranch(userFullData) }} className="btn btn-dark w-10 h-10 p-0 rounded-full"><FaEdit /></button>

                                                                   {
                                                                    userFullData.id==1?'':

                                                                    <button type="button" onClick={() => { distroy(userFullData) }} className="btn btn-dark w-10 h-10 p-0 rounded-full"><MdDelete /></button>
                                                                   }
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
                    )
                }

            </div>
        </>
    );
};


const Error = ({ error, fetchBranches }) => {
    return (<>

        <div className='bg-[#ece7f7] w-full h-[calc(80vh-80px)] flex flex-col items-center justify-center text-center space-y-4'>
            <h1 className='text-5xl font-extrabold'>{error?.status}</h1>
            <p><b>{error?.message}</b></p>
            <p><b>{error?.response?.statusText}</b></p>
            <div className='space-x-4'>
                <NavLink to={'/'} className='bg-blue-500 text-white px-4 py-2 rounded'>Back to Home</NavLink>
                <button className='bg-green-500 text-white px-4 py-2 rounded' onClick={() => fetchBranches()}>Re Try</button>
            </div>
        </div>
    </>)
}
export default Branches;
