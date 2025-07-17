import React, { useEffect, useState, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setCrmToken, setPageTitle } from '../../../store/themeConfigSlice';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import PageLoader from '../../../components/Layouts/PageLoader';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteOutline } from 'react-icons/md';
import { useAuth } from '../../../AuthContext';
import { IoMdRefresh } from 'react-icons/io';
import { IoSearchSharp } from 'react-icons/io5';
import { DataTable } from 'mantine-datatable';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
export default function Bank() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { logout, crmToken, authUser, apiUrl } = useAuth();

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [data, setData] = useState<any>([]);

    const [isLoading, setIsLoading] = useState(true);

    const fetchBanks = async (a = 0) => {
        console.log("Fetching Banks........", a)
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',

                url: apiUrl + '/api/banks',
                params: {
                    page: page,
                    pageSize: pageSize,
                    filterStatus: filterStatus,
                    search: search
                },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == "success") {
                setData(response.data.data)
            } else setData([]);

        } catch (error) {



        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        dispatch(setPageTitle('Dropdown'));

    }, []);


    const [reload, setReload] = useState(false);
    useEffect(() => {
        if (reload) {
            fetchBanks()
            setReload(false);
        }
    }, [reload]);

    useEffect(() => {
        if (page !== 1) {
            setPage(1);
        } else {
            setReload(true);
        }
    }, [filterStatus, pageSize]);

    useEffect(() => {
        if (!reload) {
            setReload(true);
        }
    }, [page]);




    const [bankModal, setBankModal] = useState(false);

    const [defaultParams] = useState({
        id: '',
        account_holder_name: '',
        account_type: '',
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        branch: '',
        status: '',
        is_bank_upi: 'bank'
    });

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.account_number) {
            errors = { ...errors, account_number: "account number is required" };
        }
        console.log(errors);
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const [btnLoading, setBtnLoading] = useState(false);

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
        console.table(params)
    };

    const addOrUpdateBank = async (data: any) => {
        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/banks",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {
                showMessage(response.data.message);
                setBankModal(false);

                fetchBanks()
                // setParams(defaultParams)

            } else { alert("Failed") }

        } catch (error: any) {
            console.log(error)
            if (error.response.status == 401) logout()
            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                    console.log(serveErrors[key][0])
                }
                setErros(serverErrors);
                showMessage("Server Validation Error! Please Solve")
            }
        } finally {
            setBtnLoading(false)
        }
    };

    const UpdateBank = (data: any) => {
        setErros({});
        if (data) {
            setParams({
                id: data.id,
                bank_name: data.bank_name,
                account_number: data.account_number,
                ifsc_code: data.ifsc_code,
                branch: data.branch,
                status: data.status,
                account_holder_name: data.account_holder_name,
                account_type: data.account_type,
            });
        } else setParams(defaultParams)
        setBankModal(true)
    }

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("id", params.id);
        data.append("bank_name", params.bank_name);
        data.append("account_number", params.account_number);
        data.append("ifsc_code", params.ifsc_code);
        data.append("branch", params.branch);
        data.append("status", params.status);
        data.append("account_holder_name", params.account_holder_name);
        data.append("account_type", params.account_type);
        data.append('is_bank_upi', 'bank');
        addOrUpdateBank(data);
    };

    const deleteBank = (bank: any) => {
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
                        url: apiUrl + '/api/banks/' + bank.id,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: "Bearer " + crmToken,
                        },
                    });
                    if (response.data.status === "success") {
                        showMessage(response.data.message);
                        fetchBanks()
                    }
                } catch (error: any) {
                    if (error.response.status == 401) logout()
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

    const updateStatus = async (id: number) => {

        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + '/api/bank-update-status',
                data: { id: id },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
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
                fetchBanks();
            }
        } catch (error) {

        }

    }

    const BankName = ({ bank_name, branch }) => {
        const bank = `${bank_name}`;
        const trimmedName = bank.substring(0, 25);
        const tippyContent = `${bank_name}`;
        return (
            <Tippy content={tippyContent}>
                <>
                    <b>{trimmedName}</b><br />
                    <b>Branch : {branch}</b>
                </>
            </Tippy>
        );
    };

    const Account = ({ account_holder_name, account_number, ifsc_code }) => {
        const name = `${account_holder_name}`;
        const trimmedName = name.substring(0, 20);
        const tippyContent = `${account_holder_name}`;
        return (
            <Tippy content={tippyContent}>
                <>
                    <b>{trimmedName}</b><br />
                    <b>{account_number}</b> <br />
                    <b>IFSC Code : {ifsc_code}</b>
                </>
            </Tippy>
        );
    };

    // < ={account_holder_name} ={account_number} ={ifsc_code}
    return (
        <div>

            {isLoading ? (<PageLoader />) : (
                <>


                    <div className='flex justify-between items-center mb-4'>
                        <h2 className='font-bold text-lg'>Banks</h2>
                        <button className='btn btn-sm btn-dark' onClick={() => UpdateBank(null)}>Add New Bank</button>
                    </div>



                    <div className='flex justify-between gap-4'>
                        <div className='flex gap-3  w-full'>
                            <div className="flex">
                                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="form-input ltr:rounded-r-none rtl:rounded-l-none" />
                                <div onClick={() => { page != 1 ? setPage(1) : fetchBanks() }} className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                    <IoSearchSharp />
                                </div>
                            </div>
                            <div className='w-[150px]'>
                                <select className='form-select ' onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="all">All</option>
                                    <option value="1">Active</option>
                                    <option value="0">Blocked</option>
                                </select>
                            </div>
                        </div>
                        <div className='flex gap-3 justify-end  w-full'>


                            <button disabled={isLoading ? true : false} onClick={() => fetchBanks()} className="bg-[#f4f4f4] rounded-md p-2 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                <IoMdRefresh className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="datatables mt-4">
                        <DataTable
                            className="whitespace-nowrap table-hover"
                            records={data?.data}

                            columns={[
                                {
                                    accessor: 'bank_name',
                                    title: 'Bank',
                                    render: ({ bank_name, branch }) => {
                                        return (
                                            <BankName bank_name={bank_name} branch={branch} />
                                        )
                                    },
                                },

                                {
                                    accessor: 'account_holder_name',
                                    title: 'Account',
                                    render: ({ account_holder_name, account_number, ifsc_code }) => {
                                        return (
                                            <Account account_holder_name={account_holder_name} account_number={account_number} ifsc_code={ifsc_code} />
                                        )
                                    },
                                },


                                {
                                    accessor: 'status',
                                    title: 'Status',

                                    render: ({ status }) => {
                                        return (
                                            <span className={`badge ${status ? 'bg-green-500' : 'bg-red-500'} text-center cursor-pointer py-0.5 w-full`} >{status ? 'Active' : 'Blocked'}</span>
                                        )
                                    },
                                },

                                //
                                {
                                    accessor: 'id',
                                    title: 'Action',
                                    render: (bank) => {
                                        return (
                                            <div className='flex justify-between w-[70px]'>
                                                <button onClick={() => UpdateBank(bank)}><FaEdit size={25} color='purple' /></button>
                                                <button onClick={() => deleteBank(bank)}><MdDeleteOutline size={25} color='red' /></button>
                                            </div>
                                        )
                                    },
                                },

                            ]}

                            totalRecords={data.totalItems}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={setPageSize}

                            minHeight={400}
                            fetching={isLoading}
                            loaderSize="xl"
                            loaderColor="green"
                            loaderBackgroundBlur={1}
                            paginationText={({ totalRecords }) => `Showing  ${data?.from} to ${data.to} of ${totalRecords} entries`}
                        />
                    </div>



                    <div className="mb-5">

                        <Transition appear show={bankModal} as={Fragment}>
                            <Dialog as="div" open={bankModal} onClose={() => setBankModal(true)}>
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
                                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg my-8 text-black dark:text-white-dark">
                                                <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                                    <div className="font-bold text-lg">Bank</div>
                                                    <button type="button" onClick={() => setBankModal(false)} className="text-white-dark hover:text-dark">
                                                        X
                                                    </button>
                                                </div>
                                                <div className="p-5">



                                                    <form autoComplete="off" className="space-y-5">
                                                        <div>
                                                            <input type="text" name='account_holder_name' value={params.account_holder_name} onChange={(e) => changeValue(e)} placeholder="Enter Account Holder Name" className="form-input" />
                                                            {errors?.account_holder_name ? <div className="text-danger mt-1">{errors.account_holder_name}</div> : ''}
                                                        </div>
                                                        <div>
                                                            <input type="text" name='bank_name' value={params.bank_name} onChange={(e) => changeValue(e)} placeholder="Enter Bank Name" className="form-input" />
                                                            {errors?.bank_name ? <div className="text-danger mt-1">{errors.bank_name}</div> : ''}
                                                        </div>


                                                        <div>
                                                            <input type="text" name='account_number' value={params.account_number} onChange={(e) => changeValue(e)} placeholder="Enter A/c Number" className="form-input" />
                                                            {errors?.account_number ? <div className="text-danger mt-1">{errors.account_number}</div> : ''}
                                                        </div>
                                                        <div>
                                                            <input type="text" name='ifsc_code' value={params.ifsc_code} onChange={(e) => changeValue(e)} placeholder="Enter IFSC Code" className="form-input" />
                                                            {errors?.ifsc_code ? <div className="text-danger mt-1">{errors.ifsc_code}</div> : ''}
                                                        </div>
                                                        <div>
                                                            <input type="text" name='branch' value={params.branch} onChange={(e) => changeValue(e)} placeholder="Enter Branch" className="form-input" />
                                                            {errors?.branch ? <div className="text-danger mt-1">{errors.branch}</div> : ''}
                                                        </div>
                                                        <div>
                                                            <select name="account_type" className="form-select" onChange={(e) => changeValue(e)} value={params.account_type}>
                                                                <option value="">Select Account Type</option>
                                                                <option value="Savings account">Savings account</option>
                                                                <option value="Current account">Current account</option>
                                                            </select>
                                                            {errors?.account_type ? <div className="text-danger mt-1">{errors.account_type}</div> : ''}
                                                        </div>
                                                        <div>
                                                            <select name="status" className="form-select" onChange={(e) => changeValue(e)} value={params.status}>
                                                                <option value="">Select Status</option>
                                                                <option value="1">Active</option>
                                                                <option value="0">Inactive</option>
                                                            </select>
                                                            {errors?.status ? <div className="text-danger mt-1">{errors.status}</div> : ''}
                                                        </div>
                                                    </form>

                                                    <div className="flex justify-end items-center mt-8">
                                                        <button type="button" onClick={() => setBankModal(false)} className="btn btn-outline-danger">
                                                            Discard
                                                        </button>
                                                        <button type="button" onClick={() => formSubmit()} className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            </Dialog.Panel>
                                        </Transition.Child>
                                    </div>
                                </div>
                            </Dialog>
                        </Transition>
                    </div>

                </>
            )}
        </div>
    )
}
