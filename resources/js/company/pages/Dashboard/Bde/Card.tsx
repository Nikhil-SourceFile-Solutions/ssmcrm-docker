import React from 'react'
import PageLoader from '../../../components/Layouts/PageLoader'
import { useNavigate } from 'react-router-dom';

export default function Card({ fetchingCard, cardData }) {
    const navigate = useNavigate();
    return (
        <>
            {fetchingCard ? <PageLoader /> : (
                <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5 gap-6 mb-6 text-white">

                    <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400 cursor-pointer " onClick={() => {
                        navigate('/leads/viewleads', {
                            state: {
                                fStatus: 0,
                                fState: 0,
                            },
                        });
                    }}>
                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Total Leads</div>
                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">{cardData?.totalLeads}</div>
                    </div>
                    <div className="panel bg-gradient-to-r from-[#6bed3d] to-[#09e1cd] cursor-pointer" onClick={() => {
                        navigate('/leads/viewleads', {
                            state: {
                                fStatus: 'Closed Won',
                                fState: 0,
                            },
                        });
                    }}>
                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Closed Won</div>
                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">{cardData?.closedWon}</div>
                    </div>


                    <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400 cursor-pointer" onClick={() => {
                        navigate('/leads/viewleads', {
                            state: {
                                fStatus: 'Follow Up',
                                fState: 0,
                            },
                        });
                    }}>
                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Followup</div>
                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">{cardData?.followUp}</div>
                    </div>


                    <div className="panel bg-gradient-to-r from-blue-500 to-blue-400 cursor-pointer" onClick={() => {
                        navigate('/leads/viewleads', {
                            state: {
                                fStatus: 'Free Trial',
                                fState: 0,
                            },
                        });
                    }}>
                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold ">Free Trial</div>
                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">{cardData?.freeTrail}</div>
                    </div>


                    <div className="panel bg-gradient-to-r from-fuchsia-500 to-fuchsia-400  cursor-pointer" onClick={() => {
                        navigate('/leads/viewleads', {
                            state: {
                                fStatus: 0,
                                fState: 0,
                            },
                        });
                    }}>
                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Others</div>
                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">{cardData?.others}</div>
                    </div>
                </div>
            )}
        </>
    )
}
