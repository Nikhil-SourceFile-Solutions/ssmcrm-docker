import React, { useRef } from 'react'
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import axios from 'axios';
import { IoCloseSharp } from 'react-icons/io5';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import 'flatpickr/dist/themes/material_blue.css';
import PageLoader from '../../../components/Layouts/PageLoader';
import { useAuth } from '../../../AuthContext';

import { setPageTitle } from '../../../store/themeConfigSlice';
import AlertCard from '../../../components/AlertCard';
export default function CreateSale({ createSaleDrawer, setCreateSaleDrawer, selectedLead }) {

    const { logout, crmToken, authUser, apiUrl, settingData } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(setPageTitle('Create Sale'))
    }, [])

    const [products, setProducts] = useState([]);
    const [dropdowns, setDropdowns] = useState([]);
    const [bankQrcodes, setBankQrcode] = useState([]);
    useEffect(() => {
        if (selectedLead && createSaleDrawer) fetchDataForCreateSale();
    }, [selectedLead, createSaleDrawer])

    const fetchDataForCreateSale = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/sales/create",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") {
                setDropdowns(response.data.data.dropdowns)
                setProducts(response.data.data.products)
                setBankQrcode(response.data.data.bankqrcode)
            }
        } catch (error) {
            if (error?.response?.status == 401) logout()
        } finally {
            setIsLoading(false)
        }
    }

    const [defaultParams] = useState({
        bank: '',
        client_type: '',
        sale_service: '',
        sale_upload_reciept: '',
        sale_date: '',
        start_date: '',
        due_date: '',
        product_id: '',
        sale_price: '',
        client_paid: '',
        offer_price: '',
        description: '',
        is_custom_price: 0
    });

    const fileLogoRef = useRef<HTMLInputElement>(null);
    const [logoPriview, setLogoPriview] = useState<any>('https://dummyimage.com/600x400/000/fff');
    const setImage1 = (e: any) => {
        const { name } = e.target;
        setErros({ ...errors, [name]: "" });
        if (e.target.files[0]) {
            if (
                e.target.files[0].type &&
                e.target.files[0].type.indexOf("image") === -1
            ) {
                setErros({ ...errors, [name]: "file is not a valid image" });
                return;
            }
            const maxSizeInBytes = 6 * 1024 * 1024;
            if (e.target.files[0].size > maxSizeInBytes) {
                setErros({ ...errors, [name]: "maximum file size is 2 mb" });
                return;
            }
            const reader = new FileReader();
            reader.onload = function (event: any) {
                setLogoPriview(reader.result);

                setParams({ ...params, [name]: e.target.files[0] });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    const setImage = (e: any) => {
        const { name } = e.target;
        const file = e.target.files[0];

        // Reset errors for this field
        setErros({ ...errors, [name]: "" });

        if (file) {
            const maxSizeInBytes = 4 * 1024 * 1024; // 2MB

            // Validate file size
            if (file.size > maxSizeInBytes) {
                setErros({ ...errors, [name]: "Maximum file size is 2 MB" });
                return;
            }

            // Validate file type (Allow images + PDF)
            const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
            if (!validTypes.includes(file.type)) {
                setErros({ ...errors, [name]: "Invalid file type. Only JPG, PNG, PDF allowed" });
                return;
            }

            const reader = new FileReader();

            // If it's an image, generate a preview
            if (file.type.startsWith("image/")) {
                reader.onload = function (event: any) {
                    setLogoPriview(reader.result); // Show preview for images only
                };
                reader.readAsDataURL(file);
            }

            // Store the file in state (whether image or not)
            setParams({ ...params, [name]: file });
        }
    };

    const [params, setParams] = useState<any>([]);
    useEffect(() => {
        if (selectedLead) setParams(defaultParams)
    }, [selectedLead])

    const [errors, setErros] = useState<any>({});
    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        console.log(value, name)
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
    };

    useEffect(() => {
        if (params.sale_price && params.client_paid) {
            let offerPrice: any = '', is_custom_price: any = 0;
            if (Number(params.client_paid)) {

                if (Number(params.client_paid) <= Number(params.sale_price)) offerPrice = params.sale_price - params.client_paid
                else offerPrice = 0;
            }

            if (parseFloat(params.client_paid) > parseFloat(params.sale_price)) {
                is_custom_price = 1;
            } else is_custom_price = 0

            is_custom_price = (parseFloat(params.client_paid) > parseFloat(params.sale_price)) ? 1 : 0;



            setErros({ ...errors, offer_price: "", client_paid: "" });
            setParams({ ...params, offer_price: offerPrice, is_custom_price: is_custom_price });
        }
    }, [params.sale_price, params.client_paid])

    useEffect(() => {
        if (params.product_id) {
            const product: any = products.find((p: any) => p.id == params.product_id);
            setErros({ ...errors, product_id: "" });
            setParams({ ...params, product_id: product.id, product_pricr: product.pro_price, sale_price: product.pro_price });
        }
    }, [params.product_id])

    const [selectedOptions, setSelectedOptions] = useState([]);

    const handleChange = (selected) => {
        setErros({ ...errors, sale_service: '' })
        const values = selected.map(option => option.value);
        const hasWhatsApp = values.includes('WhatsApp');
        const hasSms = values.includes('SMS');
        if (hasWhatsApp && hasSms) {
            alert("You can select either 'WhatsApp' or 'SMS', but not both.");
            return;
        }
        setSelectedOptions(selected);
        setParams({ ...params, sale_service: JSON.stringify(values) });
    };

    function validatePositiveNumber(value: any) {
        const positiveNumberPattern = /^[0-9]+(\.[0-9]+)?$/;
        if (positiveNumberPattern.test(value) && parseFloat(value) > 0)
            return true;
        else
            return false;

    }

    const validate = () => {
        setErros({});
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
        }

        if (params.due_date && params.start_date > params.due_date) {
            errors = { ...errors, due_date: "Due Date can not be less than start date" };
        }
        if (!params.sale_service) {
            errors = { ...errors, sale_service: "sale service is required" };
        } else if (!JSON.parse(params.sale_service).length) {
            errors = { ...errors, sale_service: "sale service is required" };
        }
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

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
                setSelectedOptions([]);
                setCreateSaleDrawer(false)

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
    };

    const toISTISOString = (date: any) => {
        const IST_OFFSET = 5.5 * 60 * 60 * 1000;
        let localDate = new Date(date.getTime() + IST_OFFSET);
        return localDate.toISOString().slice(0, 19).replace('T', ' ') + ' IST';
    }

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("lead_id", selectedLead.id);
        data.append("bank", params.bank);
        data.append("client_type", params.client_type);
        data.append("sale_service", params.sale_service);
        data.append('sale_upload_reciept', params.sale_upload_reciept);
        data.append("product_id", params.product_id);
        data.append("client_paid", params.client_paid);
        data.append("sale_date", params.sale_date ? convertDateString(params.sale_date) : '');
        data.append("start_date", params.start_date ? convertDateString(params.start_date) : '');
        data.append("due_date", params.due_date ? convertDateString(params.due_date) : '');
        data.append("description", params.description);
        createSaleApi(data);
    };

    function convertDateString(t) {
        let e = new Date(t), a = e.getFullYear(),
            n = String(e.getMonth() + 1).padStart(2, "0"),
            r = String(e.getDate()).padStart(2, "0");
        return `${a}-${n}-${r}`
    }


    return (
        <div>
            <div className={`${(createSaleDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setCreateSaleDrawer(false)}></div>

            <nav className={`${(createSaleDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                } bg-white fixed ltr:-right-[900px] rtl:-left-[900px] top-0 bottom-0 w-full max-w-[900px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4`}
            >
                <div className="flex flex-col h-screen overflow-hidden">

                    {isLoading ? <PageLoader /> : createSaleDrawer ? (
                        <>
                            <div className="w-full text-center">
                                <div className="p-1 flex sm:flex-row flex-col w-full sm:items-center gap-4">
                                    <div className="ltr:mr-3 rtl:ml-3 flex items-center">
                                        <h5 className="font-semibold text-lg dark:text-white-light">Create Sale ({authUser?.first_name} {authUser?.last_name} )</h5>
                                    </div>
                                    <div className="flex items-center gap-2 justify-center sm:justify-end sm:flex-auto flex-1">

                                        <button className='badge bg-success mr-[15px] shadow' disabled={isBtnLoading} onClick={() => formSubmit()}>
                                            {isBtnLoading ? 'Please Wait...' : 'Create Sale'}
                                        </button>
                                        <button type="button" className="bg-[#f4f4f4] ml-[15px] rounded-md p-1 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30" onClick={() => setCreateSaleDrawer(false)}>
                                            <IoCloseSharp className=" w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <hr className="my-4 dark:border-[#191e3a]" />
                            </div>

                            {!bankQrcodes?.length ? (<AlertCard
                                title={'No Bank or QR Code Found!'}
                                message="To create a sale, you need to add a bank account or QR code in the Settings Payments"
                                buttons={[{ title: 'Go to Payments', url: '/settings/payments', action: 'link', color: '' }]}
                            />) : !products?.length ? (
                                <AlertCard
                                    title={'No Product Found!'}
                                    message="To create a sale, you need to add a Product in the Settings Products"
                                    buttons={[{ title: 'Go to Products', url: '/settings/products', action: 'link', color: '' }]}
                                />
                            ) : <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5 px-2">
                                <div className='gap-6 w-full'>
                                    <div className="mb-5 flex items-center justify-center">
                                        <div className=" w-full bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] rounded border border-white-light dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
                                            <div className="p-5 flex items-center flex-col sm:flex-row">
                                                <div className="mb-5 w-20 h-20 rounded-full overflow-hidden">
                                                    <img src={`https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${selectedLead.first_name + ' ' + selectedLead.last_name}`} className="rounded-full h-12 w-12 w-full h-full object-cover" alt="" />
                                                </div>
                                                <div className="flex-1 ltr:sm:pl-5 rtl:sm:pr-5 text-center sm:text-left">
                                                    <h5 className="text-[#3b3f5c] text-[20px] font-semibold mb-2 dark:text-white-light">{selectedLead.first_name + ' ' + selectedLead.last_name}</h5>
                                                    <p className="mb-2 text-dark">{selectedLead.phone}</p>
                                                    <p className='mb-2 text-white-dark'>Alt No.- {selectedLead.second_phone}</p>
                                                    <p className='mb-2 text-white-dark'>Email - {selectedLead.email}</p>
                                                </div>
                                                <div className="flex-1 ltr:sm:pl-5 rtl:sm:pr-5 text-center sm:text-left">
                                                    <div>
                                                        <label >Sale Service <span className=' text-red-600 text-[15px] ' >*</span> </label>

                                                        <Select
                                                            isMulti
                                                            value={selectedOptions}
                                                            onChange={handleChange}
                                                            options={dropdowns
                                                                ?.filter((d: any) => d.type === 'Service By')
                                                                ?.map((service: any) => {
                                                                    if (settingData?.sms_enabled !== 0 && service.value === 'SMS') {
                                                                        return { value: service.value, label: service.value };
                                                                    } else if (settingData?.app_enabled !== 0 && service.value === 'Mobile App') {
                                                                        return { value: service.value, label: service.value };
                                                                    }
                                                                    else if (settingData?.whatsapp_enabled !== 0 && service.value === 'WhatsApp') {
                                                                        return { value: service.value, label: service.value };
                                                                    }
                                                                    else if (service.value === 'Calls') {
                                                                        return { value: service.value, label: service.value };
                                                                    }
                                                                    return null;
                                                                })
                                                                ?.filter((option: any) => option !== null)}

                                                        />
                                                        <div className="text-danger mt-1">{errors.sale_service}</div>
                                                    </div>


                                                    <div className="mb-5">
                                                        <label >Upload Receipt</label>
                                                        <input ref={fileLogoRef} name="sale_upload_reciept" type="file" onChange={(e) => setImage(e)}
                                                            className="form-input "
                                                            // accept="image/*"
                                                            accept=".jpg,.jpeg,.png,.pdf"
                                                        />
                                                        {/* <span className="w-full h-20 relative">
                                                            <img className="w-[100px] overflow-hidden object-cover rounded" id="sale_upload_reciept" onClick={() => {
                                                                fileLogoRef.current!.click()
                                                            }} src={logoPriview} alt="sale_upload_reciept" />
                                                        </span> */}
                                                        {errors?.sale_upload_reciept ? <div className="text-danger mt-1">{errors.sale_upload_reciept}</div> : ''}
                                                    </div>


                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">

                                    <div>
                                        <label>Bank Details <span className='text-red-600 text-[15px]'>*</span> </label>
                                        <select name="bank" className="form-select text-white-dark" value={params.bank} onChange={(e) => changeValue(e)}>
                                            <option value="" disabled >Select Bank Details</option>
                                            {bankQrcodes?.map((address: any, index) => (
                                                <option key={index + 1} value={address.id}>{address.is_bank_upi == 'bank' ? 'Bank - ' + address.bank_name : 'Upi - ' + address.upi}</option>
                                            ))}
                                        </select>
                                        <div className="text-danger mt-1">{errors.bank}</div>
                                    </div>

                                    <div>
                                        <label >Client Type <span className='text-red-600 text-[15px]'>*</span></label>
                                        <select name="client_type" className="form-select text-white-dark" value={params.client_type} onChange={(e) => changeValue(e)} disabled={params.client_type == "Closed Won" ? true : false}>
                                            <option value="" disabled >Select Client Type</option>
                                            {dropdowns?.filter((d: any) => d.type == 'Client Type')?.map((client: any) => (
                                                <option key={client.id}>{client.value}</option>
                                            ))}
                                        </select>
                                        <div className="text-danger mt-1">{errors.client_type}</div>
                                    </div>

                                    <div>
                                        <label >Product <span className='text-red-600 text-[15px]'>*</span></label>
                                        <select name="product_id" className="form-select text-white-dark" value={params.product_id} onChange={(e: any) => changeValue(e)} disabled={params.product_id == "Closed Won" ? true : false}>
                                            <option value="" disabled >Select Product</option>
                                            {products?.map((product: any) => (
                                                <option key={product.id} value={product.id}>{product.pro_name}</option>
                                            ))}
                                        </select>
                                        <div className="text-danger mt-1">{errors.product_id}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
                                    <div>
                                        <label>Sale Price</label>
                                        <input
                                            name='sale_price'
                                            type="text"
                                            value={params.sale_price}
                                            onChange={(e) => changeValue(e)}
                                            placeholder=""
                                            className="form-input bg-info-light"
                                            disabled={true}
                                        />
                                        <div className="text-danger mt-1">{errors.sale_price}</div>
                                    </div>

                                    <div>
                                        <label >Client Paid <span className='text-red-600 text-[15px]'>*</span>
                                            {params.is_custom_price ? (<span className="mx-2 badge bg-[#ef4444]">Custom Price</span>) : null}
                                        </label>
                                        <input
                                            name='client_paid'
                                            type="tel"
                                            value={params.client_paid}
                                            onChange={(e) => changeValue(e)}
                                            placeholder="Enter Amount"
                                            className={`form-input ${!params.sale_price ? 'bg-[#ebedf2]' : ''}`}
                                            disabled={!params.sale_price} />
                                        <div className="text-danger mt-1">{errors.client_paid}</div>
                                    </div>

                                    <div>
                                        <label>Offer Price</label>
                                        <input
                                            name='offer_price'
                                            type="text"
                                            value={params.offer_price}
                                            className="form-input bg-info-light"
                                            disabled
                                        />
                                        <div className="text-danger mt-1">{errors.offer_price}</div>
                                    </div>





                                    <div>
                                        <label>Sale Date</label>
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
                            </section>}

                        </>
                    ) : null}


                </div>
            </nav >
        </div >
    )
}
