import React,{ useState, Fragment, useEffect } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { IRootState } from '../../store';
import Select from 'react-select';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import PerfectScrollbar from 'react-perfect-scrollbar';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import { Dialog, Transition, Tab } from '@headlessui/react';
import IconX from '../../components/Icon/IconX';
import { setCrmToken, setPageTitle } from '../../store/themeConfigSlice';
import axios from 'axios';
import { FaRegTrashAlt } from "react-icons/fa";
import { MdPhoneInTalk } from "react-icons/md";
import Swal from 'sweetalert2';
import { BsFillInfoCircleFill } from "react-icons/bs";
import { useAuth } from '../../AuthContext';

export default function SaleView({ showSaleViewDrawer, setShowSaleViewDrawer, sale, sales, setSales }: any) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

  const {crmToken, apiUrl } = useAuth()

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const [modalSaleDescription, setModalSaleDescription] = useState(false);
    const [modalLeadDescription, setModalLeadDescription] = useState(false);
    const [dropdowns, setDropdowns] = useState([])
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!crmToken) navigate('/')
        else {
            dispatch(setPageTitle('View Lead'));
            fetchDropdowns()
        }
    }, [])


    const fetchDropdowns = async () => {
        setIsLoading(true)
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
            else alert("error")

            console.log(response)
        } catch (error) {

        } finally {
            setIsLoading(false)
        }
    }


    const [defaultParams] = useState({
        id: '',
        user_id: '',
        first_name: '',
        last_name: '',
        phone: '',
        second_phone: '',
        email: '',
        status: '',
        invest: '',
        first_trial: '',
        second_trial: '',
        followup: '',
        source: '',
        dnd: '',
        city: '',
        state: '',
        products: '',
        desc: '',
        lot_size: ''
    });
    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});
    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const [selectedProducts, setSelectedProducts] = useState<any>([]);

    useEffect(() => {
        setParams(lead)
        if (lead) setSelectedProducts(JSON.parse(lead.products)?.map((option: any) => {
            return { label: option, value: option }
        }))
    }, [lead])



    const handleSelectChange = (selectedOptions: any) => {
        const selectedValues = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
        setParams({ ...params, products: JSON.stringify(selectedValues) })
        setSelectedProducts(selectedOptions.map((option: any) => {
            return { label: option.value, value: option.value }
        }))
    };

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
        console.table(params)
    };

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.first_name) {
            errors = { ...errors, first_name: "first name is required" };
        }
        console.log(errors);
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const updateDropdown = async (data: any) => {
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
                const ul = response.data.lead;
                const i = leads.findIndex((l: any) => l.id == ul.id);
                const nl = [...leads];
                nl[i] = { ...nl[i], ...ul };
                setLeads(nl);
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

            } else { alert("Failed") }

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
    };

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("id", lead.id);
        data.append("user_id", lead.user_id);
        data.append("first_name", params.first_name);
        data.append("last_name", params.last_name);
        data.append("phone", lead.phone);
        data.append("second_phone", params.second_phone);
        data.append("email", params.email);
        data.append("status", params.status);
        data.append("invest", params.invest);
        data.append("followup", params.followup ? new Date(params.followup).toISOString() : '');
        data.append("first_trial", params.first_trial ? new Date(params.first_trial).toISOString() : '');
        data.append("second_trial", params.second_trial ? new Date(params.second_trial).toISOString() : '');
        data.append("source", lead.source);
        data.append("dnd", params.dnd);
        data.append("city", params.city);
        data.append("state", params.state);
        data.append("products", params.products);
        data.append("desc", params.desc);
        data.append("lot_size", params.lot_size);
        updateDropdown(data);
    };



    const [isStatusLoading, setIsStatusLoading] = useState(true);
    const [leadHistories, setLeadHistories] = useState([]);

    const handleLeadStatuses = async () => {
        setIsStatusLoading(true)
        setModalLeadDescription(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/get-lead-statuses/" + lead.id,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == "success") {
                setLeadHistories(response.data.leadStatuses)
            } else alert("error")
        } catch (error) {
            console.log(error)
        } finally {
            setIsStatusLoading(false)
        }
    }


    const deleteLead = () => {
        Swal.fire({
            icon: 'question',
            title: 'Are You Sure',
            confirmButtonText: 'Yes',
            text: 'You cant able to retrive this lead again!',
            showLoaderOnConfirm: true,
            customClass: 'sweet-alerts',
            preConfirm: async () => {
                try {
                    const response = await axios({
                        method: 'delete',
                        url: apiUrl + "/api/leads/" + lead.id,
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Authorization: "Bearer " + crmToken,
                        },
                    });

                    if (response.data.status == "success") {
                        setLeads(leads.filter((l: any) => l.id != lead.id));
                        setLeadViewShowDrawer(false)
                        Swal.fire({
                            icon: response.data.status,
                            title: response.data.title,
                            text: response.data.message,
                            padding: '2em',
                            customClass: 'sweet-alerts',
                        });
                    } else if (response.data.status == "error") {
                        Swal.fire({
                            icon: response.data.status,
                            title: response.data.title,
                            text: response.data.message,
                            padding: '2em',
                            customClass: 'sweet-alerts',
                        });
                    }
                } catch {
                }
            },
        });
    }

    const [modalLeadCallback, setModalLeadCallback] = useState(false)
    const [callbacks, setCallbacks] = useState([]);
    const [isLoadingCallbacks, setIssLoadingCallbacks] = useState(false);

    const handleCallback = async () => {
        setModalLeadCallback(true)
        setIssLoadingCallbacks(true);
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/lead-callbacks/" + lead.id,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setCallbacks(response.data.callbacks)
            }
        } catch (error) {


        } finally {
            setIssLoadingCallbacks(false);
        }
    }

    const closeCallbacks = async (id: number) => {
        Swal.fire({
            icon: 'question',
            title: 'Are You Sure',
            confirmButtonText: 'Yes',
            text: 'Once closed, then never get alert',
            showLoaderOnConfirm: true,
            customClass: 'sweet-alerts',
            preConfirm: async () => {
                try {
                    const response = await axios({
                        method: 'get',
                        url: apiUrl + "/api/lead-callbacks-close/" + id,
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Authorization: "Bearer " + crmToken,
                        },
                    });

                    if (response.data.status == "success") {
                        const nc = response.data.callback;
                        const i = callbacks.findIndex((l: any) => l.id == id);
                        const uc = [...callbacks];
                        uc[i] = nc;
                        setCallbacks(uc);
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
                            icon: response.data.status,
                            title: response.data.title,
                            text: response.data.message,
                            padding: '2em',
                            customClass: 'sweet-alerts',
                        });
                    }
                } catch {
                }
            },
        });
    }

    const [callbackDescription, setCallbackDescription] = useState('');
    const [callbackDate, setCallbackDate] = useState<any>('');

    const createCallback = async () => {
        //
        console.log("callbackDate", callbackDate)
        console.log("callbackDate", new Date(callbackDate).toISOString())

        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/lead-callbacks-add",
                data: {
                    lead_id: lead.id,
                    description: callbackDescription,
                    date_time: callbackDate
                },
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setModalLeadCallback(false)

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
            }

        } catch (error) {

        } finally {

        }
    }


    return (
        <div>
            <div className={`${(showLeadViewDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setLeadViewShowDrawer(false)}></div>

            <nav className={`${(showLeadViewDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                } ${lead.status == "Closed Won" ? 'bg-success-light' : 'bg-white'} fixed ltr:-right-[900px] rtl:-left-[900px] top-0 bottom-0 w-full max-w-[900px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4`}
            >
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className="w-full text-center">
                        <div className="p-1 flex sm:flex-row flex-col w-full sm:items-center gap-4">
                            <div className="ltr:mr-3 rtl:ml-3 flex items-center">
                                <h5 className="font-semibold text-lg dark:text-white-light">View Leads</h5>
                            </div>
                            <div className="flex items-center justify-center sm:justify-end sm:flex-auto flex-1">
                                {/* Sale Description */}
                                <button className='btn btn-outline-primary mr-[15px] btn-sm' onClick={() => setModalSaleDescription(true)}>Sales History</button>
                                <Transition appear show={modalSaleDescription} as={Fragment}>
                                    <Dialog as="div" open={modalSaleDescription} onClose={() => setModalSaleDescription(false)}>
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
                                                    <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-hidden my-8 w-full max-w-lg text-black dark:text-white-dark">
                                                        <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                                            <div className="text-lg font-bold">Sales History</div>
                                                            <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModalSaleDescription(false)}>
                                                                <IconX />
                                                            </button>
                                                        </div>
                                                        <div className="p-5">
                                                            <PerfectScrollbar className="h-[calc(50vh-80px)] relative">
                                                                <div>
                                                                    <div className='flex justify-between items-center'>
                                                                        <div className="flex items-center">
                                                                            <div className="flex-none">
                                                                                <img src={`https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=PRABUNATH`} className="rounded-full h-12 w-12 object-cover" alt="" />
                                                                            </div>
                                                                            <div className="mx-3">
                                                                                <p className="mb-1 font-semibold">Prabunath - <span className="badge badge-outline-info">View</span></p>
                                                                                <p className="text-xs text-white-dark">07/05/2024  - 05/07/2024</p>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="mx-3">
                                                                                <p className="mb-1 text-xs text-dark font-bold">HDFC - ₹ 5,00,000</p>
                                                                                <span className="badge bg-secondary">Requested</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <hr className="my-4 dark:border-[#191e3a]" />
                                                                </div>
                                                                <div>
                                                                    <div className='flex justify-between items-center'>
                                                                        <div className="flex items-center">
                                                                            <div className="flex-none">
                                                                                <img src={`https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=PRABUNATH`} className="rounded-full h-12 w-12 object-cover" alt="" />
                                                                            </div>
                                                                            <div className="mx-3">
                                                                                <p className="mb-1 font-semibold">Prabunath - <span className="badge badge-outline-info">View</span></p>
                                                                                <p className="text-xs text-white-dark">07/05/2024  - 05/07/2024</p>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="mx-3">
                                                                                <p className="mb-1 text-xs text-dark font-bold">HDFC - ₹ 5,00,000</p>
                                                                                <span className="badge bg-success">Approved</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <hr className="my-4 dark:border-[#191e3a]" />
                                                                </div>
                                                                <div>
                                                                    <div className='flex justify-between items-center'>
                                                                        <div className="flex items-center">
                                                                            <div className="flex-none">
                                                                                <img src={`https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=PRABUNATH`} className="rounded-full h-12 w-12 object-cover" alt="" />
                                                                            </div>
                                                                            <div className="mx-3">
                                                                                <p className="mb-1 font-semibold">Prabunath - <span className="badge badge-outline-info">View</span></p>
                                                                                <p className="text-xs text-white-dark">07/05/2024  - 05/07/2024</p>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="mx-3">
                                                                                <p className="mb-1 text-xs text-dark font-bold">HDFC - ₹ 5,00,000</p>
                                                                                <span className="badge bg-warning">Pending</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <hr className="my-4 dark:border-[#191e3a]" />
                                                                </div>
                                                            </PerfectScrollbar>
                                                            <div className="flex justify-end items-center mt-8">
                                                                <button type="button" className="btn btn-outline-danger" onClick={() => setModalSaleDescription(false)}>
                                                                    Discard
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </Dialog.Panel>
                                                </Transition.Child>
                                            </div>
                                        </div>
                                    </Dialog>
                                </Transition>
                                {/* Lead Description */}
                                <button className='btn btn-outline-primary mr-[15px] btn-sm' onClick={() => handleLeadStatuses()}>Status History</button>
                                <Transition appear show={modalLeadDescription} as={Fragment}>
                                    <Dialog as="div" open={modalLeadDescription} onClose={() => setModalLeadDescription(false)}>
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
                                                    <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-hidden my-8 w-full max-w-lg text-black dark:text-white-dark">
                                                        <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                                            <div className="text-lg font-bold">Status History</div>
                                                            <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModalLeadDescription(false)}>
                                                                <IconX />
                                                            </button>
                                                        </div>
                                                        {isStatusLoading ? (<>
                                                            <div className='h-[calc(50vh-80px)] text-center p-4'>
                                                                <span>Loading</span>
                                                            </div>
                                                        </>) : (
                                                            <div className="p-5">
                                                                {leadHistories?.length ? (
                                                                    <PerfectScrollbar className="h-[calc(50vh-80px)] relative">
                                                                        {leadHistories?.map((history: any) => (
                                                                            <div>
                                                                                <div className='flex justify-between items-center'>
                                                                                    <div className="flex items-center">
                                                                                        <div className="flex-none">
                                                                                            <img src={`https://ui-avatars.com/api/?background=random&name=${history.first_name} ${history.last_name}`} className="rounded-full h-12 w-12 object-cover" alt="" />
                                                                                        </div>
                                                                                        <div className="mx-3">
                                                                                            <p className="mb-1 font-semibold">{history.first_name} {history.last_name}</p>
                                                                                            <p className="text-xs text-white-dark">{history.created_at}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="badge bg-secondary">{history.status}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <p className='font-semibold text-[14px]'>{history.description}</p>
                                                                                <hr className="my-4 dark:border-[#191e3a]" />
                                                                            </div>
                                                                        ))}
                                                                    </PerfectScrollbar>
                                                                ) : (<>
                                                                    <div className="flex flex-wrap w-full justify-center mb-5">
                                                                        <div className="rounded-md bg-danger-light p-6 pt-12 mt-8 relative">
                                                                            <div className="bg-[#1d67a7] absolute text-white-light ltr:left-6 rtl:right-6 -top-8 w-16 h-16 rounded-md flex items-center justify-center mb-5 mx-auto">
                                                                                <BsFillInfoCircleFill size={35} />
                                                                            </div>
                                                                            <h5 className="text-dark text-lg font-semibold mb-3.5 dark:text-white-light">No History</h5>
                                                                            <p className="text-white-dark text-[15px]  mb-3.5">No history found with this lead!</p>
                                                                        </div>
                                                                    </div>

                                                                </>)}

                                                                <div className="flex justify-end items-center mt-8">
                                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setModalLeadDescription(false)}>
                                                                        Discard
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                    </Dialog.Panel>
                                                </Transition.Child>
                                            </div>
                                        </div>
                                    </Dialog>
                                </Transition>
                                {/* Update Status */}
                                <button className='btn btn-success mr-[15px] btn-sm' disabled={isBtnLoading} onClick={() => formSubmit()}>
                                    {isBtnLoading ? 'Updating...' : 'Update Lead'}
                                </button>

                                <button type="button" onClick={() => handleCallback()} className="bg-[#f4f4f4] rounded-md p-1 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30 ltr:mr-3 rtl:ml-3 disabled:opacity-60 disabled:cursor-not-allowed">
                                    <MdPhoneInTalk className="w-5 h-5" color="#9606ff" />
                                </button>

                                <Transition appear show={modalLeadCallback} as={Fragment}>
                                    <Dialog as="div" open={modalLeadCallback} onClose={() => setModalLeadCallback(false)}>
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
                                                    <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-hidden my-8 w-full max-w-lg text-black dark:text-white-dark">
                                                        <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                                            <div className="text-lg font-bold">Lead Call Back</div>
                                                            <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModalLeadCallback(false)}>
                                                                <IconX />
                                                            </button>
                                                        </div>
                                                        {isLoadingCallbacks ? (<>
                                                            <div className='h-[calc(50vh-80px)] text-center p-4'>
                                                                <span>Loading</span>
                                                            </div>
                                                        </>) : (
                                                            <div className="p-5">

                                                                {callbacks.filter(call => call.status == 0).length ? '' : (

                                                                    <div>
                                                                        <div className="flex flex-col md:flex-row gap-4 items-center max-w-[900px] mx-auto mb-4">
                                                                            {/* <Flatpickr
                                                                                data-enable-time
                                                                                options={{
                                                                                    enableTime: true,
                                                                                    dateFormat: 'YYYY-MM-DD',
                                                                                }}
                                                                                value={callbackDate}
                                                                                className="form-input"
                                                                                onChange={(callbackDate) => setCallbackDate(callbackDate)}
                                                                            /> */}

                                                                            <input className='form-input' type="datetime-local" onChange={(e) => setCallbackDate(e.target.value)} name="birthdaytime" />
                                                                            <button type="button" onClick={() => createCallback()} className="btn btn-primary">
                                                                                Submit
                                                                            </button>
                                                                        </div>

                                                                        <div className=''>
                                                                            <textarea rows={2} onChange={(e) => setCallbackDescription(e.target.value)} className="form-textarea" placeholder="Enter description" ></textarea>
                                                                        </div>
                                                                    </div>
                                                                )}


                                                                {callbacks.length ? (
                                                                    <PerfectScrollbar className="h-[calc(50vh-80px)] relative bg-gray-100 p-2 rounded-md">
                                                                        {callbacks?.map((history: any) => (
                                                                            <div className='bg-white p-2 rounded mb-2'>
                                                                                <div className='flex justify-between items-center'>
                                                                                    <p className="mb-1 font-semibold">{history.date_time} </p>
                                                                                    <div>
                                                                                        <span className={`badge ${history.status ? 'bg-danger' : 'bg-success'}`}>{history.status ? 'Closed' : 'Opened'}</span>
                                                                                        {!history.status ? (<span className={`cursor-pointer badge mx-2 btn-primary`} onClick={() => closeCallbacks(history.id)}>Close Now</span>) : ''}

                                                                                    </div>
                                                                                </div>
                                                                                <p className="text-xs text-white-dark">{history.description}</p>
                                                                            </div>
                                                                        ))}
                                                                    </PerfectScrollbar>
                                                                ) : (<>
                                                                    <div className=" w-full justify-center mb-5">
                                                                        <div className="rounded-md bg-danger-light p-4 ">

                                                                            <h5 className="text-dark text-lg font-semibold mb-3.5 dark:text-white-light">No Calls</h5>
                                                                            <p className="text-white-dark text-[15px]  mb-3.5">No previous call found!</p>
                                                                        </div>
                                                                    </div>

                                                                </>)}

                                                                <div className="flex justify-end items-center mt-8">
                                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setModalLeadCallback(false)}>
                                                                        Discard
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                    </Dialog.Panel>
                                                </Transition.Child>
                                            </div>
                                        </div>
                                    </Dialog>
                                </Transition>


                                <button type="button" onClick={() => deleteLead()} className="bg-[#f4f4f4] rounded-md p-1 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30 disabled:opacity-60 disabled:cursor-not-allowed">
                                    <FaRegTrashAlt className="w-5 h-5" color='red' />
                                </button>

                                <button type="button" className="bg-[#f4f4f4] ml-[15px] rounded-md p-1 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30" onClick={() => setLeadViewShowDrawer(false)}>
                                    <IoCloseSharp className=" w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <hr className="my-4 dark:border-[#191e3a]" />
                    </div>
                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5 px-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">


                            <div>
                                <label >Lead Owner</label>
                                <input type="text" name="user_id" value={params.owner} onChange={(e) => changeValue(e)} placeholder="Lead Owner Name" className="form-input bg-danger/10" disabled={true} />
                                <div className="text-danger mt-1">{errors.user_id}</div>
                            </div>
                            <div>
                                <label>First Name</label>
                                <input type="text" name="first_name" value={params.first_name} onChange={(e) => changeValue(e)} placeholder="Enter First Name" className="form-input" />
                                <div className="text-danger mt-1">{errors.first_name}</div>
                            </div>
                            <div>
                                <label >Last Name</label>
                                <input type="text" name="last_name" value={params.last_name} onChange={(e) => changeValue(e)} placeholder="Enter Last Name" className="form-input" />
                                <div className="text-danger mt-1">{errors.last_name}</div>
                            </div>
                            <div>
                                <label>Lead Mobile Number</label>
                                <input type="tel" name="phone" value={params.phone} onChange={(e) => changeValue(e)} placeholder="Enter Lead Mobile Number" className="form-input bg-danger/10" disabled={true} />
                                <div className="text-danger mt-1">{errors.phone}</div>
                            </div>
                            <div>
                                <label >Alternative Mobile Number</label>
                                <input type="tel" name="second_phone" value={params.second_phone} onChange={(e) => changeValue(e)} placeholder="Enter Lead Mobile Number" className="form-input" />
                                <div className="text-danger mt-1">{errors.second_phone}</div>
                            </div>
                            <div>
                                <label >Lead Email</label>
                                <input type="email" name="email" value={params.email} onChange={(e) => changeValue(e)} placeholder="Enter Lead Email Address" className="form-input" />
                                <div className="text-danger mt-1">{errors.email}</div>
                            </div>
                            <div>
                                <label >Lead Status</label>
                                <select name="status" className="form-select text-white-dark" value={params.status} onChange={(e) => changeValue(e)} disabled={params.status == "Closed Won" ? true : false}>
                                    {dropdowns?.filter(d => d.type == 'Lead Status')?.map((status) => (
                                        <option key={status.id}>{status.value}</option>
                                    ))}
                                </select>
                                <div className="text-danger mt-1">{errors.status}</div>
                            </div>
                            <div>
                                <label >Lead Source</label>
                                <input name='source' type="text" value={params.source} onChange={(e) => changeValue(e)} placeholder="Enter Lead Mobile Number" className="form-input bg-danger/10" disabled={true} />
                                <div className="text-danger mt-1">{errors.source}</div>
                            </div>

                            <div>
                                <label >State</label>
                                <select name="state" className="form-select text-white-dark" value={params.state} onChange={(e) => changeValue(e)}>
                                    {dropdowns?.filter(d => d.type == 'State')?.map((status) => (
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
                                <label >Followup Date</label>
                                <Flatpickr name="followup" value={params.followup} onChange={(e) => changeValue({ target: { value: e[0], name: 'followup' } })} options={{ dateFormat: 'Y-m-d', position: isRtl ? 'auto right' : 'auto left' }} className="form-input" />
                                <div className="text-danger mt-1">{errors.followup}</div>
                            </div>
                            <div>
                                <label >1st Date</label>
                                <Flatpickr name="first_trial" value={params.first_trial} onChange={(e) => changeValue({ target: { value: e[0], name: 'first_trial' } })} options={{ dateFormat: 'Y-m-d', position: isRtl ? 'auto right' : 'auto left' }} className="form-input" />
                                <div className="text-danger mt-1">{errors.first_trial}</div>
                            </div>
                            <div>
                                <label >2nd Date</label>
                                <Flatpickr name="second_trial" value={params.second_trial} onChange={(e) => changeValue({ target: { value: e[0], name: 'second_trial' } })} options={{ dateFormat: 'Y-m-d', position: isRtl ? 'auto right' : 'auto left' }} className="form-input" />
                                <div className="text-danger mt-1">{errors.second_trial}</div>
                            </div>
                            <div>
                                <label >Investment Size</label>
                                <select name="invest" value={params.invest} onChange={(e) => changeValue(e)} className="form-select text-white-dark">
                                    {dropdowns?.filter(d => d.type == 'Investment Size')?.map((status) => (
                                        <option key={status.id}>{status.value}</option>
                                    ))}
                                </select>
                                <div className="text-danger mt-1">{errors.invest}</div>
                            </div>
                            <div>
                                <label >Lot Size</label>
                                <select name="lot_size" value={params.lot_size} onChange={(e) => changeValue(e)} className="form-select text-white-dark">
                                    {dropdowns?.filter(d => d.type == 'Lot Size')?.map((status) => (
                                        <option key={status.id}>{status.value}</option>
                                    ))}
                                </select>
                                <div className="text-danger mt-1">{errors.lot_size}</div>
                            </div>

                            <div>
                                <label >DND Status</label>
                                <select name="dnd" value={params.dnd} onChange={(e) => changeValue(e)} className="form-select text-white-dark">
                                    {dropdowns?.filter(d => d.type == 'DND Status')?.map((status) => (
                                        <option key={status.id}>{status.value}</option>
                                    ))}
                                </select>
                                <div className="text-danger mt-1">{errors.dnd}</div>
                            </div>

                            <div>
                                <label >Products</label>
                                <Select name='products' onChange={handleSelectChange}
                                    value={selectedProducts
                                    }
                                    options={products} placeholder="Select an Products" isMulti isSearchable={false} />
                                <div className="text-danger mt-1">{errors.products}</div>
                            </div>
                        </div>
                        <div className='mt-4'>
                            <div className="flex">
                                <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b] whitespace-nowrap">
                                    Description
                                </div>
                                <textarea name="desc" value={params.desc} onChange={(e) => changeValue(e)} rows={4} className="form-textarea ltr:rounded-l-none rtl:rounded-r-none"></textarea>
                            </div>
                            <div className="text-danger mt-1">{errors.desc}</div>
                        </div>
                    </section>
                </div>
            </nav >
        </div >
    )
}



