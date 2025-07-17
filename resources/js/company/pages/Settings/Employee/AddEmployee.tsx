import React, { useState, useEffect, Fragment } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import 'flatpickr/dist/flatpickr.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../../AuthContext';
import PageLoader from '../../../components/Layouts/PageLoader';
import { IRootState } from '../../../store';
import { Dialog, Transition } from '@headlessui/react';
import { PiWarningCircleFill } from "react-icons/pi";
export default function AddEmployee({ tab, setTab, editData, fetchEmployee }: any) {
    const employeeData = useSelector((state: IRootState) => state.themeConfig.employeeData);


    const { logout, crmToken, settingData, apiUrl, authUser } = useAuth();
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Add Employee'))
        fetchData()
    }, [tab])

    // Fetch Data for Employee Creation and Updation
    interface Managers {
        id: number;
        first_name: string;
        last_name: string | null;
        user_type: string;
        manager_id: number
    }
    interface DataResponse {
        languages: string[];
        userTypes: string[];
        managersAndLeaders: Managers[];
    }
    const [data, setData] = useState<DataResponse>({
        languages: [],
        userTypes: [],
        managersAndLeaders: []
    });
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/users/create",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == "success") setData(response.data.data)
            else alert("error")
        } catch (error) {
            console.log(error)
            if (error?.response?.status == 401) logout()
        } finally {
            setIsLoading(false)
        }
    }

    const defaultParams = {
        id: '',
        employee_id: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone_number: '',
        user_type: '',
        manager_id: '',
        team_leader_id: '',
        langauge_known: [],
        branch_id: '',
        status: '',
    }

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});

    useEffect(() => {

        if (editData && Object.values(editData).length) setParams({
            id: editData.id,
            employee_id: editData.employee_id,
            first_name: editData.first_name,
            last_name: editData.last_name ? editData.last_name : '',
            email: editData.email ? editData.email.replace(new RegExp('@' + settingData?.crm_link, 'g'), '') : '',
            password: editData.password,
            phone_number: editData.phone_number ? editData.phone_number : '',
            user_type: editData.user_type,
            manager_id: editData.manager_id,
            team_leader_id: editData.team_leader_id,
            langauge_known: JSON.parse(editData.langauge_known),
            branch_id: editData.branch_id,
            status: editData.status,
        })

    }, [editData])

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
    };

    const formattedLanguages = (languages: any) => {
        return languages.map((language: any) => ({
            value: language,
            label: language
        }))
    };

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const [btnLoading, setBtnLoading] = useState(false);

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.employee_id) {
            errors = { ...errors, employee_id: "Employee Id is required" };
        }

        // if (params?.user_type === 'BDE') {
        //     if (!params.manager_id) {
        //         errors.manager_id = "Please Select Manager";
        //     }
        //     if (!params.team_leader_id) {
        //         errors.team_leader_id = "Please Select Team Leader";
        //     }
        // }
        // if (params?.user_type === 'Team Leader') {
        //     if (!params.manager_id) {
        //         errors.manager_id = "Please Select Manager";
        //     }
        // }

        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const AddOrUpdateEmployee = async (data: any) => {

        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/users",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == 'success') {
                showMessage(response.data.message)
                setTab('employees');
                fetchEmployee();
                setParams(defaultParams);
            } else { alert("Failed") }

        } catch (error: any) {
            console.log(error)
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
            setBtnLoading(false)
        }
    };

    const [modal, setModal] = useState(false);

    const formSubmit = (confirmation = false) => {

        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("id", params.id ? params.id : '');
        data.append("employee_id", params.employee_id);
        data.append("first_name", params.first_name);
        data.append("last_name", params.last_name);
        data.append("email", params.email ? params.email + '@' + settingData?.crm_link : '');
        data.append("phone_number", params.phone_number);
        data.append("password", params.id ? editData.show_password : params.show_password);
        data.append("user_type", params.user_type);
        data.append("status", params.status);
        data.append("langauge_known", params.langauge_known.length ? JSON.stringify(params.langauge_known) : JSON.stringify([]));
        data.append('branch_id', params.branch_id);
        if (params.user_type == 'Team Leader' || params.user_type == 'BDE') {
            data.append("manager_id", params.manager_id ? params.manager_id : '');
        }
        if (params.user_type == 'BDE') {
            data.append("team_leader_id", params.team_leader_id ? params.team_leader_id : '');
        }

        if (confirmation) { AddOrUpdateEmployee(data); return }


        if (!confirmation && params?.user_type === 'BDE') {
            if (!params.manager_id) {
                confirmation = true
            }
            if (!params.team_leader_id) {
                confirmation = true
            }
        }
        if (!confirmation && params?.user_type === 'Team Leader') {
            if (!params.manager_id) {
                confirmation = true
            }
        }

        if (confirmation) setModal(true)
        else AddOrUpdateEmployee(data);

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

    return (

        <>
            <div className="panel p-0 flex-1 overflow-x-hidden h-full">
                <div className="flex flex-col h-full">
                    {isLoading ? <PageLoader /> : (
                        <div className='panel '>
                            <div className='flex items-center justify-between mb-5'>
                                <h5 className="font-semibold text-lg dark:text-white-light">Employee Details</h5>
                                <button type="button" onClick={() => setTab('employees')} className="btn btn-outline-primary">Back</button>
                            </div>
                            <hr className="my-4 dark:border-[#191e3a]" />
                            <form className='space-y-5 mb-5' autoComplete="off">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {
                                        authUser?.user_type == 'Admin' &&
                                        <div>
                                            <label >Branch Name <span className=' text-red-600 text-md' >*</span></label>
                                            <select name="branch_id" className="form-select text-white-dark" onChange={(e) => changeValue(e)} value={params.branch_id ? params.branch_id : ''}>
                                                <option value={''}>Select Branch</option>
                                                {data?.branches?.map((branch) => (
                                                    <option value={branch.id} key={branch.id}>{branch.branch_name}</option>
                                                ))}
                                            </select>
                                            {errors?.branch_id ? <div className="text-danger mt-1">{errors.branch_id}</div> : ''}
                                        </div>
                                    }

                                    <div>
                                        <label >Employee ID <span className=' text-red-600 text-md' >*</span></label>
                                        <input type="text" placeholder="Enter Employee ID" className="form-input"
                                            name='employee_id'
                                            value={params.employee_id}
                                            onChange={(e) => changeValue(e)}
                                        />
                                        {errors?.employee_id ? <div className="text-danger mt-1">{errors.employee_id}</div> : ''}
                                    </div>
                                    <div>
                                        <label >First Name <span className=' text-red-600 text-md' >*</span></label>
                                        <input type="text" placeholder="Enter First Name" className="form-input"
                                            name='first_name'
                                            value={params.first_name}
                                            onChange={(e) => changeValue(e)}
                                        />
                                        {errors?.first_name ? <div className="text-danger mt-1">{errors.first_name}</div> : ''}
                                    </div>
                                    <div>
                                        <label >Last Name</label>
                                        <input type="text" placeholder="Enter Last Name" className="form-input"
                                            name='last_name'
                                            value={params.last_name}
                                            onChange={(e) => changeValue(e)}
                                        />
                                        {errors?.last_name ? <div className="text-danger mt-1">{errors.last_name}</div> : ''}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                                    <div className="mb-5">
                                        <label >Login Email Address <span className=' text-red-600 text-md' >*</span></label>
                                        <div className="flex">
                                            <input type="text" placeholder="Enter Email Address" name='email' value={params.email} onChange={(e) => changeValue(e)} className="form-input ltr:rounded-r-none rtl:rounded-l-none" />
                                            <div className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                @{settingData?.crm_link}
                                            </div>
                                        </div>
                                        {errors?.email ? <div className="text-danger mt-1">{errors.email}</div> : ''}

                                    </div>
                                    <div>
                                        <label >Phone Number</label>
                                        <input type="tel" placeholder="Enter Phone Number" className="form-input"
                                            name='phone_number'
                                            maxLength={10}
                                            value={params.phone_number}
                                            onChange={(e) => changeValue(e)}
                                        />
                                        {errors?.phone_number ? <div className="text-danger mt-1">{errors.phone_number}</div> : ''}
                                    </div>
                                    {
                                        params.id ? '' :
                                            <div className="relative">
                                                <label >New Password <span className=' text-red-600 text-md' >*</span></label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="Enter Password"
                                                        className="form-input pr-10"
                                                        name="show_password"
                                                        value={params.show_password}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                    <span
                                                        onClick={togglePasswordVisibility}
                                                        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                                        style={{ top: '50%', transform: 'translateY(-50%)' }}
                                                    >
                                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                    </span>
                                                </div>
                                                <span className='text-danger'>{errors?.show_password ? errors.show_password : ''}</span>
                                            </div>
                                    }

                                    <div>
                                        <label >Speaking Language</label>
                                        <Select
                                            name='langauge_known'
                                            onChange={(e) => changeValue({ target: { name: 'langauge_known', value: e.map((a: any) => a.value) } })}
                                            value={formattedLanguages(params.langauge_known)}
                                            options={data?.languages?.map((l) => ({ label: l, value: l }))}
                                            placeholder="Select Languages"
                                            isMulti
                                            className=" text-white-dark"
                                            isSearchable={false} />
                                        <div className="text-danger mt-1">{errors.langauge_known}</div>
                                    </div>
                                    <div>
                                        <label >User Type <span className=' text-red-600 text-md' >*</span></label>
                                        <select name="user_type" className="form-select text-white-dark" onChange={(e) => changeValue(e)} value={params.user_type ? params.user_type : ''}>
                                            <option value={''}>Select Type</option>
                                            {data?.userTypes?.map((type) => (
                                                <option value={type} key={type}>{type}</option>
                                            ))}
                                        </select>
                                        {errors?.user_type ? <div className="text-danger mt-1">{errors.user_type}</div> : ''}
                                    </div>
                                    {
                                        params?.user_type == 'Team Leader' || params.user_type == 'BDE' ?
                                            <div>
                                                <label >Manager</label>
                                                <select name="manager_id" className="form-select text-white-dark" onChange={(e) => changeValue(e)} value={params.manager_id ? params.manager_id : ''}>
                                                    <option value={''}>Select Manager</option>
                                                    {data?.managersAndLeaders?.filter((emp) => emp.user_type == "Manager").map((emp) => (
                                                        <option value={emp.id} key={emp.id}>{emp.first_name} {emp.last_name}</option>
                                                    ))}
                                                </select>
                                                {errors?.manager_id ? <div className="text-danger mt-1">{errors.manager_id}</div> : ''}
                                            </div> : null

                                    }

                                    {
                                        params?.user_type == 'BDE' &&
                                        <div>
                                            <label >Team Lead <span className=' text-red-600 text-md' >*</span></label>
                                            <select name="team_leader_id" className="form-select text-white-dark" onChange={(e) => changeValue(e)} value={params.team_leader_id ? params.team_leader_id : ''} disabled={!params.manager_id}>
                                                <option value={''}>Select Team Lead</option>
                                                {data?.managersAndLeaders?.filter((emp) => emp.manager_id == params.manager_id && emp.user_type == "Team Leader").map((emp) => (
                                                    <option value={emp.id} key={emp.id}>{emp.first_name} {emp.last_name}</option>
                                                ))}
                                            </select>
                                            {errors?.team_leader_id ? <div className="text-danger mt-1">{errors.team_leader_id}</div> : ''}
                                        </div>
                                    }


                                    {
                                        params.id ? '' :
                                            <div>
                                                <label >Status <span className=' text-red-600 text-md' >*</span></label>
                                                <select name="status" className="form-select text-white-dark"
                                                    onChange={(e) => changeValue(e)} value={params.status ? params.status : ''}>
                                                    <option >Select Status</option>
                                                    <option value={1}>Active</option>
                                                    <option value={0}>Inactive</option>
                                                </select>
                                                {errors?.status ? <div className="text-danger mt-1">{errors.status}</div> : ''}
                                            </div>
                                    }

                                </div>
                                <button type="button" onClick={() => formSubmit()} disabled={btnLoading} className="btn bg-[#1d67a7] text-white ltr:ml-4 rtl:mr-4">
                                    {btnLoading ? 'Please Wait' : params.id ? 'Update Employee' : 'Add Employee'}
                                </button>
                            </form>
                        </div>
                    )}
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
                    <div id="standard_modal" className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
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
                                    <div className="flex py-2 bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-center">
                                        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#f1f2f3] dark:bg-white/10">
                                            <PiWarningCircleFill size={40} color='orange' />
                                        </span>
                                    </div>
                                    <div className="p-5">
                                        <div className="py-3 font-bold text-dark text-center">
                                            <p>
                                                {params?.user_type === 'BDE' && !params.manager_id && !params.team_leader_id ? 'Are you sure? Continue BDE without a Manager and Team Leader?' : !params.manager_id ? 'Are you sure? Continue BDE without a Manager?' : !params.team_leader_id ? 'Are you sure? Continue BDE without a Team Leader?' :
                                                    params?.user_type === 'Team Leader' && !params.manager_id ? 'Are you sure? Continue Team Leader without a Manager?' : null}
                                            </p>
                                        </div>
                                        <div className="flex justify-end items-center mt-4">
                                            <button type="button" onClick={() => setModal(false)} className="btn btn-sm btn-outline-danger">
                                                Cancel
                                            </button>
                                            <button type="button" onClick={() => { setModal(false); formSubmit(true) }} className="btn btn-sm btn-primary ltr:ml-4 rtl:mr-4">
                                                Continue
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>

    )
}


