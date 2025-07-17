import React, { useEffect, useState } from 'react'
import { RiWhatsappFill } from 'react-icons/ri'
import axios from 'axios';
import { useAuth } from '../../../../AuthContext';
import Swal from 'sweetalert2';
import History from './History';

export default function Index() {


    const { apiUrl, crmToken, logout } = useAuth();
    const [templates, setTemplates] = useState([]);


    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTemplate();
    }, [])

    const fetchTemplate = async () => {
        setIsLoading(true)

        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/marketing-whatsapp-campigns",
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setTemplates(response.data.templates)
            }
            console.log(response)

        } catch (error) {
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

        setParams({
            ...defaultParams,
            campaign_name: '',
            template_id: '',
            final_template: '',
            fields: [],
        })

        setTotalFields(0)
        setTemplate('')

    }, [])

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErrors({ ...errors, [name]: '' });
        setParams({ ...params, [name]: value });
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

    const [btnLoading, setBtnLoading] = useState(false);

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


    const [phones, setPhones] = useState([]);
    const handleNumbers = (numbers) => {


        const numberArray = numbers
            .split('\n')
            .filter(str => str.length === 10 && !isNaN(str)) // Check length and ensure it's a number
            .map(Number);

        setPhones(numberArray)

    }

    const validate = () => {
        setErrors({});
        let errors = {};
        if (!params.campaign_name) {
            errors = { ...errors, campaign_name: 'campaign_name is required.' };
        }

        setErrors(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const AddWhatsappCampaign = async (data: any) => {
        try {
            setBtnLoading(true);
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/marketing-whatsapp-campigns",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status === 'success') {

                setParams(defaultParams)
                setTotalFields(0)
                Swal.fire({
                    title: "Campaign Created successfully",
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
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("campaign_name", params.campaign_name);
        data.append("template_id", params.template_id);
        data.append("phones", JSON.stringify(phones));
        data.append("fields", params?.fields?.length ? JSON.stringify(params.fields) : JSON.stringify([]));
        AddWhatsappCampaign(data);
    };


    const [historyDrawer, setHistoryDrawer] = useState(false);


    return (

        <div className='grid grid-cols-12 gap-4'>

            <div className='panel col-span-12 lg:col-span-4 h-fit'>
                <h2 className='text-[18px] font-bold'>Copy Past numbers</h2>

                <textarea id="ctnTextarea" rows={10} className="form-textarea mt-4 border-4 border-[#ebe9f1]" placeholder="Enter Phone Numbers" onChange={(e) => {
                    handleNumbers(e.target.value)
                }}></textarea>

                <div>
                    {phones?.length ? (<p className='text-[14px] font-bold'>Entered <span className='text-[#08735e]'>{phones?.length}</span> valid phone numbers</p>) : null}

                </div>
            </div>

            <div className='panel col-span-12 lg:col-span-8 '>
                <div className='flex justify-between items-center mb-4'>
                    <h1 className='font-bold text-[20px]'>WhatsApp Campaign</h1>

                    <button className='btn btn-info shadow' onClick={() => setHistoryDrawer(true)}>History</button>
                </div>


                {phones?.length ? (<div className='flex gap-2 items-center bg-white-light/40 p-3 rounded mb-3'>
                    <div><RiWhatsappFill size={24} color='green' /></div>
                    <div className='text-[16px] font-bold'>
                        <span className='text-black/70'>Whatsapp Message Sending to <span className='text-black'>{phones.length}</span> Leads</span>
                    </div>
                </div>) : null}

                <section className="flex gap-4 bg-[url('/assets/images/knowledge/pattern.png')]">
                    <div className='flex-1'>
                        <form autoComplete="off" action="" method="post" className='flex-1 bg-[#e3e7fc] p-4 rounded h-fit'>



                            <div className='mb-4'>
                                <label className='text-white-dark '>Campaign Name</label>
                                <input type="text" className="form-input"
                                    name="campaign_name"
                                    onChange={(e) => changeValue(e)}
                                    value={params.campaign_name}
                                />
                                <div className="text-danger font-semibold text-sm">{errors.campaign_name}</div>
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
                                <button type="button" className='btn btn-danger shadow' >Cancel</button>
                                <button type="button" onClick={() => formSubmit()} disabled={btnLoading || !phones.length} className="btn  btn-dark shadow bg-black">
                                    {btnLoading ? 'Please Wait...' : 'Send Updates'}
                                </button>
                            </div>

                        </form>
                    </div>

                </section>
            </div>

            <History historyDrawer={historyDrawer} setHistoryDrawer={setHistoryDrawer} />
        </div>

    )
}
