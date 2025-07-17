import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { PiBroadcastFill } from "react-icons/pi";
import { setBroadcast } from "../../store/themeConfigSlice";

function BroadCastAlert({ broadcast, isOpen, setIsOpen }) {

    const dispatch = useDispatch();
    const closeModal = () => setIsOpen(false);
    const [broadcastAudio] = useState(() => new Audio('/broadcast.wav'));

    useEffect(() => {
        if (isOpen) broadcastAudio.play();
        console.log("broadcast", broadcast)
        if (broadcast.new) dispatch(setBroadcast(JSON.stringify({ ...broadcast, new: false })))
    }, [isOpen, broadcast])

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"

                    ></div>
                    {/* Modal Content */}
                    <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-lg transform transition-all scale-95 animate-fadeIn">
                        <div className="flex items-center space-x-4">
                            <PiBroadcastFill className="text-red-500 text-4xl animate-[spin_2s_linear_infinite]" />
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">New Broadcast</h2>

                            </div>
                        </div>

                        <p className="text-sm text-[#ff0303] mt-4 font-bold">
                            {broadcast.message}
                        </p>
                        <div className="mt-4 flex justify-between items-center">

                            <div>
                                <b>{broadcast.created_at}</b>
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

export default BroadCastAlert
