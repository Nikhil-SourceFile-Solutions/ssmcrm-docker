import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { IoCloseSharp } from "react-icons/io5";
import PerfectScrollbar from 'react-perfect-scrollbar';
import { IRootState } from '../../store';
import { useSelector, useDispatch } from 'react-redux'
import { setCallBacktData } from '../../store/themeConfigSlice';
import PageLoader from './PageLoader';
import { useAuth } from '../../AuthContext';

export default function CallbackDrawer({ showCallbackDrawer, setShowCallbackDrawer }: any) {

    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const { crmToken, apiUrl, logout } = useAuth()
    const callBacktData = useSelector((state: IRootState) => state.themeConfig.callBacktData);


    const fetchCallbacks = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + '/api/get-callbacks',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken
                }
            })
            if (response.data.status == 'success') {
                dispatch(setCallBacktData(response.data.callbacks))
            }

        } catch (error) {
            console.log(error)
            if (error?.response?.status == 401) logout()
        }
        finally {
            setIsLoading(false)
        }

    }


    useEffect(() => {
        if (showCallbackDrawer) fetchCallbacks();
    }, [showCallbackDrawer]);


    return (
        <div>
            <div className={`${(showCallbackDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setShowCallbackDrawer(false)}></div>

            <nav
                className={`${(showCallbackDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                    } bg-white fixed ltr:-right-[800px] rtl:-left-[800px] top-0 bottom-0 w-full max-w-[450px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black `}
            >
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className="w-full text-center  p-4 bg-[#3b3f5c] text-white rounded-b-md">
                        <button type="button" className="px-4 py-4 absolute top-0 ltr:right-0 rtl:left-0 opacity-30 hover:opacity-100 dark:text-white" onClick={() => setShowCallbackDrawer(false)}>
                            <IoCloseSharp className=" w-5 h-5" />
                        </button>
                        <h3 className="mb-1 dark:text-white font-bold text-[18px]">Today's Callback</h3>
                    </div>
                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">

                        <PerfectScrollbar className="relative h-full  ">
                            <div className="space-y-5  sm:pb-0 pb-[68px] sm:min-h-[300px] min-h-[400px]">

                                {isLoading ? <PageLoader /> : callBacktData.length ? (
                                    <>

                                        {callBacktData.map((call) => (

                                            <div className={`mb-5 panel ${call.is_past ? 'bg-danger/10' : 'bg-[#DBE7FF]'}  mx-4`}>
                                                <div className="flex items-center justify-between  -m-5   p-5">
                                                    <button type="button" className="flex font-semibold">
                                                        <div className="shrink-0 bg-secondary w-10 h-10 rounded-md flex items-center justify-center text-white ltr:mr-2 rtl:ml-2">
                                                            <span>FD</span>
                                                        </div>
                                                        <div className='text-left'>
                                                            <h6>{call.first_name} {call.last_name}</h6>
                                                            <p className="text-xs text-white-dark mt-1">{call.phone}</p>
                                                        </div>
                                                    </button>


                                                    <div className='flex flex-col gap-2'>
                                                        <div className='text-end'><span className='badge bg-dark'>{call.time}</span></div>
                                                        <div className='text-end'><span className='badge bg-info '>{call.status}</span></div>
                                                    </div>
                                                </div>


                                                <div className='mt-2'>
                                                    <p className='text-[12px]'>{call.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : <div className='panel text-center text-[18px] font-medium bg-danger/10'>
                                    <h1>No Callbacks Today</h1>
                                </div>}




                            </div>
                        </PerfectScrollbar>
                    </section>
                    <footer className="w-full text-center border-t border-grey h-8 bg-[#3b3f5c] rounded-t-md">


                    </footer>
                </div>
            </nav>
        </div>
    )
}


