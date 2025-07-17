import React from 'react';
import { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import { setCrmToken, setPageTitle } from '../../store/themeConfigSlice';
import Select from 'react-select';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { IRootState } from '../../store';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';

import axios from 'axios';
import Swal from 'sweetalert2';
import PageLoader from '../../components/Layouts/PageLoader';
import Main from '../Development/Main';
import { useAuth } from '../../AuthContext';
import MainLeft from '../LeftNav/MainLeft';
const options5 = [
    { value: 'orange', label: 'Orange' },
    { value: 'white', label: 'White' },
    { value: 'purple', label: 'Purple' },
];
const AddLeads = () => {


    const { logout, crmToken, authUser, apiUrl } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();


    const [isLoading, setIsLoading] = useState(true);
    const [fetchingError, setFetchingError] = useState(null);
    useEffect(() => {
        if (!crmToken) navigate('/')
        else {
            dispatch(setPageTitle('Add Lead'));
            fetchCreateLeadData();
        }
    }, []);



    const [dropdowns, setDropdowns] = useState([]);
    const [products, setProducts] = useState([]);
    const fetchCreateLeadData = async () => {

        console.log("Fetching Data for Create Lead")
        setIsLoading(true)
        setFetchingError(null)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/leads/create",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });
            if (response.data.status == "success") {
                setDropdowns(response.data.dropdowns)
                setProducts(response.data.dropdowns?.filter(d => d.type == "Lead Products"))

            }
        } catch (error: any) {
            console.log(error)
            setFetchingError(error)
            if (error?.response?.status == 401) logout()
        } finally {
            setIsLoading(false)
        }
    }



    const [defaultParams] = useState({
        user_id: '',
        first_name: '',
        last_name: '',
        phone: '',
        second_phone: '',
        email: '',
        status: '',
        invest: '',
        free_trial: '',
        followup: '',
        source: '',
        dnd: '',
        city: '',
        state: '',
        products: [],
        desc: '',
        lot_size: ''
    });

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});
    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
    };

    const formattedProducts = (products: any) => {
        if (products && products.length) return products.map((product: any) => ({
            value: product,
            label: product
        }))
        else return []
    };

    const validate = () => {
        setErros({});
        let errors = {};

        if (!params.first_name && params.status == "Closed Won") {
            errors = { ...errors, first_name: "first name is required" };
        }

        if (!params.phone) {
            errors = { ...errors, phone: "phone number is required" };
        }

        if (!params.status) {
            errors = { ...errors, status: "status is required" };
        }

        if (!params.state) {
            errors = { ...errors, state: "status is required" };
        }

        if (params.status == 'Free Trial' && !params.free_trial) {
            errors = { ...errors, free_trial: 'First Free Trial date is mandatory' }
        }

        if (params.status == 'Free Trial' && !params.products.length) {
            errors = { ...errors, products: 'products is mandatory' }
        }

        if (params.status === 'Follow Up' && !params.followup) {
            errors = { ...errors, followup: 'Follow Up Date is mandatory' };
        }

        console.log(errors);
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };


    const AddDropdown = async (data: any) => {

        console.log("Sending Create Lead Data ...")

        setIsBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/leads",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {
                showMessage(response.data.message)
                navigate('/leads/viewleads');

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
            } else if (error?.response?.status === 500) {
                alert(error?.message)
            }
        } finally {
            setIsBtnLoading(false)
        }
    };

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("user_id", params.user_id);
        data.append("first_name", params.first_name);
        data.append("last_name", params.last_name);
        data.append("phone", params.phone);
        data.append("second_phone", params.second_phone);
        data.append("email", params.email);
        data.append("status", params.status);
        data.append("invest", params.invest);
        data.append("followup", params.status == "Follow Up" ? params.followup : '');
        data.append("free_trial", params.status == "Free Trial" ? params.free_trial : '');

        data.append("source", params.source);
        data.append("dnd", params.dnd);
        data.append("city", params.city);
        data.append("state", params.state);
        data.append("products", params.products.length ? JSON.stringify(params.products) : JSON.stringify([]));
        data.append("desc", params.desc);
        data.append("lot_size", params.lot_size);
        AddDropdown(data);
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



    const dateFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    return (

        <MainLeft>
            <div className="p-0 flex-1 overflow-x-hidden h-full">
                {isLoading ? <PageLoader /> : fetchingError ? <Error error={fetchingError} fetch={fetchCreateLeadData} /> : (
                    <div className="flex flex-col h-full">
                        <div id='forms_grid' className='panel'>
                            <div className='flex items-center justify-between mb-5'>
                                <h5 className="font-semibold text-lg dark:text-white-light">Create New Leads ({authUser?.first_name} {authUser?.last_name})</h5>
                                <button type="button" className="btn btn-primary" onClick={() => formSubmit()} disabled={isBtnLoading}>
                                    {isBtnLoading ? 'Please Loading' : 'Submit'}
                                </button>
                            </div>
                            <hr className="my-4 dark:border-[#191e3a]" />
                            {/* Add New Leads */}
                            <div className='mb-5 space-y-5'>
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">



                                    <div>
                                        <label >Lead Mobile Number <span className=' text-red-600 text-[15px] ' >*</span></label>
                                        <input type="tel" max={10} name="phone" value={params.phone} maxLength={10} onChange={(e) => changeValue(e)} placeholder="Enter Lead Mobile Number" className="form-input" />
                                        <div className="text-danger mt-1">{errors.phone}</div>
                                    </div>
                                    <div>
                                        <label >Alternative Mobile Number</label>
                                        <input type="tel" max={10} name="second_phone" value={params.second_phone} maxLength={10} onChange={(e) => changeValue(e)} placeholder="Enter Lead Mobile Number" className="form-input" />
                                        <div className="text-danger mt-1">{errors.second_phone}</div>
                                    </div>
                                    <div>
                                        <label >First Name</label>
                                        <input type="text" name="first_name" value={params.first_name} onChange={(e) => changeValue(e)} placeholder="Enter First Name" className="form-input" />
                                        <div className="text-danger mt-1">{errors.first_name}</div>
                                    </div>
                                    <div>
                                        <label>Last Name</label>
                                        <input type="text" name="last_name" value={params.last_name} onChange={(e) => changeValue(e)} placeholder="Enter Last Name" className="form-input" />
                                        <div className="text-danger mt-1">{errors.last_name}</div>
                                    </div>

                                    <div>
                                        <label >Lead Email</label>
                                        <input type="email" name="email" value={params.email} onChange={(e) => changeValue(e)} placeholder="Enter Lead Email Address" className="form-input" />
                                        <div className="text-danger mt-1">{errors.email}</div>
                                    </div>
                                    <div>
                                        <label >Lead Status <span className=' text-red-600 text-[15px] ' >*</span></label>
                                        <select name="status" className="form-select text-white-dark" value={params.status} onChange={(e) => changeValue(e)}>
                                            <option>Choose...</option>
                                            {dropdowns?.filter(d => d.type == 'Lead Status').map((status) => (
                                                <option key={status.id}>{status.value}</option>
                                            ))}
                                        </select>
                                        <div className="text-danger mt-1">{errors.status}</div>
                                    </div>
                                    <div>
                                        <label >Lead Source</label>
                                        <input name='source' type="text" value={'Incoming'} onChange={(e) => changeValue(e)} className="form-input bg-info-light" disabled={true} />
                                    </div>

                                    <div>
                                        <label >State <span className=' text-red-600 text-[15px] ' >*</span></label>
                                        <select name="state" className="form-select text-white-dark" value={params.state} onChange={(e) => changeValue(e)}>
                                            <option>Choose...</option>
                                            {dropdowns?.filter(d => d.type == 'State').map((status) => (
                                                <option key={status.id}>{status.value}</option>
                                            ))}
                                        </select>
                                        <div className="text-danger mt-1">{errors.state}</div>
                                    </div>

                                    <div>
                                        <label >City</label>
                                        <input name="city" type="text" value={params.city} onChange={(e) => changeValue(e)} placeholder="Enter City" className="form-input" />
                                        <div className="text-danger mt-1">{errors.city}</div>
                                    </div>



                                    <div>
                                        <label>Followup Date {params?.status == "Follow Up" ? <span className=' text-red-600 text-[15px] ' >*</span> : null} </label>
                                        <Flatpickr name="followup"
                                            // disabled={params.status != 'Follow Up'}
                                            value={params.followup}
                                            onChange={(CustomDate) => {
                                                const date = CustomDate.map((dateStr) => {
                                                    const formattedDate = dateFormatter.format(new Date(dateStr));
                                                    return formattedDate.split('/').reverse().join('-');
                                                });
                                                changeValue({ target: { value: date[0], name: 'followup' } })
                                            }}
                                            options={{ dateFormat: 'Y-m-d', position: 'auto left', minDate: 'today' }} className="form-input" />
                                        <div className="text-danger mt-1">{errors.followup}</div>
                                    </div>


                                    <div>
                                        <label >Free Trial  {params?.status == "Free Trial" ? <span className=' text-red-600 text-[15px] ' >*</span> : null}</label>
                                        <Flatpickr name="free_trial"
                                            // disabled={params.status != 'Free Trial'}
                                            value={params.free_trial}
                                            onChange={(CustomDate) => {
                                                const date = CustomDate.map((dateStr) => {
                                                    const formattedDate = dateFormatter.format(new Date(dateStr));
                                                    return formattedDate.split('/').reverse().join('-');
                                                });
                                                changeValue({ target: { value: date[0], name: 'free_trial' } })
                                            }}
                                            options={{ dateFormat: 'Y-m-d', position: 'auto left', minDate: 'today' }}
                                            className="form-input" />
                                        <div className="text-danger mt-1">{errors.free_trial}</div>
                                    </div>

                                    <div>
                                        <label >Investment Size</label>
                                        <select name="invest" value={params.invest} onChange={(e) => changeValue(e)} className="form-select text-white-dark">
                                            <option>Choose...</option>
                                            {dropdowns?.filter(d => d.type == 'Investment Size').map((status) => (
                                                <option key={status.id}>{status.value}</option>
                                            ))}
                                        </select>
                                        <div className="text-danger mt-1">{errors.invest}</div>
                                    </div>


                                    <div>
                                        <label >Lot Size</label>
                                        <select name="lot_size" value={params.lot_size} onChange={(e) => changeValue(e)} className="form-select text-white-dark">
                                            <option>Choose...</option>
                                            {dropdowns?.filter(d => d.type == 'Lot Size').map((status) => (
                                                <option key={status.id}>{status.value}</option>
                                            ))}
                                        </select>
                                        <div className="text-danger mt-1">{errors.lot_size}</div>
                                    </div>

                                    <div>
                                        <label >DND Status</label>
                                        <select name="dnd" value={params.dnd} onChange={(e) => changeValue(e)} className="form-select text-white-dark">
                                            <option>Choose...</option>
                                            {dropdowns?.filter(d => d.type == 'DND Status').map((status) => (
                                                <option key={status.id}>{status.value}</option>
                                            ))}
                                        </select>
                                        <div className="text-danger mt-1">{errors.dnd}</div>
                                    </div>


                                    <div className='sm:col-span-2'>
                                        <label >Products  {params?.status == "Free Trial" ? <span className=' text-red-600 text-[15px] ' >*</span> : null}</label>
                                        <Select
                                            name='products'
                                            onChange={(e) => changeValue({ target: { name: 'products', value: e.map((a: any) => a.value) } })}
                                            value={formattedProducts(params.products)}
                                            options={dropdowns?.filter((d: any) => d.type == "Lead Products")}
                                            placeholder="Select User Type"
                                            isMulti
                                            className=" text-white-dark"
                                            isSearchable={false} />
                                        <div className="text-danger mt-1">{errors.products}</div>
                                    </div>

                                </div>
                                <div>
                                    <div className="flex">
                                        <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b] whitespace-nowrap">
                                            Description
                                        </div>
                                        <textarea name="desc" value={params.desc} onChange={(e) => changeValue(e)} rows={4} className="form-textarea ltr:rounded-l-none rtl:rounded-r-none"></textarea>
                                    </div>
                                    <div className="text-danger mt-1">{errors.desc}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </MainLeft>

    );
};




const Error = ({ error, fetch }) => {
    return (<>

        <div className='bg-[#ece7f7] w-full h-[calc(80vh-80px)] flex flex-col items-center justify-center text-center space-y-4'>
            <h1 className='text-5xl font-extrabold'>{error?.status}</h1>
            <p><b>{error?.message}</b></p>
            <p><b>{error?.response?.statusText}</b></p>
            <div className='space-x-4'>
                <NavLink to={'/'} className='bg-blue-500 text-white px-4 py-2 rounded'>Back to Home</NavLink>
                <button className='bg-green-500 text-white px-4 py-2 rounded' onClick={() => fetch()}>Re Try</button>
            </div>
        </div>
    </>)
}

export default AddLeads;





