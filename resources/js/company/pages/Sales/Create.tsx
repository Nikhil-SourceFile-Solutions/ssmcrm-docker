import React, { useEffect, useState } from 'react'
import { useAuth } from '../../AuthContext';
import { IoCloseSharp } from 'react-icons/io5';
import axios from 'axios';
import Swal from 'sweetalert2';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';

export default function Create({ createSaleDrawer, setCreateSaleDrawer, lead_id }) {

    const { logout, crmToken, authUser, apiUrl, settingData } = useAuth();



    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>([]);

    const fetchDataForCreateSale = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/sales/create",
                params: { lead_id: lead_id },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") {
                setData(response.data.data)

            }
        } catch (error) {
            console.log(error)
            if (error?.response?.status == 401) logout()
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (createSaleDrawer) fetchDataForCreateSale()
    }, [createSaleDrawer, lead_id])


    // ################################################################## //

    const [defaultParams] = useState({
        bank: '',
        client_type: '',
        sale_service: '',
        sale_date: '',
        start_date: '',
        due_date: '',
        product_id: '',
        sale_price: '',
        product_price: '',
        client_paid: '',
        offer_price: '',
        description: '',
        is_custom_price: 0
    });

    const [params, setParams] = useState<any>([]);
    const [errors, setErrors] = useState<any>([]);

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        console.log(value, name)
        setErrors({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
    };



    useEffect(() => {
        if (params.product_id) {
            const product = data?.products?.find((p: any) => p.id == params.product_id);
            setParams({
                ...params,
                product_price: product.pro_price,
                sale_price: product.pro_price,
            })
        }
    }, [params.product_id])

    useEffect(() => {
        if (params.id && data?.products) {
            setErrors(prevErrors => ({
                ...prevErrors,
                offer_price: "",
                client_paid: ""
            }));

            const { offer_price, sale_price }: any = saleCalculation();
            setParams(prevParams => ({
                ...prevParams,
                sale_price: sale_price,

                offer_price: offer_price
            }));
        }
    }, [params.sale_price, params.is_custom_price, params.client_paid])


    const saleCalculation = () => {
        let amount = 0;


        if (params.is_custom_price) {
            amount = params.sale_price;
        } else amount = params.product_amount


        let offerPrice: any = 0;




        if (params.is_custom_price) {
            if (params.product_amount >= params.sale_price) {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    sale_price: "Cannot be less than sale price"
                }));
                offerPrice = '';
            }
        } else {
            offerPrice = amount - params.client_paid;
            if (amount < params.client_paid) {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    client_paid: "Cannot be greater than sale price"
                }));
                offerPrice = '';
            }
        }


        return { offer_price: offerPrice, sale_price: amount }
    }


    function validatePositiveNumber(value: any) {
        const positiveNumberPattern = /^[0-9]+(\.[0-9]+)?$/;
        if (positiveNumberPattern.test(value) && parseFloat(value) > 0)
            return true;
        else
            return false;

    }

    const validate = () => {
        setErrors({});
        let errors = {};
        if (!params.product_id) {
            errors = { ...errors, product_id: "product is required" };
        }
        if (!params.bank) {
            errors = { ...errors, bank: "bank is required" };
        }
        if (!params.client_type) {
            errors = { ...errors, client_type: "client type is required" };
        }

        if (!params.client_paid) {
            errors = { ...errors, client_paid: "client paid is required" };
        } else if (!validatePositiveNumber(params.client_paid)) {
            errors = { ...errors, client_paid: "invalid amount" };
        } else if (Number(params.client_paid) > Number(params.sale_price)) {
            errors = { ...errors, client_paid: "amount should be below or equelto sale amount" };
        }

        if (params.due_date && params.start_date > params.due_date) {
            errors = { ...errors, due_date: "Due Date can not be less than start date" };
        }
        if (!params.sale_service) {
            errors = { ...errors, sale_service: "sale service is required" };
        } else if (!JSON.parse(params.sale_service).length) {
            errors = { ...errors, sale_service: "sale service is required" };
        }
        setErrors(errors);
        return { totalErrors: Object.keys(errors).length };
    };



    const [isBtnLoading, setIsBtnLoading] = useState(false);



    const createSaleApi = async (data: any) => {
        setIsBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/sales",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {

                Swal.fire({
                    icon: response.data.status,
                    title: response.data.message,
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    showCancelButton: false,
                    width: 450,
                    timer: 2000,
                    customClass: {
                        popup: "color-success"
                    }
                });
                setParams(defaultParams)


            } else { alert("Failed") }

        } catch (error: any) {
            console.log(error)
            if (error?.response?.status == 401) logout()
            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                }
                setErrors(serverErrors);
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
    };



    function convertDateString(t) {
        let e = new Date(t), a = e.getFullYear(),
            n = String(e.getMonth() + 1).padStart(2, "0"),
            r = String(e.getDate()).padStart(2, "0");
        return `${a}-${n}-${r}`
    }

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("lead_id", lead_id);
        data.append("bank", params.bank);
        data.append("client_type", params.client_type);
        data.append("sale_service", params.sale_service);
        data.append("product_id", params.product_id);
        data.append("client_paid", params.client_paid);
        data.append("is_custom_price", params.is_custom_price);
        data.append("sale_price", params.sale_price);
        data.append("sale_date", params.sale_date ? convertDateString(params.sale_date) : '');
        data.append("start_date", params.start_date ? convertDateString(params.start_date) : '');
        data.append("due_date", params.due_date ? convertDateString(params.due_date) : '');
        data.append("description", params.description);
        createSaleApi(data);
    };





    const [leadModal, setLeadModal] = useState(true)
    return (
        <div>
            <div className={`${(createSaleDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setCreateSaleDrawer(false)}></div>
            <nav className={`${(createSaleDrawer && 'ltr:!right-0 rtl:!left-0') || ''} bg-white fixed ltr:-right-[900px] rtl:-left-[900px] top-0 bottom-0 w-full max-w-[900px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4`}>

                <div className="flex flex-col h-screen overflow-hidden">

                    <div className="w-full text-center">
                        <div className="p-1 flex sm:flex-row flex-col w-full sm:items-center gap-4">
                            <div className="ltr:mr-3 rtl:ml-3 flex items-center">
                                <h5 className="font-semibold text-lg dark:text-white-light">Create Sale  </h5>
                            </div>
                            <div className="flex items-center gap-2 justify-center sm:justify-end sm:flex-auto flex-1">











                                <button className='btn btn-sm btn-success  mr-[15px] shadow' disabled={isBtnLoading} onClick={() => formSubmit()}>
                                    {isBtnLoading ? 'Please Wait...' : 'Create Sale'}
                                </button>
                                <button type="button" className="bg-[#f4f4f4] ml-[15px] rounded-md p-1 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30" onClick={() => setCreateSaleDrawer(false)}>
                                    <IoCloseSharp className=" w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <hr className="my-4 dark:border-[#191e3a]" />
                    </div>




                    <section className='mx-5'>


                        <div className='flex justify-around gap-5  mb-4'>
                            <div className="flex items-center panel p-3 w-full">
                                <img className="w-[60px] rounded-md ltr:mr-3 rtl:ml-3 object-cover"
                                    src={`https://ui-avatars.com/api/?background=random&name=${data?.lead?.first_name + ' ' + data?.lead?.last_name}`} alt="avatar" />
                                <div className="flex-grow">
                                    <p> <b>#{data?.lead?.id} | {data?.lead?.first_name} {data?.lead?.last_name}</b></p>
                                    <p> <b>{data?.lead?.phone} | {data?.lead?.second_phone}</b></p>
                                    <b>{data?.lead?.state}</b>
                                </div>

                                <div className="flex-shrink-0">
                                    <button className="btn btn-sm btn-warning shadow"
                                        onClick={() => setLeadModal(true)}>Edit Lead</button>
                                </div>

                            </div>

                            <div className='items-center panel p-3 w-full'>
                                <label >Sale Service</label>
                                <select name="status" className="form-select text-white-dark"


                                >
                                    <option value="Pending" >Pending</option>
                                    <option value="Approved" >Approved</option>
                                    <option value="Expired" >Expired</option>
                                    <option value="Paused" >Paused</option>
                                </select>
                                <div className="text-danger font-semibold">{errors.status}</div>
                            </div>
                        </div>



                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 ">
                            <div>
                                <label >Bank Details <span className=' text-red-600 text-[15px] ' >*</span> </label>

                                <select name="bank" className="form-select text-white-dark" value={params.bank} onChange={(e) => changeValue(e)}
                                >
                                    <option value="" disabled >Select Bank Details</option>

                                    {data?.bankqrcode?.map((bank, index) => (
                                        <option key={index + 1} value={bank.id}>{bank.is_bank_upi == 'bank' ? 'Bank - ' + bank.bank_name : 'Upi - ' + bank.upi}</option>

                                    ))}

                                </select>
                                <div className="text-danger mt-1">{errors.bank}</div>
                            </div>

                            <div>
                                <label >Client Type <span className=' text-red-600 text-[15px] ' >*</span></label>
                                <select name="client_type" className="form-select text-white-dark" value={params.client_type} onChange={(e) => changeValue(e)} >
                                    <option value="" disabled >Select Client Type</option>
                                    {data?.dropdowns?.filter((d: any) => d.type == 'Client Type')?.map((client: any) => (
                                        <option key={client.id}>{client.value}</option>
                                    ))}
                                </select>
                                <div className="text-danger mt-1">{errors.client_type}</div>
                            </div>
                            <div>
                                <label >Product <span className=' text-red-600 text-[15px] ' >*</span></label>
                                <select name="product_id" className="form-select text-white-dark" value={params.product_id} onChange={(e: any) => changeValue(e)} >
                                    <option value="" disabled >Select Product</option>
                                    {data?.products?.map((product: any) => (
                                        <option key={product.id} value={product.id}>{product.pro_name}</option>
                                    ))}
                                </select>
                                <div className="text-danger mt-1">{errors.product_id}</div>
                            </div>
                        </div>


                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
                            <div>
                                <label >
                                    {params.product_id ? (<div >
                                        <span className={`${params.is_custom_price ? 'badge bg-success/50' : 'badge bg-success'}  cursor-pointer me-1 `}
                                            onClick={() => setParams({ ...params, is_custom_price: 0 })}
                                        >Sale Price</span>
                                        <span className={`${params.is_custom_price ? 'badge bg-success' : 'badge bg-success/50'}  cursor-pointer `}
                                            onClick={() => setParams({ ...params, is_custom_price: 1 })}
                                        >Custom Price</span>
                                    </div>) : 'Sale Price'}
                                </label>

                                <input name='sale_price' type="text" value={params.sale_price} onChange={(e) => changeValue(e)} placeholder="" className={`form-input ${params.is_custom_price ? '' : 'bg-info-light'} `} disabled={params.is_custom_price ? false : true} />
                                <div className="text-danger mt-1">{errors.sale_price}</div>
                            </div>
                            <div>
                                <label >Client Paid <span className=' text-red-600 text-[15px] ' >*</span></label>
                                <input name='client_paid' type="tel" value={params.client_paid} onChange={(e) => changeValue(e)} placeholder=""
                                    className={`form-input ${!params.sale_price ? 'bg-[#ebedf2]' : ''}`} disabled={!params.sale_price} />
                                <div className="text-danger mt-1">{errors.client_paid}</div>
                            </div>

                            <div>
                                <label >Offer Price</label>
                                <input name='offer_price' type="text" value={params.offer_price} className="form-input bg-info-light" disabled />
                                <div className="text-danger mt-1">{errors.offer_price}</div>
                            </div>

                            <div>
                                <label >Sale Date</label>
                                <Flatpickr name="sale_date"
                                    disabled={authUser?.user_type == "BDE" ? true : false}
                                    value={params.sale_date}
                                    onChange={(e) => changeValue({ target: { value: e[0], name: 'sale_date' } })}
                                    options={{ dateFormat: 'Y-m-d', position: "auto left" }}
                                    className={`form-input ${authUser?.user_type == "BDE" ? 'bg-[#ebedf2]' : ''}`} />
                                <div className="text-danger mt-1">{errors.sale_date}</div>
                            </div>
                            <div>
                                <label >Start Date</label>
                                <Flatpickr name="start_date" value={params.start_date} onChange={(e) => changeValue({ target: { value: e[0], name: 'start_date' } })} options={{ dateFormat: 'Y-m-d', position: "auto left" }} className="form-input" />
                                <div className="text-danger mt-1">{errors.start_date}</div>
                            </div>
                            <div>
                                <label >Due Date</label>
                                <Flatpickr name="due_date"
                                    disabled={authUser?.user_type == "BDE" || !params.start_date}
                                    value={params.due_date}
                                    onChange={(e) => changeValue({ target: { value: e[0], name: 'due_date' } })}
                                    options={{ dateFormat: 'Y-m-d', position: "auto left", minDate: params.start_date }}
                                    className={`form-input ${authUser?.user_type == "BDE" || !params.start_date ? 'bg-[#ebedf2]' : ''}`} />
                                <div className="text-danger mt-1">{errors.due_date}</div>
                            </div>


                        </div>

                        <div className='mt-4'>
                            <div className="flex">
                                <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b] whitespace-nowrap">
                                    Description
                                </div>
                                <textarea name="description" value={params.description} onChange={(e) => changeValue(e)} rows={4} className="form-textarea ltr:rounded-l-none rtl:rounded-r-none"></textarea>
                            </div>
                            <div className="text-danger mt-1">{errors.description}</div>
                        </div>


                    </section>
                </div>
            </nav>

        </div>
    )
}
