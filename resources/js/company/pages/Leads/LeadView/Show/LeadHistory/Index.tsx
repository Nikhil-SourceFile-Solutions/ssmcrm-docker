import React, { useState } from 'react'
import { IoCloseSharp } from 'react-icons/io5';
import StatusHistory from './StatusHistory';
import SalesHistory from './SalesHistory';

function Index({ leadHistoryDrawer, setLeadHistoryDrawer, lead_id }) {


    const [tab, setTab] = useState('status-history');
    return (
        <div>
            <div className={`${(leadHistoryDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setLeadHistoryDrawer(false)}></div>
            <nav
                className={`${(leadHistoryDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                    } bg-white fixed ltr:-right-[800px] rtl:-left-[800px] top-0 bottom-0 w-full max-w-[650px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black `}
            >
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className="w-full text-center  p-4 bg-[#3b3f5c] text-white rounded-b-md">
                        <button type="button" className="px-4 py-4 absolute top-0 ltr:right-0 rtl:left-0 opacity-30 hover:opacity-100 dark:text-white" onClick={() => setLeadHistoryDrawer(false)}>
                            <IoCloseSharp className=" w-5 h-5" />
                        </button>
                        <h3 className="mb-1 dark:text-white font-bold text-[18px]">Lead  History</h3>
                    </div>
                    <div className='flex gap-4'>
                        <button
                            className={`${tab == "status-history" && 'text-secondary !outline-none before:!w-full'}
                        before:inline-block' relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`}
                            onClick={() => setTab('status-history')}
                            type='button'
                        >
                            Status History
                        </button>
                        <button
                            className={`${tab == "sales-history" && 'text-secondary !outline-none before:!w-full'}
                        before:inline-block' relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`}
                            onClick={() => setTab('sales-history')} type='button'>
                            Sales History
                        </button>
                    </div>


                    {tab == "status-history" ? <StatusHistory leadHistoryDrawer={leadHistoryDrawer} tab={tab} lead_id={lead_id} /> : tab == "sales-history" ? <SalesHistory leadHistoryDrawer={leadHistoryDrawer} tab={tab} lead_id={lead_id} /> : null}




                </div>
            </nav>
        </div>
    )
}

export default Index