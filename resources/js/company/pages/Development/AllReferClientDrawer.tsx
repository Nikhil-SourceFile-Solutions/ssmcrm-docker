import React,{ useState, Fragment, useEffect } from 'react';
import ViewReferClient from './ViewReferClient';



export default function AllReferClientDrawer({
    showAllReferClientDrawer,
    setShowReferClientDrawer,
    referClient,
    tab,
    referredData
}: any) {



    return (
        <div>
            <div className={`${(showAllReferClientDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setShowReferClientDrawer(false)}></div>

            <nav className={`${(showAllReferClientDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                }  bg-white fixed ltr:-right-[900px] rtl:-left-[900px] top-0 bottom-0 w-full max-w-[700px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black `}
            >
                {
                    tab=='view-referred-client'?
                    <div className="flex flex-col h-screen overflow-hidden py-4">
                    <div className="w-full text-center">
                        <div className="p-1 flex sm:flex-row flex-col w-full sm:items-center gap-4 px-4">
                            <div className="ltr:mr-3 rtl:ml-3 flex items-center">
                                <h5 className="font-semibold text-lg dark:text-white-light"> All Referred Clients</h5>
                            </div>

                        </div>
                        <hr className="mt-4 dark:border-[#191e3a]" />
                    </div>

                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar py-6 px-4">
                        <div className='gap-6 w-full'>
                        { referClient.map((lead: any) => (
                                                <div className=" py-1.5 relative group">
                                                    <div className='flex items-center  relative group'>
                                                        <div className="flex-1">{lead.client}</div>
                                                        <div className="ltr:ml-auto rtl:mr-auto text-xs text-dark dark:text-gray-500">{lead.phone}</div>
                                                    </div>
                                                    <div className='flex items-center'>
                                                        <div className="ltr:ml-auto rtl:mr-auto text-xs text-dark dark:text-gray-500">Refered by:{lead.owner}</div>
                                                    </div>
                                                <hr />

                                                </div>
                                            ))}
                        </div>




                    </section>
                </div>
                :
                <ViewReferClient referredData={referredData} />
                }

            </nav>




        </div >
    )





}
