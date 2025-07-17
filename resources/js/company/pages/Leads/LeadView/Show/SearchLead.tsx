import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../../AuthContext';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import CreateSale from '../CreateSale';
import SalesHistory from './SalesHistory';
import StatusHistory from './StatusHistory';
import Callback from './Callback';
import TransferLead from './TransferLead';
import ReferLead from './ReferLead';
// import BankDetails from './BankDetails';
import PageLoader from '../../../../components/Layouts/PageLoader';
import Select from 'react-select';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Swal from 'sweetalert2';
export default function SearchLead() {
    const { logout, authUser, settingData, crmToken, apiUrl } = useAuth();

    const location = useLocation();
    const lead_id = location.state?.lead_id;



    const [lead, setLead] = useState<any>({});
    const [allLeadOwners, setAllLeadOwners] = useState([]);
    const [dropdowns, setDropdowns] = useState([]);
    const disabledField = authUser.user_type == "Admin" ? false : true;

    useEffect(() => {
        fetchSearchLead()
    }, [lead_id])

    const [isLoading, setIsLoading] = useState(true);
    const fetchSearchLead = async () => {
        setIsLoading(true)
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/get-search-leads",
                params: { lead_id: lead_id },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });


            if (response.data.status == "success") {
                setLead(response.data.lead)
                setAllLeadOwners(response.data.allLeadOwners)
                setDropdowns(response.data.dropdowns)
            }

        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }


    const [showCreateSaleDrawer, setShowCreateSaleDrawer] = useState(false)
    const [salesHistoryModal, setSalesHistoryModal] = useState(false)
    const [statusHistoryModal, setStatusHistoryModal] = useState(false)
    const [bankDetailsModal, setBankDetailsModal] = useState(false)

    function isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }


    const [params, setParams] = useState<any>({
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

    useEffect(() => {
        if (!isEmpty(lead)) setParams({
            user_id: lead.user_id,
            first_name: lead.first_name ? lead.first_name : '',
            last_name: lead.last_name ? lead.last_name : '',
            phone: lead.phone ? lead.phone : '',
            second_phone: lead.second_phone ? lead.second_phone : '',
            email: lead.email ? lead.email : '',
            status: lead.status ? lead.status : '',
            invest: lead.invest ? lead.invest : '',
            free_trial: lead.free_trial ? lead.free_trial : '',
            followup: lead.followup ? lead.followup : '',
            source: lead.source ? lead.source : '',
            dnd: lead.dnd ? lead.dnd : '',
            city: lead.city ? lead.city : '',
            state: lead.state ? lead.state : '',
            products: lead?.products?.length ? JSON.parse(lead.products) : [],
            desc: lead.desc ? lead.desc : '',
            lot_size: lead.lot_size ? lead.lot_size : '',

        })
    }, [lead])

    const [errors, setErros] = useState<any>({});
    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
        console.table(params)
    };

    const formattedEmployee = (user_id: any) => {
        return allLeadOwners?.find((owner: any) => owner.value == user_id);
    };



    const formattedProducts = (products: any) => {
        if (products && products.length) return products.map((product: any) => ({
            value: product,
            label: product
        }))
        else return []
    };


    const UpdateLeadApi = async (data) => {

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

            if (response.data.status == "success") showMessage(response.data.message)
        } catch (error) {
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
            }

        } finally {
            setIsBtnLoading(false)
        }

    }

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.status) {
            errors = { ...errors, status: "status is required" };
        }
        console.log(errors)
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("id", lead.id);
        data.append("user_id", params.user_id);
        data.append("first_name", params.first_name);
        data.append("last_name", params.last_name);
        data.append("second_phone", params.second_phone);
        data.append("email", params.email);
        data.append("status", params.status);
        data.append("products", params?.products?.length ? JSON.stringify(params.products) : JSON.stringify([]));
        data.append("invest", params.invest);
        data.append("followup", params.followup ? new Date(params.followup).toISOString() : '');
        data.append("free_trial", params.free_trial ? new Date(params.free_trial).toISOString() : '');
        data.append("source", params.source);
        data.append("dnd", params.dnd);
        data.append("city", params.city);
        data.append("state", params.state);
        data.append("desc", params.desc);
        data.append("lot_size", params.lot_size);
        UpdateLeadApi(data);
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
            {
                isLoading ? (<PageLoader />) : (
                    <>

                        <div className="flex flex-col h-screen overflow-hidden panel">
                            <div className="w-full text-center">
                                <div className="p-1 flex sm:flex-row flex-col w-full sm:items-center gap-4">
                                    <div className="ltr:mr-3 rtl:ml-3 flex items-center">
                                        <h5 className="font-semibold text-lg dark:text-white-light">Search Lead</h5>
                                    </div>

                                    <div className="flex items-center justify-center sm:justify-end sm:flex-auto flex-1">
                                        {lead?.status == "Closed Won" && <>
                                            <button className='btn btn-outline-primary mr-[15px] btn-sm'
                                                onClick={() => {
                                                    setShowCreateSaleDrawer(true)
                                                }}
                                            >Create Sale</button>
                                            <button className='btn btn-outline-primary mr-[15px] btn-sm' onClick={() => setSalesHistoryModal(true)}>Sales History</button>
                                        </>}
                                        <button className='btn btn-outline-primary mr-[15px] btn-sm' onClick={() => setStatusHistoryModal(true)}>Status History</button>

                                        {authUser.user_type == "Admin" ? (<button className='btn btn-secondary mr-[15px] btn-sm' disabled={isBtnLoading ? true : false} onClick={() => formSubmit()}>
                                            {isBtnLoading ? 'Please Wait...' : 'Update Lead'}
                                        </button>) : null}


                                    </div>
                                </div>
                                <hr className="mt-4 dark:border-[#191e3a]" />


                            </div>


                            <>
                                <div className="p-1 flex sm:flex-row flex-col w-full sm:items-center gap-4">
                                    <div className="flex items-center justify-center sm:justify-end sm:flex-auto flex-1">
                                        {
                                            settingData?.website_permission == 1 && <button className='badge bg-primary mr-2' >Send Website Link</button>
                                        }
                                        {
                                            lead?.status == 'Closed Won' ? <button className='badge bg-success mr-2'
                                                onClick={() => { setBankDetailsModal(true) }}
                                            >Send Bank Details</button> : null
                                        }


                                    </div>
                                </div>
                                <hr className="mb-4 dark:border-[#191e3a]" />
                                <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5 px-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                        <div>
                                            <label >Lead Owner
                                            </label>


                                            <Select placeholder="Select an employee"
                                                options={allLeadOwners}
                                                isDisabled={disabledField}
                                                onChange={(e: any) => changeValue({ target: { name: 'user_id', value: e.value } })}
                                                value={formattedEmployee(params.user_id)}
                                            />


                                        </div>

                                        <div>
                                            <label >First Name</label>
                                            <input type="text" name="first_name"
                                                value={params.first_name}
                                                onChange={(e) => changeValue(e)}
                                                disabled={disabledField}
                                                className="form-input" />
                                        </div>

                                        <div>
                                            <label >Last Name</label>
                                            <input type="text" name="last_name"
                                                value={params.last_name}
                                                onChange={(e) => changeValue(e)}
                                                disabled={disabledField}
                                                className="form-input" />
                                        </div>

                                        <div>
                                            <label >Mobile Number
                                            </label>
                                            <input type="tel" name="phone"
                                                value={params.phone}
                                                disabled
                                                className="form-input bg-danger/10" />
                                        </div>

                                        <div>
                                            <label >Alternative Mobile Number</label>
                                            <input type="tel" name="second_phone"
                                                value={params.second_phone}
                                                onChange={(e) => changeValue(e)}
                                                disabled={disabledField}
                                                className="form-input" />
                                        </div>
                                        <div>
                                            <label >Email</label>
                                            <input type="email" name="email"
                                                value={params.email}
                                                onChange={(e) => changeValue(e)}
                                                disabled={disabledField}
                                                className="form-input" />
                                        </div>

                                        <div>
                                            <label >Lead Status</label>
                                            <select name="status" className="form-select text-white-dark" disabled={params.status == "Closed Won" ? true : disabledField ? true : false} value={params.status} onChange={(e) => changeValue(e)}>
                                                {dropdowns?.filter((d: any) => d.type == 'Lead Status').map((status: any) => (
                                                    <option key={status.id}>{status.value}</option>
                                                ))}
                                            </select>
                                            <div className="text-danger mt-1">{errors.status}</div>
                                        </div>

                                        <div>
                                            <label >Source</label>
                                            <input type="text" name='source'
                                                value={params.source}
                                                disabled
                                                className="form-input bg-danger/10" />
                                        </div>

                                        <div>
                                            <label >State</label>
                                            <select name="state" className="form-select text-white-dark" disabled={disabledField} value={params.state} onChange={(e) => changeValue(e)}>
                                                <option>Choose...</option>
                                                {dropdowns?.filter((d: any) => d.type == 'State').map((status: any) => (
                                                    <option key={status.id}>{status.value}</option>
                                                ))}
                                            </select>
                                            <div className="text-danger mt-1">{errors.state}</div>
                                        </div>

                                        <div>
                                            <label >City</label>
                                            <input type="text" name="city" disabled={disabledField}
                                                value={params.city}
                                                onChange={(e) => changeValue(e)}
                                                className="form-input" />
                                        </div>

                                        <div>
                                            <label >Followup Date</label>
                                            <Flatpickr
                                                name="followup"
                                                value={params.followup}
                                                onChange={(e) => changeValue({ target: { value: e[0], name: 'followup' } })}
                                                disabled={disabledField}
                                                options={{
                                                    dateFormat: 'Y-m-d',
                                                    position: 'auto left',
                                                    minDate: 'today' // This restricts the date selection to today and future dates
                                                }}
                                                className="form-input"
                                            />
                                            <div className="text-danger mt-1">{errors.followup}</div>
                                        </div>

                                        <div>
                                            <label >Free Trial</label>
                                            <Flatpickr
                                                name="free_trial"
                                                value={params.free_trial}
                                                onChange={(e) => changeValue({ target: { value: e[0], name: 'free_trial' } })}
                                                disabled={disabledField}
                                                options={{
                                                    dateFormat: 'Y-m-d',
                                                    position: 'auto left',
                                                    minDate: 'today' // This restricts the date selection to today and future dates
                                                }}
                                                className="form-input"
                                            />
                                            <div className="text-danger mt-1">{errors.followup}</div>
                                        </div>



                                        <div>
                                            <label >Investment Size</label>
                                            <select name="invest" value={params.invest} disabled={disabledField} onChange={(e) => changeValue(e)} className="form-select text-white-dark">
                                                <option>Choose...</option>
                                                {dropdowns?.filter((d: any) => d.type == 'Investment Size').map((status: any) => (
                                                    <option key={status.id}>{status.value}</option>
                                                ))}
                                            </select>
                                            <div className="text-danger mt-1">{errors.invest}</div>
                                        </div>



                                        <div>
                                            <label >Lot Size</label>
                                            <select name="lot_size" value={params.lot_size} disabled={disabledField} onChange={(e) => changeValue(e)} className="form-select text-white-dark">
                                                <option>Choose...</option>
                                                {dropdowns?.filter((d: any) => d.type == 'Lot Size').map((status: any) => (
                                                    <option key={status.id}>{status.value}</option>
                                                ))}
                                            </select>
                                            <div className="text-danger mt-1">{errors.lot_size}</div>
                                        </div>

                                        <div>
                                            <label >DND Status</label>
                                            <select name="dnd" value={params.dnd} disabled={disabledField} onChange={(e) => changeValue(e)} className="form-select text-white-dark">
                                                <option>Choose...</option>
                                                {dropdowns?.filter((d: any) => d.type == 'DND Status').map((status: any) => (
                                                    <option key={status.id}>{status.value}</option>
                                                ))}
                                            </select>
                                            <div className="text-danger mt-1">{errors.dnd}</div>
                                        </div>

                                        <div>
                                            <label >Products</label>
                                            <Select
                                                name='products'
                                                isDisabled={disabledField}
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
                                    <div className='mt-4'>
                                        <div className="flex">
                                            <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b] whitespace-nowrap">
                                                Description
                                            </div>
                                            <textarea name="desc" disabled={disabledField} value={params.desc} onChange={(e) => changeValue(e)} rows={4} className="form-textarea ltr:rounded-l-none rtl:rounded-r-none"></textarea>
                                        </div>
                                        <div className="text-danger mt-1">{errors.desc}</div>
                                    </div>
                                </section>
                            </>

                        </div>


                        <CreateSale saleModel={showCreateSaleDrawer} setSaleModel={setShowCreateSaleDrawer} selectedLead={lead} />
                        <SalesHistory salesHistoryModal={salesHistoryModal} setSalesHistoryModal={setSalesHistoryModal} lead_id={lead?.id} />
                        <StatusHistory statusHistoryModal={statusHistoryModal} setStatusHistoryModal={setStatusHistoryModal} lead_id={lead?.id} />
                        {/* <BankDetails bankDetailsModal={bankDetailsModal} setBankDetailsModal={setBankDetailsModal} lead_id={lead?.id} selectedLead={lead} /> */}
                    </>
                )
            }


        </div>
    )
}
