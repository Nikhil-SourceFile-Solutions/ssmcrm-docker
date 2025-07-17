import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import React, { useEffect, useRef, useState } from 'react';
import { setPageTitle, setCrmToken, setAuthUser, setLastLogin, setSettingToggleData, setBranches } from '../../store/themeConfigSlice';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import axios from 'axios';
import PageLoader from '../../components/Layouts/PageLoader';
import Admin from './Admin';
import { useAuth } from '../../AuthContext';
import Blocked from './Blocked/Blocked';
import Index from './Blocked/Index';
import { useToast } from '../../ToastContext ';
import TwoFAuth from './TwoFAuth';

const Login = () => {
    const dispatch = useDispatch();
    const { addToast } = useToast();
    useEffect(() => { dispatch(setPageTitle('Login')); });
    const navigate = useNavigate();

    const { crmToken, apiUrl, authUser } = useAuth()

    const lastLogin = useSelector((state: IRootState) => state.themeConfig.lastLogin);



    useEffect(() => {
        if (crmToken && lastLogin == 0 && authUser.id != 1) navigate('/create-password')
        else if (crmToken) navigate('/')
        else checkCrmStatus();
    }, [crmToken, lastLogin])

    const [isLoading, setIsLoading] = useState(true);
    const [action, setAction] = useState('');

    const [block, setBlock] = useState(null);
    const [companyType, setCompanyType] = useState(0);

    const checkCrmStatus = async () => {
        setIsLoading(!0);
        try {
            console.log("Checking CRM Status API .....")
            let t = await axios({ method: "get", url: apiUrl + "/api/check-crm" });
            "success" == t.data.status && setAction('login');
            if (t.data.settings) dispatch(setSettingToggleData(t.data.settings));
            if (t.data.status == "error" && t.data.action == "admin") {
                setAction('admin')
                setCompanyType(t.data.company_type)
            }
            else if (t.data.status == "error" && t.data.action == "blocked") {
                setAction('blocked')
                setBlock(t.data.type)
            }

        } catch (a) {
            console.log(a)
            alert("Error");
        } finally {
            setIsLoading(!1);
        }
    };

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
            </div>
            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                {isLoading ? <PageLoader /> : action == 'login' ? (
                    <div className="relative w-full max-w-[500px] rounded-md">
                        <div className="relative flex flex-col justify-center rounded-md dark:bg-black/50 px-4 lg:min-h-[auto] py-6">
                            <CheckUser />
                        </div>
                    </div>
                ) : action == "admin" ? (<Admin setAction={setAction} companyType={companyType} />) : action == "blocked" ? <Index block={block} /> : null}
            </div>
        </div>
    );
};


const CheckUser = () => {

    const { addToast } = useToast();
    const apiUrl = useSelector((state: IRootState) => state.themeConfig.apiUrl);
    const settingData = useSelector((state: IRootState) => state.themeConfig.settingData);
    const dispatch = useDispatch();
    const [defaultParams] = useState({
        password: '',
        pin: '',
        email_or_emp_id_or_phone: '',
        isChecked: false,
        user_name: '',
        isPin: false,
        showPin: false,
        is2FA: false,
        otp: '',
    });

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});



    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
    };

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.email_or_emp_id_or_phone) {
            errors = { ...errors, email_or_emp_id_or_phone: "email or employee id  is required" };
        }

        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const [isChecking, setIsChecking] = useState(false);
    const checkLoginUser = async (data: any) => {
        console.log("Checking Login User API....")
        setIsChecking(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/check-login-user",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.status == 'success') {
                setParams({ ...params, isChecked: true, user_name: response.data.user, is2FA: response.data.is2FA, isPin: response.data.isPin, showPin: response.data.isPin })
                dispatch(setBranches(response.data.branches));
            } else { alert("Failed") }

        } catch (error: any) {
            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                }
                setErros(serverErrors);
                addToast({
                    variant: 'error',
                    title: error.response.data.message,
                });
            }
        } finally {
            setIsChecking(false)
        }
    };

    const checkEmail = () => {
        const isValid = validate();
        if (isValid.totalErrors) {
            addToast({
                variant: 'error',
                title: "Validation Error! Please Solve",
            });
            return false;
        }
        const data = new FormData();
        data.append("email_or_emp_id_or_phone", params.email_or_emp_id_or_phone);
        checkLoginUser(data);
    };

    return (<>


        {params.isChecked ? (<LoginBlock params={params} setParams={setParams} defaultParams={defaultParams} />) : (
            <div className="bg-white shadow-lg rounded-lg mt-9">
                <header className="px-5 pb-5">
                    {settingData?.logo ? (
                        <div className="flex-none">
                            <img className="w-[200px] max-w-[100px] ltr:-ml-1 rtl:-mr-1 inline mt-5" src={`${apiUrl}/storage/${settingData?.logo}`} />
                        </div>
                    ) : null}
                    <div className='mt-2'>
                        <h2 className='text-2xl font-semibold'>Sign in</h2>
                        <span>to access CRM</span>
                    </div>
                </header>
                <div className="bg-gray-100 text-center px-5 py-10">
                    <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); checkEmail(); }} className="justify-center rounded">
                        <div>
                            <label htmlFor='email_or_emp_id_or_phone' className='text-left'>Email Address or User ID</label>
                            <div className="relative text-white-dark mb-2">
                                <input name="email_or_emp_id_or_phone" type="text" placeholder="Enter Email or User ID" className="form-input ps-10 placeholder:text-white-dark"
                                    value={params.email_or_emp_id_or_phone}
                                    onChange={(e) => changeValue(e)}
                                />
                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                    <IconMail fill={true} />
                                </span>
                            </div>
                            <span className='text-danger font-bold '>{errors?.email_or_emp_id_or_phone ? errors.email_or_emp_id_or_phone : ''}</span>
                        </div>
                        <div
                            // onClick={() => { checkEmail() }}
                            className='max-w-[260px] mx-auto mt-4'>
                            <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 w-100px uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]" disabled={isChecking}>
                                {isChecking ? 'Please Wait' : 'Login'}
                            </button>
                        </div>
                    </form>



                </div>
            </div>
        )}

    </>)
}


