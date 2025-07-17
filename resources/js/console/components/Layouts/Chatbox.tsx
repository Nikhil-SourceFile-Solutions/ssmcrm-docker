import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { IoCloseSharp } from "react-icons/io5";
import PerfectScrollbar from 'react-perfect-scrollbar';
import { IRootState } from '../../store';
import { useSelector, useDispatch } from 'react-redux'
import Swal from 'sweetalert2';
import { setCrmToken } from '../../store/themeConfigSlice';
import { useAuth } from '../../AuthContext';
export default function Chatbox({ showDrawer, setShowDrawer, chats, fetchChatbot }: any) {


    const [isLoading, setIsLoading] = useState(false);


    const { logout, crmToken, authUser, apiUrl } = useAuth();



    const dispatch = useDispatch();
    const [defaultParams] = useState({
        id: '',
        message: '',

    });
    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});
    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.message) {
            errors = { ...errors, message: "message is needed" };
        }
        console.log(errors);
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };
    const [btnLoading, setBtnLoading] = useState(false);

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
        // console.table(params)
    };
    const AddChatbox = async (data: any) => {
        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/broadcast",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {

                setParams(defaultParams)
                fetchChatbot()
            } else { alert("Failed") }

        } catch (error: any) {
            console.log(error)
            if (error.response.status == 401) dispatch(setCrmToken(''))
            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                    console.log(serveErrors[key][0])
                }
                setErros(serverErrors);
                Swal.fire({
                    title: "Server Validation Error! Please Solve",
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    showCancelButton: false,
                    width: 450,
                    timer: 2000,
                    customClass: {
                        popup: "color-danger"
                    }
                });
            }
        } finally {
            setBtnLoading(false)
        }
    };
    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("id", params.id);
        data.append("message", params.message);
        AddChatbox(data);
    };





    return (
        <div>
            <div className={`${(showDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setShowDrawer(false)}></div>

            <nav
                className={`${(showDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                    } bg-white fixed ltr:-right-[800px] rtl:-left-[800px] top-0 bottom-0 w-full max-w-[450px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black `}
            >
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className="w-full text-center  bg-white-light p-4">
                        <button type="button" className="px-4 py-4 absolute top-0 ltr:right-0 rtl:left-0 opacity-30 hover:opacity-100 dark:text-white" onClick={() => setShowDrawer(false)}>
                            <IoCloseSharp className=" w-5 h-5" />
                        </button>
                        <h3 className="mb-1 dark:text-white font-bold text-[18px]">Today's Advice</h3>
                    </div>
                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">

                        <PerfectScrollbar className="relative h-full sm:h-[calc(100vh_-_300px)] chat-conversation-box">
                            <div className="space-y-5 p-4 sm:pb-0 pb-[68px] sm:min-h-[300px] min-h-[400px]">
                                <div className="block m-6 mt-0">
                                    <h4 className="text-xs text-center border-b border-[#f4f4f4] dark:border-gray-800 relative">
                                        <span className="relative top-2 px-3 bg-white dark:bg-black">Today</span>
                                    </h4>
                                </div>

                                {
                                    chats?.map((chat) => {
                                        return (

                                            <div key={chat.id} className="flex items-start gap-3 justify-end">
                                                <div className="space-y-2">
                                                    <div className='flex justify-end gap-2 items-center'>
                                                        <div className="text-xs text-white-dark ltr:text-right rtl:text-left">
                                                            {chat.created_at}
                                                        </div>

                                                        <div className='flex gap-2 items-center'>
                                                            <b>Analyst</b>
                                                            <img className="w-6 h-6 rounded-full overflow-hidden object-cover" src="/assets/images/profile-12.jpeg" alt="img" />
                                                        </div>
                                                    </div>
                                                    <div className="flex float-right gap-3">
                                                        <div className="bg-[#DBE7FF] ltr:rounded-br-none p-4 py-2 rounded-md rtl:rounded-bl-none font-bold">
                                                            {chat.message}
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>

                                        )
                                    })
                                }

                            </div>
                        </PerfectScrollbar>
                    </section>
                    {
                        (authUser?.user_type === 'Admin' || authUser?.user_type === 'Analyst') && (
                            <footer className="w-full text-center border-t border-grey bg-white-light p-4">
                                <div className='mb-3'>
                                    <textarea id="message" name='message' value={params.message} onChange={(e) => { changeValue(e) }} rows={3} className="form-textarea" placeholder="Recommendations" required></textarea>
                                </div>
                                <div className='flex justify-end gap-5 py-2'>
                                    <button className='btn shadow' onClick={() => { alert('Under progess') }} >Older Broadcast</button>
                                    <button onClick={() => { formSubmit() }} disabled={btnLoading ? true : false} className='btn btn-success'>
                                        {btnLoading ? 'Sending Please Wait...' : ' Send Notification'}
                                    </button>
                                </div>
                            </footer>
                        )
                    }

                </div>
            </nav>
        </div>
    )
}







