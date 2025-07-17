import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setCrmToken, setPageTitle } from '../../../store/themeConfigSlice';
import { useNavigate } from 'react-router-dom';
import { IRootState } from '../../../store';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../../AuthContext';

export default function Razorpay({ paymentGateways, setPaymentGateways }: any) {
    const razorpay = paymentGateways.find((pg: any) => pg.payment_gateway_name == "Razorpay")
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {  crmToken, apiUrl } = useAuth()

    const [defaultParams] = useState({
        payment_gateway_name: 'Razorpay',
        status: '',
        field_1: '',
        field_2: '',
        field_3: '',
    });

    const [errors, setErros] = useState<any>({});
    const [params, setParams] = useState<any>(defaultParams);

    useEffect(() => {
        if (!crmToken) navigate('/')
        else if (razorpay) {
            setParams({
                payment_gateway_name: 'Razorpay',
                status: razorpay.status,
                field_1: razorpay.field_1,
                field_2: razorpay.field_2,
                field_3: razorpay.field_3,
            })
        }
        dispatch(setPageTitle('Settings | Payments | Razorpay'))
    }, [razorpay])


    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.payment_gateway_name) {
            errors = { ...errors, payment_gateway_name: "payment gateway name is required" };
        }
        console.log(errors);
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };
    const [btnLoading, setBtnLoading] = useState(false);


    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
        console.table(params)
    };


    const AddEmployee = async (data: any) => {
        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/payment-gateways",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {
                showMessage(response.data.message);
                const newPaymentGateways = [...paymentGateways];
                const index = newPaymentGateways.findIndex((a) => a.payment_gateway_name == 'Razorpay');
                if (index >= 0) {
                    newPaymentGateways[index] = response.data.razorpay;
                    console.log("new ", newPaymentGateways)
                    setPaymentGateways(newPaymentGateways)
                } else setPaymentGateways([response.data.razorpay])
            }

        } catch (error: any) {
            console.log(error)
            if (error.response.status == 401) dispatch(setCrmToken(''))
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
            setBtnLoading(false)
        }
    };

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("payment_gateway_name", params.payment_gateway_name);
        data.append("status", params.status);
        data.append("field_1", params.field_1);
        data.append("field_2", params.field_2);
        data.append("field_3", params.field_3);
        AddEmployee(data);
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

    return (
        <form autoComplete="off" className="space-y-5">
            <div>
                <input type="text" placeholder="Enter API Key *" name='field_1' className="form-input" value={params.field_1} onChange={(e) => changeValue(e)} />
            </div>
            <div>
                <input type="text" placeholder="Enter Secret Key *" name='field_2' className="form-input" value={params.field_2} onChange={(e) => changeValue(e)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <select name="field_3" className='form-select' value={params.field_3} onChange={(e) => changeValue(e)}>
                        <option value="">Select Environment</option>
                        <option value="Live">Live</option>
                        <option value="Demo">Demo</option>
                    </select>
                </div>
                <div>
                    <select name="status" className='form-select' value={params.status} onChange={(e) => changeValue(e)}>
                        <option value="">Select Status</option>
                        <option value="1">Active</option>
                        <option value="0">Blocked</option>
                    </select>
                </div>
            </div>
            <button type="button" className="btn btn-primary !mt-6" onClick={() => formSubmit()} disabled={btnLoading}>
                {btnLoading ? 'Please Wait' : 'Submit'}
            </button>
        </form>
    )
}
