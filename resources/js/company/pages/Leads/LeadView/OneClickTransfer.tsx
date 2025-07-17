import React from 'react'
import Swal from 'sweetalert2';
import { useState, useEffect, Fragment } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { IRootState } from '../../../store';
import axios from 'axios';
import { IoCloseCircleSharp } from 'react-icons/io5';

import Select from 'react-select';
import { useAuth } from '../../../AuthContext';

export default function OneClickTransfer({ octModal, setOtcModal }) {
    const { logout, crmToken, authUser, apiUrl, selectedBranch } = useAuth();



    const [data, setData] = useState<any>([]);
    const getDataForOCT = async () => {
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/get-data-for-oct",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                    SelectedBranch: selectedBranch
                },
            });

            if (response.data.status == "success") {
                setData(response.data.data);
            }
            console.log(response)
        } catch (error) {

        } finally {

        }
    }

    const [defaultParams] = useState({
        state: '',
        status: '',
        employees: '',
        count: '',
        availableLeads: '',
        maxLeadCount: '',
        perLeadCount: ''
    });
    const [params, setParams] = useState<any>([]);
    const [errors, setErros] = useState<any>({});

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
    };

    // const validate = () => {
    //     setErros({});
    //     let errors = {};
    //     if (!params.product_id) {
    //         errors = { ...errors, product_id: "product is required" };
    //     }
    //     if (!params.bank) {
    //         errors = { ...errors, bank: "bank is required" };
    //     }
    //     if (!params.client_type) {
    //         errors = { ...errors, client_type: "client type is required" };
    //     }

    //     if (!params.client_paid) {
    //         errors = { ...errors, client_paid: "client paid is required" };
    //     } else if (!validatePositiveNumber(params.client_paid)) {
    //         errors = { ...errors, client_paid: "invalid amount" };
    //     } else if (Number(params.client_paid) > Number(params.sale_price)) {
    //         errors = { ...errors, client_paid: "amount should be below or equelto sale amount" };
    //     }

    //     if (params.start_date > params.due_date) {
    //         errors = { ...errors, due_date: "Due Date can not be less than start date" };
    //     }
    //     if (!params.sale_service) {
    //         errors = { ...errors, sale_service: "sale service is required" };
    //     } else if (!JSON.parse(params.sale_service).length) {
    //         errors = { ...errors, sale_service: "sale service is required" };
    //     }
    //     setErros(errors);
    //     return { totalErrors: Object.keys(errors).length };
    // };




    useEffect(() => {
        if (params.state && params.status) getLeadsCount()
        else setParams({ ...params, availableLeads: '', employees: '', count: '', maxLeadCount: '' })
    }, [params.state, params.status])





    const getLeadsCount = async () => {
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/get-leads-count-for-oct",
                params: {
                    state: params.state,
                    status: params.status
                },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                    SelectedBranch: selectedBranch
                },
            });

            if (response.data.status == "success") {
                setParams({ ...params, availableLeads: response.data.leads })
            }

            // console.log(response)
        } catch (error) {

        } finally {

        }
    }

    useEffect(() => {
        if (octModal) {
            getDataForOCT()
            setParams(defaultParams)
        }
    }, [octModal])


    useEffect(() => {
        if (params?.employees?.length) {
            const length = params.employees.length;
            setParams({ ...params, maxLeadCount: Math.floor(params.availableLeads / length) })
        }
    }, [params.employees])


    useEffect(() => {
        if (params.count) {
            setParams({ ...params, perLeadCount: Math.floor(params.count / params.employees.length) })
        }
    }, [params.count, params.employees])



    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.status) {
            errors = { ...errors, status: "status is required" };
        }
        if (!params.state) {
            errors = { ...errors, state: "state is required" };
        }
        if (!params.employees) {
            errors = { ...errors, employees: "employees is required" };
        }
        if (!params.count) {

            errors = { ...errors, count: "count is required" };
        } else if (params.count > params.availableLeads) {
            errors = { ...errors, count: "count should be below avalilable leads" };
        }
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const octApi = async (data) => {
        setIsBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/oct-leads",
                data: data,
                params: {
                    state: params.state,
                    status: params.status
                },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                    SelectedBranch: selectedBranch
                },
            });

            if (response.data.status == "success") {
                setOtcModal(false)
                showMessage(response.data.message)
                setParams(defaultParams);

            }
        } catch (error) {
            if (error?.response?.status == 401) logout()
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
            setIsBtnLoading(false)
        }

    }

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("employees", JSON.stringify(params.employees));
        data.append("count", params.count);
        data.append("state", params.state);
        data.append("status", params.status);
        octApi(data);
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

    return (<Transition appear show={octModal} as={Fragment}>
        <Dialog as="div" open={octModal} onClose={() => setOtcModal(true)}>
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
            <div className="fixed inset-0 bg-[black]/60 z-[40] overflow-y-auto">
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


                        <Dialog.Panel className="panel bg-transparent h-screen border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg mt-8 text-black dark:text-white-dark">
                            <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                <div className="font-bold text-lg">One Click Transfer</div>
                                <button type="button" onClick={() => setOtcModal(false)} className="text-white-dark hover:text-dark">
                                    <IoCloseCircleSharp size={25} color='black' />
                                </button>
                            </div>
                            <div className="p-5 bg-secondary-light rounded-b-lg">


                                <div className="grid grid-cols-1 sm:flex justify-between gap-5">
                                    <div className='w-full'>
                                        <label >Status</label>
                                        <select id="ctnSelect1" name='status' className="form-select text-white-dark"
                                            value={params.status} onChange={(e) => changeValue(e)}
                                        >
                                            <option value=''>Select Status</option>
                                            {data?.statuses?.map((status: any) => (
                                                <option value={status}>{status}</option>
                                            ))}
                                        </select>
                                        <div className="text-danger mt-1">{errors.status}</div>
                                    </div>
                                    <div className='w-full'>
                                        <label >State</label>
                                        <select id="ctnSelect1" name='state' value={params.state} onChange={(e) => changeValue(e)} className="form-select text-white-dark" >
                                            <option value=''  >Select State</option>
                                            {data?.states?.map((state: any) => (
                                                <option value={state}>{state}</option>
                                            ))}
                                        </select>
                                        <div className="text-danger mt-1">{errors.state}</div>
                                    </div>
                                </div>

                                {params.availableLeads || params.availableLeads == '0' ? (
                                    <>
                                        <div className='text-center mt-4 bg-white p-2 rounded w-fit m-auto px-5 shadow'>
                                            <strong className='text-3xl'>{params.availableLeads}</strong>
                                            <h2 className='font-semibold text-gray-500'>Available Leads</h2>
                                        </div>

                                        {params.availableLeads ? (<div className='mt-4 '>
                                            <label >Select Employees {params?.employees?.length ? ('(Maximum lead per employee :' + params.maxLeadCount + ')') : null}</label>
                                            <Select placeholder="Select Employees"
                                                className='z-999999999999'
                                                onChange={(e) => changeValue({ target: { name: 'employees', value: e.map((a: any) => a.value) } })}
                                                options={data?.employees?.map((employee) => ({ label: employee.first_name + ' ' + (employee.last_name ? employee.last_name : ''), value: employee.id }))}

                                                isMulti isSearchable={true} />
                                            <div className="text-danger mt-1">{errors.employees}</div>

                                            {params?.employees?.length ? (
                                                <>
                                                    <div className='w-full mt-4'>
                                                        <label >Count</label>
                                                        <input type="number"
                                                            max={params.maxLeadCount}
                                                            name='count'
                                                            value={params.count}
                                                            onChange={(e) => changeValue(e)}
                                                            placeholder="Enter Count" className="form-input" required />
                                                        <div className="text-danger mt-1">{errors.count}</div>
                                                    </div>

                                                    {params.perLeadCount ? (<b className='text-xs'>{params.perLeadCount} per employee</b>) : null}

                                                </>


                                            ) : null}

                                        </div>) : null}

                                    </>

                                ) : null}








                                <div className="flex justify-end items-center mt-8">

                                    <button type="button" onClick={() => formSubmit()} disabled={isBtnLoading} className="btn btn-sm btn-primary ltr:ml-4 rtl:mr-4">
                                        {isBtnLoading ? 'Please Wait...' : ' Transfer Now'}

                                    </button>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </div>
        </Dialog>
    </Transition>)
}