const LoginBlock = ({ params, setParams, defaultParams }) => {

    const dispatch = useDispatch();
    const { addToast } = useToast();
    useEffect(() => { dispatch(setPageTitle('Login')); });
    const navigate = useNavigate();

    const { apiUrl } = useAuth()

    const [errors, setErros] = useState<any>({});

    const changeValue = (e) => {
        const { value, name } = e.target;
        const [fieldName, fieldIndex] = name.split("_");
        const index = parseInt(fieldIndex, 10);

        if (fieldName === "pin") {
            setErros({ ...errors, pin: "" });

            if (value) {
                // Move to the next input if the user enters a digit
                const nextInput = document.querySelector(`input[name=pin_${index + 1}]`);
                if (nextInput) nextInput.focus();
            }

            // Collect all PIN values after change
            const allInputs = document.querySelectorAll(".pin");
            let pin = "";
            allInputs.forEach((input) => {
                pin += input.value;
            });

            setParams({ ...params, pin });
        } else {
            setErros({ ...errors, [name]: "" });
            setParams({ ...params, [name]: value });
        }
    };

    const handleKeyDown = (e, index) => {
        // Listen for the Backspace key
        if (e.key === "Backspace" && !e.target.value) {
            const prevInput = document.querySelector(`input[name=pin_${index - 1}]`);
            if (prevInput) {
                prevInput.focus();
                prevInput.value = ""; // Clear the previous input field
            }
        }
    };


    const validate = () => {
        setErros({});
        let errors = {};
        if (params.isPin) {
            if (!params.pin) errors = { ...errors, pin: "Pin is required", password: '' };
        } else if (!params.password) errors = { ...errors, pin: "", password: 'Password is required' };
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const [isBtnLoading, setiSBtnLoading] = useState(false);
    const LoginApi = async (data: any) => {
        setiSBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/login",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.status == 'success') {
                if (response.data.lastLogin == 0) {
                    navigate('/create-password');
                }
                dispatch(setCrmToken(response.data.token))
                dispatch(setAuthUser(response.data.user))
                dispatch(setLastLogin(response.data.lastLogin))

                localStorage.setItem('callbacks', JSON.stringify(response.data.callbacks));
            } else { alert("Failed") }

        } catch (error: any) {


            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                }
                setErros(serverErrors);

                addToast({
                    variant: 'error',
                    title: error.response.data.message,
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
                title: "Validation Error! Please Solve",
            });
            return false;
        }
        const data = new FormData();

        data.append("pin", params.pin);
        data.append("password", params.password);
        data.append("otp", params.otp);
        data.append("email_or_emp_id_or_phone", params.email_or_emp_id_or_phone);
        LoginApi(data);
    };

    // to get the cursor at start pin field

    const firstInputRef = useRef(null);

    useEffect(() => {
        // Automatically focus the first input field when the component mounts
        if (firstInputRef.current) {
            firstInputRef.current.focus();
        }
    }, []);



    return (
        <>{params.is2FA ? <TwoFAuth params={params} setParams={setParams} defaultParams={defaultParams} errors={errors} setErros={setErros} LoginApi={LoginApi} /> : (<div className="bg-white shadow-lg rounded-lg mt-9">
            <header className="text-center px-5 pb-5">
                <div className="flex-none">
                    <img src={`https://ui-avatars.com/api/?background=random&name=${params.user_name}&length=3`} className="inline-flex -mt-9 w-[72px] h-[72px] fill-current rounded-full border-4 border-white box-content shadow mb-3 rounded-full h-12 w-12 object-cover" alt="" />
                </div>
                <div className="text-[18px] font-medium text-gray-500">{params.user_name}</div>
                <div className=' text-[14px] text-blue-900 mt-2 cursor-pointer' onClick={() => {
                    {
                        setParams(defaultParams)
                    }
                }}  >change user</div>
            </header>
            <div className="bg-gray-100 text-center px-5 py-6">
                <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); formSubmit(); }} className="justify-center rounded">



                    {
                        params.isPin ?


                            <div>
                                <label className='text-2xl font-bold mb-8'>Enter 4 Digit PIN </label>

                                <div className="flex items-center justify-center gap-3 mb-2">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <input
                                            key={i}
                                            type="password"
                                            ref={i === 0 ? firstInputRef : null} // Focus on the first input on mount
                                            value={params.pin.charAt(i)}
                                            name={`pin_${i}`}
                                            onChange={changeValue}
                                            onKeyDown={(e) => handleKeyDown(e, i)}
                                            className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900
                                          border border-transparent hover:border-slate-200 appearance-none
                                          rounded p-4 outline-none focus:bg-white focus:border-indigo-400
                                          focus:ring-2 focus:ring-indigo-100 pin"
                                            maxLength={1}
                                        />
                                    ))}
                                </div>
                                {/* <div className='flex items-center justify-center gap-3 mb-2'>
                                    <input type="password" ref={firstInputRef} value={params.pin.charAt(0)} name='pin_0' onChange={(e) => changeValue(e)} className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 pin" maxLength={1} />
                                    <input type="password" value={params.pin.charAt(1)} name='pin_1' onChange={(e) => changeValue(e)} className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 pin" maxLength={1} />
                                    <input type="password" value={params.pin.charAt(2)} name='pin_2' onChange={(e) => changeValue(e)} className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 pin" maxLength={1} />
                                    <input type="password" value={params.pin.charAt(3)} name='pin_3' onChange={(e) => changeValue(e)} className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 pin" maxLength={1} />
                                </div> */}
                                {errors.pin ? <b className="text-danger font-bold p-2">{errors.pin}</b> : ''}
                            </div>

                            :
                            <div>
                                <label className=' text-left' >Password</label>
                                <div className="relative text-white-dark mb-2">
                                    <input name="password" value={params.password} type="password" placeholder="Enter Password" className="form-input ps-10 placeholder:text-white-dark"
                                        onChange={(e) => changeValue(e)} />
                                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                        <IconLockDots fill={true} />
                                    </span>
                                </div>
                                <span className='text-danger font-bold'>{errors?.password ? errors.password : ''}</span>
                                <div>
                                    <label className="flex cursor-pointer items-center">
                                        <input type="checkbox" className="form-checkbox bg-white dark:bg-black" />
                                        <span className="text-white-dark">Remember me</span>
                                    </label>
                                </div>
                            </div>
                    }

                    <div className='max-w-[260px] mx-auto mt-4'>
                        <button type="submit"
                            // onClick={() => { formSubmit() }}
                            disabled={isBtnLoading} className="btn btn-gradient !mt-6 w-full border-0 w-100px uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                            {isBtnLoading ? 'Please Wait' : 'Login'}
                        </button>
                    </div>

                    {params.showPin ? (
                        <div className=' flex justify-center cursor-pointer mt-2' >
                            {
                                params.isPin ? <b className='mt-4' onClick={() => { setParams({ ...params, pin: '', isPin: false }) }} >Login with Password</b>
                                    : <b className='mt-4' onClick={() => { setParams({ ...params, password: '', isPin: true }) }} >Login with 4 Digit PIN</b>
                            }
                        </div>
                    ) : null}
                </form>
            </div>
        </div>)}</>

    )
}

export default Login;


