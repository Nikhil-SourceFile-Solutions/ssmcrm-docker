import React, { useEffect, useState } from 'react'
import { IoCloseSharp } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import { Navigate, useNavigate } from 'react-router-dom';
import { setCrmToken, setPageTitle } from '../../../store/themeConfigSlice';
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import axios from 'axios';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import Tippy from '@tippyjs/react';
import { useAuth } from '../../../AuthContext';
const CrmSwal = withReactContent(Swal);

export default function AddPackage({ addPackageModel, setAddPackageModel, whatsappConfiguration }: any) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
  const {crmToken, apiUrl } = useAuth()

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });

    useEffect(() => {
        if (!crmToken) dispatch(setCrmToken(''))
        else {
            dispatch(setPageTitle('Package'));
        }
    }, [crmToken])

    const defaultParams = {
        package_name: "",
        incentive_percentage: "",
        fixed_salary: "",
        status: "",
        incentive_amount: "",

    };

    const [errors, setErrors] = useState<any>({});
    const [params, setParams] = useState<any>(defaultParams);

    // useEffect(() => {
    //     if (whatsappConfiguration) {
    //         setParams({
    //             incentive_percentage: whatsappConfiguration.incentive_percentage,
    //             package_name: whatsappConfiguration.package_name,
    //             incentive_percentage: whatsappConfiguration.incentive_percentage,
    //             fixed_salary: whatsappConfiguration.fixed_salary,
    //             status: whatsappConfiguration.status,
    //             incentive_amount: whatsappConfiguration.incentive_amount,
    //         });
    //     } else setParams(defaultParams)
    // }, [whatsappConfiguration])



    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErrors({ ...errors, [name]: '' });
        setParams({ ...params, [name]: value });
        console.table(params)
    };

    const validate = () => {
        setErrors({});
        let errors = {};
        if (!params.incentive_amount) {
            errors = { ...errors, incentive_amount: 'incentive Amount is required.' };
        }

        if (!params.package_name) {
            errors = { ...errors, package_name: 'package name is required.' };
        }

        if (!params.incentive_percentage) {
            errors = { ...errors, incentive_percentage: 'incentive percentage is required.' };
        }

        setErrors(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const [btnLoading, setBtnLoading] = useState(false);

    const storeOrUpdateApi = async (data: any) => {
        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/packages",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status === 'success') {
                showMessage(response.data.message);
                setAddPackageModel(false)
                setParams('');
                fetchPackage();

            } else {
                alert("Error")
            }
        } catch (error: any) {
            if (error?.response?.status === 401) {
                dispatch(setCrmToken(""))
            } else if (error?.response?.status === 422) {

                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                    setErrors(serverErrors)
                    console.log(serveErrors[key][0])
                }

                CrmSwal.fire({
                    title: "Server Validation Error! Please solve",
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
        // data.append("id", params.id);
        data.append("incentive_percentage", params.incentive_percentage);
        data.append("package_name", params.package_name);
        data.append("incentive_percentage", params.incentive_percentage);
        data.append("fixed_salary", params.fixed_salary);
        data.append("status", params.status);
        data.append("incentive_amount", params.incentive_amount);
        storeOrUpdateApi(data);
    };

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
    const [isLoading, setIsLoading] = useState(false)
    const [packages, setPackage] = useState([])
    const [response, setResponse] = useState([])
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

    const UpdatePackage = (userFullData) => {
        setParams({
            id: userFullData?.id,
            package_name: userFullData?.package_name,
            incentive_percentage: userFullData?.incentive_percentage,
            fixed_salary: userFullData?.fixed_salary,
            status: userFullData?.status,
            incentive_amount: userFullData?.incentive_amount,
        })

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
                        url: apiUrl + '/api/packages/' + userFullData.id,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: "Bearer " + crmToken,
                        },
                    });
                    if (response.data.status === "success") {
                        showMessage(response.data.message)
                        fetchPackage()
                    }
                } catch (error: any) {

                } finally {

                }
            }
        });

    }


    const Total_percentage = ((Number(params.incentive_percentage)) / 100) * Number(params.incentive_amount)
    return (
        <div>
            <div className={`${(addPackageModel && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setAddPackageModel(!addPackageModel)}></div>

            <nav
                className={`${(addPackageModel && 'ltr:!right-0 rtl:!left-0') || ''
                    } bg-white fixed ltr:-right-[800px] rtl:-left-[800px] top-0 bottom-0 w-full max-w-[500px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4`}
            >
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className=' border-b border-grey p-2 flex justify-between' >
                        <button className="mb-1 dark:text-white font-bold">Package</button>
                        <button onClick={() => setAddPackageModel(false)}>
                            <IoCloseSharp className=" w-5 h-5" />
                        </button>
                    </div>

                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">

                        <form autoComplete="off" action="" method="post" className='p-0'>

                            <div className='mb-4'>
                                <input type="text" placeholder="Enter Package Name" className="form-input"
                                    name="package_name" onChange={(e) => changeValue(e)} value={params.package_name}
                                />
                                <div className="text-danger font-semibold text-sm">{errors.package_name}</div>
                            </div>
                            <div className='mb-4'>
                                <input type="text" placeholder="Enter Fixed Salary" className="form-input"
                                    name="fixed_salary" onChange={(e) => changeValue(e)} value={params.fixed_salary}
                                />
                                <div className="text-danger font-semibold text-sm">{errors.fixed_salary}</div>
                            </div>
                            <div className='mb-4'>
                                <input type="text" placeholder="Enter Incentive Amount" className="form-input"
                                    name="incentive_amount" onChange={(e) => changeValue(e)} value={params.incentive_amount}
                                />
                                <div className="text-danger font-semibold text-sm">{errors.incentive_amount}</div>
                            </div>
                            <div className='mb-4'>
                                <div className="flex">
                                    <input id="iconRight" type="text" name="incentive_percentage" onChange={(e) => changeValue(e)} value={params.incentive_percentage} placeholder="Incentive Percentage" className="form-input ltr:rounded-r-none rtl:rounded-l-none" />
                                    <div className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                        <span>%</span>
                                    </div>
                                </div>

                                <div className="text-danger font-semibold text-sm">{errors.incentive_percentage}</div>
                            </div>

                            <div className='mb-4'>
                                <label className='text-white-dark'>Approx Incentive :- <b>{Total_percentage}</b> </label>
                            </div>

                            <div>
                                <select name="status" className="form-select text-white-dark" onChange={(e) => changeValue(e)} value={params.status}>
                                    <option value={''}>Select Status</option>
                                    <option value={1}>Active</option>
                                    <option value={0}>Inactive</option>
                                </select>
                                {errors?.status ? <div className="text-danger mt-1">{errors.status}</div> : ''}
                            </div>

                            <div className='flex justify-end gap-5 mb-5 py-2'>
                                <button type="button" className='btn shadow' onClick={() => setAddPackageModel(false)}>Cancel</button>
                                <button type="button" onClick={() => formSubmit()} disabled={btnLoading} className="btn  btn-dark shadow bg-black">

                                    {btnLoading ? 'Please Wait...' : params.id ? 'Update' : 'Add'}
                                </button>
                            </div>

                        </form>
                        <hr className=" dark:border-[#191e3a]" />
                        <div className='mb-5'>
                            <div className="datatables">

                                <DataTable
                                    className="whitespace-nowrap table-hover"
                                    records={packages}
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
                                            accessor: 'package_name',
                                            title: 'Package  Name',
                                            sortable: true,
                                            render: ({ package_name }) => (
                                                <div className="flex items-center gap-2">
                                                    <div className="font-semibold">{package_name}</div>
                                                </div>
                                            ),
                                        },
                                        {
                                            accessor: 'fixed_salary',
                                            title: 'Fixed Salary',
                                            sortable: true,
                                            render: ({ fixed_salary
                                            }) => (
                                                <div className="flex items-center gap-2">
                                                    <div className="font-semibold">{fixed_salary
                                                    }</div>
                                                </div>
                                            ),
                                        },
                                        {
                                            accessor: 'incentive_amount',
                                            title: 'Incentive Amount',
                                            sortable: true,
                                            render: ({ incentive_amount }) => (
                                                <div className="flex items-center gap-2">
                                                    <div className="font-semibold">{incentive_amount
                                                    }</div>
                                                </div>
                                            ),
                                        },
                                        {
                                            accessor: 'incentive_percentage',
                                            title: 'Incentive Percentage',
                                            sortable: true,
                                            render: ({ incentive_percentage
                                            }) => (
                                                <div className="flex items-center gap-2">
                                                    <div className="font-semibold">{incentive_percentage
                                                    }</div>
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
                                                    <button type="button" onClick={() => { UpdatePackage(userFullData) }} className="btn btn-dark w-10 h-10 p-0 rounded-full"><FaEdit /></button>
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
                                    minHeight={200}
                                    fetching={isLoading}
                                    loaderColor="blue"
                                    loaderBackgroundBlur={4}
                                    paginationText={({ from, to, totalRecords }) => `Showing  ${response?.form} to ${response.to} of ${totalRecords} entries`}
                                />
                            </div>
                        </div>
                    </section>


                </div>
            </nav>
        </div>
    )
}

