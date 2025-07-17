import React, { useState } from 'react'
import { useToast } from '../../../ToastContext ';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { useDispatch } from 'react-redux';

function ControlPanel({ data, domain, params, setParams }) {

    const { addToast } = useToast();
    const { logout, authUser, crmToken, apiUrl } = useAuth();

    const dispatch = useDispatch();

    const [errors, setErros] = useState<any>({});

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.branch_no) {
            errors = { ...errors, branch_no: "Number of branches is required" };
        }
        if (!params.max_employee_count) {
            errors = { ...errors, max_employee_count: "Employee count is required" };
        }
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const [btnLoading, setBtnLoading] = useState(false);

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
    };

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) {
            addToast({
                variant: 'error',
                title: "Validation Error! Please Check",
            });
            return false
        };
        const data = new FormData();
        data.append("branch_no", params.branch_no);
        data.append("max_employee_count", params.max_employee_count);
        UpdateCompany(data);
    };

    const UpdateCompany = async (data: any) => {
        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + '/api/company-update/' + domain,
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {

                addToast({
                    variant: 'success',
                    title: response.data.message,
                });
            } else { alert("Failed") }

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
                addToast({
                    variant: 'error',
                    title: "Server Validation Error! Please Solve",
                });
            }
        } finally {
            setBtnLoading(false)
        }
    };


    return (
        <div className='panel'>

            <div className='flex justify-between items-center pb-2 border-b-4 border-[#f1f2f3]'>
                <h3 className='font-bold text-[18px]'>Control Panel</h3>
                <button className='btn btn-gradient' disabled={btnLoading} onClick={() => formSubmit()}>
                    {btnLoading ? 'Please Wait...' : 'Update'}
                </button>
            </div>

            <div className='mt-4'>

                <p className='text-danger font-bold'> Changes will be reflected in the customer's CRM.</p>

                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">

                    <div>
                        <label className="block text-gray-700 mb-1">Total Branches</label>
                        <input
                            type="number"
                            placeholder="Enter Number of Branches"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            name='branch_no'
                            value={params.branch_no}
                            onChange={(e) => changeValue(e)}
                        />
                        {errors?.branch_no ? <span className='text-danger font-bold'>{errors?.branch_no}</span> : ''}
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Maximum Employees</label>
                        <input
                            type="number"
                            placeholder="Input 1"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            name='max_employee_count'
                            value={params.max_employee_count}
                            onChange={(e) => changeValue(e)}
                        />
                        {errors?.max_employee_count ? <span className='text-danger font-bold'>{errors?.max_employee_count}</span> : ''}
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Dummy Field</label>
                        <input
                            disabled
                            type="text"
                            placeholder="dummy"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Dummy Field</label>
                        <input
                            disabled
                            type="text"
                            placeholder="dummy"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

        </div>
    )
}

export default ControlPanel