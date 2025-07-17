import React, { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setCrmToken, setPageTitle } from '../../../store/themeConfigSlice';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { IRootState } from '../../../store';
import axios from 'axios';
import Swal from 'sweetalert2';
import { MdDelete, MdDeleteOutline } from 'react-icons/md';
import { FaEdit, FaRegEye } from 'react-icons/fa';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { downloadExcel } from 'react-export-table-to-excel';
import IconFile from '../../../components/Icon/IconFile';
import IconPrinter from '../../../components/Icon/IconPrinter';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { Tab } from '@headlessui/react';
import AddPackage from './AddPackage';
import Select from 'react-select';
import PerfectScrollbar from 'react-perfect-scrollbar';
import LeftTab from '../LeftTab';
import { useAuth } from '../../../AuthContext';


const ListSalary = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => { dispatch(setPageTitle('ListSalary')); });

    const location = useLocation();

  const { settingData, crmToken, apiUrl } = useAuth()

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });

    useEffect(() => {
        if (!crmToken) navigate('/')
        else {
            dispatch(setPageTitle('Dropdown'));
            fetchSalary()
        }
    }, [page, pageSize]);


    const editDropdown = location?.state?.dropdown;
    const [isLoading, setIsLoading] = useState(false)
    const [salaries, setSalary] = useState([])
    const [modal, setModal] = useState<any>(false);

    const [defaultParams] = useState({
        id: '',
        select_package: '',
        select_employee: '',
        fixed_salary: '',
        incentive_amount: '',
        incentive_percentage: '',
        status: ''
    });

    const [search, setSearch] = useState('');
    useEffect(() => { fetchSalary(); }, [page, search])
    const [response, setResponse] = useState<any>(null);
    const [whatsappConfiguration, setWhatsappConfiguration] = useState(0)

    const fetchSalary = async () => {
        setIsLoading(true)
        try {
            const a = whatsappConfiguration;
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/salaries",
                // ?page=" + page + "&pageSize=" + pageSize + "&search=" + search ,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") {
                console.log('***** Fetching Whatsapp Data *****')
                setResponse(response.data.data);
                setSalary(response.data.salary);
                const selectedPackageId = params.select_package;

                // Find the package details using the selected ID
                const selectedPackage = packages.find(pack => pack.id === parseInt(selectedPackageId));

            }

        } catch (error) {

        } finally {
            setIsLoading(false)
        }
    }

    function handleDownloadExcel() {
        const header = ['#', 'Template Name', 'Template', 'Status'];
        downloadExcel({
            fileName: 'Last Login',
            sheet: 'react-export-table-to-excel',
            tablePayload: {
                header,
                body: salaries.map((sms: any, index) => ({
                    a: index + 1,
                    c: sms.select_package,
                    d: sms.select_package,
                    e: sms.status ? 'Active' : 'Blocked',
                })),
            },
        });
    }

    const exportTable = (type: any) => {
        let columns: any = ['#', 'Template Name', 'Template', 'Status'];
        let records = salaries.map((sms: any, index) => ({
            "#": index + 1,
            "Template Name": sms.template_name,
            "Template": sms.select_package,
            "Status": sms.status ? 'Active' : 'Blocked',
        }));
        let filename = 'SMS';
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
        if (!params.select_package) {
            errors = { ...errors, select_package: "Please Select Package" };
        }
        console.log(errors);
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };
    const [btnLoading, setBtnLoading] = useState(false);
    const [showWhatsAppDrawer, setShowWhatsAppDrawer] = useState(false)
    const [selectedPackage, setSelectedPackage] = useState(null);

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
        if (name === 'select_package') {
            const packageDetails = packages.find(pack => pack.id === parseInt(value));
            setSelectedPackage(packageDetails || null);
        }
    };

    const AddSalary = async (data: any) => {
        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/salaries",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {
                showMessage(response.data.message);
                setParams(defaultParams)
                fetchSalary()
                setShowWhatsAppDrawer(false);

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
                showMessage('Server Validation Error!!!!')
            }
        } finally {
            setBtnLoading(false)
        }
    };

    const UpdateSalary = (userFullData: any) => {
        setErros({});
        if (userFullData) {
            setParams({
                id: userFullData?.id,
                select_employee: userFullData?.select_employee,
                select_package: userFullData?.select_package,
                fixed_salary: userFullData?.fixed_salary,
                incentive_amount: userFullData?.incentive_amount,
                incentive_percentage: userFullData?.incentive_percentage,
                status: userFullData?.status
            });
        } else {
            const defaltData = JSON.parse(JSON.stringify(defaultParams));
            setParams(defaltData);
        }
        setModal(true)
        setShowWhatsAppDrawer(true)
    }

    const distroy = (userFullData: any) => {

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
                        url: apiUrl + '/api/salaries/' + userFullData.id,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: "Bearer " + crmToken,
                        },
                    });
                    if (response.data.status === "success") {
                        showMessage(response.data.message)
                        fetchSalary()
                    }
                } catch (error: any) {

                } finally {

                }
            }
        });

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

    const [showDrawer, setShowDrawer] = useState(false);
    // const [showNewDrawer, setShowNewDrawer] = useState(false);


    // const updateStatus = async (id: number) => {
    //     try {
    //         const response = await axios({
    //             method: 'post',
    //             url: apiUrl + '/api/whatsapp-update-status',
    //             data: { id: id },
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 Authorization: "Bearer " + crmToken,
    //             },
    //         });

    //         if (response.data.status == "success") {
    //             const newsalaries = [...salaries],
    //                 index = salaries.findIndex((n: any) => n.id == id);
    //             newsalaries[index] = {
    //                 ...newsalaries[index],
    //                 status: response.data.value
    //             },
    //                 setSalary(newsalaries);
    //             Swal.fire({
    //                 title: response.data.message,
    //                 toast: true,
    //                 position: 'top',
    //                 showConfirmButton: false,
    //                 showCancelButton: false,
    //                 width: 500,
    //                 timer: 2000,
    //                 customClass: {
    //                     popup: "color-success"
    //                 }
    //             });
    //             fetchSalary();
    //         }
    //     } catch (error) {

    //     }

    // }

    const [addPackageModel, setAddPackageModel] = useState(false)

    const [packages, setPackage] = useState([])
    useEffect(() => {
        fetchPackage();
    }, [])
    const fetchPackage = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/packages",
                // + page + "&pageSize=" + pageSize + "&search=" + search + "&whatsappConfiguration=" + a,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") {
                console.log('***** Fetching Package *****')
                setResponse(response.data.data);
                setPackage(response.data.package);
            }

        } catch (error) {

        } finally {
            setIsLoading(false)
        }
    }
    console.table(params)




    const [employees, setEmployee] = useState([])
    const [data, setData] = useState([]);
    const [filterStatus, setFilterStatus] = useState(0);
    const [filterUserType, setFilterUserType] = useState(0);
    useEffect(() => {
        fetchEmployee()
    }, []);
    const fetchEmployee = async () => {
        setIsLoading(true);
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/users?page=" + page + "&pageSize=" + pageSize + "&filterStatus=" + filterStatus + "&filterUserType=" + filterUserType + "&search=" + search,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status === 'success') {
                console.log('**** Fetching Employee Data *****');
                // Map employee data to fit the format for react-select options
                const employeeOptions = response.data.data.data.map((employee: any) => ({
                    label: employee.first_name,
                    value: employee.id,
                }));

                setEmployee(employeeOptions); // Setting the formatted options
                setData(employeeOptions);     // Assuming you want to keep a similar state
                setResponse(response.data.data);

                // dispatch(setEmployeeData(response.data.data.data)); // Full data if needed elsewhere
            }

        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                dispatch(setCrmToken(''));
            }
        } finally {
            setIsLoading(false);
        }
    };
    const [selectedEmployees, setSelectedEmployees] = useState([]); // For selected values


    // Handle selection change
    const handleSelectChange = (selectedOptions) => {
        setSelectedEmployees(selectedOptions);

        const employeeIds = selectedOptions.map((employee) => employee.label);
        setParams({ ...params, select_employee: employeeIds });

        console.log('Selected Employees:', selectedOptions);
        console.log('Params:', params);
    };
    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("id", params.id);
        data.append("select_employee", params.select_package);
        data.append("fixed_salary", selectedPackage?.fixed_salary);
        data.append("select_package", params.select_package);
        data.append("incentive_amount", selectedPackage?.incentive_amount);
        data.append("incentive_percentage", selectedPackage?.incentive_percentage);
        data.append("status", params.status);
        AddSalary(data);
    };

    console.log('hselectedPackageselectedPackageselectedPackage', selectedPackage)
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

                <div className=" p-0 flex-1 overflow-x-hidden h-full">
                    <AddPackage setAddPackageModel={setAddPackageModel} addPackageModel={addPackageModel} />

                    <div className="flex flex-col h-full">
                        <div className='panel'>
                            <div className='flex items-center justify-between mb-1'>
                                <h5 className="font-semibold text-lg dark:text-white-light">Salary Details </h5>
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
                                    <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                                    <button type="button" onClick={() => setAddPackageModel(true)} className="btn btn-sm btn-primary">Packages</button>

                                    <button className='btn btn-sm btn-primary' onClick={() => setShowWhatsAppDrawer(!showWhatsAppDrawer)}>Add Salary </button>


                                    <div className={`${(showWhatsAppDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setShowWhatsAppDrawer(!showWhatsAppDrawer)}>
                                    </div>
                                    <nav className={`${(showWhatsAppDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                                        } bg-white fixed ltr:-right-[500px] rtl:-left-[500px] top-0 bottom-0 w-full max-w-[500px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4 pt-0`}>
                                        <div className="flex flex-col h-screen overflow-hidden">
                                            <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">
                                                <form autoComplete="off" action="" method="post" className='p-0'>
                                                    <div className="mb-5">
                                                        <Tab.Group>
                                                            <div className='flex justify-between mb-4 ' >
                                                                <div className='text-lg bold' >{params?.id ? 'Update Salary' : 'Add Salary'}</div>
                                                            </div>
                                                            <hr className='mb-5' />
                                                            <Tab.Panels>
                                                                <Tab.Panel>
                                                                    <div className='mb-5 space-y-5'>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                                            <div>
                                                                                <label >Employee</label>
                                                                                <Select
                                                                                    isMulti
                                                                                    options={employees}
                                                                                    placeholder="Select Employees"
                                                                                    className="basic-multi-select"
                                                                                    classNamePrefix="select"
                                                                                    name='select_employee'
                                                                                    onChange={handleSelectChange}
                                                                                    value={selectedEmployees}
                                                                                />

                                                                            </div>

                                                                            <div>
                                                                                <select name="select_package" value={params.select_package} onChange={(e) => { changeValue(e) }} className='form-select' >
                                                                                    <option value="">Select Package</option>
                                                                                    {
                                                                                        packages.map((pack) => (
                                                                                            <option value={pack.id} > {pack.id} {pack.package_name}</option>
                                                                                        ))
                                                                                    }
                                                                                </select>
                                                                                <div className="text-danger mt-1">{errors.select_package}</div>

                                                                            </div>

                                                                            {selectedPackage ? (
                                                                                <div className="package-details">
                                                                                    {/* <p><strong>Package ID:</strong> {selectedPackage.id}</p> */}
                                                                                    <p><strong>Package Name:</strong> {selectedPackage.package_name}</p>
                                                                                    <p><strong>Fixed Salary:</strong> {selectedPackage.fixed_salary}</p>
                                                                                    <p><strong>Incentive Amount:</strong> {selectedPackage.incentive_amount}</p>
                                                                                    <p><strong>Incentive Percentage:</strong> {selectedPackage.incentive_percentage}</p>

                                                                                </div>
                                                                            ) : <div className="package-details">
                                                                                {/* <p><strong>Package ID:</strong> {params.id}</p> */}
                                                                                <p><strong>Package Name:</strong> {params.package_name}</p>
                                                                                <p><strong>Fixed Salary:</strong> {params.fixed_salary}</p>
                                                                                <p><strong>Incentive Amount:</strong> {params.incentive_amount}</p>
                                                                                <p><strong>Incentive Percentage:</strong> {params.incentive_percentage}</p>

                                                                            </div>}


                                                                        </div>

                                                                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                                            <div>
                                                                                <label >Status</label>
                                                                                <select name="status" className="form-select text-white-dark" onChange={(e) => changeValue(e)} value={params.status}>
                                                                                    {/* <option value={''}>Select Status</option> */}
                                                                                    <option value={1}>Active</option>
                                                                                    <option value={0}>Inactive</option>
                                                                                </select>
                                                                                {errors?.status ? <div className="text-danger mt-1">{errors.status}</div> : ''}
                                                                            </div>
                                                                        </div>
                                                                        <button type="button" onClick={() => formSubmit()} disabled={btnLoading} className="btn bg-[#1d67a7] text-white ltr:ml-4 rtl:mr-4">
                                                                            {params.id ? <div>{btnLoading ? 'Please wait' : 'Update Salary'}</div> : <div>{btnLoading ?
                                                                                'Please wait' : editDropdown ? 'Update Salary' :
                                                                                    'Add Salary'}</div>}
                                                                        </button>
                                                                    </div>
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
                                        records={salaries}
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
                                                accessor: 'select_employee',
                                                title: 'Employee',
                                                sortable: true,
                                                render: ({ select_employee }) => (
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-semibold">{select_employee}</div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                accessor: 'select_package',
                                                title: 'Package Name',
                                                sortable: true,
                                                render: ({ select_package }) => (
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-semibold">{select_package}</div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                accessor: 'fixed_salary',
                                                title: 'Fixed Salary',
                                                sortable: true,
                                                render: ({ fixed_salary }) => (
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-semibold">{fixed_salary}</div>
                                                    </div>
                                                ),
                                            },

                                            {
                                                accessor: 'incentive_amount',
                                                title: 'Incentive Amount',
                                                sortable: true,
                                                render: ({ incentive_amount }) => (
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-semibold">{incentive_amount}</div>
                                                    </div>
                                                ),
                                            },

                                            {
                                                accessor: 'incentive_percentage',
                                                title: 'Incentive Percentage',
                                                sortable: true,
                                                render: ({ incentive_percentage }) => (
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-semibold">{incentive_percentage}</div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                accessor: 'status',
                                                sortable: true,
                                                render: ({ id, status }) => (
                                                    <div className="flex flex-col gap-2">
                                                        <label className="w-12 h-6 relative">
                                                            <input type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" onChange={(e) => {
                                                                updateStatus(id, status)
                                                            }} id="custom_switch_checkbox1" checked={status == true ? true : false} />
                                                            <span className={`outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                        </label>
                                                    </div>
                                                ),
                                            },
                                            {
                                                accessor: 'Action',
                                                sortable: true,
                                                render: (userFullData) => (
                                                    <div className="flex gap-2">
                                                        <button type="button" onClick={() => { UpdateSalary(userFullData) }} className="btn btn-dark w-10 h-10 p-0 rounded-full"><FaEdit /></button>
                                                        <button type="button" onClick={() => { distroy(userFullData) }} className="btn btn-dark w-10 h-10 p-0 rounded-full"><MdDelete /></button>
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
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
};

export default ListSalary;
