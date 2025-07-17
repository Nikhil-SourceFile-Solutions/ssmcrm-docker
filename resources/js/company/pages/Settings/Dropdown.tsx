import React, { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setCrmToken, setPageTitle } from '../../store/themeConfigSlice';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { IRootState } from '../../store';
import axios from 'axios';
import Swal from 'sweetalert2';
import { MdDelete, MdDeleteOutline } from 'react-icons/md';
import { FaEdit, FaRegEye } from 'react-icons/fa';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { downloadExcel } from 'react-export-table-to-excel';
import IconFile from '../../components/Icon/IconFile';
import IconPrinter from '../../components/Icon/IconPrinter';
import { Tab } from '@headlessui/react';
import LeftTab from './LeftTab';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useAuth } from '../../AuthContext';
import { IoMdRefresh } from 'react-icons/io';
import { IoSearchSharp } from 'react-icons/io5';
const Dropdown = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { crmToken, apiUrl } = useAuth()

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [filterType, setFilterType] = useState('');
    const [search, setSearch] = useState('');
    const [dropdowns, setDropdown] = useState([])
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
    useEffect(() => {
        if (!crmToken) navigate('/')
        else {
            dispatch(setPageTitle('Dropdown'));
            fetchDropdowns()
        }
    }, [page, pageSize, filterType]);

    const [isLoading, setIsLoading] = useState(false)

    const [defaultParams] = useState({
        id: '',
        type: '',
        value: '',
        status: 0
    });

    // useEffect(() => {
    //     fetchDropdowns();
    // }, [page, pageSize, search, filterType])

    const [response, setResponse] = useState(null);
    const [fetchingError, setFetchingError] = useState(null);


    const fetchDropdowns = async () => {
        setIsLoading(true)
        setFetchingError(null)
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/dropdowns?page=" + page + "&pageSize=" + pageSize + "&filterType=" + filterType + "&search=" + search,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") {
                console.log("*** Fetching Dropdown Data ***")
                setResponse(response.data.data);
                setDropdown(response.data.data.data)

            }

        } catch (error) {
            setFetchingError(error)
        } finally {
            setIsLoading(false)
        }
    }
    function handleDownloadExcel() {
        const header = ['#', 'Type', 'Value', 'Status'];
        downloadExcel({
            fileName: 'Dropdowns',
            sheet: 'react-export-table-to-excel',
            tablePayload: {
                header,
                body: dropdowns.map((dropdown: any, index) => ({
                    a: index + 1,
                    b: dropdown.type,
                    c: dropdown.value,
                    h: dropdown.status ? 'Active' : 'Blocked',
                })),
            },
        });
    }
    const exportTable = (type: any) => {
        let columns: any = ['#', 'Type', 'Value', 'Status'];;
        let records = dropdowns.map((dropdown: any, index) => ({
            "#": index + 1,
            "Type": dropdown.type,
            "Value": dropdown.value,
            "Status": dropdown.status ? 'Active' : 'Blocked',
        }));
        let filename = 'Dropdowns';
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

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});
    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.value) {
            errors = { ...errors, value: "Dropdown Value is required" };
        }
        if (!params.type) {
            errors = { ...errors, type: "Dropdown type is required" };
        }
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };
    const [btnLoading, setBtnLoading] = useState(false);

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
    };
    const AddDropdown = async (data: any) => {
        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/dropdowns",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {
                showMessage(response.data.message)
                setParams(defaultParams)
                fetchDropdowns()
                setShowDropdownDrawer(false);
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
        data.append("type", params.type);
        data.append("value", params.value);
        data.append("status", params.status);
        AddDropdown(data);
    };
    const UpdateDropdown = (data: any) => {
        setErros({});
        if (data) {
            setParams({
                id: data.id,
                type: data.type,
                value: data.value,
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

    const distroy = (dropdowns: any) => {
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
                        url: apiUrl + '/api/dropdowns/' + dropdowns.id,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: "Bearer " + crmToken,
                        },
                    });
                    if (response.data.status === "success") {
                        // Swal.fire({ title: response.data.title, text: response.data.message, icon: 'success', customClass: 'sweet-alerts' });
                        showMessage(response.data.message)
                        fetchDropdowns()
                    }
                }
                catch (error) {
                    if (error.response && error.response.status === 400) {
                        showMessage("Cannot delete the Dropdown as it is being used.");
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
                url: apiUrl + '/api/dropdowns-status-update',
                data: { id: id },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                const newDropdowns = [...dropdowns],
                    index = dropdowns.findIndex((n: any) => n.id == id);
                newDropdowns[index] = {
                    ...newDropdowns[index],
                    status: response.data.value
                },
                    setDropdown(newDropdowns);
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
                    fetchingError ? <Error error={fetchingError} fetchDropdowns={fetchDropdowns} /> : (
                        <div className=" p-0 flex-1 overflow-x-hidden h-full">
                            <div className="flex flex-col h-full">
                                <div className='panel'>
                                    <div className='flex items-center justify-between mb-1'>
                                        <h5 className="font-semibold text-lg dark:text-white-light">Dropdown List</h5>
                                        <div className="flex items-center flex-wrap">
                                            <button type="button" className="btn btn-primary btn-sm m-1"
                                                onClick={handleDownloadExcel}
                                            >
                                                <IconFile className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                                EXCEL
                                            </button>
                                            <button type="button"
                                                onClick={() => exportTable('print')}
                                                className="btn btn-primary btn-sm m-1">
                                                <IconPrinter className="ltr:mr-2 rtl:ml-2" />
                                                PRINT
                                            </button>
                                        </div>
                                        <div className='flex gap-4'>
                                            <select className='form-select w-[150px]' onChange={(e: any) => setFilterType(e.target.value)}>
                                                <option value="">All</option>
                                                <option value={'Lead Source'}>Lead Source</option>
                                                <option value={'Lead Status'}>Lead Status</option>
                                                <option value={'Sale Status'}>Sale Status</option>
                                                <option value={'Lead Products'}>Lead Products</option>
                                                <option value={'Service By'}>Service By</option>
                                                <option value={'Client Type'}>Client Type</option>
                                                <option value={'Sender Id'}>Sender Id</option>
                                                <option value={'State'}>State</option>
                                                <option value={'Investment Size'}>Investment Size</option>
                                                <option value={'Lot Size'}>Lot Size</option>
                                                <option value={'DND Status'}>DND Status</option>
                                                <option value={'Speaking Languages'}>Speaking Languages</option>

                                            </select>
                                            <div className="flex">
                                                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Value" className="form-input min-w-[220px] ltr:rounded-r-none rtl:rounded-l-none" />
                                                <div
                                                    className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]"
                                                    onClick={() => page == 1 ? fetchDropdowns() : setPage(1)}
                                                >
                                                    <IoSearchSharp />
                                                </div>
                                            </div>
                                            {/* <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e: any) => setSearch(e.target.value)} /> */}

                                            <button className='btn btn-sm btn-primary' onClick={() => setShowDropdownDrawer(!showDropdownDrawer)}>Add Dropdown</button>
                                            <button onClick={() => { fetchDropdowns() }} className="bg-[#f4f4f4] rounded-md p-2  enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
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
                                                                        <div className='text-lg bold' >Dropdown</div>
                                                                        {params.id ? <button type='button' onClick={() => setParams(defaultParams)} className='btn btn-sm btn-primary'>Add Dropdown</button> : ''}
                                                                    </div>
                                                                    <hr className='mb-5' />
                                                                    <Tab.Panels>
                                                                        <Tab.Panel>
                                                                            <div className='mb-5 space-y-5'>
                                                                                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                                                    <div>
                                                                                        <label >Dropdown Type</label>
                                                                                        <select name="type" className="form-select text-white-dark" onChange={(e) => changeValue(e)} value={params.type ? params.type : ''}>
                                                                                            <option value="">Select Type</option>
                                                                                            <option value={'Lead Source'}>Lead Source</option>
                                                                                            <option value={'Lead Status'}>Lead Status</option>
                                                                                            <option value={'Sale Status'}>Sale Status</option>
                                                                                            <option value={'Lead Products'}>Lead Products</option>
                                                                                            {/* <option value={'Bank Account'}>Bank Account</option> */}
                                                                                            <option value={'Service By'}>Service By</option>
                                                                                            <option value={'Client Type'}>Client Type</option>
                                                                                            <option value={'Sender Id'}>Sender Id</option>
                                                                                            <option value={'State'}>State</option>
                                                                                            <option value={'Investment Size'}>Investment Size</option>
                                                                                            <option value={'Lot Size'}>Lot Size</option>
                                                                                            <option value={'DND Status'}>DND Status</option>
                                                                                            <option value={'Speaking Languages'}>Speaking Languages</option>

                                                                                        </select >
                                                                                        {errors?.type ? <div className="text-danger mt-1">{errors.type}</div> : ''}
                                                                                    </div >
                                                                                </div >
                                                                                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                                                    {
                                                                                        params.type === 'Sender Id' ?
                                                                                            <div>
                                                                                                <label >Value</label>
                                                                                                <input type="text" placeholder="Enter 6 digit Id" className="form-input"
                                                                                                    name='value'
                                                                                                    maxLength={6}
                                                                                                    value={params.value}
                                                                                                    onChange={(e) => changeValue(e)}
                                                                                                />
                                                                                                {errors?.value ? <div className="text-danger mt-1">{errors.value}</div> : ''}
                                                                                            </div> : <div>
                                                                                                <label >Value</label>

                                                                                                <input type="text" placeholder="Enter Dropdown Value" className="form-input"
                                                                                                    name='value'
                                                                                                    value={params.value}
                                                                                                    onChange={(e) => changeValue(e)}
                                                                                                />
                                                                                                {errors?.value ? <div className="text-danger mt-1">{errors.value}</div> : ''}
                                                                                            </div>
                                                                                    }

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
                                                                                    {btnLoading ? 'Please wait' : params.id ? 'Update Dropdown' : 'Add Dropdown'}
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
                                                records={dropdowns}
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
                                                        accessor: 'Type',
                                                        sortable: true,
                                                        render: ({ type }) => (
                                                            <div className="flex items-center gap-2">
                                                                <div className="font-semibold">{type}</div>
                                                            </div>
                                                        ),
                                                    },
                                                    {
                                                        accessor: 'Value',
                                                        sortable: true,
                                                        render: ({ value }) => (
                                                            <div className="flex items-center gap-2">
                                                                <div className="font-semibold">{value}</div>
                                                            </div>
                                                        ),
                                                    },
                                                    {
                                                        accessor: 'Status',
                                                        sortable: true,
                                                        render: ({ id, status }) => (
                                                            <div className="flex flex-col gap-2">
                                                                <label className="w-12 h-6 relative">
                                                                    <input type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" onChange={(e) => {
                                                                        updateStatus(id)
                                                                    }} id="custom_switch_checkbox1" checked={status ? true : false} />
                                                                    <span className={`outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                                </label>
                                                            </div>
                                                        ),
                                                    },
                                                    {
                                                        accessor: 'Action',
                                                        sortable: true,
                                                        render: (userFullData) => (
                                                            userFullData.is_editable ? (
                                                                <div className="flex gap-2">
                                                                    <button type="button" onClick={() => { UpdateDropdown(userFullData) }} className="btn btn-dark w-10 h-10 p-0 rounded-full"><FaEdit /></button>
                                                                    <button type="button" onClick={() => { distroy(userFullData) }} className="btn btn-dark w-10 h-10 p-0 rounded-full"><MdDelete /></button>
                                                                </div>
                                                            ) : <span className='badge badge-outline-danger'>Not Editable</span>

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
                                                paginationText={({ from, to, totalRecords }) => `Showing  ${response?.from} to ${response.to} of ${totalRecords} entries`}
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


const Error = ({ error, fetchDropdowns }) => {
    return (<>

        <div className='bg-[#ece7f7] w-full h-[calc(80vh-80px)] flex flex-col items-center justify-center text-center space-y-4'>
            <h1 className='text-5xl font-extrabold'>{error?.status}</h1>
            <p><b>{error?.message}</b></p>
            <p><b>{error?.response?.statusText}</b></p>
            <div className='space-x-4'>
                <NavLink to={'/'} className='bg-blue-500 text-white px-4 py-2 rounded'>Back to Home</NavLink>
                <button className='bg-green-500 text-white px-4 py-2 rounded' onClick={() => fetchDropdowns()}>Re Try</button>
            </div>
        </div>
    </>)
}
export default Dropdown;
