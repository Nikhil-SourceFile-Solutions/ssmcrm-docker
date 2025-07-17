import React from 'react'
import IconCaretDown from '../../../components/Icon/IconCaretDown'
import IconPlus from '../../../components/Icon/IconPlus'
import { useAuth } from '../../../AuthContext';
import PageLoader from '../../../components/Layouts/PageLoader';
import { useNavigate } from 'react-router-dom';

export default function Card({ cardLoad, cardData }) {

    const { authUser } = useAuth();
    const navigate = useNavigate();
    return (

        <>
            {cardLoad ? <PageLoader /> : (<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">

                <div className="panel h-full p-0 border-0 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-[#4361ee] to-[#160f6b] min-h-[190px]">
                        <div className="flex justify-between items-center mb-6">
                            <div className="bg-black/50 rounded-full p-1 ltr:pr-3 rtl:pl-3 flex items-center text-white font-semibold">
                                <img className="w-8 h-8 rounded-full border-2 border-white/50 block object-cover ltr:mr-1 rtl:ml-1" src={`https://ui-avatars.com/api/?background=000&color=fff&name=${authUser?.first_name + ' ' + authUser?.last_name}`} alt="avatar" />
                                {authUser?.first_name + ' ' + authUser?.last_name}
                            </div>
                            {/* <button type="button" className="ltr:ml-auto rtl:mr-auto flex items-center justify-between w-9 h-9 bg-black text-white rounded-md hover:opacity-80">
                                <IconPlus className="w-6 h-6 m-auto" />
                            </button> */}
                        </div>
                        <div className="text-white flex justify-between items-center">
                            <p className="text-xl">Today's Total Sales</p>
                            <h5 className="ltr:ml-auto rtl:mr-auto text-2xl">
                                <span className="text-white-light">₹</span>{cardData?.totalSales}
                            </h5>
                        </div>
                    </div>
                    <div className="-mt-12 px-8 grid grid-cols-2 gap-2">
                        <div className="bg-white rounded-md shadow px-4 py-2.5 dark:bg-[#060818]">
                            <span className="flex justify-between items-center mb-4 dark:text-white font-bold">
                                Team Leaders
                            </span>
                            <div className="btn w-full  py-1 text-base shadow-none border-0 bg-[#ebedf2] dark:bg-black text-[#515365] dark:text-[#bfc9d4]">{cardData?.leaders}</div>
                        </div>
                        <div className="bg-white rounded-md shadow px-4 py-2.5 dark:bg-[#060818]">
                            <span className="flex justify-between items-center mb-4 dark:text-white font-bold">
                                BDE
                            </span>
                            <div className="btn w-full  py-1 text-base shadow-none border-0 bg-[#ebedf2] dark:bg-black text-[#515365] dark:text-[#bfc9d4]">{cardData?.bdes
                            }</div>
                        </div>
                    </div>
                    <div className="p-5">

                        <div className=" space-y-1">
                            <div className="flex items-center justify-between">
                                <p className="text-[#515365] font-semibold">Today's Own Sales</p>
                                <p className="text-base">
                                    <span>₹</span> <span className="font-semibold">{cardData?.ownSales}</span>
                                </p>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-[#515365] font-semibold">Today's Team Sales</p>
                                <p className="text-base">
                                    <span>₹</span> <span className="font-semibold ">{cardData?.teamSales}</span>
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                <div className='col-span-2'>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-6 mb-6 text-white">
                        <div className="panel bg-gradient-to-r from-[#c706d4d1] to-[#2247eec9]">
                            <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Total Leads</div>
                            <div className='flex justify-between mt-5'>
                                <div className='cursor-pointer w-full' onClick={() => {
                                    navigate('/leads/viewleads', {
                                        state: {
                                            fStatus: 0,
                                            fState: 0,
                                        },
                                    });
                                }}>


                                    <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{cardData?.ownLeads}</div>
                                    <small>My Own</small>
                                </div>
                                <hr className='border-2 h-[50px]' />
                                <div className='cursor-pointer w-full text-end' onClick={() => {
                                    navigate('/team-leads', {
                                        state: {
                                            fStatus: 0,
                                            fState: 0,
                                        },
                                    });
                                }}>
                                    <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{cardData?.teamLeads}</div>
                                    <small>My Team's</small>
                                </div>
                            </div>
                        </div>
                        <div className="panel bg-gradient-to-r from-[#12a300d1] to-[#c3d703]">
                            <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Closed Won</div>
                            <div className='flex justify-between mt-5'>
                                <div className='cursor-pointer w-full' onClick={() => {
                                    navigate('/leads/viewleads', {
                                        state: {
                                            fStatus: 'Closed Won',
                                            fState: 0,
                                        },
                                    });
                                }}>
                                    <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{cardData?.ownCloseWonLeads}</div>
                                    <small>My Own</small>
                                </div>
                                <hr className='border-2 h-[50px]' />
                                <div className='cursor-pointer w-full text-end' onClick={() => {
                                    navigate('/team-leads', {
                                        state: {
                                            fStatus: 'Closed Won',
                                            fState: 0,
                                        },
                                    });
                                }}>
                                    <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{cardData?.teamCloseWonLeads}</div>
                                    <small>My Team's</small>
                                </div>
                            </div>
                        </div>
                        <div className="panel bg-gradient-to-r from-[#d40606b8] to-[#ee8722]">
                            <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Followup</div>
                            <div className='flex justify-between mt-5'>
                                <div className='cursor-pointer w-full' onClick={() => {
                                    navigate('/leads/viewleads', {
                                        state: {
                                            fStatus: 'Follow Up',
                                            fState: 0,
                                        },
                                    });
                                }}>
                                    <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{cardData?.ownFollowupLeads}</div>
                                    <small>My Own</small>
                                </div>
                                <hr className='border-2 h-[50px]' />
                                <div className='cursor-pointer w-full text-end' onClick={() => {
                                    navigate('/team-leads', {
                                        state: {
                                            fStatus: 'Follow Up',
                                            fState: 0,
                                        },
                                    });
                                }}>
                                    <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{cardData?.teamFollowupLeads}</div>
                                    <small>My Team's</small>
                                </div>
                            </div>
                        </div>
                        <div className="panel bg-gradient-to-r from-[#f63b3b] to-[#f7107db0]">
                            <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Free Trial</div>
                            <div className='flex justify-between mt-5'>
                                <div className='cursor-pointer w-full' onClick={() => {
                                    navigate('/leads/viewleads', {
                                        state: {
                                            fStatus: 'Free Trial',
                                            fState: 0,
                                        },
                                    });
                                }}>
                                    <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{cardData?.ownFreeTrailLeads}</div>
                                    <small>My Own</small>
                                </div>
                                <hr className='border-2 h-[50px]' />
                                <div className='cursor-pointer w-full text-end' onClick={() => {
                                    navigate('/team-leads', {
                                        state: {
                                            fStatus: 'Free Trial',
                                            fState: 0,
                                        },
                                    });
                                }}>
                                    <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{cardData?.teamFreeTrailLeads
                                    }</div>
                                    <small>My Team's</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>)}
        </>

    )
}
