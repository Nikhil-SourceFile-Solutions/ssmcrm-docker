import React, { useState, useEffect } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import { setCrmToken, setPageTitle } from '../../store/themeConfigSlice';
import axios from 'axios';
import Swal from 'sweetalert2';
import { MdVerified } from "react-icons/md";
import { GoTrash } from "react-icons/go";
import { ThreeDots } from 'react-loader-spinner'
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import SalesHistory from './SalesHistory';
import SaleStatuses from './SaleStatuses';
import SalesInvoice from './SalesInvoice';
import EditLead from './EditLead';
import { useAuth } from '../../AuthContext';

export default function Show({ showSaleViewDrawer, setShowSaleViewDrawer, sale,
    setViewSale,
    sales,
    setSales,
    createSaleData,
    fetchLeads
}: any) {



    console.log(createSaleData)
    const { logout, authUser, settingData, crmToken, apiUrl } = useAuth();

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!crmToken) navigate('/')
        else if (showSaleViewDrawer && sale) {
            dispatch(setPageTitle('View Sale'));
            fetchSaleDetails()
        }
    }, [showSaleViewDrawer, sale])

    const [defaultParams, setDefaultParams] = useState({
        bank: '',
        client_type: '',
        sale_service: '',
        sale_date: '',
        start_date: '',
        due_date: '',
        product_id: '',
        sale_price: '',
        client_paid: '',
        offer_price: '',

        description: '',
        status: '',
        is_custom_price: 0
    });


    const [params, setParams] = useState<any>(defaultParams);
    useEffect(() => {
        if (sale) setParams({
            bank: sale?.bank,
            client_type: sale?.client_type,
            sale_service: sale?.sale_service,
            sale_date: sale?.sale_date ? new Date(sale?.sale_date) : '',
            start_date: sale?.start_date ? new Date(sale?.start_date) : '',
            due_date: sale?.due_date ? new Date(sale?.due_date) : '',
            product_id: sale?.product_id,
            sale_price: sale?.sale_price,
            client_paid: sale?.client_paid,
            offer_price: sale?.offer_price,

            description: '',
            status: sale?.status,
            is_custom_price: sale?.is_custom_price,
        })
    }, [sale, showSaleViewDrawer])



    const [errors, setErros] = useState<any>({});
    const [isBtnLoading, setIsBtnLoading] = useState(false);
    const [saleInvoiceModal, setSaleInvoiceModal] = useState(false)
    const [selectedPayment, setSelectedPaymnet] = useState('');


    useEffect(() => {

        setParams(defaultParams)

    }, [])
    const [bankQr, setBankQr] = useState([])






    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });

        if (name === 'bank') {
            const selectedOption = e.target.options[e.target.selectedIndex];
            console.log('selectedOption', selectedOption);
            const isBank = selectedOption.dataset.is_bank;
            console.log('isBank', isBank);

            // Update params and selectedPayment at the same time
            const updatedParams = { ...params, is_bank: isBank, [name]: value };
            setParams(updatedParams);

            // Set selectedPayment based on the bankQr array
            const selectedPayment = bankQr.find((bank: any) => bank.id == value && bank.is_bank == isBank);
            setSelectedPaymnet(selectedPayment);

            console.log('updatedParams', updatedParams);
            console.log('selectedPayment', selectedPayment); // Log selectedPayment after it is set
        } else {
            // Update params for other fields
            setParams({ ...params, [name]: value });
        }
    };

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.product_id) {
            errors = { ...errors, product_id: "product is required" };
        }
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };


    const [salesData, setSalesData] = useState<any>('');
    const [products, setProducts] = useState([]);
    const [banks, setBanks] = useState([]);
    const [qrCodes, setQrcode] = useState([]);
    const [setting, setSetting] = useState<any>();
    const [bankqrcode, setBankQrcode] = useState([]);


    const fetchSaleDetails = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + '/api/sales/' + sale?.id,

                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken
                }
            })

            if (response.data.status == "success") {
                setSalesData(response.data.data)
                setProducts(response.data.data.products)
                setQrcode(response.data.data.qr_codes)
                setBanks(response.data.data.banks)
                setVerifications(response.data.data.verifications)
                setSetting(response.data.data.settings)
                setBankQrcode(response.data.data.bankqrcode);

            }
        } catch (error) {

        } finally {
            setIsLoading(false)
        }
    }


    const deleteSale = async () => {
        Swal.fire({
            title: 'Are you sure?',
            icon: "question",
            confirmButtonText: 'Yes Delete',
            text: '',
            showLoaderOnConfirm: true,
            showCancelButton: true,
            cancelButtonText: "Nope",
            customClass: 'sweet-alerts',
            allowOutsideClick: false,
            preConfirm: async () => {
                try {
                    const response = await axios({
                        method: 'delete',
                        url: apiUrl + '/api/sales/' + sale?.id,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + crmToken
                        }
                    })
                    if (response.data.status == "success") {

                        const as = sales.data;
                        const ns = as.filter((s: any) => s.id != sale?.id);
                        const nd = { ...sales, data: ns, to: sales.to - 1, totalItems: sales.totalItems - 1 }
                        setSales(nd)
                        setShowSaleViewDrawer(false)
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
                    } else if (response.data.status == "error") {
                        Swal.fire({
                            title: response.data.title,
                            text: response.data.message,
                            footer: response.data.description,
                            confirmButtonText: 'Ok',
                            customClass: 'sweet-alerts',
                            allowOutsideClick: false,
                        });
                    }
                } catch (error) {
                    console.log(error)
                }
            },
        });
    }


    const productHandle = (id: number) => {
        const product: any = createSaleData?.products.find((p: any) => p.id == id);
        setErros({ ...errors, product_id: "" });
        setParams({
            ...params,
            product_id: id,
            sale_price: product.pro_price,
            client_paid: "",
            offer_price: "",

        });
    }










    const [verifications, setVerifications] = useState([]);

    const Verification = () => {

        useEffect(() => {
            verifications?.filter((v: any) => v.verification_type == "Manager" && v.status)
        }, [verifications])
        return (
            <>
                {setting?.has_manager_verification ? (
                    <div className={`flex items-center rounded-full mr-[15px] ${verifications.filter((v: any) => v.verification_type == "Manager" && v.status == 1).length ? 'bg-success' : 'bg-black/50'}  font-semibold text-white px-3 py-2`}>
                        <MdVerified className="block h-6 w-6  object-cover ltr:mr-1 rtl:ml-1" />
                        Manager
                    </div>
                ) : ''}

                {setting?.has_complaince_verification ? (
                    <div className={`flex items-center rounded-full mr-[15px] ${verifications.filter((v: any) => v.verification_type == "Complaince" && v.status == 1).length ? 'bg-success' : 'bg-black/50'}  font-semibold text-white px-3 py-2`}>
                        <MdVerified className="block h-6 w-6  object-cover ltr:mr-1 rtl:ml-1" />
                        Complaince
                    </div>
                ) : ''}

                {setting?.has_accounts_verification ? (
                    <div className={`flex items-center rounded-full ${verifications.filter((v: any) => v.verification_type == "Accounts" && v.status == 1).length ? 'bg-success' : 'bg-black/50'}  font-semibold text-white px-3 py-2`}>
                        <MdVerified className="block h-6 w-6 object-cover ltr:mr-1 rtl:ml-1" />
                        Accounts
                    </div>
                ) : ''}



            </>
        )
    }

    const [salesHistoryModal, setSalesHistoryModal] = useState(false);
    const [salesStatusModal, setSalesStatusModal] = useState(false);

    useEffect(() => {
        if (params.product_id && params.client_paid) {
            let offerPrice: any = '';
            if (Number(params.client_paid) > 0 && Number(params.client_paid) <= Number(params.sale_price)) {



                offerPrice = params.sale_price - params.client_paid;
            } else offerPrice = '';
            setErros({ ...errors, offer_price: "", client_paid: "" });
            setParams({ ...params, offer_price: offerPrice, });
        }
    }, [params.product_id, params.client_paid, params.is_custom_price, params.sale_price])

    useEffect(() => {
        if (!params.is_custom_price && params.product_id) productHandle(params.product_id)
    }, [params.is_custom_price])


    const updateSaleApi = async (data: any) => {
        setIsBtnLoading(true)
        try {
            const response = await axios({
                method: 'put',
                url: apiUrl + "/api/sales/" + sale?.id,
                data,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {

                // const ns = [...sales];
                // const i = ns.findIndex((s: any) => s.id == sale?.id);
                // ns[i] = { ...ns[i], ...response.data.sale };
                // setSales(ns)
                // setViewSale(ns[i])

                const as = sales.data;
                const i = as.findIndex((s: any) => s.id == sale?.id);
                as[i] = { ...as[i], ...response.data.sale };
                setViewSale(as[i])
                const nd = { ...sales, data: as }
                setSales(nd)

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
            }

            else { alert("Failed") }

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
        // data.append("bank", params.bank);
        data.append("bank", selectedPayment?.id ? selectedPayment?.id : params.bank);
        data.append("client_type", params.client_type);
        data.append("sale_service", params.sale_service);
        data.append("product_id", params.product_id);
        data.append("client_paid", params.client_paid);
        data.append("is_custom_price", params.is_custom_price);
        data.append("sale_price", params.sale_price);
        data.append("sale_date", params.sale_date ? toISTISOString(params.sale_date) : '');
        data.append("start_date", params.start_date ? toISTISOString(params.start_date) : '');
        data.append("due_date", params.due_date ? toISTISOString(params.due_date) : '');
        data.append("description", params.description);
        data.append("status", params.status);
        updateSaleApi(data);
    }


    const toISTISOString = (date: any) => {
        const IST_OFFSET = 5.5 * 60 * 60 * 1000;
        let localDate = new Date(date.getTime() + IST_OFFSET);
        return localDate.toISOString().slice(0, 19).replace('T', ' ') + ' IST';
    }

    const [indexOfCurrentLead, setIndexOfCurrentLead] = useState<any>(null);


    useEffect(() => {
        if (sales?.data?.length && sale && showSaleViewDrawer) setIndexOfCurrentLead(sales.data.findIndex((l: any) => l.id == sale?.id))
    }, [sale, showSaleViewDrawer])




    const nextSale = () => {
        const next = sales.data[indexOfCurrentLead + 1]
        setViewSale(next)
    }

    const prevSale = () => {
        const prev = sales.data[indexOfCurrentLead - 1]
        setViewSale(prev)
    }



    const [leadModal, setLeadModal] = useState(false);


    return (
        <div>
            <div className={`${(showSaleViewDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setShowSaleViewDrawer(false)}></div>

            <nav className={`${(showSaleViewDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                } ${sale?.status == 'Pending' ? 'bg-warning-light' : sale?.status == 'Approved' ? 'bg-success-light' : sale?.status == 'Expired' ? 'bg-danger-light' : sale?.status == 'Verified' ? 'bg-info-light' : 'bg-white'}  fixed ltr:-right-[900px] rtl:-left-[900px] top-0 bottom-0 w-full max-w-[900px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black `}
            >


                <div className="flex flex-col h-screen overflow-hidden py-4">
                    <div className="w-full text-center">
                        <div className="p-1 flex sm:flex-row flex-col w-full sm:items-center gap-4 px-4">
                            <div className="ltr:mr-3 rtl:ml-3 flex items-center">
                                <h5 className="font-semibold text-lg dark:text-white-light">View Sale  ({authUser.first_name} {authUser?.last_name})</h5>
                            </div>

                            <div className="flex items-center justify-center sm:justify-end sm:flex-auto flex-1">
                                {
                                    sale?.status == 'Approved' &&
                                    <div>
                                        {
                                            (authUser.user_type === 'Admin' || authUser.user_type === 'Accounts') &&
                                            <button className='btn btn-outline-primary mr-[15px] btn-sm' onClick={() => setSaleInvoiceModal(true)}>Generate Invoice</button>
                                        }
                                    </div>
                                }


                                <button className='btn btn-outline-primary mr-[15px] btn-sm' onClick={() => setSalesHistoryModal(true)} >Sales History</button>
                                <button className='btn btn-outline-primary mr-[15px] btn-sm' onClick={() => setSalesStatusModal(true)}  >Sale Logs</button>
                                <button className='btn btn-success mr-[15px] btn-sm shadow-none' onClick={() => formSubmit()}
                                    disabled={!(authUser.user_type === "Admin" || authUser.user_type === "Accounts") && sale?.status !== "Pending" ? true : false}
                                >
                                    Update Sale
                                </button>
                                <button type="button" className="bg-[#f4f4f4] rounded-md p-1 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30 ltr:mr-3 rtl:ml-3 disabled:opacity-60 disabled:cursor-not-allowed">
                                    <GoTrash className="w-5 h-5" onClick={() => deleteSale()} />
                                </button>
                                <button type="button" disabled={indexOfCurrentLead == 0 ? true : false} onClick={() => prevSale()} className="bg-[#f4f4f4] rounded-md p-1 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30 ltr:mr-3 rtl:ml-3 disabled:opacity-60 disabled:cursor-not-allowed">
                                    <IconCaretDown className="w-5 h-5 rtl:-rotate-90 rotate-90" />
                                </button>
                                <button type="button" disabled={indexOfCurrentLead == sales.to - 1} onClick={() => nextSale()} className="bg-[#f4f4f4] rounded-md p-1 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30 disabled:opacity-60 disabled:cursor-not-allowed">
                                    <IconCaretDown className="w-5 h-5 rtl:rotate-90 -rotate-90" />
                                </button>
                                <button type="button" className="bg-[#f4f4f4] ml-[15px] rounded-md p-1 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30" onClick={() => setShowSaleViewDrawer(false)}>
                                    <IoCloseSharp className=" w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <hr className="mt-4 dark:border-[#191e3a]" />
                    </div>

                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar py-6 px-4">
                        <div className='gap-6 w-full'>
                            <div className="mb-5 flex items-center justify-center">
                                <div className=" w-full bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] rounded border border-white-light dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
                                    <div className="flex justify-end">
                                        <div className=' flex justify-around items-center mr-[15px] mt-2'>
                                            {isLoading ? (
                                                <ThreeDots
                                                    visible={true}
                                                    height="25"
                                                    width="25"
                                                    color="gray"
                                                    radius="9"
                                                    ariaLabel="three-dots-loading"
                                                    wrapperStyle={{}}

                                                />
                                            ) : <>

                                                <div>
                                                    <Tippy content={`Send Bank detail link`}>
                                                        <button className="badge bg-danger  shadow-none mr-[10px]">Bank Details</button>
                                                    </Tippy>
                                                </div>

                                            </>}
                                        </div>
                                    </div>
                                    <div className="p-5 flex items-center flex-col sm:flex-row">
                                        <div className="mb-5 w-20 h-20 rounded-full overflow-hidden">
                                            <img src={`https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${sale?.first_name + ' ' + sale?.last_name}`} className="rounded-full h-12 w-12 w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="flex-1 ltr:sm:pl-5 rtl:sm:pr-5 text-center sm:text-left">
                                            <h5 className="text-[#3b3f5c] text-[20px] font-semibold mb-2 dark:text-white-light">{sale?.first_name + ' ' + sale?.last_name}</h5>
                                            <p className="mb-2 text-dark">{sale?.phone}</p>
                                            <p className='mb-2 text-white-dark'>Alt.-{sale?.second_phone} | {sale?.email}</p>
                                            <p className='mb-2 text-white-dark'>{sale?.description}</p>

                                            <button className='btn btn-info btn-sm' onClick={() => setLeadModal(true)}>Edit Lead</button>
                                        </div>
                                        <div className="flex-1 ltr:sm:pl-5 rtl:sm:pr-5 text-center sm:text-left">

                                            <div>
                                                <label >Update Status</label>
                                                <select name="status" className="form-select text-white-dark" value={params.status} onChange={(e) => changeValue(e)}
                                                    disabled={!(authUser.user_type === "Admin" || authUser.user_type === "Accounts") ? true : false}
                                                >
                                                    <option value="Pending" >Pending</option>
                                                    <option value="Approved" >Approved</option>
                                                    <option value="Expired" >Expired</option>
                                                    <option value="Paused" >Paused</option>
                                                </select>
                                                <div className="text-danger mt-1">{errors.status}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className=' flex h-12 px-5 pt-5 pb-2 items-center mb-3 justify-center'>
                                        {isLoading ? (
                                            <ThreeDots
                                                visible={true}
                                                height="25"
                                                width="25"
                                                color="gray"
                                                radius="9"
                                                ariaLabel="three-dots-loading"
                                                wrapperStyle={{}}
                                            />
                                        ) : <>
                                            <Verification />
                                        </>}


                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label >Bank Details </label>
                                <select name="bank" className="form-select text-white-dark" value={params.bank} onChange={(e) => changeValue(e)}
                                    disabled={
                                        !(authUser.user_type === "Admin" || authUser.user_type === "Accounts") && sale?.status !== "Pending" ? true : false
                                    }>
                                    <option value="" disabled selected>Select Bank Details</option>

                                    {bankqrcode?.map((address, index) => (
                                        <option key={index + 1} value={address.id}>{address.is_bank_upi == 'bank' ? 'Bank - ' + address.bank_name : 'Upi - ' + address.upi}</option>

                                    ))}

                                </select>


                                <div className="text-danger mt-1">{errors.bank}</div>
                            </div>


                            <div>
                                <label >Client Type</label>
                                <select name="client_type" className="form-select text-white-dark" value={params.client_type} onChange={(e) => changeValue(e)}
                                    disabled={
                                        !(authUser.user_type === "Admin" || authUser.user_type === "Accounts") && sale?.status !== "Pending" ? true : false
                                    }
                                >
                                    <option value="" disabled selected>Select Client Type</option>
                                    {createSaleData?.dropdowns?.filter((d: any) => d.type == 'Client Type')?.map((client: any) => (
                                        <option key={client.id}>{client.value}</option>
                                    ))}
                                </select>
                                <div className="text-danger mt-1">{errors.client_type}</div>
                            </div>


                            <div>
                                <label >Sale Service</label>

                                <Select
                                    isDisabled={
                                        !(authUser.user_type === "Admin" || authUser.user_type === "Accounts") && sale?.status !== "Pending" ? true : false
                                    }
                                    onChange={(a) => {

                                        changeValue({ target: { value: JSON.stringify(a.map((b: any) => b.value)), name: 'sale_service' } })
                                    }}
                                    value={params.sale_service ? JSON.parse(params.sale_service).map((a: any) => {
                                        return { value: a, label: a }
                                    }) : ''}
                                    placeholder="Select Service" options={createSaleData.dropdowns?.filter((d: any) => d.type == 'Sales Service')?.map((service: any) => {
                                        return { value: service.value, label: service.value }

                                    })} isMulti isSearchable={false} />
                                <div className="text-danger mt-1">{errors.sale_service}</div>
                            </div>

                            <div>
                                <label >Product</label>
                                <select name="product_id" className="form-select text-white-dark" value={params.product_id} onChange={(e: any) => productHandle(e.target.value)}
                                    disabled={
                                        !(authUser.user_type === "Admin" || authUser.user_type === "Accounts") && sale?.status !== "Pending" ? true : false
                                    }
                                >
                                    <option value="" disabled selected>Select Product</option>
                                    {createSaleData?.products?.map((product: any) => (
                                        <option key={product.id} value={product.id}>{product.pro_name}</option>
                                    ))}
                                </select>
                                <div className="text-danger mt-1">{errors.product_id}</div>
                            </div>

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
                                <input name='client_paid' type="text" value={params.client_paid} onChange={(e) => changeValue(e)} placeholder="" className={`form-input ${!params.sale_price ? 'bg-[#ebedf2]' : ''}`}

                                    disabled={
                                        !(authUser.user_type === "Admin" || authUser.user_type === "Accounts") && sale?.status !== "Pending" ? true : false
                                    }
                                />
                                <div className="text-danger mt-1">{errors.client_paid}</div>
                            </div>
                        </div>


                        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 mt-4">
                            <div>
                                <label >Offer Price</label>
                                <input name='offer_price' type="text" value={params.offer_price} onChange={(e) => changeValue(e)} placeholder="" className="form-input bg-info-light" disabled={true} />
                                <div className="text-danger mt-1">{errors.offer_price}</div>
                            </div>

                            <div>
                                <label >Sale Date</label>
                                <Flatpickr name="sale_date" value={params.sale_date} onChange={(e) => changeValue({ target: { value: e[0], name: 'sale_date' } })}
                                    options={{ dateFormat: 'Y-m-d', position: "auto left" }} className="form-input"
                                    disabled={!(authUser.user_type === "Admin" || authUser.user_type === "Accounts") ? true : false}
                                />
                                <div className="text-danger mt-1">{errors.sale_date}</div>
                            </div>
                            <div>
                                <label >Start Date</label>
                                <Flatpickr name="start_date" value={params.start_date} onChange={(e) => changeValue({ target: { value: e[0], name: 'start_date' } })}
                                    options={{ dateFormat: 'Y-m-d', position: "auto left" }} className="form-input"
                                    disabled={!(authUser.user_type === "Admin" || authUser.user_type === "Accounts") && sale?.status !== "Pending" ? true : false} />
                                <div className="text-danger mt-1">{errors.start_date}</div>
                            </div>
                            <div>
                                <label >Due Date</label>
                                <Flatpickr name="due_date" value={params.due_date} onChange={(e) => changeValue({ target: { value: e[0], name: 'due_date' } })}
                                    options={{ dateFormat: 'Y-m-d', position: "auto left" }} className="form-input"
                                    disabled={!(authUser.user_type === "Admin" || authUser.user_type === "Accounts") ? true : false} />
                                <div className="text-danger mt-1">{errors.due_date}</div>
                            </div>
                        </div>
                        <div className='mt-2'>
                            <label >New Description <span className=' text-red-600 text-[15px] ' >*</span></label>
                            <textarea name="description" className='form-textarea' onChange={(e) => changeValue(e)} value={params.description}
                                disabled={
                                    !(authUser.user_type === "Admin" || authUser.user_type === "Accounts") && sale?.status !== "Pending" ? true : false
                                }></textarea>
                            <div className="text-danger mt-1">{errors.description}</div>
                        </div>

                    </section>
                </div>

            </nav>


            <SalesInvoice saleInvoiceModal={saleInvoiceModal} setSaleInvoiceModal={setSaleInvoiceModal} sale_id={sale?.id} lead_id={sale?.lead_id} />

            <SalesHistory salesHistoryModal={salesHistoryModal} setSalesHistoryModal={setSalesHistoryModal} lead_id={sale?.lead_id} />

            <SalesHistory salesHistoryModal={salesHistoryModal} setSalesHistoryModal={setSalesHistoryModal} lead_id={sale?.lead_id} />
            <SaleStatuses salesStatusModal={salesStatusModal} setSalesStatusModal={setSalesStatusModal} sale={sale} />

            <EditLead leadModal={leadModal} setLeadModal={setLeadModal} sale={sale} setSales={setSales} />
        </div >
    )





}
