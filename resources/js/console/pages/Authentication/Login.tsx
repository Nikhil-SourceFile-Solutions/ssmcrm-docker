import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import React, { useEffect, useRef, useState } from 'react';
import { setPageTitle, setCrmToken, setAuthUser, setLastLogin, setSettingToggleData } from '../../store/themeConfigSlice';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import axios from 'axios';
import PageLoader from '../../components/Layouts/PageLoader';
import Admin from './Admin';
import { useAuth } from '../../AuthContext';

const Login = () => {
    const dispatch = useDispatch();
    useEffect(() => { dispatch(setPageTitle('Login')); });
    const navigate = useNavigate();
    const lastLogin = useSelector((state: IRootState) => state.themeConfig.lastLogin);
    const { crmToken, apiUrl,authUser } = useAuth()

    useEffect(() => {
        if (crmToken && lastLogin == 0 && authUser.id != 1) navigate('/create-password')
        else if (crmToken) navigate('/')
        else checkCrmStatus();
    }, [crmToken, lastLogin])

    const [isLoading, setIsLoading] = useState(true);
    const [action, setAction] = useState('');

    const checkCrmStatus = async () => {
        setIsLoading(!0);
        try {
            console.log("Checking CRM Status API .....")
            let t = await axios({ method: "get", url: apiUrl + "/api/check-crm" });
            "success" == t.data.status && setAction('login');
            if (t.data.settings) dispatch(setSettingToggleData(t.data.settings));
            if (t.data.status == "error" && t.data.action == "admin") setAction('admin')
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
                        <div className="relative flex flex-col justify-center rounded-md dark:bg-black/50 px-8 lg:min-h-[auto] py-6">
                            <CheckUser />
                        </div>
                    </div>
                ) : action == "admin" ? (<Admin setAction={setAction} />) : null}
            </div>
        </div>
    );
};


const CheckUser = () => {

    const apiUrl = useSelector((state: IRootState) => state.themeConfig.apiUrl);
    const settingData = useSelector((state: IRootState) => state.themeConfig.settingData);
    const [defaultParams] = useState({
        password: '',
        pin: '',
        email_or_emp_id_or_phone: '',
        isChecked: false,
        user_name: '',
        isPin: false,
        showPin: false,
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
                setParams({ ...params, isChecked: true, user_name: response.data.user, isPin: response.data.isPin, showPin: response.data.isPin })
            } else { alert("Failed") }

        } catch (error: any) {
            console.log(error)

            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                }
                setErros(serverErrors);
            }
        } finally {
            setIsChecking(false)
        }
    };

    const checkEmail = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
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
                            <img className="w-[200px] ltr:-ml-1 rtl:-mr-1 inline mt-5" src={`${apiUrl}/storage/${settingData?.logo}`} />
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
    useEffect(() => { dispatch(setPageTitle('Login')); });
    const navigate = useNavigate();


    const apiUrl = useSelector((state: IRootState) => state.themeConfig.apiUrl);
    const [errors, setErros] = useState<any>({});




    const changeValue = (e: any) => {
        const { value, name } = e.target;
        const [fieldName, fieldIndex] = name.split("_");
        if (fieldName == 'pin') {
            setErros({ ...errors, pin: '' });
            if (value) {
                let a: any = document.querySelector(`input[name=pin_${parseInt(fieldIndex, 10) + 1}]`)
                if (a) a.focus()
            }
            const aa = document.querySelectorAll('.pin');
            let pin = '';
            aa.forEach((element: any) => {
                pin += element.value;
            });
            setParams({ ...params, pin: pin });
        } else {
            setErros({ ...errors, [name]: '' });
            setParams({ ...params, [name]: value });

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
            console.log(error)

            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
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

        data.append("pin", params.pin);
        data.append("password", params.password);
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



    return (<div className="bg-white shadow-lg rounded-lg mt-9">
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
                            <label className='text-2xl font-bold mb-8'>Enter 4 Digit PIN</label>
                            <div className='flex items-center justify-center gap-3 mb-2'>
                                <input type="tel" ref={firstInputRef} value={params.pin.charAt(0)} name='pin_0' onChange={(e) => changeValue(e)} className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 pin" maxLength={1} />
                                <input type="tel" value={params.pin.charAt(1)} name='pin_1' onChange={(e) => changeValue(e)} className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 pin" maxLength={1} />
                                <input type="tel" value={params.pin.charAt(2)} name='pin_2' onChange={(e) => changeValue(e)} className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 pin" maxLength={1} />
                                <input type="tel" value={params.pin.charAt(3)} name='pin_3' onChange={(e) => changeValue(e)} className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 pin" maxLength={1} />
                            </div>
                            {errors.pin ? <b className="text-danger font-bold p-2">{errors.pin}</b> : ''}
                        </div> :
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
    </div>)
}

export default Login;


