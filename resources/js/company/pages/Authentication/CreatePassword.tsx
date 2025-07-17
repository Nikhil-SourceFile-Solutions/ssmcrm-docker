import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import React, { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import Swal from 'sweetalert2';
import { useAuth } from '../../AuthContext';
const CreatePassword = () => {
    const dispatch = useDispatch();
    useEffect(() => { dispatch(setPageTitle('Create Password')); });
    const navigate = useNavigate();

    const { crmToken, apiUrl, logout } = useAuth()


    // useEffect(() => {
    //     if (crmToken) navigate('/')

    // }, [crmToken])

    // useEffect(() => {
    //     if (crmToken) navigate('/')
    //     else checkCrmStatus();
    // }, [crmToken])

    // const [isLoading, setIsLoading] = useState(true);
    // const [action, setAction] = useState('');

    // const checkCrmStatus = async () => {
    //     setIsLoading(!0);
    //     try {
    //
    //         "success" == t.data.status && setAction('login'), console.log(t);

    //         if (t.data.status == "error" && t.data.action == "admin") setAction('admin')
    //     } catch (a) {
    //         alert("Error");
    //     } finally {
    //         setIsLoading(!1);
    //     }
    // };

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

    const [defaultParams] = useState({
        password_confirmation: '',
        password: '',
    });

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.password_confirmation) {
            errors = { ...errors, password_confirmation: "password_confirmation is required" };
        }
        if (!params.password) {
            errors = { ...errors, password: "password is required" };
        }
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
        console.table(params)
    };

    const [isBtnLoading, setiSBtnLoading] = useState(false);

    const LoginApi = async (data: any) => {
        setiSBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/create-password",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {
                showMessage(response.data.message);
                navigate('/')
                // dispatch(setCrmToken(response.data.token))
                // dispatch(setAuthUser(response.data.user))
                // localStorage.setItem('callbacks', JSON.stringify(response.data.callbacks));
            } else { alert("Failed") }

        } catch (error: any) {
            console.log(error)
            if (error?.response?.status == 401) logout()

            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                showMessage(serveErrors)
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                    console.log(serveErrors[key][0])
                }
                setErros(serverErrors);
            }
        } finally {
            setiSBtnLoading(false)
        }
    };

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("password_confirmation", params.password_confirmation);
        data.append("password", params.password);
        LoginApi(data);
    };

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };
    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
            </div>
            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                <img src="/assets/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" />

                {/* {isLoading ? <PageLoader /> : action == 'login' ? ( */}
                <div className="relative w-full max-w-[500px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-8 lg:min-h-[auto] py-6">
                        <div className="space-y-5 mx-auto w-full ">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Create Password</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">Enter your password and confirm password to login</p>
                            </div>
                            <div className="relative">
                                <label>New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter Confirm Password"
                                        className="form-input pr-10"
                                        name="password"
                                        value={params.password}
                                        onChange={(e) => changeValue(e)}
                                    />
                                    <span
                                        onClick={togglePasswordVisibility}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                        style={{ top: '50%', transform: 'translateY(-50%)' }}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                                <span className='text-danger'>{errors?.password ? errors.password : ''}</span>
                            </div>

                            <div className="relative">
                                <label >Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Enter Confirm Password"
                                        className="form-input pr-10"
                                        name="password_confirmation"
                                        value={params.password_confirmation}
                                        onChange={(e) => changeValue(e)}
                                    />
                                    <span
                                        onClick={toggleConfirmPasswordVisibility}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                        style={{ top: '50%', transform: 'translateY(-50%)' }}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                                <span className='text-danger'>{errors?.password_confirmation ? errors.password_confirmation : ''}</span>
                            </div>


                            <NavLink to='/Login' >
                                <button type="button"
                                    className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                                    disabled={isBtnLoading ? true : false}
                                    onClick={() => { formSubmit() }}
                                >
                                    Create Password
                                </button>
                            </NavLink>

                        </div>
                    </div>
                </div>
                {/* ) : action == "admin" ? (<Admin setAction={setAction} />) : null} */}


            </div>
        </div>
    );
};

export default CreatePassword;
