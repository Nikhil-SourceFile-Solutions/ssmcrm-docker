import React from 'react';
import { useEffect, useState } from 'react';
import { setPageTitle } from '../../../store/themeConfigSlice';
import { useDispatch, useSelector } from 'react-redux';
import IconArrowWaveLeftUp from '../../../components/Icon/IconArrowWaveLeftUp';
import axios from 'axios';
import Swal from 'sweetalert2';
import { IRootState } from '../../../store';
import { useAuth } from '../../../AuthContext';

const MoveLead = ({ fileInfo, setAction, checkLeadUpload }: any) => {

    const { logout, crmToken, apiUrl } = useAuth();



    const moveLeadData = useSelector((state: IRootState) => state.themeConfig.moveLeadData);
    const dispatch = useDispatch();


    useEffect(() => {
        dispatch(setPageTitle('Move Lead'));
    });
    const [activeTab, setActiveTab] = useState<String>('general');
    const [per, setPer] = useState(0);
    const [isMoving, setIsMoving] = useState(0);


    useEffect(() => {
        if (moveLeadData?.value) {
            setPer(moveLeadData.value)
            if (!isMoving) setIsMoving(true)
        }
    }, [moveLeadData])

    useEffect(() => {
        setIsMoving(fileInfo.is_moving)

        if (!fileInfo.is_moving) setPer(0)
    }, [fileInfo])




    const moveLead = async () => {
        setIsMoving(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/move-leads",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });
            if (response.data.status == "success") {

                Swal.fire({
                    icon: 'success',
                    title: response.data.message,
                    html: `<div class="text-dark font-extrabold w-[230px] m-auto">
                            <div class="mb-5 flex justify-between ">
                                <div><span>Total</span></div>
                                <div><b>${response.data.data.total}</b></div>
                            </div>
                            <div class="mb-5 flex justify-between ">
                                <div><span>Inserted</span></div>
                                <div><b>${response.data.data.inserted}</b></div>
                            </div>
                            <div class="mb-5 flex justify-between">
                                <div><span>Invalid</span></div>
                                <div><b>${response.data.data.invalid}</b></div>
                            </div>
                            <div class="mb-5 flex justify-between ">
                                <div><span>Duplicate</span></div>
                                <div><b>${response.data.data.duplicate}</b></div>
                            </div>
                          </div>`,
                    showCloseButton: true,
                    showCancelButton: false,
                    focusConfirm: false,
                    allowOutsideClick: false,
                    confirmButtonText: '<i className="flaticon-checked-1"></i> Great!',
                    padding: '2em',
                    customClass: 'sweet-alerts',
                }).then((result) => {
                    if (result.value) {
                        setAction('upload')
                        checkLeadUpload()
                    }
                });
            }
        } catch (error) {
            console.log(error)
            if (error?.response?.status == 401) logout()
        } finally {
            setIsMoving(false)
        }
    }
    return (
        <div>
            <div className="relative rounded-t-md bg-primary-light bg-[url(/assets/images/auth/map.png)] bg-contain bg-left-top bg-no-repeat px-5 py-10 dark:bg-black md:px-10">
                <div className="absolute -bottom-1 -end-6 hidden text-[#DBE7FF] rtl:rotate-y-180 dark:text-[#1B2E4B] lg:block xl:end-0">

                </div>
                <div className="relative">
                    <div className="flex flex-col items-center justify-center sm:-ms-32 sm:flex-row xl:-ms-60">
                        <div className="mb-2 flex gap-1 text-end text-base leading-5 sm:flex-col xl:text-xl">
                            <span>Lets Move</span>

                        </div>
                        <div className="me-4 ms-2 hidden sm:block text-[#0E1726] dark:text-white rtl:rotate-y-180">
                            <IconArrowWaveLeftUp className="w-16 xl:w-28" />
                        </div>
                        <div className="mb-2 text-center text-2xl font-bold dark:text-white md:text-5xl">{fileInfo.total} Leads </div>
                    </div>
                    <p className="mb-9 text-center text-base font-semibold">{fileInfo.total} Leads are ready to move to leads table</p>


                    {isMoving ? <div className='bg-black/10 rounded-full w-2/3 m-auto'>
                        <div
                            className={`bg-primary h-4 rounded-full animated-progress`}
                            style={{
                                backgroundImage:
                                    'linear-gradient(45deg,hsla(0,0%,100%,.15) 25%,transparent 0,transparent 50%,hsla(0,0%,100%,.15) 0,hsla(0,0%,100%,.15) 75%,transparent 0,transparent)',
                                backgroundSize: '1rem 1rem',
                                width: `${Math.round(per)}%`
                            }}
                        ></div>
                    </div> : ''}


                    <div className='mt-4'>
                        <button type="button" onClick={() => moveLead()} className="btn btn-primary  shadow-none m-auto" disabled={isMoving ? true : false}>
                            {isMoving ? 'Moving....' : 'Move Leads'}
                        </button>
                    </div>



                    <div className='text-center mt-5'>
                        <p><b><span className='text-black/75'>Leads Uploaded </span>{fileInfo.created_at}</b></p>
                    </div>

                </div>
            </div>
            <div className="mb-12 flex items-center rounded-b-md bg-[#DBE7FF] dark:bg-[#141F31]">
                <ul className="mx-auto flex items-center gap-5 overflow-auto whitespace-nowrap px-3 py-4.5 xl:gap-8">
                    <li
                        className={`group flex min-w-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md px-8 py-2.5 text-center text-[#506690] duration-300 hover:bg-white hover:text-primary dark:hover:bg-[#1B2E4B]
                    bg-white text-primary dark:bg-[#1B2E4B] `}

                    >
                        <b> {fileInfo.total}</b>

                        <h6 className="font-bold text-black dark:text-white">Total Leads</h6>
                    </li>
                    <li
                        className={`group flex min-w-[120px] cursor-pointer flex-col items-center justify-center gap-4 rounded-md px-8 py-2.5 text-center text-[#506690] duration-300 hover:bg-white hover:text-primary dark:hover:bg-[#1B2E4B]
                    ${activeTab === 'quick-support' ? 'bg-white text-primary dark:bg-[#1B2E4B]' : ''}`}

                    >
                        <b>-</b>

                        <h6 className="font-bold text-black dark:text-white">Invalid Leads</h6>
                    </li>
                    <li
                        className={`group flex min-w-[120px] cursor-pointer flex-col items-center justify-center gap-4 rounded-md px-8 py-2.5 text-center text-[#506690] duration-300 hover:bg-white hover:text-primary dark:hover:bg-[#1B2E4B]
                    ${activeTab === 'free-updates' ? 'bg-white text-primary dark:bg-[#1B2E4B]' : ''}`}

                    >
                        <b> -</b>

                        <h6 className="font-bold text-black dark:text-white">Duplicate Leads</h6>
                    </li>
                    <li
                        className={`group flex min-w-[120px] cursor-pointer flex-col items-center justify-center gap-4 rounded-md px-8 py-2.5 text-center text-[#506690] duration-300 hover:bg-white hover:text-primary dark:hover:bg-[#1B2E4B]
                    ${activeTab === 'pricing' ? 'bg-white text-primary dark:bg-[#1B2E4B]' : ''}`}

                    >
                        <b>-</b>

                        <h6 className="font-bold text-black dark:text-white">Moved Leads</h6>
                    </li>

                </ul>
            </div>





        </div>
    );
};

export default MoveLead;
