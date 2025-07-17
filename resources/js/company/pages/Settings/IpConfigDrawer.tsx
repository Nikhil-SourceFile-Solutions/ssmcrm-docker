import React, { useEffect, useState } from 'react'
import { IoCloseSharp } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { Navigate, useNavigate } from 'react-router-dom';
import { setCrmToken, setPageTitle } from '../../store/themeConfigSlice';
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import axios from 'axios';
const CrmSwal = withReactContent(Swal);
import { FaEye } from 'react-icons/fa';
import { useAuth } from '../../AuthContext';


export default function IpConfigDrawer({settingData, showIpConfigDrawer, setShowIpConfigDrawer, whatsappConfiguration }: any) {

    const dispatch = useDispatch();
    const navigate = useNavigate();

  const { crmToken, apiUrl } = useAuth()

    useEffect(() => {
        if (!crmToken) dispatch(setCrmToken(''))
        else {
            dispatch(setPageTitle('Ip Config'));
        }
    }, [crmToken])

    const defaultParams = {
        username: "",
        password: "",
        token: "",
        get_message: "",
        send_message: "",
        send_otp: "",

    };


    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (whatsappConfiguration) {
            setParams({
                username: whatsappConfiguration.username,
                password: whatsappConfiguration.password,
                token: whatsappConfiguration.token,
                get_message: whatsappConfiguration.get_message,
                send_message: whatsappConfiguration.send_message,
                send_otp: whatsappConfiguration.send_otp,
            });
        } else setParams(defaultParams)
    }, [whatsappConfiguration])


    const [btnLoading, setBtnLoading] = useState(false);
    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };


    const [params, setParams] = useState({ crm_ip: '' });
    // const [errors, setErrors] = useState({});
    const [inputData, setInputData] = useState([]);


    const changeValue = (e) => {
        setParams({ ...params, [e.target.name]: e.target.value });
    };

    const addInputData = () => {
        // if (!params.crm_ip) {
        //     setErrors({ ...errors, crm_ip: 'crm_ip is required' });
        //     return;
        // }
        setInputData([...inputData, params.crm_ip]);
        setParams({ crm_ip: '' });  // Clear the input after adding
    };

    const submitData = async (data) => {
        if (inputData.length === 0) {
            alert('No data to submit');
            return;
        }
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/setting-ipconfig-store",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,

                },
            });

            if (response.data.status === 'success') {
                showMessage(response.data.message);
                setShowIpConfigDrawer(false)

            } else {
                alert("Error")
            }
        } catch (error: any) {
            if (error?.response?.status === 401) {
                dispatch(setCrmToken(""))
            } else if (error?.response?.status === 422) {

                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                    setErrors(serverErrors)
                    console.log(serveErrors[key][0])
                }

                CrmSwal.fire({
                    title: "Server Validation Error! Please solve",
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
    }

    const formSubmit = () => {
        const data = new FormData();
        data.append("crm_ip", inputData?inputData:'');
        data.append("id", settingData?.id);

        submitData(data);
    };
    return (
        <div>
            <div className={`${(showIpConfigDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setShowIpConfigDrawer(!showIpConfigDrawer)}></div>

            <nav
                className={`${(showIpConfigDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                    } bg-white fixed ltr:-right-[800px] rtl:-left-[800px] top-0 bottom-0 w-full max-w-[500px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4`}
            >
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className=' border-b border-grey p-2 flex justify-between' >
                        <button className="mb-1 dark:text-white font-bold">IP Configurations</button>
                        <button onClick={() => setShowIpConfigDrawer(false)}>
                            <IoCloseSharp className=" w-5 h-5" />
                        </button>
                    </div>

                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">

                        <form autoComplete="off" action="" method="post" className='p-0'>
                            <div className='mb-4'>
                                <label  className='text-white-dark'>Ip Config Name</label>
                                <div className=' flex gap-2' >
                                <input type="text" placeholder="" className="form-input"
                                    name="crm_ip" onChange={(e) => changeValue(e)} value={params.crm_ip}
                                />
                                 <button type='button' onClick={addInputData} className=' btn btn-sm btn-primary' >Add</button>
                                </div>

                                <div className="text-danger font-semibold text-sm">{errors.crm_ip}</div>

                            </div>
                             {/* Show the accumulated data */}
            <ul>
                {inputData.map((data, index) => (
                    <li key={index}>{data}</li>
                ))}
            </ul>
                            <div className='flex justify-end gap-5 py-2'>
                                <button type="button" className='btn shadow' onClick={() => setShowIpConfigDrawer(false)}>Cancel</button>
                                <button type="button" onClick={() => formSubmit()} disabled={btnLoading} className="btn  btn-dark shadow bg-black">
                                    {btnLoading ? 'Please Wait...' : 'Submit'}
                                </button>
                            </div>

                        </form>
                    </section>
                </div>
            </nav>
        </div>
    )
}
