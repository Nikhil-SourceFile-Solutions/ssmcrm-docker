import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { TbLivePhotoFilled } from "react-icons/tb";
import { FaPhoneVolume } from "react-icons/fa6";
import { setDocumentAlets } from '../../store/themeConfigSlice';
import { useNavigate } from 'react-router-dom';
function DocumentAlets() {

    const documentAlets = useSelector((state: IRootState) => state.themeConfig.documentAlets);
    const [broadcastAudio] = useState(() => new Audio('/broadcast.wav'));
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        if (documentAlets) {
            setData(JSON.parse(documentAlets))
            setIsOpen(true)
            broadcastAudio.play();
        } else setIsOpen(false)
    }, [documentAlets])

    const [data, setData] = useState<any>(null);



    const closeModal = () => {
        dispatch(setDocumentAlets(null))
    };




    const [isOpen, setIsOpen] = useState(false);

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
                            <TbLivePhotoFilled className="text-[#a60c6a] text-4xl animate-[spin_2s_linear_infinite]" />
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">{data?.action}</h2>

                                <h4 className='font-bold text-blue-900'>{data?.title}</h4>

                            </div>
                        </div>

                        <div className='flex justify-between mt-4 text-center'>
                            <div className='flex items-center gap-2'>
                                <FaPhoneVolume color='#08735e' /> <b className='text-[16px] text-[#08735e]'>{data?.phone}</b>
                            </div>

                            <div className='flex items-center gap-3'>
                                {data?.action == "Agreement" ? (

                                    <button className='btn btn-sm shadow btn-secondary' onClick={() => {
                                        navigate('/sales/show', {
                                            state: {
                                                sale_id: data.sale_id,
                                                filterOwner: 0,
                                                filterStatus: 0,
                                            }
                                        });
                                        setIsOpen(false)
                                    }}>View Sale</button>

                                ) : null
                                }

                                <button className='btn btn-sm shadow btn-info' onClick={() => {
                                    navigate('/leads/viewleads/show', {
                                        state: {
                                            lead_id: data.lead_id,
                                            filterOwner: 0,
                                            filterStatus: 0,
                                            filterState: 0,
                                            multyLead: 0,
                                        }
                                    });
                                    setIsOpen(false)
                                }}>View Lead</button>
                            </div>

                        </div>


                        <div className="mt-4 flex justify-end items-center">

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

export default DocumentAlets