import React, { PropsWithChildren, Suspense, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import App from '../../App';
import { IRootState } from '../../store';
import { setBroadcast, setChatMessage, setDocumentAlets, setLeadRequestCount, setMoveLeadData, toggleSidebar } from '../../store/themeConfigSlice';
import Footer from './Footer';
import Header from './Header';

import Sidebar from './Sidebar';
import Portals from '../../components/Portals';
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../../firebase/firebaseConfig";
const VITE_APP_VAPID_KEY = 'BKftQIV8GrvaQ5jb2FH-ohnYfJjTMQkXy9MW5GMmrcT_RQpPn3U-ZryMWSCwvhZhjVno1TcG-0ZCu7RRGr-NpNQ';
import { toast, ToastContainer } from "react-toastify";
import Message from "./Message";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Callback from './Callback';
import { useAuth } from '../../AuthContext';
import DocumentAlets from './DocumentAlets';
import LoginAlert from './LoginAlert';
import SaleAlert from './SaleAlert';

interface CallBackData {
    date_time: string; // Adjust based on your actual data structure
}

interface Props {
    callBacktData: CallBackData[];
}

const DefaultLayout = ({ children }: PropsWithChildren) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const { settingData, crmToken, apiUrl, logout } = useAuth()

    const callBacktData = useSelector((state: IRootState) => state.themeConfig.callBacktData);
    const callBacktAlertIds = useSelector((state: IRootState) => state.themeConfig.callBacktAlertIds);


    useEffect(() => {
        if (!crmToken) {
            console.log("#####################  UNAUTHENTICATED       ##########################")
            console.log("#####################  CLEARED ALL AUTH DATA ##########################")
            console.log("#####################  FOURCING TO LOGIN     ##########################")
            localStorage.clear();
            navigate('/login')
        } else setTimeout(() => {
            requestPermission();
        }, 5000);
    }, [crmToken])

    const [callbackAudio] = useState(new Audio('/callback.wav'));




    useEffect(() => {
        const storedIds = localStorage.getItem('callBacktAlertIds');
        const callBacktAlertIds: number[] = storedIds ? JSON.parse(storedIds) : [];
        callBacktAlertIds.forEach(id => clearTimeout(id));
        const alertIds: number[] = [];
        if (!callBacktData.length) return;

        callBacktData.forEach(data => {
            const time = data.date_time;
            const alertTime = new Date(time.replace(' ', 'T')).getTime();
            const now = Date.now();
            const diffInMilliseconds = alertTime - now;
            if (diffInMilliseconds > 0) {
                const timeoutDuration = diffInMilliseconds - (60 * 1000);
                if (timeoutDuration < 0) {
                    _CALLBACK(data);
                } else {
                    const id = setTimeout(() => {
                        _CALLBACK(data);
                    }, timeoutDuration);
                    alertIds.push(id);
                }
            }
        });

        localStorage.setItem('callBacktAlertIds', JSON.stringify(alertIds));
        return () => {
            alertIds.forEach(id => clearTimeout(id));
        };
    }, [callBacktData]);

    const [callbackData, setCallbackData] = useState();

    // {
    //     date_time: "2024-07-24 17:35:00",
    //     description: "test",
    //     first_name: "eeee",
    //     id: 4,
    //     last_name: "ffff",
    //     phone: "2223336363",
    //     status: "New"
    // }
    const [callbackModal, setCallbackModal] = useState(false);
    const _CALLBACK = (data: any) => {
        callbackAudio.play();
        setCallbackModal(true)
        setCallbackData(data)
    }




    const [showLoader, setShowLoader] = useState(true);
    const [showTopButton, setShowTopButton] = useState(false);

    const goToTop = () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    };

    const onScrollHandler = () => {
        if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
            setShowTopButton(true);
        } else {
            setShowTopButton(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', onScrollHandler);

        const screenLoader = document.getElementsByClassName('screen_loader');
        if (screenLoader?.length) {
            screenLoader[0].classList.add('animate__fadeOut');
            setTimeout(() => {
                setShowLoader(false);
            }, 200);
        }

        return () => {
            window.removeEventListener('onscroll', onScrollHandler);
        };
    }, []);



    async function requestPermission() {
        const permission = await Notification.requestPermission();
        console.log(permission)
        if (permission === "granted") {
            const token = await getToken(messaging, {
                vapidKey: VITE_APP_VAPID_KEY,
            });
            updateFcmToken(token)
        } else if (permission === "denied") {
            alert("You denied for the notification");
        }
    }
    //


    const updateFcmToken = async (token: string) => {

        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/fcm-token",
                data: { fcm_token: token },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") {
                console.log("************************")
                console.log(response.data.message)
                console.log("************************")
            }
        } catch (error) {
            if (error?.response?.status == 401) logout()
        }

    }



    useEffect(() => {
        const unsubscribe = onMessage(messaging, (payload) => {
            handleNotification(payload)
        });
        return () => {
            unsubscribe();
        };
    }, []);


    const handleNotification = (payload) => {

        // console.log(payload)
        console.log(payload?.data)

        // console.log(payload?.data?.action)


        // alert(JSON.stringify(payload))

        if (payload?.data?.action == "lead-move") dispatch(setMoveLeadData(payload.data))
        if (payload?.data?.action == "lead-request") {
            toast(<Message payload={payload} />)

        }



        else if (payload?.data?.action == "new-chat-message") dispatch(setChatMessage(payload.data))
        else if (payload?.data?.action == "lead-request") dispatch(setLeadRequestCount(payload.data.totalRequest))
        else if (payload?.data?.action == "new-broadcast") dispatch(setBroadcast(payload?.data?.message))
        else if (payload?.data?.action == "documents") dispatch(setDocumentAlets(payload?.data?.message))
        else if (payload?.data?.action == "auth") setAuthAlert(JSON.parse(payload?.data?.message))
        else if (payload?.data?.action == "sale") setSaleAlert(JSON.parse(payload?.data?.message))
    }

    const [authAlert, setAuthAlert] = useState({});
    const [saleAlert, setSaleAlert] = useState({});


    return (


        <App>
            {/* BEGIN MAIN CONTAINER */}
            <div className="relative">
                {/* sidebar menu overlay */}
                <div className={`${(!themeConfig.sidebar && 'hidden') || ''} fixed inset-0 bg-[black]/60 z-50 lg:hidden`} onClick={() => dispatch(toggleSidebar())}></div>
                {/* screen loader */}
                {/* {showLoader && (
                    <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                        <svg width="64" height="64" viewBox="0 0 135 135" xmlns="http://www.w3.org/2000/svg" fill="#4361ee">
                            <path d="M67.447 58c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10zm9.448 9.447c0 5.523 4.477 10 10 10 5.522 0 10-4.477 10-10s-4.478-10-10-10c-5.523 0-10 4.477-10 10zm-9.448 9.448c-5.523 0-10 4.477-10 10 0 5.522 4.477 10 10 10s10-4.478 10-10c0-5.523-4.477-10-10-10zM58 67.447c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10z">
                                <animateTransform attributeName="transform" type="rotate" from="0 67 67" to="-360 67 67" dur="2.5s" repeatCount="indefinite" />
                            </path>
                            <path d="M28.19 40.31c6.627 0 12-5.374 12-12 0-6.628-5.373-12-12-12-6.628 0-12 5.372-12 12 0 6.626 5.372 12 12 12zm30.72-19.825c4.686 4.687 12.284 4.687 16.97 0 4.686-4.686 4.686-12.284 0-16.97-4.686-4.687-12.284-4.687-16.97 0-4.687 4.686-4.687 12.284 0 16.97zm35.74 7.705c0 6.627 5.37 12 12 12 6.626 0 12-5.373 12-12 0-6.628-5.374-12-12-12-6.63 0-12 5.372-12 12zm19.822 30.72c-4.686 4.686-4.686 12.284 0 16.97 4.687 4.686 12.285 4.686 16.97 0 4.687-4.686 4.687-12.284 0-16.97-4.685-4.687-12.283-4.687-16.97 0zm-7.704 35.74c-6.627 0-12 5.37-12 12 0 6.626 5.373 12 12 12s12-5.374 12-12c0-6.63-5.373-12-12-12zm-30.72 19.822c-4.686-4.686-12.284-4.686-16.97 0-4.686 4.687-4.686 12.285 0 16.97 4.686 4.687 12.284 4.687 16.97 0 4.687-4.685 4.687-12.283 0-16.97zm-35.74-7.704c0-6.627-5.372-12-12-12-6.626 0-12 5.373-12 12s5.374 12 12 12c6.628 0 12-5.373 12-12zm-19.823-30.72c4.687-4.686 4.687-12.284 0-16.97-4.686-4.686-12.284-4.686-16.97 0-4.687 4.686-4.687 12.284 0 16.97 4.686 4.687 12.284 4.687 16.97 0z">
                                <animateTransform attributeName="transform" type="rotate" from="0 67 67" to="360 67 67" dur="8s" repeatCount="indefinite" />
                            </path>
                        </svg>
                    </div>
                )} */}
                <div className="fixed bottom-6 ltr:right-6 rtl:left-6 z-50">
                    {showTopButton && (
                        <button type="button" className="btn btn-outline-primary rounded-full p-2 animate-pulse bg-[#fafafa] dark:bg-[#060818] dark:hover:bg-primary" onClick={goToTop}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* BEGIN APP SETTING LAUNCHER */}

                {/* <LeftnavDrawer /> */}
                {/* END APP SETTING LAUNCHER */}

                <div className={`${themeConfig.navbar} main-container text-black dark:text-white-dark min-h-screen`}>
                    {/* BEGIN SIDEBAR */}
                    <Sidebar />
                    {/* END SIDEBAR */}

                    <div className="main-content flex flex-col min-h-screen">
                        {/* BEGIN TOP NAVBAR */}
                        <Header _CALLBACK={_CALLBACK} />
                        {/* END TOP NAVBAR */}
                        {/* <button type="button" onClick={() => setCallbackModal(true)} className="btn btn-primary">
                            Standard
                        </button> */}

                        <Callback callbackModal={callbackModal} setCallbackModal={setCallbackModal} callbackData={callbackData} />
                        {/* BEGIN CONTENT AREA */}
                        <Suspense>
                            <DocumentAlets />
                            <div className={`${themeConfig.animation}   p-3 animate__animated`}>{children}</div>
                            <LoginAlert authAlert={authAlert} />

                            <SaleAlert saleAlert={saleAlert} />


                        </Suspense>
                        {/* END CONTENT AREA */}

                        {/* BEGIN FOOTER */}
                        <Footer />
                        {/* END FOOTER */}
                        <Portals />
                    </div>
                </div>
                <ToastContainer />
            </div>
        </App>
    );
};

export default DefaultLayout;
