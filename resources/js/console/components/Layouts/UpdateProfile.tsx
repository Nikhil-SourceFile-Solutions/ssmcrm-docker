import React, { useEffect, useState } from 'react'
import { IoCloseSharp } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { Navigate, useNavigate } from 'react-router-dom';
import { setAuthUser, setCrmToken, setPageTitle } from '../../store/themeConfigSlice';
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import axios from 'axios';
const CrmSwal = withReactContent(Swal);
import { FaEye } from 'react-icons/fa';
import UpdatePasswordPin from './UpdatePasswordPin';
import { useAuth } from '../../AuthContext';


export default function UpdateProfile({ profileUpdateDrawer, showProfileUpdateDrawer, whatsappConfiguration }: any) {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { crmToken, apiUrl,authUser } = useAuth()



    useEffect(() => {
        if (!crmToken) dispatch(setCrmToken(''))
        else {
            dispatch(setPageTitle('Update Profile'));
        }
    }, [crmToken])

    const defaultParams = {
        first_name: "",
        last_name: "",
        // langauge_known: "",
        phone_number: "",


    };

    const [errors, setErrors] = useState<any>({});
    const [params, setParams] = useState<any>(defaultParams);

    useEffect(() => {
        if (authUser) {
            setParams({
                first_name: authUser.first_name,
                last_name: authUser.last_name,
                // langauge_known: authUser.langauge_known,
                phone_number: authUser.phone_number,
            });
        } else setParams(defaultParams)
    }, [authUser])



    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErrors({ ...errors, [name]: '' });
        setParams({ ...params, [name]: value });
        console.table(params)
    };


    const validate = () => {
        setErrors({});
        let errors = {};
        if (!params.first_name) {
            errors = { ...errors, first_name: 'first_name is required.' };
        }

        if (!params.last_name) {
            errors = { ...errors, last_name: 'last_name is required.' };
        }



        setErrors(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const [btnLoading, setBtnLoading] = useState(false);


    const storeOrUpdateApi = async (data: any) => {
        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/update-user-profile",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status === 'success') {
                showMessage(response.data.message);
                dispatch(setAuthUser(response.data.data))
                // showProfileUpdateDrawer(false)

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
    };
const a=params.first_name+params.last_name

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("id", authUser?.id);
        data.append("first_name", params.first_name);
        data.append("last_name", params.last_name);
        // data.append("langauge_known", params.langauge_known);
        data.append("phone_number", params.phone_number);
        // data.append("owner", a);

        storeOrUpdateApi(data);
    };

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


    const [updatePasswordPinModal, showUpdatePasswordPinModal] = useState(false)
    return (
        <div>
            <div className={`${(profileUpdateDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => showProfileUpdateDrawer(!profileUpdateDrawer)}></div>

            <nav
                className={`${(profileUpdateDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                    } bg-white fixed ltr:-right-[800px] rtl:-left-[800px] top-0 bottom-0 w-full max-w-[500px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4`}
            >
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className=' border-b border-grey p-2 flex justify-between' >
                        <button className="mb-1 dark:text-white font-bold">Update Profile</button>
                        <div className=' flex gap-2' >
                            <button onClick={() => { showUpdatePasswordPinModal(true) }} className=' btn btn-sm btn-primary' >Change Password/Pin</button>
                        </div>
                    </div>
                    <UpdatePasswordPin updatePasswordPinModal={updatePasswordPinModal} showUpdatePasswordPinModal={showUpdatePasswordPinModal} id={authUser?.id} />

                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">

                        <form autoComplete="off" action="" method="post" className='p-0'>
                            <div className='mb-4'>
                                <label  className='text-white-dark'>First Name</label>
                                <input type="text" placeholder="Enter Name" className="form-input"
                                    name="first_name"  onChange={(e) => changeValue(e)} value={params.first_name}
                                />
                                <div className="text-danger font-semibold text-sm">{errors.first_name}</div>
                            </div>

                            <div className='mb-4'>
                                <label  className='text-white-dark'>Last Name</label>
                                <div className="relative">
                                    <input
                                        type='text'
                                        placeholder=""

                                        className="form-input pr-10"
                                        name="last_name"
                                        onChange={(e) => changeValue(e)}
                                        value={params.last_name}
                                    />

                                </div>


                                <div className="text-danger font-semibold text-sm">{errors.last_name}</div>
                            </div>

                            <div className='mb-4'>
                                <label  className='text-white-dark'>Phone</label>
                                <input type="text" placeholder="" className="form-input"
                                    name="phone_number"  onChange={(e) => changeValue(e)} value={params.phone_number}
                                />
                                <div className="text-danger font-semibold text-sm">{errors.phone_number}</div>
                            </div>


                            <div className='flex justify-end gap-5 py-2'>
                                <button type="button" className='btn shadow' onClick={() => showProfileUpdateDrawer(false)}>Cancel</button>
                                <button type="button" onClick={() => formSubmit()} disabled={btnLoading} className="btn  btn-dark shadow bg-black">
                                    {btnLoading ? 'Please Wait...' : 'Update'}
                                </button>
                            </div>

                        </form>
                    </section>
                </div>
            </nav>
        </div>
    )
}
