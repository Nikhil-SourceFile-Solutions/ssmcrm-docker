import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import React, { useEffect, useState } from 'react';
import { setPageTitle, setCrmToken, setAuthUser } from '../../store/themeConfigSlice';
import Dropdown from '../../components/Dropdown';
import i18next from 'i18next';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import axios from 'axios';
import Swal from 'sweetalert2';
import PageLoader from '../../components/Layouts/PageLoader';

export default function Admin({ setAction }: any) {


    const navigate = useNavigate();

    const apiUrl = useSelector((state: IRootState) => state.themeConfig.apiUrl);

    const [defaultParams] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        company_type: 1,
        crm_link: '',

    });




    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});

    const validate = () => {
        setErros({});
        let errors = {};

        if (!params.first_name) {
            errors = { ...errors, first_name: "first name is required!" };
        }
        if (!params.last_name) {
            errors = { ...errors, last_name: "last name is required!" };
        }

        if (!params.email) {
            errors = { ...errors, email: "email is required!" };
        }

        if (!params.phone) {
            errors = { ...errors, phone: "phone number is required!" };
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
        console.log(params)
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

                Swal.fire({
                    title: response.data.message,
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    showCancelButton: false,
                    width: 500,
                    timer: 2000,
                    customClass: {
                        popup: "color-success"
                    }
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
            setiSBtnLoading(false)
        }
    };

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("first_name", params.first_name);
        data.append("last_name", params.last_name);
        data.append("email", params.email);
        data.append("phone", params.phone);
        data.append("password", params.password);
        data.append("password_confirmation", params.password_confirmation);
        AdminApi(data)
    };


    return (
        <div className="bg-[#3b3f5c] flex items-center justify-center min-h-screen px-6 py-10 relative sm:px-16">
            <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-8 lg:min-h-[auto] py-6">
                <div className="space-y-5 mx-auto w-full ">
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Admin Onboarding</h1>
                        <p className="text-base font-bold leading-normal text-white-dark">Setting Up Your CRM Admin Account</p>
                    </div>



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
                                <input name="phone" type="tel" maxLength={10} placeholder="Enter phone number" className="form-input ps-10 placeholder:text-white-dark"
                                    onChange={(e) => changeValue(e)}
                                />
                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                    <IconMail fill={true} />
                                </span>
                            </div>
                            <span className='text-danger'>
                                {errors?.phone ? errors.phone : ''}
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
