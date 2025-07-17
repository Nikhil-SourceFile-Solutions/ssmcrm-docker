import React, { useEffect, useRef, useState } from 'react'
import { TbAuth2Fa } from 'react-icons/tb'
import { useToast } from '../../ToastContext ';

function TwoFAuth({ params, setParams, defaultParams, LoginApi, errors, setErros }) {

    const firstInputRef = useRef(null);

    console.log("params", params)
    const { addToast } = useToast();

    const changeValue = (e) => {
        const { value, name } = e.target;
        const [fieldName, fieldIndex] = name.split("_");
        const index = parseInt(fieldIndex, 10);

        if (fieldName === "otp") {
            setErros({ ...errors, otp: "" });

            if (value) {
                const nextInput = document.querySelector(`input[name=otp_${index + 1}]`);
                if (nextInput) nextInput.focus();
            }

            const allInputs = document.querySelectorAll(".otp");
            let otp = "";
            allInputs.forEach((input) => {
                otp += input.value;
            });

            setParams({ ...params, otp });


        }

        console.log("otp", params)
    };

    useEffect(() => {
        if (params.otp.length === 6) {
            formSubmit()
        }
    }, [params.otp]);

    function isSixDigitNumber(num) {

        return /^\d{6}$/.test(num.toString());
    }

    const validate = () => {
        setErros({});
        let errors = {};

        if (!params.otp) errors = { ...errors, otp: "OTP is required" };

        else if (!isSixDigitNumber(params.otp.toString())) { errors = { ...errors, otp: "Invalid OTP" }; }

        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
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

        data.append("otp", params.otp);
        data.append("email_or_emp_id_or_phone", params.email_or_emp_id_or_phone);
        LoginApi(data);
    };



    const handleKeyDown = (e, index) => {
        // Listen for the Backspace key
        if (e.key === "Backspace" && !e.target.value) {
            const prevInput = document.querySelector(`input[name=otp_${index - 1}]`);
            if (prevInput) {
                prevInput.focus();
                prevInput.value = ""; // Clear the previous input field
            }
        }
    };
    return (
        <div className="bg-white shadow-lg rounded-lg mt-9">
            <header className="text-center px-5 pb-5">
                <div className="flex-none">
                    {/* <img src={`https://ui-avatars.com/api/?background=random&name=nnnnn&length=3`} alt="" /> */}
                    <TbAuth2Fa className="inline-flex -mt-9 w-[72px] bg-white h-[72px] fill-current rounded-full border-4 border-white box-content shadow mb-3 rounded-full h-12 w-12 object-cover" />

                </div>
                <div className="text-[18px] font-bold text-[#009688]">
                    Two-factor authentication</div>

            </header>
            <div className='px-2'>
                <b className='text-[12px]'>Hi {params.user_name}, <br /> &nbsp; &nbsp; Please enter the OTP from your Two-Factor Authentication app</b>
            </div>

            <div className="flex items-center justify-center gap-3 mt-8">
                {Array.from({ length: 6 }).map((_, i) => (
                    <input
                        key={i}
                        type="password"
                        ref={i === 0 ? firstInputRef : null} // Focus on the first input on mount
                        value={params.otp.charAt(i)}
                        name={`otp_${i}`}
                        onChange={changeValue}
                        onKeyDown={(e) => handleKeyDown(e, i)}
                        className="w-10 h-10 sm:w-12 sm:h-12 text-center text-2xl font-extrabold text-slate-900 
           border-4 rounded-md hover:border-slate-200 appearance-none focus:border-success/50
           outline-none focus:bg-white 
           focus:ring-2 focus:ring-success-100 otp"
                        maxLength={1}
                    />
                ))}
            </div>

            <div className='mb-8 mt-2 text-center' >
                <b className='text-[#ff0303]'>{errors.otp}</b>
            </div>


            <div className="bg-gray-100 text-center px-5 py-3">

                <small><b>If you haven't scanned and completed two-factor authentication in the authenticator app, please contact your HR or admin</b></small>
                <form autoComplete="off"
                    // onSubmit={(e) => { e.preventDefault(); formSubmit(); }} 
                    className="justify-center rounded">


                </form>
            </div>
        </div >
    )
}

export default TwoFAuth