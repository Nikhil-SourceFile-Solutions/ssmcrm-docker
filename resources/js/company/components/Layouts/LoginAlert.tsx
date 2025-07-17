import React, { useEffect, useState } from 'react'
import { FaMobileRetro } from "react-icons/fa6";
import { MdMarkEmailRead } from "react-icons/md";
import { TbWorldCheck } from "react-icons/tb";
import { BsFillRouterFill } from "react-icons/bs";
import { GiSecurityGate } from "react-icons/gi";
function LoginAlert({ authAlert }) {

    // console.log("authAlert", authAlert)

    const closeModal = () => {
        setIsOpen(false)
    };


    useEffect(() => {
        if (Object.keys(authAlert).length != 0) setIsOpen(true)
    }, [authAlert])


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
                            <GiSecurityGate className={`${authAlert.action == "login" ? 'text-[#0faa07]' : 'text-[#ff1e1e]'} animate__bounceIn text-4xl `} />
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">{authAlert?.title}</h2>

                                <h4 className='font-bold text-blue-900'>{authAlert?.message}</h4>

                            </div>
                        </div>

                        <div className='flex justify-between mt-4 text-center'>
                            <div className='flex items-center gap-2'>
                                <MdMarkEmailRead size={20} color='#08735e' /> <b className='text-[16px] text-[#08735e]'>{authAlert?.user?.email}</b>
                            </div>

                            {authAlert?.user?.phone_number ? (<> <div className='flex items-center gap-1'>
                                <FaMobileRetro color='#2196F3' /> <b className='text-[16px] text-[#2196F3]'>{authAlert?.user?.phone_number}</b>
                            </div></>) : null}


                        </div>


                        <div className="mt-4 flex justify-between items-center">

                            <div>
                                <div className='flex items-center gap-1'>
                                    <TbWorldCheck size={20} color='#fc5718' /> <b className='text-[16px] text-[#fc5718]'>{authAlert?.track?.browser
                                    }</b>
                                </div>

                            </div>

                            <div>
                                <div className='flex items-center gap-2'>
                                    <BsFillRouterFill size={20} color='#a60c6a' /> <b className='text-[16px] text-[#a60c6a]'>{authAlert?.track?.ip_address

                                    }</b>
                                </div>
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
    );
}

export default LoginAlert