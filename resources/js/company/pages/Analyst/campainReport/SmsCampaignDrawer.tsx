import React, { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setCrmToken, setPageTitle } from '../../../store/themeConfigSlice';
import { useNavigate } from 'react-router-dom';
import { IRootState } from '../../../store';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../../AuthContext';

export default function SMSReportDrawer({ showSMSReportDrawer, setShowSMSReportDrawer, reportData }: any) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { crmToken, apiUrl, logout } = useAuth()
    const countOfCampaignId = reportData?.update_data?.length



    useEffect(() => {
        if (!crmToken) dispatch(setCrmToken(''))
        else {
            dispatch(setPageTitle('SMS Campaign'));
        }
    }, [crmToken])


    const defaultParams = {
        sms_sent_id: reportData.id,
        // id: '',
        sender_id: '',
        template_name: '',
        template: '',
        fields: '',
        contact_details: '',
        campaign_name: '',
        total_number_count: ''
    };
    console.log('reportData', reportData);
    console.log('sms_sent_id', reportData.id);
    // console.log('sms_sent_id', sms_sent_id);



    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});
    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.sender_id) {
            errors = { ...errors, sender_id: "Sender Id is required" };
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

    useEffect(() => {
        if (reportData) {
            setParams({
                campaign_name: reportData.campaign_name,
                sms_sent_id: reportData.id,
                sender_id: reportData.sender_id,
                contact_details: reportData.contact_details,
                template: reportData.template,

            });
        } else setParams(defaultParams)
    }, [reportData])

    function removeDuplicates(array, key) {
        const seen = new Set();
        return array.reduce((acc, item) => {
            const keyValue = item[key];
            if (!seen.has(keyValue)) {
                seen.add(keyValue);
                acc.push(item);
            }
            return acc;
        }, []);
    }

    useEffect(() => {
        fetchData();
    }, []);
    const [employeeData, setEmployeeData] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/get-sms-notification",
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == 'success') {
                setEmployeeData(response.data.smstemplates)
                console.log('response.data.smstemplates', response.data.smstemplates)
            }
        } catch (error) {
            console.log(error)
            if (error?.response?.status == 401) logout()
        }
        finally {
            console.log('finnalyyy');
        }
    }
    const AddEmployee = async (data: any) => {
        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/update-sms-data",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {
                showMessage(response.data.message);
                setParams(defaultParams);
                setShowSMSReportDrawer(false);
                console.log('params', params);
            } else { alert("Failed") }

        } catch (error: any) {
            console.log(error)
            if (error?.response?.status == 401) logout()
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
        console.log(params)
        const fields = []
        for (let i = 0; i < count; i++) {
            fields.push(params[`fields[${i}]`])
        }
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("id", params.id);
        data.append("sms_sent_id", reportData.id);
        // data.append("campaign_name", params.campaign_name);
        data.append("total_number_count", JSON.parse(params.contact_details).length);
        data.append("template_id", params.template_name);
        data.append("fields", params.fields ? JSON.stringify(params.fields) : '');
        data.append("contact_details", params.contact_details);
        data.append("campaign_name", params.campaign_name + '  ' + `Update_${countOfCampaignId + 1}`);

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

    const [template, setTemplate] = useState('')


    function findField() {
        if (params.template_name) {
            const obj = employeeData.find(item => item.id == params.template_name);
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
        const regex = /\{\#/g;
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
    const generatePreview = () => {
        let preview = template;
        fields.forEach((field, index) => {
            preview = preview.replace(`{{${index + 1}}}`, field);
        });
        return preview;
    };
    return (
        <div>
            <div className={`${(showSMSReportDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setShowSMSReportDrawer(!showSMSReportDrawer)}>
            </div>

            <nav className={`${(showSMSReportDrawer && 'ltr:!right-0 rtl:!left-0') || ''} bg-white fixed ltr:-right-[800px] rtl:-left-[800px] top-0 bottom-0 w-full max-w-[800px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4 pt-0`}>
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className="w-full py-4">
                        <div>
                            <h3 className="mb-1 dark:text-white font-bold text-[18px]">Template Name - SMS Campaign</h3>
                        </div>
                        <hr className="my-4 dark:border-[#191e3a]" />
                    </div>

                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">
                        <form autoComplete="off" action="" method="post" className='p-0'>

                            <div className='mb-4'>
                                <label className='text-white-dark'>Campaign Name</label>
                                <input type="text" placeholder="" className="form-input"
                                    name="campaign_name" onChange={(e) => changeValue(e)}

                                    value={params.campaign_name + '  ' + `Update_${countOfCampaignId + 1}`}
                                />
                                <div className="text-danger font-semibold text-sm">{errors.campaign_name}</div>
                            </div>
                            <div className='mb-4'>
                                <label className='text-white-dark'>Contact Details</label>
                                <input type="text" placeholder="" className="form-input"
                                    name="contact_details" onChange={(e) => changeValue(e)} value={params.contact_details}
                                />
                                <div className="text-danger font-semibold text-sm">{errors.contact_details}</div>
                            </div>

                            <div className='mb-4'>
                                <select name="sender_id" className="form-select text-white-dark  py-2 text-sm" onChange={(e) => changeValue(e)} value={params.sender_id ? params.sender_id : ''}>
                                    <option value={''}>Select Sender Id</option>
                                    {removeDuplicates(employeeData, 'sender_id').map((dropdown) => (<option value={dropdown.sender_id}>{dropdown.sender_id}</option>
                                    ))}
                                </select>

                                <div className="text-danger font-semibold text-sm">{errors.sender_id}</div>
                            </div>
                            <div className='mb-4'>
                                <select onChange={(e) => changeValue(e)} value={params.template_name} name="template_name" className="form-select text-white-dark  py-2 text-sm ">
                                    <option value={''} >Select Template</option>
                                    {
                                        employeeData?.filter(filters => filters.sender_id == params.sender_id).map((user) => (
                                            <option value={user.id}>{user.template_name} </option>
                                        ))
                                    }
                                </select>
                                <div className="text-danger font-semibold text-sm">{errors.sms_numbers}</div>
                            </div>
                            {template && (
                                <div className='mb-4'>
                                    <textarea
                                        className='form-textarea bg-[#f1faff]'
                                        defaultValue={template}
                                        value={generatePreview()}
                                        name="template"
                                        disabled
                                    />
                                </div>
                            )}

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                                {Array.from({ length: count }, (_, index) => (
                                    <div key={index} className='mb-4'>
                                        <input
                                            type="text"
                                            placeholder={`{{${'#' + index + 1 + '#'}}}`}
                                            className="form-input"
                                            name={`fields[${index}]`}
                                            onChange={(e) => handleChange(e, index)}
                                        />
                                        <div className="text-danger font-semibold text-sm">{errors.fields}</div>
                                    </div>
                                ))}
                            </div>
                            <div className='flex justify-end gap-5 py-2'>
                                <button type="button" className='btn shadow' onClick={() => setShowSMSReportDrawer(false)}>Cancel</button>
                                <button type="button" onClick={() => formSubmit()} disabled={btnLoading} className="btn  btn-dark shadow bg-black">
                                    {btnLoading ? 'Please Wait...' : 'Send Updates'}
                                </button>
                            </div>

                        </form>
                    </section>
                </div>
            </nav>
        </div >
    )
}

