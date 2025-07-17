import React, { useEffect, useMemo, useState } from 'react'
import MainLeft from '../../../LeftNav/MainLeft'
import axios from 'axios';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../AuthContext';
import ShowLoader from './ShowLoader';
import { MdPhoneCallback } from 'react-icons/md';
import { GoTrash } from 'react-icons/go';
import IconCaretDown from '../../../../components/Icon/IconCaretDown';
import { IoCloseSharp } from 'react-icons/io5';
import { IoMdRefresh } from 'react-icons/io';
import Select from 'react-select';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import 'flatpickr/dist/themes/material_blue.css';
import Swal from 'sweetalert2';
import LeadHistory from './LeadHistory/Index';
import CreateSale from '../CreateSale';
import Callback from './Callback';
import TransferLead from './TransferLead';
import ReferLead from './ReferLead';
export default function Show() {

    const { logout, crmToken, authUser, settingData, apiUrl } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();



    const [dataForLeadView, setDataForLeadView] = useState(location.state || {})

    useEffect(() => {
        setDataForLeadView(location.state || {});
    }, [location.state]);


    const [isLoading, setIsLoading] = useState(true);
    const [fetchingError, setFetchingError] = useState(null);

    const [id, setId] = useState(0);

    useEffect(() => {
        fetchLead(dataForLeadView.lead_id)
    }, [dataForLeadView])

    const [data, setData] = useState<any>(null);



    const [verification, setVerification] = useState([]);
    const [lead, setLead] = useState([]);

    const fetchLead = async (lead_id, action = null) => {
        setIsLoading(true)
        // setParams(defaultParams)
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/leads/" + lead_id,
                params: {
                    action: action,
                    filterOwner: dataForLeadView.filterOwner,
                    filterStatus: dataForLeadView.filterStatus,
                    filterState: dataForLeadView.filterState,
                },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") {
                setId(response.data.data.id)
                setData(response.data.data)
                setVerification(response.data.data.verification)
                setLead(response.data.lead)



            } else setData(null)

        } catch (error) {
            console.log(error)
            setFetchingError(error)
            if (error?.response?.status == 401) logout()

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
        free_trial: '',
        second_trial: '',
        followup: '',
        source: '',
        dnd: '',
        city: '',
        state: '',
        products: [],
        desc: '',
        lot_size: '',
        owner: ''
    });

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});
    const [isBtnLoading, setIsBtnLoading] = useState(false);

    useEffect(() => {
        if (data?.lead) setParams({
            ...data?.lead,
            products: data?.lead?.products?.length ? JSON.parse(data?.lead?.products) : [],
            owner: data?.owner?.first_name + ' ' + data?.owner?.last_name
        })
        else setParams(defaultParams)
    }, [data])

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });

        console.log(value)
    }

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.first_name && params.status == "Closed Won") {
            errors = { ...errors, first_name: "first name is required" };
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

        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const updateLead = async (data: any) => {
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
                // setData(prevData => ({
                //     ...prevData,
                //     lead: response.data.lead
                // }));


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

                fetchLead(id, 'nxt')

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

    const formattedProducts = (products: any) => {
        if (products && products.length) return products.map((product: any) => ({
            value: product,
            label: product
        }))
        else return []
    };

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("id", params.id);
        data.append("user_id", params.user_id);
        data.append("first_name", params.first_name ? params.first_name : '');
        data.append("last_name", params.last_name ? params.last_name : '');
        data.append("phone", data?.lead?.phone ? data?.lead?.phone : '');
        data.append("second_phone", params.second_phone ? params.second_phone : '');
        data.append("email", params.email ? params.email : '');
        data.append("status", params.status ? params.status : '');
        data.append("invest", params.invest ? params.invest : '');
        data.append("followup", params.status == "Follow Up" ? params.followup : '');
        data.append("free_trial", params.status == "Free Trial" ? params.free_trial : '');
        data.append("source", params.source);
        data.append("dnd", params.dnd ? params.dnd : '');
        data.append("city", params.city ? params.city : '');
        data.append("state", params.state ? params.state : '');
        data.append("products", params?.products?.length ? JSON.stringify(params.products) : JSON.stringify([]));
        data.append("desc", params.desc ? params.desc : '');
        data.append("lot_size", params.lot_size ? params.lot_size : '');
        updateLead(data);
    };

    const dateFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });


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
                        url: apiUrl + "/api/leads/" + id,
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Authorization: "Bearer " + crmToken,
                        },
                    });

                    if (response.data.status == "success") {
                        navigate('/leads/viewleads');
                        Swal.fire({
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
                } catch (error) {
                    if (error?.response?.status == 401) logout()
                    console.log(error)

                }
            },
        });
    }


    const [leadHistoryDrawer, setLeadHistoryDrawer] = useState(false);
    const [salesHistoryDrawer, setSalesHistoryDrawer] = useState(false);
    const [createSaleDrawer, setCreateSaleDrawer] = useState(false);
    const [callbackModal, setCallbackModal] = useState(false);
    const [transferOwnerModal, setTransferOwnerModal] = useState(false);
    const [referModal, setReferModal] = useState(false);







    return (
        <>
            <MainLeft>
                <div className='panel flex-1 h-fit'>
                    {fetchingError ? <Error error={fetchingError} fetch={fetchLead} /> : (

                        <>
                            <div className="w-full text-center">
                                <div className="p-1 flex sm:flex-row flex-col w-full sm:items-center gap-4">
                                    <div className="ltr:mr-3 rtl:ml-3 flex items-center">
                                        <h5 className="font-semibold text-lg dark:text-white-light">View Lead</h5>
                                    </div>

                                    <div className="flex items-center justify-center sm:justify-end sm:flex-auto flex-1">

                                        {data?.lead?.status === "Closed Won" ? (
                                            <>


                                                <button
                                                    className="btn btn-outline-primary mr-[15px] btn-sm"
                                                    onClick={() => setCreateSaleDrawer(true)}
                                                    aria-label="Create Sale"
                                                >
                                                    Create Sale
                                                </button>
                                            </>
                                        ) : null}

                                        <button className='btn btn-outline-primary mr-[15px] btn-sm' onClick={() => setLeadHistoryDrawer(true)}>Logs</button>


                                        <button className='btn btn-success mr-[15px] btn-sm' disabled={isBtnLoading} onClick={() => formSubmit()}>
                                            {isBtnLoading ? 'Updating...' : 'Update Lead'}
                                        </button>

                                        <button type="button"
                                            onClick={() => setCallbackModal(true)}
                                            className="bg-[#f4f4f4] rounded-md p-1 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30 ltr:mr-3 rtl:ml-3 disabled:opacity-60 disabled:cursor-not-allowed">
                                            <MdPhoneCallback className="w-5 h-5" />
                                        </button>
                                        {
                                            authUser?.user_type == 'Admin' && <button type="button" onClick={() => deleteLead()} className="bg-[#f4f4f4] rounded-md p-1 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30 ltr:mr-3 rtl:ml-3 disabled:opacity-60 disabled:cursor-not-allowed">
                                                <GoTrash className="w-5 h-5" />
                                            </button>
                                        }

                                        {dataForLeadView?.multyLead ? (<button type="button"
                                            onClick={() => fetchLead(id, 'prv')} className="bg-[#f4f4f4] rounded-md p-1 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                            <IconCaretDown className="w-5 h-5 rtl:-rotate-90 rotate-90" />
                                        </button>) : null}


                                        <button type="button"
                                            onClick={() => fetchLead(id)} className="mx-3 bg-[#f4f4f4] rounded-md p-1 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                            <IoMdRefresh className="w-5 h-5" />
                                        </button>

                                        {dataForLeadView?.multyLead ? (<button type="button"
                                            onClick={() => fetchLead(id, 'nxt')} className="bg-[#f4f4f4] rounded-md p-1 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30 disabled:opacity-60 disabled:cursor-not-allowed">
                                            <IconCaretDown className="w-5 h-5 rtl:rotate-90 -rotate-90" />
                                        </button>) : null}

                                        <NavLink to={'/leads/viewleads'} className="bg-[#f4f4f4] ml-[15px] rounded-md p-1 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30">
                                            <IoCloseSharp className=" w-5 h-5" />
                                        </NavLink>
                                    </div>
                                </div>
                                <hr className="mt-4 dark:border-[#191e3a]" />
                            </div>

                            {isLoading ? <ShowLoader /> : (<>


                                {!data ? (

                                    <div className='bg-[#ece7f7] w-full h-[calc(80vh-80px)] flex flex-col items-center justify-center text-center space-y-4'>
                                        <h1 className='text-5xl font-extrabold'>No More Leads</h1>

                                        <div className='space-x-4'>
                                            <NavLink to={'/leads/viewleads'} className='bg-blue-500 text-white px-4 py-2 rounded'>Back to Leads Table</NavLink>

                                        </div>
                                    </div>
                                ) : (
                                    <>



                                        <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5 px-2">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div>
                                                    <label >Lead Owner
                                                        {
                                                            settingData?.transfer_permission == 1 &&
                                                            <button type="button" className="badge bg-primary ml-1" onClick={() => setTransferOwnerModal(true)}>Transfer</button>
                                                        }
                                                    </label>

                                                    <input type="text" name="user_id" defaultValue={params.owner || ''} placeholder="Lead Owner Name" className="form-input bg-danger/10" disabled={true} />
                                                    <div className="text-danger mt-1">{errors.user_id}</div>
                                                </div>
                                                <div>
                                                    <label >First Name </label>
                                                    <input type="text" name="first_name" value={params.first_name || ''} onChange={(e) => changeValue(e)} placeholder="Enter First Name" className="form-input" />
                                                    <div className="text-danger mt-1">{errors.first_name}</div>
                                                </div>
                                                <div>
                                                    <label >Last Name</label>
                                                    <input type="text" name="last_name" value={params.last_name || ''} onChange={(e) => changeValue(e)} placeholder="Enter Last Name" className="form-input" />
                                                    <div className="text-danger mt-1">{errors.last_name}</div>
                                                </div>
                                                <div>
                                                    <label >Lead Mobile Number
                                                        {
                                                            settingData?.refer_permission == 1 &&
                                                            <button type="button" className="badge bg-success ml-1" onClick={() => setReferModal(true)}>Refer Now</button>

                                                        }

                                                    </label>
                                                    <input type="tel" name="phone" value={params.phone || ''} onChange={(e) => changeValue(e)} placeholder="Enter Lead Mobile Number" className="form-input bg-danger/10" disabled={true} />
                                                    <div className="text-danger mt-1">{errors.phone}</div>
                                                </div>

                                                <div>
                                                    <label >Alternative Mobile Number</label>
                                                    <input type="tel" name="second_phone" value={params.second_phone || ''} onChange={(e) => changeValue(e)} placeholder="Enter Lead Mobile Number" className="form-input" />
                                                    <div className="text-danger mt-1">{errors.second_phone}</div>
                                                </div>
                                                <div>
                                                    <label >Lead Email</label>
                                                    <input type="email" name="email" value={params.email || ''} onChange={(e) => changeValue(e)} placeholder="Enter Lead Email Address" className="form-input" />
                                                    <div className="text-danger mt-1">{errors.email}</div>
                                                </div>
                                                <div>
                                                    <label >Lead Status <span className=' text-red-600 text-[15px] ' >*</span></label>
                                                    <select name="status" className="form-select text-white-dark" value={params.status || ''} onChange={(e) => changeValue(e)} disabled={params.status == "Closed Won" ? true : false}>
                                                        {data?.dropdowns?.filter((d: any) => d.type == 'Lead Status')?.map((status, index) => (
                                                            <option key={index} value={status.value}>{status.label}</option>
                                                        ))}
                                                    </select>
                                                    <div className="text-danger mt-1">{errors.status}</div>
                                                </div>
                                                <div>
                                                    <label >Lead Source</label>
                                                    <input name='source' type="text" value={params.source || ''} onChange={(e) => changeValue(e)} placeholder="Enter Lead Mobile Number" className="form-input bg-danger/10" disabled={true} />
                                                    <div className="text-danger mt-1">{errors.source}</div>
                                                </div>

                                                <div>
                                                    <label >State</label>
                                                    <select name="state" className="form-select text-white-dark" value={params.state || ''} onChange={(e) => changeValue(e)}>
                                                        {data?.dropdowns?.filter((d: any) => d.type == 'State')?.map((state, index) => (
                                                            <option key={index} value={state.value}>{state.label}</option>
                                                        ))}
                                                    </select>
                                                    <div className="text-danger mt-1">{errors.state}</div>
                                                </div>

                                                <div>
                                                    <label >City</label>
                                                    <input name="city" type="text" value={params.city || ''} onChange={(e) => changeValue(e)} placeholder="Enter City" className="form-input" />
                                                    <div className="text-danger mt-1">{errors.city}</div>
                                                </div>


                                                <div>
                                                    <label>Followup Date {params?.status == "Follow Up" ? <span className=' text-red-600 text-[15px] ' >*</span> : null}</label>
                                                    <Flatpickr name="followup" disabled={params.status != 'Follow Up'}
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
                                                    <label > Free Trial {params?.status == "Free Trial" ? <span className=' text-red-600 text-[15px] ' >*</span> : null}</label>
                                                    <Flatpickr name="free_trial"
                                                        disabled={params.status != 'Free Trial'}
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
                                                    <select name="invest" value={params.invest || ''} onChange={(e) => changeValue(e)} className="form-select text-white-dark">
                                                        {data?.dropdowns?.filter((d: any) => d.type == 'Investment Size')?.map((status) => (
                                                            <option key={status.id}>{status.value}</option>
                                                        ))}
                                                    </select>
                                                    <div className="text-danger mt-1">{errors.invest}</div>
                                                </div>
                                                <div>
                                                    <label >Lot Size</label>
                                                    <select name="lot_size" value={params.lot_size || ''} onChange={(e) => changeValue(e)} className="form-select text-white-dark">
                                                        {data?.dropdowns?.filter((d: any) => d.type == 'Lot Size')?.map((status) => (
                                                            <option key={status.id}>{status.value}</option>
                                                        ))}
                                                    </select>
                                                    <div className="text-danger mt-1">{errors.lot_size}</div>
                                                </div>

                                                <div>
                                                    <label >DND Status</label>
                                                    <select name="dnd" value={params.dnd || ''} onChange={(e) => changeValue(e)} className="form-select text-white-dark">
                                                        {data?.dropdowns?.filter((d: any) => d.type == 'DND Status')?.map((status) => (
                                                            <option key={status.id}>{status.value}</option>
                                                        ))}
                                                    </select>
                                                    <div className="text-danger mt-1">{errors.dnd}</div>
                                                </div>




                                                <div>
                                                    <label >Products {params?.status == "Free Trial" ? <span className=' text-red-600 text-[15px] ' >*</span> : null}</label>
                                                    <Select
                                                        name='products'
                                                        onChange={(e) => changeValue({ target: { name: 'products', value: e.map((a: any) => a.value) } })}
                                                        value={formattedProducts(params.products)}
                                                        options={data?.dropdowns?.filter((d: any) => d.type == "Lead Products")}
                                                        placeholder="Select Products"
                                                        isMulti
                                                        className=" text-white-dark"
                                                        isSearchable={false} />
                                                    <div className="text-danger mt-1">{errors.products}</div>
                                                </div>

                                            </div>
                                            <div className='mt-4'>
                                                <div className="flex">
                                                    <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b] whitespace-nowrap">
                                                        Description
                                                    </div>
                                                    <textarea
                                                        name="desc"
                                                        onChange={(e) => changeValue(e)}
                                                        rows={4}
                                                        value={params.desc || ''}
                                                        className="form-textarea ltr:rounded-l-none rtl:rounded-r-none"
                                                    />
                                                </div>
                                                <div className="text-danger mt-1">{errors.desc}</div>
                                            </div>
                                        </section>


                                        <div className="table-responsive mt-2 px-2">
                                            <table >
                                                <thead>
                                                    <tr >
                                                        <th>Description</th>
                                                        <th className="text-center">Date Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody>

                                                    {data?.descriptions?.map(item => {
                                                            try {
                                                                const parsed = JSON.parse(item.changes);
                                                                const descChange = parsed.find(change => change.field === 'desc' && change.new !== '');
                                                                return descChange ? { text: descChange.new, date: item.created_at } : null;
                                                            } catch (err) {
                                                                return null;
                                                            }
                                                        })
                                                        .filter(Boolean)
                                                        .map((desc, i) => (
                                                            // <p key={i} className='bg-[#000]/[0.08] p-1 rounded mb-1'>
                                                            //   {desc.} <br />
                                                            //   <small className="text-xs text-gray-600">{desc.}</small>
                                                            // </p>


                                                            <tr key={data.i}>
                                                               <td>
                                             <div className="whitespace-normal break-words">{desc.text}</div>
                                                    </td>

                                                                <td className="text-center">
                                                                    {desc.date}
                                                                </td>
                                                            </tr>
                                                        ))}




                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}


                            </>)}

                        </>



                    )}
                </div>

            </MainLeft >

            <CreateSale
                createSaleDrawer={createSaleDrawer}
                setCreateSaleDrawer={setCreateSaleDrawer}
                selectedLead={data?.lead}
            />


            <Callback callbackModal={callbackModal} setCallbackModal={setCallbackModal} lead_id={id} />
            <LeadHistory leadHistoryDrawer={leadHistoryDrawer} setLeadHistoryDrawer={setLeadHistoryDrawer} lead_id={id} />

            <TransferLead transferOwnerModal={transferOwnerModal} setTransferOwnerModal={setTransferOwnerModal} lead_id={id} />
            <ReferLead referModal={referModal} setReferModal={setReferModal} lead_id={id} />



        </>
    )
}

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
