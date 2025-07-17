import React from 'react'
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { IRootState } from "../../store";
import { useDispatch, useSelector } from 'react-redux';
export default function ViewReferClient({ referredData }) {
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    return (
        <div>
            <div className="flex flex-col h-screen overflow-hidden py-4">
                <div className="w-full text-center">
                    <div className="p-1 flex sm:flex-row flex-col w-full sm:items-center gap-4 px-4">
                        <div className="ltr:mr-3 rtl:ml-3 flex items-center">
                            <h5 className="font-semibold text-lg dark:text-white-light">  Referred Client (<span>{referredData?.owner}</span> - {referredData?.updated_at})</h5>
                        </div>
                    </div>
                    <hr className="mt-4 dark:border-[#191e3a]" />
                </div>
                <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5 px-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label >Lead Owner </label>
                            <input type="text" name="user_id" value={referredData?.owner} placeholder="Lead Owner Name" className="form-input bg-danger/10" disabled={true} />
                        </div>
                        <div>
                            <label >First Name</label>
                            <input type="text" name="first_name" value={referredData?.first_name} placeholder="Enter First Name" className="form-input bg-danger/10" disabled={true} />
                        </div>
                        <div>
                            <label >Last Name</label>
                            <input type="text" name="last_name" value={referredData?.last_name} placeholder="Enter Last Name" className="form-input bg-danger/10" disabled={true} />

                        </div>
                        <div>
                            <label >Lead Mobile Number
                            </label>
                            <input type="tel" name="phone" value={referredData?.phone} placeholder="Enter Lead Mobile Number" className="form-input bg-danger/10" disabled={true} />

                        </div>

                        <div>
                            <label>Alternative Mobile Number</label>
                            <input type="tel" name="second_phone" value={referredData?.second_phone} placeholder="Enter Lead Mobile Number" className="form-input bg-danger/10" disabled={true} />

                        </div>
                        <div>
                            <label >Lead Email</label>
                            <input type="email" name="email" value={referredData?.email} placeholder="Enter Lead Email Address" className="form-input bg-danger/10" disabled={true} />
                        </div>
                        <div>
                            <label>Lead Status</label>
                            <select name="status" className="form-select text-white-dark bg-danger/10" disabled={true} value={referredData?.owner}  >
                                <option value="">{referredData?.owner}</option>
                            </select>

                        </div>
                        <div>
                            <label>Lead Source</label>
                            <input name='source' type="text" value={referredData?.source} placeholder="Enter Lead Mobile Number" className="form-input bg-danger/10" disabled={true} />
                        </div>

                        <div>
                            <label >State</label>
                            <select name="state" className="form-select text-white-dark bg-danger/10" disabled={true} value={referredData?.owner} >
                                <option value="">{referredData?.state}</option>
                            </select>
                        </div>
                        <div>
                            <label>City</label>
                            <input name="city" type="text" value={referredData?.city} placeholder="Enter City" className="form-input bg-danger/10" disabled={true} />
                        </div>
                        <div>
                            <label >Followup Date</label>
                            <Flatpickr name="followup" value={referredData?.followup} options={{ dateFormat: 'Y-m-d', position: isRtl ? 'auto right' : 'auto left' }} className="form-input bg-danger/10" disabled={true} />
                        </div>
                        <div>
                            <label >First Free Trial</label>
                            <Flatpickr name="first_trial" value={referredData?.first_trial} options={{ dateFormat: 'Y-m-d', position: isRtl ? 'auto right' : 'auto left' }} className="form-input bg-danger/10" disabled={true} />
                        </div>
                        <div>
                            <label>Second Free Trial</label>
                            <Flatpickr name="second_trial" value={referredData?.second_trial} options={{ dateFormat: 'Y-m-d', position: isRtl ? 'auto right' : 'auto left' }} className="form-input bg-danger/10" disabled={true} />
                        </div>
                        <div>
                            <label >Investment Size</label>
                            <select name="invest" value={referredData?.invest} className="form-select text-white-dark bg-danger/10" disabled={true}>
                                <option value="">{referredData?.invest}</option>
                            </select>
                        </div>
                        <div>
                            <label >Lot Size</label>
                            <select name="lot_size" value={referredData?.lot_size} className="form-select text-white-dark bg-danger/10" disabled={true}>
                                <option value="">{referredData?.lot_size}</option>
                            </select>
                        </div>

                        <div>
                            <label>DND Status</label>
                            <select name="dnd" value={referredData?.dnd} className="form-select text-white-dark bg-danger/10" disabled={true}>
                                <option value="">{referredData?.dnd}</option>
                            </select>
                        </div>

                        <div>
                            <label>Products</label>
                            <select name="products" value={referredData?.products} className="form-select text-white-dark bg-danger/10" disabled={true}>
                                <option value="">{referredData?.products}</option>
                            </select>
                        </div>

                    </div>
                    <div className='mt-4 mb-2'>
                        <div className="flex">
                            <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b] whitespace-nowrap">
                                Description
                            </div>
                            <textarea name="desc" rows={4} className="form-textarea ltr:rounded-l-none rtl:rounded-r-none bg-danger/10" disabled={true}>{referredData?.desc}</textarea>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
