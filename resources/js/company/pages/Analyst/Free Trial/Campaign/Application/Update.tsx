import React, { useEffect, useState } from 'react';

import axios from 'axios';
import PageLoader from '../../../../../components/Layouts/PageLoader';
import Swal from 'sweetalert2';
import { useAuth } from '../../../../../AuthContext';


export default function Update({ data, setDrawer, drawer }: any) {


    const { crmToken, apiUrl, logout } = useAuth()



    const [isLoading, setIsLoading] = useState(true);
    const [templates, setTemplates] = useState([]);



    const defaultParams = {

        application_campaign_id: '',
        update: '',

    };

    const [errors, setErrors] = useState<any>({});
    const [params, setParams] = useState<any>(defaultParams);
    const [template, setTemplate] = useState<any>('')
    const [totalFields, setTotalFields] = useState(0);

    useEffect(() => {
        if (data) {
            setParams({
                ...defaultParams,
                application_campaign_id: data.id,
            })
            setTotalFields(0)
            setTemplate('')
        }
    }, [data, drawer])

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErrors({ ...errors, [name]: '' });
        setParams({ ...params, [name]: value });
    };


    const validate = () => {
        setErrors({});
        let errors = {};

        setErrors(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const [btnLoading, setBtnLoading] = useState(false);

    const AddApplicationCampaign = async (data: any) => {
        try {
            setBtnLoading(true);
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/update-application-notification",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status === 'success') {
                Swal.fire({
                    title: "Application Campaign Updated successfully",
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    showCancelButton: false,
                    width: 450,
                    timer: 2000,
                    customClass: {
                        popup: "color-success"
                    }
                })
                setDrawer(false)
            }
        } catch (error: any) {
            console.log(error);
            if (error?.response?.status == 401) logout()

        } finally {
            setBtnLoading(false);
        }
    };


    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("application_campaign_id", params.application_campaign_id);
        data.append("update", params.update);
        AddApplicationCampaign(data);
    };
    console.log(data?.id)




    return (


        <>


            <form autoComplete="off" action="" method="post" className='p-0'>

                <div className=' grid grid-cols-1 md:grid-cols-1 gap-2' >
                    {/* <div className='mb-4'>
                            <input type="text" placeholder="Enter Instrument" className="form-input"
                                name="application_campaign_id" onChange={(e) => changeValue(e)} value={params.application_campaign_id}
                            />
                            <div className="text-danger font-semibold text-sm">{errors.application_campaign_id}</div>
                        </div> */}

                    <div className='mb-4'>
                        <input type="text" placeholder="Enter Updates Details" className="form-input"
                            name="update" onChange={(e) => changeValue(e)} value={params.update}
                        />
                        <div className="text-danger font-semibold text-sm">{errors.update}</div>
                    </div>

                </div>
                <div className='flex justify-end gap-5 py-2'>
                    <button type="button" className='btn shadow' onClick={() => setDrawer(false)}>Cancel</button>
                    <button type="button" onClick={() => formSubmit()} disabled={btnLoading} className="btn  btn-dark shadow bg-black">
                        {btnLoading ? 'Please Wait...' : 'Send Updates'}
                    </button>
                </div>

            </form>

        </>

    )
}
