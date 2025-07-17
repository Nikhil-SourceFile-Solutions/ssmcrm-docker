import React, { useEffect, useState } from 'react';

import axios from 'axios';
import PageLoader from '../../../../../components/Layouts/PageLoader';
import Swal from 'sweetalert2';
import { useAuth } from '../../../../../AuthContext';


export default function Update({ data, setDrawer, drawer }: any) {

    const { settingData, crmToken, apiUrl, authUser, logout } = useAuth()
    useEffect(() => {
        if (drawer) fetchWhatsappTemplate();
    }, [drawer])


    const [isLoading, setIsLoading] = useState(true);
    const [templates, setTemplates] = useState([]);
    const fetchWhatsappTemplate = async () => {


        console.log("Fetching Whatsapp Template ......")
        setIsLoading(true)
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/campaigns/get-whatsapp-template",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") setTemplates(response.data.templates);

        } catch (error) {
            console.log(error)
            if (error?.response?.status == 401) logout()
        } finally {
            setIsLoading(false)
        }
    }


    const defaultParams = {
        whatsapp_campaign_id: data.id,
        template_id: "",
        campaign_name: "",
        contact_details: "",
        final_template: "",
        fields: [],
    };

    const [errors, setErrors] = useState<any>({});
    const [params, setParams] = useState<any>(defaultParams);
    const [template, setTemplate] = useState<any>('')
    const [totalFields, setTotalFields] = useState(0);

    useEffect(() => {
        if (data) {
            setParams({
                ...defaultParams,
                campaign_name: data.campaign_name + ' Update - ' + (1 + data.updates),
                contact_details: JSON.parse(data.phones),
                template_id: '',
                final_template: '',
                fields: [],
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
        if (!params.campaign_name) {
            errors = { ...errors, campaign_name: 'campaign_name is required.' };
        }

        if (!params.contact_details) {
            errors = { ...errors, contact_details: 'contact_details is required.' };
        }

        setErrors(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const [btnLoading, setBtnLoading] = useState(false);





    const AddWhatsappCampaign = async (data: any) => {
        try {
            setBtnLoading(true);
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/campaigns/free-trail/whatsapp/update",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status === 'success') {
                Swal.fire({
                    title: "Campaign Updated successfully",
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

        data.append("whatsapp_campaign_id", params.whatsapp_campaign_id);
        data.append("template_id", params.template_id);
        data.append("fields", params?.fields?.length ? JSON.stringify(params.fields) : JSON.stringify([]));
        AddWhatsappCampaign(data);
    };



    const handleChange = (e: any, index: any) => {
        const { value } = e.target;
        const newFields: any = [...params.fields];
        newFields[index] = value;
        let result = template.template.replace(/{{(\d+)}}/g, (match: string, i: number) => {
            return newFields[i - 1] ? newFields[i - 1] : match
        });
        const newParams = { ...params, fields: newFields, final_template: result };
        setParams(newParams);
    };



    function countDoubleBraces(template: string) {
        const regex = /\{\{/g;
        const matches = template.match(regex);
        return matches ? matches.length : 0;
    }



    useEffect(() => {
        if (params.template_id) {
            const template: any = templates.find((t: any) => t.id == params.template_id);
            setTemplate(template)
            setTotalFields(countDoubleBraces(template.template))
            setParams({
                ...defaultParams, template_id: params.template_id,
                whatsapp_campaign_id: params.whatsapp_campaign_id,
                campaign_name: params.campaign_name,
                contact_details: params.contact_details,
                final_template: template.template
            })
        }
    }, [params.template_id])



    return (


        <>

            {isLoading ? <PageLoader /> : (
                <form autoComplete="off" action="" method="post" className='p-0'>

                    <div className='mb-4'>
                        <label className='text-white-dark '>Campaign Name</label>
                        <input type="text" className="form-input bg-[#ebedf2]"
                            name="campaign_name"

                            disabled
                            value={params.campaign_name}
                        />
                    </div>

                    <div className='mb-4'>
                        <label className='text-white-dark '>Contact Numbers</label>
                        <input type="text" className="form-input bg-[#ebedf2]" name='contact_details'
                            value={params.contact_details} disabled
                        />
                    </div>


                    <div className='mb-4'>
                        <select onChange={(e) => changeValue(e)} value={params.template_id} name="template_id" className="form-select text-white-dark  py-2 text-sm ">
                            <option value={''} >Select Template</option>
                            {templates?.map((t: any) => (
                                <option key={t.id} value={t.id}>{t.template_name}</option>
                            ))}
                        </select>
                        <div className="text-danger font-semibold text-sm">{errors.template_id}</div>
                    </div>

                    {
                        template && <div className='mb-4  '>

                            <div className='bg-[#f1faff] p-4 rounded shadow'>
                                <p>{params.final_template}</p>
                            </div>

                        </div>
                    }


                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                        {Array.from({ length: totalFields }, (_, index) => (
                            <div key={index} className='mb-4'>
                                <input
                                    type="text"
                                    placeholder={`{{${index + 1}}}`}
                                    className="form-input"
                                    name={`fields[${index}]`}
                                    onChange={(e) => handleChange(e, index)}
                                />
                                <div className="text-danger font-semibold text-sm">{errors.fields}</div>
                            </div>
                        ))}
                    </div>

                    <div className='flex justify-end gap-5 py-2'>
                        <button type="button" className='btn shadow' onClick={() => setDrawer(false)}>Cancel</button>
                        <button type="button" onClick={() => formSubmit()} disabled={btnLoading} className="btn  btn-dark shadow bg-black">
                            {btnLoading ? 'Please Wait...' : 'Send Updates'}
                        </button>
                    </div>

                </form>
            )}
        </>

    )
}
