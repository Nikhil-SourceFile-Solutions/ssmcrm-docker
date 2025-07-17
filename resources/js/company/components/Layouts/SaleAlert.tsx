import React, { useEffect, useState } from 'react'
import { FaMobileRetro } from 'react-icons/fa6';
import { GiSecurityGate } from 'react-icons/gi';
import { MdMarkEmailRead } from 'react-icons/md';
import { RiMoneyRupeeCircleFill } from "react-icons/ri";
import { TbTargetArrow } from "react-icons/tb";
function SaleAlert({ saleAlert }) {

    // console.log("saleAlert", saleAlert)

    const closeModal = () => {
        setIsOpen(false)
    };


    useEffect(() => {
        if (Object.keys(saleAlert).length != 0) {
            const broadcastAudio = new Audio('/sales-alert.wav');
            broadcastAudio.play();
            setIsOpen(true)
        }
    }, [saleAlert])







    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"

                    ></div>
                    <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-lg transform transition-all scale-95 animate-fadeIn">
                        <div className="flex items-center space-x-4">
                            <TbTargetArrow className={`text-[#0faa07] animate__bounceIn text-4xl `} />
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">{saleAlert?.title}</h2>

                                <h4 className='font-bold text-blue-900'>{saleAlert?.message}</h4>

                            </div>
                        </div>

                        <div className='flex justify-between mt-4 text-center'>

                            <div className='flex items-center gap-1'>
                                <FaMobileRetro color='#2196F3' /> <b className='text-[16px] text-[#2196F3]'>{saleAlert?.sale?.phone}</b>
                            </div>

                            <div className='flex items-center gap-1'>
                                <RiMoneyRupeeCircleFill size={20} color='#08735e' /> <b className='text-[16px] text-[#08735e]'>{saleAlert?.sale?.client_paid}</b>
                            </div>


                            <span className='badge bg-[#075E54]'>{saleAlert?.sale?.status}</span>


                        </div>


                        <div className="mt-4 flex justify-between items-center">

                            <div className='pr-2'>
                                <b>{saleAlert?.sale?.product}</b>
                            </div>

                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                            >
                                OK
                            </button>
                        </div>


                    </div>
                </div>
            )}
        </>
    )
}

export default SaleAlert