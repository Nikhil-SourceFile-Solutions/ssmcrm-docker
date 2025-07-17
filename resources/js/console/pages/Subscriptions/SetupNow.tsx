import React,{ useState, Fragment, useEffect } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { IRootState } from '../../store';
import 'flatpickr/dist/flatpickr.css';
import Flatpickr from 'react-flatpickr';

import { LuIndianRupee } from 'react-icons/lu';

export default function SetupNow({ showSetupViewDrawer, setSetupViewShowDrawer }: any) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const [start_date, setStartDate] = useState<any>('2022-07-05');
    const [end_date, setEndDate] = useState<any>('2022-07-05');
    return (
        <div>
            <div className={`${(showSetupViewDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setSetupViewShowDrawer(false)}></div>
            <nav className={`${(showSetupViewDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                } bg-white fixed ltr:-right-[600px] rtl:-left-[600px] top-0 bottom-0 w-full max-w-[600px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4`}
            >
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className="w-full text-center">
                        <div className="p-1 flex sm:flex-row flex-col w-full sm:items-center gap-4">
                            <div className="ltr:mr-3 rtl:ml-3 flex items-center">
                                <h5 className="font-semibold text-lg dark:text-white-light">Subscription</h5>
                            </div>
                            <div className="flex items-center justify-center sm:justify-end sm:flex-auto flex-1">
                                <button className='btn btn-primary mr-[15px] btn-sm'>Add Subscription</button>
                            </div>
                        </div>
                        <hr className="my-4 dark:border-[#191e3a]" />
                    </div>
                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar">
                        <div className='space-y-5 mb-5'>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="sub_plan">Select Plan *</label>
                                    <select className="form-select text-white-dark" name='sub_plan'>
                                        <option>Free Trial</option>
                                        <option>Plan 1</option>
                                        <option>Plan 2</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="sub_user">Select User *</label>
                                    <select className="form-select text-white-dark" name='sub_user'>
                                        <option>Customer Name</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="sub_tenure">Select Tenure * </label>
                                    <select className="form-select text-white-dark" name='sub_tenure'>
                                        <option>Free Trial 15 days</option>
                                        <option>Monthly</option>
                                        <option>Half Yearly</option>
                                        <option>Yearly</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="customer_status">Status</label>
                                    <select className="form-select text-white-dark" name='customer_status'>
                                        <option>Select Status</option>
                                        <option>Active</option>
                                        <option>Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="sub_price">Plan Price *</label>
                                    <input type="text" placeholder="Enter Price" className="form-input" name='sub_price' />
                                </div>
                                <div>
                                    <label htmlFor="sub_disprice">Discounted Price</label>
                                    <input type="text" placeholder="Enter Discounted Price" className="form-input" name='sub_disprice' />
                                </div>
                                <div>
                                    <label htmlFor="sub_agents">No. of Agents</label>
                                    <input type="text" placeholder="Enter Number of Agents" className="form-input" name='sub_agents' />
                                </div>
                                <div>
                                    <label htmlFor="customer_email">Total Price</label>
                                    <span className="flex items-center text-[18px] mt-4 font-bold text-success"><LuIndianRupee className="" /> 15000.00</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="customer_companyname">Start Date</label>
                                    <Flatpickr value={start_date} options={{ dateFormat: 'Y-m-d', position: isRtl ? 'auto right' : 'auto left' }} className="form-input" onChange={(date) => setStartDate(date)} />
                                </div>
                                <div>
                                    <label htmlFor="customer_gstin">End Date</label>
                                    <Flatpickr value={end_date} options={{ dateFormat: 'Y-m-d', position: isRtl ? 'auto right' : 'auto left' }} className="form-input" onChange={(date) => setEndDate(date)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="sub_paymentmethod">Payment Method</label>
                                    <select className="form-select text-white-dark" name='sub_paymentmethod'>
                                        <option>Select Method</option>
                                        <option>Bank</option>
                                        <option>UPI</option>
                                        <option>Cash</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="sub_transactionid">Transaction ID</label>
                                    <input type="text" placeholder="Enter State" className="form-input" name='sub_transactionid' />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="sub_planfeatures">Plan Features</label>
                                    <textarea className="form-input" name='sub_planfeatures'></textarea>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </nav>
        </div>
    )
}
