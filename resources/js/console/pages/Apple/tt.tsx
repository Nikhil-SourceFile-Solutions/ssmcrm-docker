import React, { useState, Fragment, useEffect } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { IRootState } from '../../store';
import 'flatpickr/dist/flatpickr.css';
import { useAuth } from '../../AuthContext';
import Swal from 'sweetalert2';
import axios from 'axios';

 function Customer({ showCustomerViewDrawer, setCustomerViewShowDrawer, fetchCustomers, company }: any) {

    const { logout, authUser, crmToken, apiUrl } = useAuth();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [defaultParams] = useState({
        id: '',
        domain: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        company_name: '',
        gstin: '',
        city: '',
        state: '',
        branch_no:'',
        corporate_branch_name:'',
        company_type: 1,
        status: 1,
        status_type: 'active'
    });


    useEffect(() => {
        if (showCustomerViewDrawer) {
            if (company) {
                setParams({
                    id: company.id,
                    domain: company.domain,
                    customer_name: company.customer_name,
                    customer_email: company.customer_email,
                    customer_phone: company.customer_phone,
                    company_name: company.company_name,
                    gstin: company.gstin,
                    city: company.city,
                    branch_no:company.branch_no,
                    corporate_branch_name:company.corporate_branch_name,
                    state: company.state,
                    company_type: company.company_type ? 1 : 0,
                    status: company.status ? 1 : 0,
                    status_type: company.status_type
                })

            } else {
                setParams(defaultParams)
            }
        }

    }, [showCustomerViewDrawer, company])


    function subdomainFormat(inputString) {
        return inputString
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
    }

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.domain) {
            errors = { ...errors, domain: "sub domain is required" };
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
                url: apiUrl + "/api/companies",
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
                fetchCustomers()
                setCustomerViewShowDrawer(false);
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
        data.append("id", params.id);
        data.append("domain", subdomainFormat(params.domain));
        data.append("customer_name", params.customer_name);
        data.append("customer_email", params.customer_email);
        data.append("customer_phone", params.customer_phone);
        data.append("company_name", params.company_name);
        data.append("gstin", params.gstin);
        data.append("city", params.city);
        data.append("state", params.state);
        data.append("branch_no", params.branch_no);
        data.append("state", params.state);
        data.append("company_type", params.company_type);
        data.append("status", params.status);
        data.append("corporate_branch_name", params.corporate_branch_name);
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


    return (
        <div>
            <div className={`${(showCustomerViewDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setCustomerViewShowDrawer(false)}></div>
            <nav className={`${(showCustomerViewDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                } bg-white fixed ltr:-right-[600px] rtl:-left-[600px] top-0 bottom-0 w-full max-w-[600px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4`}
            >
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className="w-full text-center">
                        <div className="p-1 flex sm:flex-row flex-col w-full sm:items-center gap-4">
                            <div className="ltr:mr-3 rtl:ml-3 flex items-center">
                                <h5 className="font-semibold text-lg dark:text-white-light">Customer</h5>
                            </div>
                            <div className="flex items-center justify-center sm:justify-end sm:flex-auto flex-1">
                                <button onClick={() => formSubmit()} disabled={btnLoading} className='btn btn-primary mr-[15px] btn-sm'>
                                    {btnLoading ? 'Please Wait...' : params?.id ? "Update Customer" : 'Add Customer'}
                                </button>
                            </div>
                        </div>
                        <hr className="my-4 dark:border-[#191e3a]" />
                    </div>
                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar">
                        <div className='space-y-5 mb-5'>
                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">

                                <div>
                                    <label htmlFor="domain">Sub Domain</label>
                                    <input type="text"
                                        placeholder="Enter Subdomain"
                                        className={`form-input ${params.id ? 'bg-[#000]/[0.08]' : ''}`}
                                        name='domain'
                                        value={subdomainFormat(params.domain)}
                                        onChange={(e) => changeValue(e)}
                                        disabled={params.id ? true : false}
                                    />
                                    <div className="text-danger mt-1">{errors.domain}</div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="branch_no">No Of Branches</label>
                                    <input type="text"
                                        placeholder="Enter No of Branches"
                                        className="form-input"
                                        name='branch_no'
                                        value={params.branch_no}
                                        onChange={(e) => changeValue(e)}
                                    />
                                    <div className="text-danger mt-1">{errors.branch_no}</div>
                                </div>
                                <div>
                                    <label htmlFor="corporate_branch_name">Corporate Branch Name</label>
                                    <input type="text"
                                        placeholder="Enter Corporate Branch name"
                                        className="form-input"
                                        name='corporate_branch_name'
                                        value={params.corporate_branch_name}
                                        onChange={(e) => changeValue(e)}
                                    />
                                    <div className="text-danger mt-1">{errors.corporate_branch_name}</div>
                                </div>
                            </div>

                                <div>
                                    <label htmlFor="customer_name">Customer Name</label>
                                    <input type="text"
                                        placeholder="Enter Customer Name"
                                        className="form-input"
                                        name='customer_name'
                                        value={params.customer_name}
                                        onChange={(e) => changeValue(e)}
                                    />
                                    <div className="text-danger mt-1">{errors.customer_name}</div>
                                </div>
                                <div>
                                    <label htmlFor="customer_email">Customer Email</label>
                                    <input type="email"
                                        placeholder="Enter Customer Email"
                                        className="form-input"
                                        name='customer_email'
                                        value={params.customer_email}
                                        onChange={(e) => changeValue(e)}
                                    />
                                    <div className="text-danger mt-1">{errors.customer_email}</div>
                                </div>
                                <div>
                                    <label htmlFor="customer_phone">Customer Mobile</label>
                                    <input type="tel"
                                        placeholder="Enter Customer Mobile"
                                        className="form-input"
                                        name='customer_phone'
                                        value={params.customer_phone}
                                        onChange={(e) => changeValue(e)}
                                    />
                                    <div className="text-danger mt-1">{errors.customer_phone}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="company_name">Company Name</label>
                                    <input type="text"
                                        placeholder="Enter Company Name"
                                        className="form-input"
                                        name='company_name'
                                        value={params.company_name}
                                        onChange={(e) => changeValue(e)}
                                    />
                                    <div className="text-danger mt-1">{errors.company_name}</div>
                                </div>

                                <div>
                                    <label htmlFor="gstin">GSTIN</label>
                                    <input type="text"
                                        placeholder="Enter GSTIN"
                                        className="form-input"
                                        name='gstin'
                                        value={params.gstin}
                                        onChange={(e) => changeValue(e)}
                                    />
                                    <div className="text-danger mt-1">{errors.gstin}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="city">City</label>
                                    <input type="text"
                                        placeholder="Enter City"
                                        className="form-input"
                                        name='city'
                                        value={params.city}
                                        onChange={(e) => changeValue(e)}
                                    />
                                    <div className="text-danger mt-1">{errors.city}</div>
                                </div>
                                <div>
                                    <label htmlFor="state">State</label>
                                    <input type="text"
                                        placeholder="Enter State"
                                        className="form-input"
                                        name='state'
                                        value={params.state}
                                        onChange={(e) => changeValue(e)}
                                    />
                                    <div className="text-danger mt-1">{errors.state}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="company_type">Company Type</label>
                                    <select
                                        className="form-select text-white-dark"
                                        name='company_type'
                                        value={params.company_type}
                                        onChange={(e) => changeValue(e)}
                                    >
                                        <option value={1}>SEBI </option>
                                        <option value={0}>Non-SEBI</option>

                                    </select>
                                    <div className="text-danger mt-1">{errors.company_type}</div>
                                </div>
                                <div>
                                    <label htmlFor="customer_status">Status</label>
                                    <select
                                        className="form-select text-white-dark"
                                        name='status'
                                        value={params.status}
                                        onChange={(e) => changeValue(e)}
                                    >
                                        <option value={1}>Active</option>
                                        <option value={0}>Inactive</option>
                                    </select>
                                    <div className="text-danger mt-1">{errors.status}</div>
                                </div>
                            </div>


                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {params.status == 0 ? (<div>
                                    <label htmlFor="status_type">Status Type</label>
                                    <select
                                        className="form-select text-white-dark"
                                        name='status_type'
                                        value={params.status_type}
                                        onChange={(e) => changeValue(e)}
                                    >
                                        <option value="" >Select Status Type</option>

                                        <option value="blocked">Blocked</option>
                                        <option value="payment">Payment</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <div className="text-danger mt-1">{errors.status_type}</div>
                                </div>) : null}

                            </div>

                        </div>
                    </section>
                </div>
            </nav>
        </div>
    )
}

export default Customer;
