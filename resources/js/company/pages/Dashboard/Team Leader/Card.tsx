import React from 'react'
import PageLoader from '../../../components/Layouts/PageLoader'
import { useNavigate } from 'react-router-dom';

export default function Card({ cardLoad, cardData }) {
    const navigate = useNavigate();
    return (
        <>
            {cardLoad ? <PageLoader /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6 text-white">

                    <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
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
                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{cardData?.ownTotalLeads}</div>
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
                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{cardData?.teamTotalLeads}</div>
                                <small>My Team's</small>
                            </div>
                        </div>
                    </div>
                    <div className="panel bg-gradient-to-r from-[#6bed3d] to-[#09e1cd]">
                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Closed Won</div>
                        <div className='flex justify-between mt-5'>
                            <div className='cursor-pointer w-full' onClick={() => {
                                navigate('/leads/viewleads', {
                                    state: {
                                        fStatus: "Closed Won",
                                        fState: 0,
                                    },
                                });
                            }}>
                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{cardData?.ownClosedWonLeads}</div>
                                <small>My Own</small>
                            </div>
                            <hr className='border-2 h-[50px]' />
                            <div className='cursor-pointer w-full text-end' onClick={() => {
                                navigate('/team-leads', {
                                    state: {
                                        fStatus: "Closed Won",
                                        fState: 0,
                                    },
                                });
                            }}>
                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{cardData?.teamClosedWonLeads}</div>
                                <small>My Team's</small>
                            </div>
                        </div>
                    </div>
                    <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Followup</div>
                        <div className='flex justify-between mt-5'>
                            <div className='cursor-pointer w-full' onClick={() => {
                                navigate('/leads/viewleads', {
                                    state: {
                                        fStatus: "Follow Up",
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
                                        fStatus: "Follow Up",
                                        fState: 0,
                                    },
                                });
                            }}>
                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{cardData?.teamFollowupLeads}</div>
                                <small>My Team's</small>
                            </div>
                        </div>
                    </div>
                    <div className="panel bg-gradient-to-r from-blue-500 to-blue-400">
                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Free Trial</div>
                        <div className='flex justify-between mt-5'>
                            <div className='cursor-pointer w-full' onClick={() => {
                                navigate('/leads/viewleads', {
                                    state: {
                                        fStatus: "Free Trial",
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
                                        fStatus: "Free Trial",
                                        fState: 0,
                                    },
                                });
                            }}>
                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{cardData?.teamFreeTrailLeads}</div>
                                <small>My Team's</small>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </>
    )
}
