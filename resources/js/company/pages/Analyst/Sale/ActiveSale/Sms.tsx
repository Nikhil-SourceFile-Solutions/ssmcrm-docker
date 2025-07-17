import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useSelector } from 'react-redux';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { IRootState } from '../../../../store';
import axios from 'axios';
import Swal from 'sweetalert2';
import PageLoader from '../../../../components/Layouts/PageLoader';
import React, { useEffect, useState } from 'react';
import { FaCommentSms } from "react-icons/fa6";
import { useAuth } from '../../../../AuthContext';

export default function Sms({ drawer, setDrawer, selectedRecords }: any) {
    const sales = selectedRecords.map((sr: any) => sr.id)

    const { crmToken, apiUrl, logout } = useAuth()


    useEffect(() => {
        if (drawer) fetchWhatsappTemplate();
    }, [drawer])


    const [isLoading, setIsLoading] = useState(true);
    const [templates, setTemplates] = useState([]);
    const [filteredTemplates, setFilteredTemplates] = useState([]);
    const [senderIds, setSenderIds] = useState([]);
    const [clients, setClients] = useState<any>(null);

    const fetchWhatsappTemplate = async () => {


        console.log("Fetching SMS Template ......")
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/campaigns/get-sms-template",
                params: { sales: JSON.stringify(sales) },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setSenderIds(response.data.sender_ids)
                setTemplates(response.data.templates.filter((temp) => temp.template_type == 'Other'));
                setClients(response.data.sales)
            }

        } catch (error) {
            console.log(error)
            if (error?.response?.status == 401) logout()
        } finally {
            setIsLoading(false)
        }
    }



    const defaultParams = {
        template_id: "",
        campaign_name: "",
        final_template: "",
        fields: [],
    };

    const [errors, setErrors] = useState<any>({});
    const [params, setParams] = useState<any>(defaultParams);
    const [template, setTemplate] = useState<any>('')
    const [totalFields, setTotalFields] = useState(0);

    useEffect(() => {
        if (params.sender_id) setFilteredTemplates(templates.filter((t: any) => t.sender_id == params.sender_id))
    }, [params.sender_id])

    useEffect(() => {
        if (drawer) {
            setParams({
                ...defaultParams,
                campaign_name: '',
                template_id: '',
                final_template: '',
                fields: [],
            })

            setTotalFields(0)
            setTemplate('')
        }
    }, [drawer])

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErrors({ ...errors, [name]: '' });
        setParams({ ...params, [name]: value });

        console.table(params)
    };


    const validate = () => {
        setErrors({});
        let errors = {};
        if (!params.campaign_name) {
            errors = { ...errors, campaign_name: 'campaign_name is required.' };
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
                url: apiUrl + "/api/campaigns/sms",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status === 'success') {
                Swal.fire({
                    title: "Campaign Sent successfully",
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
            if (error?.response?.status == 401) logout()
            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                    console.log(serveErrors[key][0]);
                }
                setErrors(serverErrors);
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
            setBtnLoading(false);
        }
    };


    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("campaign_name", params.campaign_name);
        data.append("template_id", params.template_id);
        data.append("sales", JSON.stringify(sales));
        data.append("fields", params?.fields?.length ? JSON.stringify(params.fields) : JSON.stringify([]));
        AddWhatsappCampaign(data);
    };



    const handleChange = (e: any, index: any) => {
        const { value } = e.target;
        const newFields: any = [...params.fields];
        newFields[index] = value;
        let fieldIndex = 0;
        let result = template.template.replace(/\{#var#\}/g, (match: string) => {
            let replacement = newFields[fieldIndex] !== undefined ? newFields[fieldIndex] : match;
            fieldIndex++; // Increment index for the next replacement
            return replacement;
        });
        const newParams = { ...params, fields: newFields, final_template: result };
        setParams(newParams);
    };



    function countDoubleBraces(template: string) {
        const regex = /\{\#/g;
        const matches = template.match(regex);
        console.log(matches ? matches.length : 0)
        return matches ? matches.length : 0;
    }



    useEffect(() => {
        if (params.template_id) {
            const template: any = templates.find((t: any) => t.id == params.template_id);
            setTemplate(template)
            setTotalFields(countDoubleBraces(template.template))
            setParams({
                ...params,
                fields: [],
                final_template: template.template
            })
        }
    }, [params.template_id])



    return (


        <>

            {isLoading ? <PageLoader /> : (
                <form autoComplete="off" action="" method="post" className='p-0'>


                    {clients ? (<div className='flex gap-2 items-center bg-white-light/40 p-3 rounded mb-3'>
                        <div><FaCommentSms size={24} /></div>
                        <div className='text-[16px] font-bold'>
                            <span className='text-black/70'>SMS Sending to <span className='text-black'>{clients}</span> Clients</span>
                        </div>
                    </div>) : null}

                    <div className='mb-4'>
                        <label className='text-white-dark '>Campaign Name</label>
                        <input type="text" className="form-input"
                            name="campaign_name"
                            value={params.campaign_name}
                            onChange={(e) => changeValue(e)}
                        />
                        <div className="text-danger font-semibold text-sm">{errors.campaign_name}</div>
                    </div>




                    <div className='mb-4'>
                        <select onChange={(e) => changeValue(e)} value={params.sender_id} name="sender_id" className="form-select text-white-dark  py-2 text-sm ">
                            <option value={''} disabled selected>Select Sender Id</option>
                            {senderIds?.map((t: any, i: number) => (
                                <option key={i} value={t}>{t}</option>
                            ))}
                        </select>
                        <div className="text-danger font-semibold text-sm">{errors.sender_id}</div>
                    </div>

                    <div className='mb-4'>
                        <select onChange={(e) => changeValue(e)} value={params.template_id} name="template_id" className="form-select text-white-dark  py-2 text-sm ">
                            <option value={''} >Select Template</option>
                            {filteredTemplates?.map((t: any) => (
                                <option key={t.id} value={t.id}>{t.short_name}</option>
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
                            {btnLoading ? 'Please Wait...' : 'Send Updates '}
                        </button>
                    </div>

                </form>
            )}

        </>

    )

}
