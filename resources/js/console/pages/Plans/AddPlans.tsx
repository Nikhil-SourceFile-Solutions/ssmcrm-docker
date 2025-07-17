import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import Swal from 'sweetalert2';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
export default function AddPlans({ plan, setTab, fetchPlans }: any) {
    useEffect(() => { dispatch(setPageTitle('Add Plans')); });
    const { logout, authUser, crmToken, apiUrl } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const [defaultParams] = useState({
        plan_name: '',
        max_agents: '',
        description: '',
        company_type: '',
        is_paid: 0,
        monthly_price: '',
        monthly_discount: '',
        half_yearly_price: '',
        half_yearly_discount: '',
        yearly_price: '',
        yearly_discount: '',
        chat_module: 0,
        broadcast_module: 0,
        document_module: 0,
        analyst_module: 0,
        whatsapp_module: 0,
        sms_module: 0,
        status: ''
    });

    useEffect(() => {
        if (plan) {
            setParams({
                id: plan?.id ? plan?.id : '',
                plan_name: plan?.plan_name ? plan?.plan_name : '',
                max_agents: plan?.max_agents ? plan?.max_agents : '',
                description: plan?.description ? plan?.description : '',
                company_type: plan?.company_type ? plan?.company_type : '',
                is_paid: plan?.is_paid ? 1 : 0,
                monthly_price: plan?.monthly_price ? plan?.monthly_price : '',
                monthly_discount: plan?.monthly_discount ? plan?.monthly_discount : '',
                half_yearly_price: plan?.half_yearly_price ? plan?.half_yearly_price : '',
                half_yearly_discount: plan?.half_yearly_discount ? plan?.half_yearly_discount : '',
                yearly_price: plan?.yearly_price ? plan?.yearly_price : '',
                yearly_discount: plan?.yearly_discount ? plan?.yearly_discount : '',
                chat_module: plan?.chat_module ? 1 : 0,
                broadcast_module: plan?.broadcast_module ? 1 : 0,
                document_module: plan?.document_module ? 1 : 0,
                analyst_module: plan?.analyst_module ? 1 : 0,
                whatsapp_module: plan?.whatsapp_module ? 1 : 0,
                sms_module: plan?.sms_module ? 1 : 0,
                status: plan?.status,
            })
        }
        else {

            setParams(defaultParams);
        }

    }, [plan])
    console.log(plan)
    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});

    const validate = () => {
        setErros({});
        let errors = {};
        // if (!params.domain) {
        //     errors = { ...errors, domain: "sub domain is required" };
        // }



        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const [btnLoading, setBtnLoading] = useState(false);

    // const changeValue = (e: any) => {
    //     const { value, name } = e.target;
    //     setErros({ ...errors, [name]: "" });
    //     setParams({ ...params, [name]: value });
    // };

    // const changeValue = (e: any) => {
    //     const { name, checked,value } = e.target;
    //     setErros({ ...errors, [name]: "" });
    //     setParams({ ...params, [name]: checked ? 1 : 0 });
    //     setParams({ ...params, [name]: value });

    // };

    const changeValue = (e: any) => {
        const { name, type, checked, value } = e.target;

        // Clear errors for the field
        setErros({ ...errors, [name]: "" });

        // Set params based on input type
        setParams({
            ...params,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value
        });
    };


    const addPlans = async (data: any) => {
        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/plans",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            console.log(response)

            if (response.data.status == 'success') {
                showMessage(response.data.message)
                setParams(defaultParams)
                setTab('plans')
                fetchPlans()
            } else { alert(response.data.message) }

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

    // const UpdateDropdown = (data: any) => {
    //     setErros({});
    //     if (data) {
    //         setParams({
    //             id: data.id,
    //             type: data.type,
    //             value: data.value,
    //             status: data.status ? "1" : "0"
    //         });
    //         // setShowDropdownDrawer(true)
    //     }
    // }

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("id", params.id ? params.id : '');
        data.append("plan_name", params.plan_name);
        data.append("max_agents", params.max_agents);
        data.append("description", params.description);
        data.append("company_type", params.company_type);
        data.append("is_paid", params.is_paid);
        data.append("monthly_price", params.monthly_price);
        data.append("monthly_discount", params.monthly_discount);
        data.append("half_yearly_price", params.half_yearly_price);
        data.append("half_yearly_discount", params.half_yearly_discount);
        data.append("yearly_price", params.yearly_price);
        data.append("yearly_discount", params.yearly_discount);
        data.append("chat_module", params.chat_module);
        data.append("broadcast_module", params.broadcast_module);
        data.append("document_module", params.document_module);
        data.append("analyst_module", params.analyst_module);
        data.append("whatsapp_module", params.whatsapp_module);
        data.append("sms_module", params.sms_module);
        data.append("status", params.status);

        addPlans(data);
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
        <div>
            <div className="panel">
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Add Plans</h5>
                    <div className="ltr:ml-auto rtl:mr-auto flex md:items-center md:flex-row flex-col mb-5 gap-5">
                        <button type="button" onClick={() => setTab('plans')} className="btn btn-outline-primary">Back</button>
                        <button type="button" onClick={() => { formSubmit() }} className="btn btn-primary">Submit</button>

                    </div>
                </div>
                <hr className="my-4 dark:border-[#191e3a]" />
                <div className='space-y-5 mb-5'>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="plan_name">Plan Name</label>
                            <input type="text" placeholder="Enter Plan Name" className="form-input"
                                name='plan_name'
                                value={params.plan_name}
                                onChange={(e) => changeValue(e)}

                            />
                        </div>
                        <div>
                            <label htmlFor="plan_name">Max. Agent</label>
                            <input type="text" placeholder="Enter Maximum Agent" className="form-input"
                                name='max_agents'
                                value={params.max_agents}
                                onChange={(e) => changeValue(e)}
                            />
                        </div>

                        <div>
                            <label htmlFor="plan_name">Description</label>
                            <textarea placeholder="Enter Description" className="form-input"
                                name='description'
                                value={params.description}
                                onChange={(e) => changeValue(e)}
                            ></textarea>
                        </div>
                        <div>
                            <label htmlFor="company_type">Company Type</label>
                            <select className="form-select text-white-dark"
                                name='company_type'
                                value={params.company_type}
                                onChange={(e) => changeValue(e)}
                            >
                                <option>Select Type</option>
                                <option>Non-SEBI</option>
                                <option>SEBI - Research Analyst</option>
                                <option>SEBI - Investment Advisor</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="plan_status">Status</label>
                            <select className="form-select text-white-dark"
                                name='status'
                                value={params.status ? params.status : ''}
                                onChange={(e) => changeValue(e)}
                            >
                                <option>Select Status</option>
                                <option value={1} >Active</option>
                                <option value={0} >Inactive</option>
                            </select>
                            {errors?.status ? <div className="text-danger mt-1">{errors.status}</div> : ''}

                        </div>
                    </div>
                </div>
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Plan Tenure</h5>
                </div>
                <hr className="my-4 dark:border-[#191e3a]" />
                <div className='space-y-5 mb-5'>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="plan_name" className='mb-4'>Paid If you want to make this plan free turn this off </label>
                            {/* <label className="w-12 h-6 relative">
                                <input type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                    id="custom_switch_checkbox1"
                                    name='is_paid'
                                    value={params.is_paid ? 1 : 0}
                                    onChange={(e) => changeValue(e)}
                                    checked={params.is_paid=='1'}
                                />
                                <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                            </label> */}
                            <label className="w-12 h-6 relative">
                                <input
                                    type="checkbox"
                                    className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                    id="custom_switch_checkbox1"
                                    name="is_paid"
                                    checked={params.is_paid === 1}
                                    onChange={(e) => changeValue(e)}
                                />
                                <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                            </label>

                        </div>
                    </div>
                </div>
                {
                    params.is_paid ?
                        <div className='space-y-5 mb-5'>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Monthly  */}
                                <div className="panel border">
                                    <div className="flex items-center justify-between mb-5">
                                        <h5 className="font-semibold text-lg dark:text-white-light">Monthly</h5>
                                    </div>
                                    <hr className="my-4 dark:border-[#191e3a]" />
                                    <div className="mb-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="monthlyplan_price">Monthly Price</label>
                                                <input type="text" placeholder="Enter Plan Price" className="form-input"
                                                    name='monthly_price'
                                                    value={params.monthly_price}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="monthlyplan_disprice">Monthly Discounted Price</label>
                                                <input type="text" placeholder="Enter Plan Discounted Price" className="form-input"
                                                    name='monthly_discount'
                                                    value={params.monthly_discount}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Halfyearly  */}
                                <div className="panel border">
                                    <div className="flex items-center justify-between mb-5">
                                        <h5 className="font-semibold text-lg dark:text-white-light">Halfyearly</h5>
                                    </div>
                                    <hr className="my-4 dark:border-[#191e3a]" />
                                    <div className="mb-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="halfyearlyplan_price">Halfyearly Price</label>
                                                <input type="text" placeholder="Enter Plan Price" className="form-input"
                                                    name='half_yearly_price'
                                                    value={params.half_yearly_price}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="halfyearlyplan_disprice">Halfyearly Discounted Price</label>
                                                <input type="text" placeholder="Enter Plan Discounted Price" className="form-input"
                                                    name='half_yearly_discount'
                                                    value={params.half_yearly_discount}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Yearly  */}
                                <div className="panel border">
                                    <div className="flex items-center justify-between mb-5">
                                        <h5 className="font-semibold text-lg dark:text-white-light">Yearly</h5>
                                    </div>
                                    <hr className="my-4 dark:border-[#191e3a]" />
                                    <div className="mb-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="yearlyplan_price">Yearly Price</label>
                                                <input type="text" placeholder="Enter Plan Price" className="form-input"
                                                    name='yearly_price'
                                                    value={params.yearly_price}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="yearlyplan_disprice">Yearly Discounted Price</label>
                                                <input type="text" placeholder="Enter Plan Discounted Price" className="form-input"
                                                    name='yearly_discount'
                                                    value={params.yearly_discount}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> : ''
                }

                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Module Selection *</h5>
                </div>
                <hr className="my-4 dark:border-[#191e3a]" />
                <div className='space-y-5 mb-5'>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Chat  */}
                        <div className="panel border">
                            <div className="flex items-center justify-between mb-5">
                                <h5 className="font-semibold text-lg dark:text-white-light">Chat</h5>
                                <button type="button"
                                    className="font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600">
                                    <span className="flex items-center"> Communicate with team members in real time </span>
                                </button>
                            </div>
                            <hr className="my-4 dark:border-[#191e3a]" />

                            <div className="mb-5">
                                <label className="w-12 h-6 relative">
                                    <input type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                        name='chat_module'
                                        value={params.chat_module ? 1 : 0}
                                        onChange={(e) => changeValue(e)}
                                        checked={params.chat_module == '1'}

                                    />
                                    <span className="outline_checkbox bg-icon border-2 border-[#ebedf2] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#ebedf2] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full before:bg-[url(/assets/images/close.svg)] before:bg-no-repeat before:bg-center peer-checked:before:left-7 peer-checked:before:bg-[url(/assets/images/checked.svg)] peer-checked:border-primary peer-checked:before:bg-primary before:transition-all before:duration-300"></span>
                                </label>
                                {/* <span className="flex items-center"> {plan.chat_module ? 'Already Enabled' : 'Enabled'}  </span> */}
                                <span className="flex items-center"> {params.chat_module == '1' ? 'Enabled' : 'Disabled'} </span>

                            </div>
                        </div>
                        {/* Broadcast  */}
                        <div className="panel border">
                            <div className="flex items-center justify-between mb-5">
                                <h5 className="font-semibold text-lg dark:text-white-light">Broadcast</h5>
                                <button type="button" className="font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600">
                                    <span className="flex items-center">Transmitting information to all connected devices.</span>
                                </button>
                            </div>
                            <hr className="my-4 dark:border-[#191e3a]" />
                            <div className="mb-5">
                                <label className="w-12 h-6 relative">
                                    <input type="checkbox"
                                        className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                        name="broadcast_module"
                                        value={params.broadcast_module ? 1 : 0}
                                        onChange={(e) => changeValue(e)}
                                        checked={params.broadcast_module == '1'}

                                    />
                                    <span className="outline_checkbox bg-icon border-2 border-[#ebedf2] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#ebedf2] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full before:bg-[url(/assets/images/close.svg)] before:bg-no-repeat before:bg-center peer-checked:before:left-7 peer-checked:before:bg-[url(/assets/images/checked.svg)] peer-checked:border-primary peer-checked:before:bg-primary before:transition-all before:duration-300"></span>
                                </label>
                                {/* <span className="flex items-center"> Enabled </span> */}
                                <span className="flex items-center"> {params.broadcast_module == '1' ? 'Enabled' : 'Disabled'} </span>

                            </div>
                        </div>
                        {/* Documents  */}
                        <div className="panel border">
                            <div className="flex items-center justify-between mb-5">
                                <h5 className="font-semibold text-lg dark:text-white-light">Documents</h5>
                                <button type="button" className="font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600">
                                    <span className="flex items-center"> KYC, Risk Profile, and Invoice </span>
                                </button>
                            </div>
                            <hr className="my-4 dark:border-[#191e3a]" />
                            <div className="mb-5">
                                <label className="w-12 h-6 relative">
                                    <input type="checkbox"
                                        className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                        name="document_module"
                                        value={params.document_module ? 1 : 0}
                                        onChange={(e) => changeValue(e)}
                                        checked={params.document_module == '1'}

                                    />
                                    <span className="outline_checkbox bg-icon border-2 border-[#ebedf2] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#ebedf2] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full before:bg-[url(/assets/images/close.svg)] before:bg-no-repeat before:bg-center peer-checked:before:left-7 peer-checked:before:bg-[url(/assets/images/checked.svg)] peer-checked:border-primary peer-checked:before:bg-primary before:transition-all before:duration-300"></span>
                                </label>
                                <span className="flex items-center"> {params.document_module == '1' ? 'Enabled' : 'Disabled'} </span>
                            </div>
                        </div>
                        {/* Analyst  */}
                        <div className="panel border">
                            <div className="flex items-center justify-between mb-5">
                                <h5 className="font-semibold text-lg dark:text-white-light">Analyst</h5>
                                <button type="button" className="font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600">
                                    <span className="flex items-center"> Campaign and Sales Campaigns </span>
                                </button>
                            </div>
                            <hr className="my-4 dark:border-[#191e3a]" />
                            <div className="mb-5">
                                <label className="w-12 h-6 relative">
                                    <input type="checkbox"
                                        className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                        name="analyst_module"
                                        value={params.analyst_module ? 1 : 0}
                                        onChange={(e) => changeValue(e)}
                                        checked={params.analyst_module == '1'}

                                    />
                                    <span className="outline_checkbox bg-icon border-2 border-[#ebedf2] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#ebedf2] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full before:bg-[url(/assets/images/close.svg)] before:bg-no-repeat before:bg-center peer-checked:before:left-7 peer-checked:before:bg-[url(/assets/images/checked.svg)] peer-checked:border-primary peer-checked:before:bg-primary before:transition-all before:duration-300"></span>
                                </label>
                                {/* <span className="flex items-center"> Enabled </span> */}
                                <span className="flex items-center"> {params.analyst_module == '1' ? 'Enabled' : 'Disabled'} </span>

                            </div>
                        </div>
                        {/* WhatsApp  */}
                        <div className="panel border">
                            <div className="flex items-center justify-between mb-5">
                                <h5 className="font-semibold text-lg dark:text-white-light">WhatsApp API</h5>
                                <button type="button" className="font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600">
                                    <span className="flex items-center"> Interface for programmatic WhatsApp messaging automation. </span>
                                </button>
                            </div>
                            <hr className="my-4 dark:border-[#191e3a]" />
                            <div className="mb-5">
                                <label className="w-12 h-6 relative">
                                    <input type="checkbox"
                                        className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                        name="whatsapp_module"
                                        value={params.whatsapp_module ? 1 : 0}
                                        onChange={(e) => changeValue(e)}
                                        checked={params.whatsapp_module == '1'}

                                    />
                                    <span className="outline_checkbox bg-icon border-2 border-[#ebedf2] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#ebedf2] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full before:bg-[url(/assets/images/close.svg)] before:bg-no-repeat before:bg-center peer-checked:before:left-7 peer-checked:before:bg-[url(/assets/images/checked.svg)] peer-checked:border-primary peer-checked:before:bg-primary before:transition-all before:duration-300"></span>
                                </label>
                                {/* <span className="flex items-center"> Enabled </span> */}
                                <span className="flex items-center"> {params.whatsapp_module == '1' ? 'Enabled' : 'Disabled'} </span>

                            </div>
                        </div>
                        {/* SMS  */}
                        <div className="panel border">
                            <div className="flex items-center justify-between mb-5">
                                <h5 className="font-semibold text-lg dark:text-white-light">SMS API</h5>
                                <button type="button" className="font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600">
                                    <span className="flex items-center"> Interface for sending text messages programmatically. </span>
                                </button>
                            </div>
                            <hr className="my-4 dark:border-[#191e3a]" />
                            <div className="mb-5">
                                <label className="w-12 h-6 relative">
                                    <input type="checkbox"
                                        className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                        name="sms_module"
                                        value={params.sms_module ? 1 : 0}
                                        onChange={(e) => changeValue(e)}
                                        checked={params.sms_module == '1'}

                                    />
                                    <span className="outline_checkbox bg-icon border-2 border-[#ebedf2] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#ebedf2] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full before:bg-[url(/assets/images/close.svg)] before:bg-no-repeat before:bg-center peer-checked:before:left-7 peer-checked:before:bg-[url(/assets/images/checked.svg)] peer-checked:border-primary peer-checked:before:bg-primary before:transition-all before:duration-300"></span>
                                </label>
                                {/* <span className="flex items-center"> Enabled </span> */}
                                <span className="flex items-center"> {params.sms_module == '1' ? 'Enabled' : 'Disabled'} </span>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
