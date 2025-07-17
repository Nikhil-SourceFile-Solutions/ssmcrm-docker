import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageLoader from '../../../components/Layouts/PageLoader';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import Verification from './Verification';
export default function Index() {

    const apiUrl = useSelector((state: IRootState) => state.themeConfig.apiUrl);
    const { token } = useParams();
    const [isChecking, setChecking] = useState(true);


    useEffect(() => {
        if (token) checkRiskprofile()
    }, [])


    const [action, setAction] = useState(null);
    const [phone, setPhone] = useState(false);
    const [questions, setQuestions] = useState([]);
    const checkRiskprofile = async () => {
        setChecking(true)
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/customer-riskprofile-check",
                params: { token: token },
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });


            if (response.data.status == "success") {
                setPhone(response.data.phone)
                setAction(response.data.action)
            }

        } catch (error) {

            console.log(error)
        } finally {
            setChecking(false)
        }
    }



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
                <div className="relative flex w-full max-w-[1502px] flex-col justify-between overflow-hidden rounded-md bg-white/60 text-center backdrop-blur-lg dark:bg-black/50 lg:min-h-[758px] lg:flex-row lg:gap-10 xl:gap-0">

                    <div className=' w-full panel'>
                        <h1 className='text-3xl font-extrabold'>Risk Profile</h1>

                        <div>
                            {isChecking ? <PageLoader />
                                : action == "login" ? <Login phone={phone} token={token} mainAction={setAction} />
                                    : action == "pan" ? <Pan phone={phone} token={token} mainAction={setAction} setQuestions={setQuestions} />
                                        : action == "questions" ? <Questions phone={phone} token={token} mainAction={setAction} questions={questions} />
                                            : action == "verification" ? <Verification phone={phone} token={token} mainAction={setAction} />
                                                : null}


                        </div>
                    </div>



                </div>
            </div>
        </div>
    )
}


const Login = ({ phone, token, mainAction }) => {

    const apiUrl = useSelector((state: IRootState) => state.themeConfig.apiUrl);
    const [isBtnLoading, setIsLoading] = useState(false);

    const [action, setAction] = useState('login');
    const [otp, setOtp] = useState('');


    const getOtp = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/customer-riskprofile-otp-generate",
                data: { phone: phone, token: token },
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            if (response.data.status == "success") {
                setAction(response.data.action);
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    const verifyOTP = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/customer-riskprofile-otp-verify",
                data: { phone: phone, token: token, otp: otp },
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.status == "success") mainAction(response.data.action)
            console.log(response)
        } catch (error) {

        } finally {
            setIsLoading(false)
        }
    }
    return (
        <div className='max-w-[500px] m-auto mt-5'>
            <h1>Login</h1>
            {action == "login" ? (
                <input type="tel" placeholder="Phone Number" value={phone} className="form-input" disabled />
            ) : action == 'otp' ? (
                <input type="tel" placeholder="Enter 6 digits OTP" maxLength={6} onChange={(e) => setOtp(e.target.value)} value={otp} className="form-input" />
            ) : null}
            <div>
                <button type="button" disabled={isBtnLoading} className="btn btn-primary mt-6 m-auto"
                    onClick={() => action == "login" ? getOtp() : action == "otp" ? verifyOTP() : null}
                >
                    {isBtnLoading ? 'Please Wait...' : action == "login" ? 'Get OTP' : action == "otp" ? 'Verify OTP' : null}
                </button>
            </div>
        </div >
    )
}

const Pan = ({ phone, token, mainAction, setQuestions }) => {

    const apiUrl = useSelector((state: IRootState) => state.themeConfig.apiUrl);


    const [params, setParams] = useState<any>({
        phone: phone,
        token: token,
        full_name: '',
        pan: '',
        dob: ''
    });

    const [errors, setErros] = useState<any>({});
    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
    };
    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.full_name) {
            errors = { ...errors, full_name: "full name is required" };
        }
        if (!params.pan) {
            errors = { ...errors, pan: "pan is required" };
        }
        if (!params.dob) {
            errors = { ...errors, dob: "dob is required" };
        }
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const verifyPan = async (data: any) => {
        setIsBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/customer-riskprofile-pan-verify",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.status == 'success') {
                setQuestions(JSON.parse(response.data?.questions.questions))
                mainAction(response.data.action)
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
            setIsBtnLoading(false)
        }
    };


    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("phone", phone);
        data.append("token", token);
        data.append("full_name", params.full_name);
        data.append("pan", params.pan);
        data.append("dob", params.dob);
        verifyPan(data);
    };

    return (

        <div>
            <h1>Pan Validation</h1>

            <div className="grid grid-cols-1 lg:flex justify-between gap-5">
                <input type="text" placeholder="Enter Name" name="full_name" value={params.full_name} onChange={(e) => changeValue(e)} className="form-input" />
                <input type="text" placeholder="Enter pan card number" name="pan" value={params.pan} onChange={(e) => changeValue(e)} className="form-input" />
                <input type="date" placeholder="Enter dob" name="dob" value={params.dob} onChange={(e) => changeValue(e)} className="form-input" />
            </div>
            <button type="button" disabled={isBtnLoading} className="btn btn-primary mt-6" onClick={() => formSubmit()}>
                {isBtnLoading ? 'Please  Wait...' : 'Verify'}
            </button>

        </div>

    )
}


const Questions = ({ phone, token, mainAction, questions }) => {
    const apiUrl = useSelector((state: IRootState) => state.themeConfig.apiUrl);

    const totalIndexs = questions.length - 1;

    const [currentIndex, setCurrentIndex] = useState(0);




    const [answers, setAnswers] = useState([]);

    useEffect(() => {
        console.log(answers)
    }, [answers])

    const handleOptionClick = (currentIndex, option) => {
        const updatedAnswers: any = [...answers];
        updatedAnswers[currentIndex] = {
            question: questions[currentIndex].question,
            option: option
        };
        setAnswers(updatedAnswers);

        if (currentIndex != totalIndexs) setCurrentIndex((c) => c + 1)
    };


    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const submitAnswers = async () => {

        setIsBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/customer-riskprofile-answers",
                data: {
                    phone, token, answers: JSON.stringify(answers)
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.status == "success") mainAction(response.data.action)
        } catch (error) {

        } finally {
            setIsBtnLoading(false)
        }

    }
    return (<>

        <div>

            <p>{questions[currentIndex].question}</p>

            <ul>
                {JSON.parse(questions[currentIndex].options).map((option) => (
                    <li>
                        <label className="inline-flex">
                            <input type="radio" name="default_radio"
                                onChange={() => handleOptionClick(currentIndex, option)}
                                className="form-radio text-success" value={{ index: currentIndex, option: option }}
                                checked={answers[currentIndex]?.option?.option == option.option}
                            />
                            <span>{option.option}</span>
                        </label>
                    </li>
                ))}
            </ul>

            <div>
                {currentIndex ? <button onClick={() => setCurrentIndex((e) => e - 1)}>Back</button> : null}

                {totalIndexs == currentIndex && answers[currentIndex] ?
                    <button disabled={isBtnLoading} onClick={() => submitAnswers()}>{isBtnLoading ? 'Please wait...' : 'Submit'}</button>
                    : answers[currentIndex] ? <button onClick={() => setCurrentIndex((e) => e + 1)}>Next</button> : null}


            </div>

            {/* {questions.map((question, index) => (
                <div key={index}>
                    <b>{question.question}</b>
                    <ul>
                        {JSON.parse(question.options).map((option) => (
                            <p>{option.option}</p>
                        ))}
                    </ul>
                </div>
            ))} */}

        </div>
    </>)
}

