import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { IoCloseSharp } from 'react-icons/io5'
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useAuth } from '../../AuthContext';
import PageLoader from './PageLoader';
import { FaEye } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
export default function Search({ searchDrawer, setSearchDrawer }) {

    const { logout, crmToken, apiUrl } = useAuth();
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [data, setData] = useState('');
    useEffect(() => {
        if (searchDrawer) {
            setSearch('')
            setData('')
        }
    }, [searchDrawer])



    useEffect(() => {

        if (search && search.length >= 5 && isDigits(search)) {
            searchApi()
        }

    }, [search])


    function isDigits(value: string) {
        return /^\d+$/.test(value);
    }

    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);

    const searchApi = async () => {
        setSearching(true);
        setSearched(false)
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/global-search",
                params: { search: search },
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setData(response.data.leads)
            }

            setSearched(true)

        } catch (error) {
            console.log(error)


        } finally {
            setSearching(false);
        }
    }
    return (
        <div>
            <div className={`${(searchDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setSearchDrawer(false)}></div>

            <nav
                className={`${(searchDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                    } bg-white fixed ltr:-right-[800px] rtl:-left-[800px] top-0 bottom-0 w-full max-w-[450px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black `}
            >
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className="w-full text-center  p-4 bg-[#3b3f5c] text-white rounded-b-md">
                        <button type="button" className="px-4 py-4 absolute top-0 ltr:right-0 rtl:left-0 opacity-30 hover:opacity-100 dark:text-white" onClick={() => setSearchDrawer(false)}>
                            <IoCloseSharp className=" w-5 h-5" />
                        </button>
                        <h3 className="mb-1 dark:text-white font-bold text-[18px]">Search Lead By Phone</h3>
                    </div>
                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">

                        <PerfectScrollbar className="relative h-full  ">
                            <div className="space-y-5  sm:pb-0 pb-[68px] sm:min-h-[300px] min-h-[400px]">

                                <div className="p-4">

                                    <div className="relative">
                                        <input
                                            type="tel"
                                            className="form-input ltr:pl-9 rtl:pr-9 ltr:sm:pr-4 rtl:sm:pl-4 ltr:pr-9 rtl:pl-9 peer sm:bg-transparent bg-gray-100 placeholder:tracking-widest"
                                            placeholder="Enter minimum 5 digits.."
                                            name='global-search'
                                            value={search}
                                            onChange={(e: any) => setSearch(e.target.value)}
                                        />
                                        <button type="button" className="absolute w-9 h-9 inset-0 ltr:right-auto rtl:left-auto appearance-none peer-focus:text-primary">
                                            <svg className="mx-auto" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="11.5" cy="11.5" r="9.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
                                                <path d="M18.5 18.5L22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                        </button>
                                        <button type="button" className="hover:opacity-80 sm:hidden block absolute top-1/2 -translate-y-1/2 ltr:right-2 rtl:left-2" onClick={() => setSearch(false)}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle opacity="0.5" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                                                <path d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                        </button>
                                    </div>

                                    <button
                                        type="button"

                                        className="search_btn sm:hidden p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:bg-white-light/90 dark:hover:bg-dark/60"
                                    >
                                        <svg className="w-4.5 h-4.5 mx-auto dark:text-[#d0d2d6]" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="11.5" cy="11.5" r="9.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
                                            <path d="M18.5 18.5L22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                    </button>
                                </div>

                                <>
                                    {searching ? <PageLoader /> : (
                                        <>

                                            {searched ?
                                                data.length ? (

                                                    data?.map((lead: any) => (
                                                        <div className='flex justify-between items-center bg-[#fafafa] m-4 rounded p-4'>
                                                            <div className='min-w-[300px]'>
                                                                <div className='flex justify-between items-center'>
                                                                    <b>{lead.f_name} {lead.l_name}</b>

                                                                    <b>{lead.phone}</b>
                                                                </div>

                                                                <div className='flex justify-between items-center'>
                                                                    <span className={`badge ${lead.status == "Closed Won" ? 'bg-success' : 'bg-[#1d67a7]'}`}>{lead.status}</span>


                                                                    <div className="flex items-center mt-2">
                                                                        <img className="w-6 h-6 rounded-md ltr:mr-3 rtl:ml-3 object-cover" src={`https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${lead.first_name + ' ' + lead.last_name}`} alt="avatar" />
                                                                        <span className="whitespace-nowrap"><b>{lead.first_name} {lead.last_name}</b></span>
                                                                    </div>

                                                                </div>
                                                            </div>

                                                            <span><FaEye size={25} onClick={() => { navigate('/search-leads', { state: { lead_id: lead.id } }); setSearchDrawer(false) }} /></span>
                                                        </div>
                                                    ))

                                                ) : <div className='bg-secondary-light font-bold m-4 p-6 rounded text-[20px] text-center'>
                                                    No Data Found
                                                </div> : null
                                            }


                                        </>
                                    )}

                                </>

                                {/* {isLoading ? <PageLoader /> : callBacks.length ? (
                                <>

                                    {callBacks.map((call) => (

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
                                                <p className='text-[12px]'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur sequi libero perspiciatis sunt cupiditate qui, illo, temporibus accusamus quos magnam voluptatibus autem accusantium reprehenderit architecto pariatur, ex adipisci quas similique.</p>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : <div className='panel text-center text-[18px] font-medium bg-danger/10'>
                                <h1>No Callbacks Today</h1>
                            </div>} */}




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
