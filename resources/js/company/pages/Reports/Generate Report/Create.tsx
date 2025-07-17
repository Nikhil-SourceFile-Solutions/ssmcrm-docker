import React, { useEffect, useState } from 'react'
import { Tab } from '@headlessui/react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import { useAuth } from '../../../AuthContext';
import axios from 'axios';
import PageLoader from '../../../components/Layouts/PageLoader';
export default function Create({ showGReportDrawer, setShowGReportDrawer, fetchReports }) {
    const { logout, crmToken, apiUrl } = useAuth();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;


    const [data, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(true);



    const fetchdDataForGenerateReport = async () => {
        setIsLoading(true)
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/get-data-for-generate-report",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") {
                setData(response.data.data)
            }

        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }

    }



    const [defaultParams] = useState({
        type: '',
        status: 'All',
        date_range: [],
        report_name: '',
        employee_id: '',
        state: '',
    });

    const [params, setParams] = useState<any>([]);

    useEffect(() => {
        if (showGReportDrawer) {
            fetchdDataForGenerateReport()
            setParams(defaultParams)

        }
    }, [showGReportDrawer])






    const [errors, setErros] = useState<any>({});
    const [isBtnLoading, setIsBtnLoading] = useState(false);



    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        if (name == "type") {
            setParams({ ...params, status: '', [name]: value });
        } else setParams({ ...params, [name]: value });
    };

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.type) {
            errors = { ...errors, type: "type is required" };
        }

        if (!params.status) {
            errors = { ...errors, status: "status is required" };
        }

        if (!params.date_range) {
            errors = { ...errors, date_range: "date_range is required" };
        }

        if (!params.report_name) {
            errors = { ...errors, report_name: "Report Name is required" };
        }

        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const createSaleApi = async (data: any) => {
        setIsBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/reports",
                data,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            console.log(response)

            if (response.data.status == 'success') {
                setParams(defaultParams)
                setShowGReportDrawer(false);
                fetchReports()
            } else if (response.data.status == 'error') {
                alert(response.data.message)
            }

        } catch (error: any) {
            console.log(error)
            if (error?.response?.status == 401) logout()
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
        data.append("type", params.type);
        data.append("status", params.status);
        data.append("date_range", JSON.stringify(params.date_range));
        data.append("report_name", params.report_name);
        data.append("employee_id", params.employee_id);
        data.append("state", params.state)
        createSaleApi(data);
    };

    const dateFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });




    return (
        <>
            <div className={`${(showGReportDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setShowGReportDrawer(!showGReportDrawer)}>
            </div>
            <nav className={`${(showGReportDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                } bg-white fixed ltr:-right-[500px] rtl:-left-[500px] top-0 bottom-0 w-full max-w-[500px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4 pt-0`}>
                <div className="flex flex-col h-screen overflow-hidden">
                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">
                        <form autoComplete="off" action="" method="post" className='p-0'>
                            <div className="mb-5">

                                <div className='flex justify-between mb-4 ' >
                                    <div className='text-lg bold' >Generate Report</div>
                                </div>
                                <hr className='mb-5' />

                                {isLoading ? (<PageLoader />) : (
                                    <div className='mb-5'>
                                        <form autoComplete="off" className="space-y-5">
                                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                <div>
                                                    <label >Generate Type</label>
                                                    <select id="generateType" name="type" onChange={(e) => changeValue(e)} className="form-select text-white-dark">
                                                        <option value={''}>Select Type</option>
                                                        <option>Leads</option>
                                                        <option>Sales</option>
                                                    </select>
                                                    <div className="text-danger mt-1">{errors.type}</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                <div>
                                                    <label>Employee</label>
                                                    <select id="generateType" name="employee_id" onChange={(e) => changeValue(e)} className="form-select text-white-dark">
                                                        <option value={''}>Select Employee</option>
                                                        {data?.employees?.map((s, i) => (
                                                            <option key={i} value={s.id}>{s.first_name} {s.last_name}</option>
                                                        ))}

                                                    </select>
                                                    {errors.employee_id ? <div className="text-danger mt-1">{errors.employee_id}</div> : (
                                                        <div className="text-[13px] text-[#2196F3] mt-1">Leave blank to get All Emplyee Data.</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                <div>
                                                    <label>State</label>
                                                    <select id="generateType" name="state" onChange={(e) => changeValue(e)} className="form-select text-white-dark">
                                                        <option value={''}>Select State</option>
                                                        {data?.states?.map((s, i) => (
                                                            <option key={i} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                    {errors.state ? <div className="text-danger mt-1">{errors.state}</div> : (
                                                        <div className="text-[13px] text-[#2196F3] mt-1">Leave blank to get All State Data.</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                <div>
                                                    <label >Status</label>
                                                    <select id="reportStatus" name="status" onChange={(e) => changeValue(e)}
                                                        disabled={params.type ? false : true}
                                                        className="form-select text-white-dark">
                                                        <option value={''}>Select Status</option>

                                                        {params?.type == "Leads" ? (
                                                            data?.leadstatus?.map((s, i) => (
                                                                <option key={i}>{s}</option>
                                                            ))
                                                        ) : (
                                                            data?.salestatus?.map((s, i) => (
                                                                <option key={'a' + i}>{s}</option>
                                                            ))
                                                        )}
                                                    </select>
                                                    <div className="text-danger mt-1">{errors.status}</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                <div>
                                                    <label >Select Duration (created at)</label>
                                                    <Flatpickr
                                                        options={{
                                                            mode: 'range',
                                                            dateFormat: 'Y-m-d',
                                                            position: isRtl ? 'auto right' : 'auto left',
                                                        }}
                                                        name="date_range"
                                                        value={params.date_range}
                                                        className="form-input"
                                                        onChange={(CustomDate) => {
                                                            const date = CustomDate.map((dateStr) => {
                                                                const formattedDate = dateFormatter.format(new Date(dateStr));
                                                                return formattedDate.split('/').reverse().join('-');
                                                            });
                                                            if (date.length == 2) changeValue({ target: { name: 'date_range', value: date } })
                                                        }}
                                                    />
                                                    {errors.date_range ? <div className="text-danger mt-1">{errors.date_range}</div> : (
                                                        <div className="text-[13px] text-[#2196F3] mt-1">Leave blank to apply no date range filter.</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                <div>
                                                    <label >Report Name</label>
                                                    <input name="report_name" onChange={(e) => changeValue(e)} type="text" placeholder="Enter Report Name" className="form-input" />
                                                    <div className="text-danger mt-1">{errors.report_name}</div>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => formSubmit()} disabled={isBtnLoading} className="btn btn-primary mt-6">
                                                {isBtnLoading ? 'Generating...' : 'Generate'}
                                            </button>
                                        </form>
                                    </div>
                                )}


                            </div>
                        </form>
                    </section>
                </div>
            </nav>
        </>
    )
}
