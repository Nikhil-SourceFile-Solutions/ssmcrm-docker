import React, { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setCrmToken, setPageTitle } from '../../../store/themeConfigSlice';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { IRootState } from '../../../store';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../../AuthContext';
export default function WhatsappCampaignDrawer({ showWACampaignDrawer, setShowWACampaignDrawer, reportData, fetchData1 }: any) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { crmToken, apiUrl, logout } = useAuth()


    // console.log('Report Dattaattat', reportData?.update_data?.length);
    const countOfCampaignId = reportData?.update_data?.length
    useEffect(() => {
        if (!crmToken) dispatch(setCrmToken(''))
        else {
            dispatch(setPageTitle('Whatsapp Campaign'));
        }
    }, [crmToken])

    const defaultParams = {
        whatsapp_sent_id: reportData.id,
        campaign_name: "",
        contact_details: "",
        template: "",

    };

    const [errors, setErrors] = useState<any>({});
    const [params, setParams] = useState<any>(defaultParams);

    useEffect(() => {
        if (reportData) {
            setParams({
                id: reportData.id,
                campaign_name: reportData.campaign_name,
                contact_details: reportData.contact_details,
                template: reportData.template,
                t1: reportData.t1,
                whatsapp_sent_id: reportData.id
            });
        } else setParams(defaultParams)
    }, [reportData])



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
                url: apiUrl + "/api/update-whatsapp-data",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status === 'success') {
                setParams(defaultParams);
                showMessage(response.data.message)
                setShowWACampaignDrawer(false);
                fetchData();
                fetchData1();
                // handleUpdate();

            }
        } catch (error: any) {
            console.log(error);
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
        console.log(params)
        const fields = []
        for (let i = 0; i < count; i++) {
            fields.push(params[`fields[${i}]`])
        }
        console.log('fielsd', fields);
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("id", params.id);
        data.append("whatsapp_sent_id", params.whatsapp_sent_id);
        data.append("template_id", params.template_name);
        // data.append("template_name", params.template_name);
        data.append("template", params.template);
        data.append("fields", params.fields ? JSON.stringify(params.fields) : JSON.stringify([]));
        data.append("contact_details", params.contact_details);
        data.append("campaign_name", params.campaign_name + '  ' + `Update_${countOfCampaignId + 1}`);
        data.append("total_number_count", JSON.parse(params.contact_details).length);

        AddWhatsappCampaign(data);
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

    const [whatsappDrawer, setWhatsappDrawer] = useState([]);

    const [template, setTemplate] = useState('')

    useEffect(() => {
        fetchData();
    }, [])
    const fetchData = async () => {
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/get-whatsapp-notification",
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == 'success') {
                setWhatsappDrawer(response.data.whatsappnotification)
                console.log('response.data.whatsappnotification', response.data.whatsappnotification)
            }


        } catch (error) {

        }
    }
    function findField() {
        if (params.template_name) {
            const obj = whatsappDrawer.find(item => item.id == params.template_name);
            const a = obj.template ? obj.template : '';
            console.log(a)
            console.log("hhghgsddfj", a)
            setTemplate(a)
        }
        else {
            setTemplate('')
        }
    }

    useEffect(() => {
        findField()
    }, [params])


    function countDoubleBraces(template) {
        const regex = /\{\{/g;
        const matches = template.match(regex);
        console.log(matches ? matches.length : 0)
        return matches ? matches.length : 0;
    }
    const count = countDoubleBraces(template);
    const [fields, setFields] = useState(Array(count).fill(''));

    const handleChange = (e, index) => {
        const { value } = e.target;
        const newFields = [...fields];
        newFields[index] = value;
        setFields(newFields);
        const newParams = { ...params, fields: newFields };
        setParams(newParams);
    };
    const [updateCount, setUpdateCount] = useState(1);
    const [campaignName, setCampaignName] = useState('');

    useEffect(() => {
        // Initialize the campaign name with the update count
        setCampaignName(`${params.campaign_name} Update ${updateCount}`);
    }, [params.campaign_name, updateCount]);

    const handleUpdate = () => {
        setUpdateCount(prevCount => prevCount + 1);
    };

    useEffect(() => {
        handleUpdate();
    }, []);

    return (
        <div>
            <div className={`${(showWACampaignDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setShowWACampaignDrawer(!showWACampaignDrawer)}>
            </div>
            <nav className={`${(showWACampaignDrawer && 'ltr:!right-0 rtl:!left-0') || ''} bg-white fixed ltr:-right-[500px] rtl:-left-[500px] top-0 bottom-0 w-full max-w-[500px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4 pt-0`}>
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className="w-full py-4">
                        <div>
                            <h3 className="mb-1 dark:text-white font-bold text-[18px]">Template Name - Whatsapp </h3>
                        </div>
                        <hr className="my-4 dark:border-[#191e3a]" />
                    </div>
                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">
                        <form autoComplete="off" action="" method="post" className='p-0'>

                            <div className='mb-4'>
                                <label className='text-white-dark'>Campaign Name</label>
                                <input type="text" placeholder="" className="form-input"
                                    name="campaign_name"
                                    onChange={(e) => changeValue(e)}
                                    readOnly
                                    value={params.campaign_name + '  ' + `Update_${countOfCampaignId + 1}`}

                                />
                                <div className="text-danger font-semibold text-sm">{errors.campaign_name}</div>
                            </div>
                            <div className='mb-4'>
                                <label className='text-white-dark'>Contact Numbers</label>
                                <input type="text" placeholder="" className="form-input"
                                    name="contact_details" onChange={(e) => changeValue(e)} value={params.contact_details} readOnly
                                />
                                <div className="text-danger font-semibold text-sm">{errors.contact_details}</div>
                            </div>
                            <div className='mb-4'>
                                <select onChange={(e) => changeValue(e)} value={params.template_name} name="template_name" className="form-select text-white-dark  py-2 text-sm ">
                                    <option value={''} >Select Template</option>
                                    {/* <option value={params.template_name}>{params.template_name}</option> */}


                                    {
                                        whatsappDrawer?.map((user) => (
                                            <option value={user.id}>{user.template_name} </option>
                                        ))
                                    }
                                </select>
                                <div className="text-danger font-semibold text-sm">{errors.template_name}</div>
                            </div>

                            {
                                template && <div className='mb-4  '>
                                    <textarea className='form-textarea bg-[#f1faff] ' defaultValue={template} value={template} name="template" disabled >{template}</textarea>
                                </div>
                            }

                            {/* <div className='mb-4  '>
                                    <textarea className='form-textarea bg-[#f1faff] '
                                    // defaultValue={template}
                                     value={params.t1}
                                      name="params.t1"
                                        disabled >
                                            {params.t1}
                                            </textarea>
                                </div> */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                                {Array.from({ length: count }, (_, index) => (
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
                            <button type='button' onClick={handleUpdate}>Update Campaign Name</button>

                            <div className='flex justify-end gap-5 py-2'>
                                <button type="button" className='btn shadow' onClick={() => setShowWACampaignDrawer(false)}>Cancel</button>
                                <button type="button" onClick={() => formSubmit()} disabled={btnLoading} className="btn  btn-dark shadow bg-black">
                                    {btnLoading ? 'Please Wait...' : 'Send Updates'}
                                </button>
                            </div>

                        </form >
                    </section >
                </div >
            </nav >
        </div >
    )
}

