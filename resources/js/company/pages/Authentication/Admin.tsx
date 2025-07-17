import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import React, { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import axios from 'axios';

import { useToast } from '../../ToastContext ';

export default function Admin({ setAction }: any) {

    const { addToast } = useToast();
    const dispatch = useDispatch();
    const apiUrl = useSelector((state: IRootState) => state.themeConfig.apiUrl);

    useEffect(() => {
        dispatch(setPageTitle("Admin Onboarding"))
    }, [])

    const [defaultParams] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
        crm_link: '',

    });




    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});

    const validate = () => {
        setErros({});
        let errors = {};

        if (!params.crm_link) {
            errors = { ...errors, crm_link: "crm link is required!" };
        }



        if (!params.first_name) {
            errors = { ...errors, first_name: "first name is required!" };
        }
        if (!params.last_name) {
            errors = { ...errors, last_name: "last name is required!" };
        }



        if (!params.email) {
            errors = { ...errors, email: "email is required!" };
        }

        if (!params.phone_number) {
            errors = { ...errors, phone_number: "phone number is required!" };
        }

        if (!params.password) {
            errors = { ...errors, password: "password is required!" };
        } else if (params.password != params.password_confirmation) {
            errors = { ...errors, password_confirmation: "password missmatch!" };
        }
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const changeValue = (e: any) => {
        const { value, name, type, checked } = e.target;
        setErros({ ...errors, [name]: "" });
        if (type == "checkbox") setParams({ ...params, [name]: checked ? 1 : 0 });
        else setParams({ ...params, [name]: value });
    };

    const [isBtnLoading, setiSBtnLoading] = useState(false);

    const AdminApi = async (data: any) => {
        setiSBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/admin",

                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.status == 'success' && response.data.action == "login") {
                setAction('login')

                addToast({
                    variant: 'success',
                    title: response.data.message,
                });
            }

        } catch (error: any) {
            console.log(error)
            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                    console.log(serveErrors[key][0])
                }
                setErros(serverErrors);

                addToast({
                    variant: 'error',
                    title: 'Server Validation Error! Please Solve',
                });

            }
        } finally {
            setiSBtnLoading(false)
        }
    };

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) {
            addToast({
                variant: 'error',
                title: 'Validation Error! Please Solve',
            });
            return false;
        }
        const data = new FormData();
        data.append("first_name", params.first_name);
        data.append("last_name", params.last_name);
        data.append("email", params.email);
        data.append("phone_number", params.phone_number);
        data.append("password", params.password);
        data.append("password_confirmation", params.password_confirmation);

        data.append("crm_link", params.crm_link);

        AdminApi(data);
    };


    return (
        <div className="relative w-full max-w-[700px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
            <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-8 lg:min-h-[auto] py-6">
                <div className="space-y-5 mx-auto w-full ">
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Admin Onboarding</h1>
                        <p className="text-base font-bold leading-normal text-white-dark">Setting Up Your CRM Admin Account</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label >CRM Link</label>
                            <div className="relative text-white-dark">
                                <input name="crm_link" type="text" placeholder="Enter crm link" className="form-input ps-10 placeholder:text-white-dark"
                                    onChange={(e) => changeValue(e)}
                                />
                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                    <IconMail fill={true} />
                                </span>
                            </div>
                            <span className='text-danger'>
                                {errors?.crm_link ? errors.crm_link : ''}
                            </span>
                        </div>




                    </div>

                    <hr />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label >First Name</label>
                            <div className="relative text-white-dark">
                                <input name="first_name" type="text" placeholder="Enter First Name" className="form-input ps-10 placeholder:text-white-dark"
                                    onChange={(e) => changeValue(e)}
                                />
                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                    <IconMail fill={true} />
                                </span>
                            </div>
                            <span className='text-danger'>
                                {errors?.first_name ? errors.first_name : ''}
                            </span>
                        </div>
                        <div>
                            <label >Last Name</label>
                            <div className="relative text-white-dark">
                                <input name="last_name" type="text" placeholder="Enter Last Name" className="form-input ps-10 placeholder:text-white-dark"
                                    onChange={(e) => changeValue(e)}
                                />
                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                    <IconMail fill={true} />
                                </span>
                            </div>
                            <span className='text-danger'>
                                {errors?.last_name ? errors.last_name : ''}
                            </span>
                        </div>
                    </div>



                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label >Email</label>
                            <div className="relative text-white-dark">
                                <input name="email" type="email" placeholder="Enter Email" className="form-input ps-10 placeholder:text-white-dark"
                                    onChange={(e) => changeValue(e)}
                                />
                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                    <IconMail fill={true} />
                                </span>
                            </div>
                            <span className='text-danger'>
                                {errors?.email ? errors.email : ''}
                            </span>
                        </div>
                        <div>
                            <label >Phone Number</label>
                            <div className="relative text-white-dark">
                                <input name="phone_number" type="tel" maxLength={10} placeholder="Enter phone number" className="form-input ps-10 placeholder:text-white-dark"
                                    onChange={(e) => changeValue(e)}
                                />
                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                    <IconMail fill={true} />
                                </span>
                            </div>
                            <span className='text-danger'>
                                {errors?.phone_number ? errors.phone_number : ''}
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label >Password</label>
                            <div className="relative text-white-dark">
                                <input name="password" type="password" placeholder="Enter Password" className="form-input ps-10 placeholder:text-white-dark"
                                    onChange={(e) => changeValue(e)} />
                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                    <IconLockDots fill={true} />
                                </span>
                            </div>
                            <span className='text-danger'>
                                {errors?.password ? errors.password : ''}
                            </span>
                        </div>
                        <div>
                            <label >Confirm Password</label>
                            <div className="relative text-white-dark">
                                <input name="password_confirmation" type="password" placeholder="Enter password confirmation" className="form-input ps-10 placeholder:text-white-dark"
                                    onChange={(e) => changeValue(e)} />
                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                    <IconLockDots fill={true} />
                                </span>
                            </div>
                            <span className='text-danger'>
                                {errors?.password_confirmation ? errors.password_confirmation : ''}
                            </span>
                        </div>
                    </div>
                    <button type="button" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]" disabled={isBtnLoading ? true : false} onClick={() => formSubmit()}>
                        {isBtnLoading ? "Please wait..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    )
}
