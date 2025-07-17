import React, { useEffect, useState } from "react";
import Select from 'react-select';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { IRootState } from "../../store";
import { useDispatch, useSelector } from 'react-redux';
import Swal from "sweetalert2";
import { setCrmToken } from "../../store/themeConfigSlice";
import axios from "axios";
import { useAuth } from "../../AuthContext";

export default function ViewTransferLeads({
    showAllTransferClientDrawer,
    setShowAllTransferClientDrawer,

    transferClient,
    setTransferClient,
    data

}: any) {

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const dispatch = useDispatch();

    const { crmToken, apiUrl} = useAuth()
    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const ApprovedData = async (data: any) => {
        setIsBtnLoading(true)
        console.log('Fetching Leads Approved data')
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/approved-transfer-lead",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });


            if (response.data.status == 'success') {
                showMessage('Message Sent')

                setShowAllTransferClientDrawer(false)
            } else { alert(response.data.message) }

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
    const formSubmit = () => {

        const hello = new FormData();
        hello.append("transfer_lead_id", data.transfer_lead_id);
        hello.append("action", 1);

        ApprovedData(hello);
    };


    return (
        <div>
            <div className={`${(showAllTransferClientDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setShowAllTransferClientDrawer(false)}></div>

            <nav className={`${(showAllTransferClientDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                }  bg-white fixed ltr:-right-[900px] rtl:-left-[900px] top-0 bottom-0 w-full max-w-[800px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black `}
            >
                <div className="flex flex-col h-screen overflow-hidden py-4">
                    <div className="w-full text-center">
                        <div className="p-1 flex justify-between sm:flex-row flex-col w-full sm:items-center gap-4 px-4">
                            <div className="ltr:mr-3 rtl:ml-3 flex items-center">
                                <h5 className="font-semibold text-lg dark:text-white-light">  Transferred Client </h5>
                            </div>
                            <button type="button" onClick={() => { formSubmit() }} className="btn btn-primary" >Approve Transfer Data</button>

                        </div>
                        <hr className="mt-4 dark:border-[#191e3a]" />
                    </div>
                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5 px-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">


                            <div>
                                <label >Lead Owner </label>
                                {/* <TransferOwner requestModal={TransferOwnerModal} setTransferOwnerModal={setTransferOwnerModal} lead={lead}/> */}
                                <input type="text" name="user_id" defaultValue={data.owner} placeholder="Lead Owner Name" className="form-input bg-danger/10" disabled={true} />

                            </div>
                            <div>
                                <label >First Name</label>
                                <input type="text" name="first_name" defaultValue={data.first_name} placeholder="Enter First Name" className="form-input bg-danger/10" disabled={true} />
                            </div>
                            <div>
                                <label >Last Name</label>
                                <input type="text" name="last_name" defaultValue={data.last_name} placeholder="Enter Last Name" className="form-input bg-danger/10" disabled={true} />
                            </div>
                            <div>
                                <label >Lead Mobile Number

                                    {/* <ReferNow requestModal={referModal} setReferModal={setReferModal} lead={lead} /> */}
                                </label>
                                <input type="tel" name="phone" defaultValue={data.phone} placeholder="Enter Lead Mobile Number" className="form-input bg-danger/10" disabled={true} />
                            </div>

                            <div>
                                <label >Alternative Mobile Number</label>
                                <input type="tel" name="second_phone" defaultValue={data.second_phone} placeholder="Enter Lead Mobile Number" className="form-input bg-danger/10" disabled={true} />
                            </div>
                            <div>
                                <label >Lead Email</label>
                                <input type="email" name="email" defaultValue={data.email} placeholder="Enter Lead Email Address" className="form-input bg-danger/10" disabled={true} />
                            </div>
                            <div>
                                <label >Lead Status</label>
                                <select name="status" className="form-select text-white-dark" defaultValue={data.status} disabled={data.status == "Closed Won" ? true : false}>
                                    {/* {dropdowns?.filter(d => d.type == 'Lead Status')?.map((status) => (
                                        <option key={status.id}>{status.defaultValue}</option>
                                    ))} */}
                                    <option defaultValue="">{data.status}</option>
                                </select>
                            </div>
                            <div>
                                <label>Lead Source</label>
                                <input name='source' type="text" defaultValue={data.source} placeholder="Enter Lead Mobile Number" className="form-input bg-danger/10" disabled={true} />
                            </div>

                            <div>
                                <label>State</label>
                                <select name="state" className="form-select text-white-dark" defaultValue={data.state} >
                                    {/* {dropdowns?.filter(d => d.type == 'State')?.map((status) => (
                                        <option key={status.id}>{status.defaultValue}</option>
                                    ))} */}
                                    <option defaultValue="">{data.state}</option>
                                </select>
                            </div>

                            <div>
                                <label>City</label>
                                <input name="city" type="text" defaultValue={data.city} placeholder="Enter City" className="form-input" />
                            </div>


                            <div>
                                <label >Followup Date</label>
                                <Flatpickr name="followup" defaultValue={data.followup} options={{ dateFormat: 'Y-m-d', position: isRtl ? 'auto right' : 'auto left' }} className="form-input" />
                            </div>
                            <div>
                                <label>First Free Trial</label>
                                <Flatpickr name="first_trial" defaultValue={data.first_trial} options={{ dateFormat: 'Y-m-d', position: isRtl ? 'auto right' : 'auto left' }} className="form-input" />
                            </div>
                            <div>
                                <label>Second Free Trial</label>
                                <Flatpickr name="second_trial" defaultValue={data.second_trial} options={{ dateFormat: 'Y-m-d', position: isRtl ? 'auto right' : 'auto left' }} className="form-input" />
                            </div>
                            <div>
                                <label>Investment Size</label>
                                <select name="invest" defaultValue={data.invest} className="form-select text-white-dark">

                                    <option >{data.invest}</option>

                                </select>
                            </div>
                            <div>
                                <label >Lot Size</label>
                                <select name="lot_size" defaultValue={data.lot_size} className="form-select text-white-dark">

                                    <option >{data.lot_size}</option>

                                </select>
                            </div>

                            <div>
                                <label>DND Status</label>
                                <select name="dnd" defaultValue={data.dnd} className="form-select text-white-dark">

                                    <option >{data.dnd}</option>

                                </select>
                            </div>

                            <div>
                                <label>Products</label>
                                <select name="products" defaultValue={data.products} className="form-select text-white-dark">

                                    <option >{data.products}</option>

                                </select>
                            </div>


                        </div>
                        <div className='mt-4 mb-2'>
                            <div className="flex">
                                <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b] whitespace-nowrap">
                                    Description
                                </div>
                                <textarea name="desc" rows={4} className="form-textarea ltr:rounded-l-none rtl:rounded-r-none" defaultValue={data.desc}></textarea>
                            </div>
                        </div>




                    </section>

                    {/* <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar py-6 px-4">
                        <div className='gap-6 w-full'>
                            <h1>Transferred clients</h1>
                        { transferClient?.map((lead: any) => (
                                                <div className=" py-1.5 relative group">
                                                    <div className='flex items-center  relative group'>
                                                        <div className="flex-1">{lead.owner}</div>
                                                        <div className="ltr:ml-auto rtl:mr-auto text-xs text-dark dark:text-gray-500">{lead.phone}</div>
                                                    </div>
                                                    <div className='flex items-center'>
                                                        <div className="ltr:ml-auto rtl:mr-auto text-xs text-dark dark:text-gray-500">Refered by:{lead.owner}</div>
                                                    </div>
                                                <hr />

                                                </div>
                                            ))}
                        </div>




                    </section> */}
                </div>
            </nav>




        </div >
    )





}
