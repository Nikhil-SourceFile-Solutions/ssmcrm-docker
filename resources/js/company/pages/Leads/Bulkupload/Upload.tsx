import React, { useEffect, useState, Fragment } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFileCsv } from "react-icons/fa6";
import Papa from 'papaparse';
import { Dialog, Transition } from '@headlessui/react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { IRootState } from '../../../store';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
const Upload = ({ states, statuses, setAction, checkLeadUpload, employees }: any) => {

    const [darkMode, setDarkMode] = useState(false);

    const [csvDatas, setCsvDatas] = useState([]);

    const [csvFileInfo, setCsvFileInfo] = useState('');
    const [fileSelected, setFileSelected] = useState(false);

    const onDrop = (acceptedFiles: any) => {
        const file = acceptedFiles[0];

        console.log(file.type)
        if (file) {
            // if (file.type != "text/csv") {
            //     alert("Invalid file please select csv file")
            //     return 0;
            // }
            Papa.parse(file, {
                header: true,
                complete: (results: any, file: any) => {
                    setCsvDatas(results.data)
                    setCsvFileInfo(file)
                    setFileSelected(true)
                },
                error: (error: any) => {
                    console.error('Error parsing CSV file:', error);
                },
            });
        } else {
            alert("No File")
        }
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const [modal3, setModal3] = useState(false);
    useEffect(() => {

        if (fileSelected) {
            if (csvDatas.length > 1) {
                setModal3(true)
            } else {
                alert("no file record")
            }
        }
    }, [csvDatas, fileSelected])


    return (

        <>

            <div >
                <div  {...getRootProps({ className: 'dropzone max-w-[450px] m-auto mt-10 border-2 border-dashed p-3 rounded' })}>
                    <input {...getInputProps()} />
                    <div className='flex justify-around items-center'>
                        <div className='animate animate-pulse'><FaFileCsv size={50} color='green' /></div>
                        <div> <h1 className='font-extrabold text-[15px] text-gray-500'>Drag 'n' drop a file here, or click to select a file</h1></div>
                    </div>
                </div>
            </div>


            <CsvModal modal3={modal3} setModal3={setModal3} csvDatas={csvDatas} csvFileInfo={csvFileInfo} states={states} statuses={statuses} setAction={setAction} checkLeadUpload={checkLeadUpload} employees={employees} />

        </>

    );
};


const CsvModal = ({ modal3, setModal3, csvDatas, csvFileInfo, states, statuses, setAction, checkLeadUpload, employees }: any) => {
    const sampleData = csvDatas.length ? csvDatas.slice(0, 3) : [];
    const firstObjectKeys = sampleData.length ? Object.keys(sampleData[0]) : [];

    const [tab, setTab] = useState('select');


    function getTodayDateRange() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day} 09:00:00`;


    }

    const [errors, setErros] = useState<any>({});
    const [defaultParams] = useState({
        state: '',
        status: '',
        phone: '',
        source: '',
        name: '',
        email: '',
        city: '',
        user_id: 0,
        is_to_employee: 0,
        created_at: getTodayDateRange()
    });
    const [params, setParams] = useState<any>(defaultParams);




    const changeValue = (e: any) => {
        let { value, name, type } = e.target;

        if (type == 'checkbox') value = e.target.checked ? 1 : 0

        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
        console.table(params)
    };


    const [isValidating, setIsvalidating] = useState(false);
    const validateSelectField = () => {
        setIsvalidating(true)
        setErros({});
        let errors = {};
        if (!params.phone) errors = { ...errors, phone: "phone field is required" };
        if (!params.source) errors = { ...errors, source: "source field is required" };
        if (!params.state) errors = { ...errors, state: "state field is required" };
        if (!params.status) errors = { ...errors, status: "status field is required" };

        if (params.is_to_employee && !params.user_id) errors = { ...errors, user_id: "employee is required" };
        console.log(errors);
        setErros(errors);
        if (Object.keys(errors).length) {
            setIsvalidating(false)
            return false;
        }
        validateCsvData();
    }
    const [importData, setImpotData] = useState([]);
    const [validInfo, setValidInfo] = useState({ invalid: 0, total: 0, duplicate: 0 })
    const unique_id = Date.now();
    const validateCsvData = () => {
        const filterValidData = () => {
            const keyMapping = swapKeysAndValues(removeNullValues(params));

            const a = csvDatas
                .filter((item: any) => validatePhoneNumber(item[params.phone]))
                .map((item: any) => {
                    return Object.keys(keyMapping).reduce((obj: any, key) => {
                        if (item.hasOwnProperty(key)) {
                            obj[keyMapping[key]] = item[key];
                        }
                        obj.state = params.state;
                        obj.status = params.status;
                        obj.unique_id = unique_id;
                        obj.user_id = params.is_to_employee ? params.user_id : 1;
                        obj.created_at = params.created_at;

                        return obj;
                    }, {});
                });
            return a
        };
        const idata = filterValidData();
        const finalData = getUniquePhones(idata)
        const total = csvDatas.length;
        const invalid = total - idata.length
        const duplicate = idata.length - finalData.length;
        setValidInfo({ total: total, invalid: invalid, duplicate: duplicate, valid: total - (duplicate + invalid) })
        setImpotData(finalData)
        setTab('import')
        setIsvalidating(false)
    }

    const getUniquePhones = (array) => {
        const seenPhones = new Set();
        return array.filter(item => {
            if (!seenPhones.has(item.phone)) {
                seenPhones.add(item.phone);
                return true; // Keep this item
            }
            return false; // Skip this item
        });
    };

    const removeNullValues = (object: any) => {
        const newObj = {};
        Object.keys(object).forEach(key => {
            if (object[key] !== '') {
                newObj[key] = object[key];
            }
        });
        return newObj;
    };

    const swapKeysAndValues = (object: any) => {
        const newObj = {};
        for (const [key, value] of Object.entries(object)) {
            newObj[value] = key;
        }
        return newObj;
    };

    const validatePhoneNumber = (phone: any) => {
        const phoneRegex = /^\d{3}[-.\s]?\d{3}[-.\s]?\d{4}$/;
        return phoneRegex.test(phone);
    };

    return (
        <div className="mb-5">
            <Transition appear show={modal3} as={Fragment}>
                <Dialog as="div" open={modal3} onClose={() => setModal3(true)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
                        <div className="flex items-start justify-center min-h-screen px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden  w-full max-w-5xl  my-8 text-black dark:text-white-dark">
                                    <div className="flex bg-danger/10 dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                        <div className="font-bold text-lg">Bulk Lead Upload</div>

                                    </div>

                                    {tab == "select" ? (
                                        <div className="p-5">



                                            <div className="grid grid-cols-12  gap-4">
                                                <div className='col-span-8 panel bg-[#ebedf2]'>
                                                    <div className="table-responsive mb-5 max-h-[calc(100vh-300px)]">
                                                        <table >
                                                            <thead>
                                                                <tr>
                                                                    <th>File Column</th>
                                                                    <th>Column Data</th>

                                                                    {/* <th className="text-center">Selected</th> */}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {firstObjectKeys.map((field, index) => {
                                                                    return (
                                                                        <tr key={index + 1}>
                                                                            <td>
                                                                                <div className="whitespace-nowrap">{field}</div>
                                                                            </td>
                                                                            <td>
                                                                                <div className='max-w-[350px] truncate'>
                                                                                    {sampleData.map((data: any, index: number) => (
                                                                                        <span className='badge bg-[#3b3f5c] me-1' key={index + 1}>{data[field]}</span>
                                                                                    ))}
                                                                                </div>
                                                                            </td>


                                                                            {/* <td className="text-center">
                            <label className="inline-flex">
                                <input type="checkbox" className="form-checkbox text-success rounded-full" checked={targetedFields.includes(field) ? true : false} />
                            </label>
                        </td> */}
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                <div className='col-span-4 panel bg-primary/10'>

                                                    <div className="flex items-center">
                                                        <label className="w-12 h-6 relative mr-2 mb-0">
                                                            <input
                                                                type="checkbox"
                                                                className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                                                id="custom_switch_checkbox1"
                                                                onChange={(e) => changeValue(e)}
                                                                name='is_to_employee'
                                                                checked={params.is_to_employee ? true : false}
                                                            />
                                                            <span className="bg-red-500 block h-full rounded-full before:absolute before:left-1 before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:bg-green-500 peer-checked:before:left-7 before:transition-all before:duration-300"></span>
                                                        </label>
                                                        <span className='font-bold'>Sending To Employee</span>
                                                    </div>

                                                    {params.is_to_employee ? (
                                                        <div className='mt-2'>
                                                            <select className="form-select text-white-dark" onChange={(e) => changeValue(e)} name="user_id" value={params.user_id}>
                                                                <option value={''}>Select Employee</option>
                                                                {employees?.map((employee) => (
                                                                    <option key={employee.id} value={employee.id}>{employee.user_type} - {employee?.first_name + ' ' + employee?.last_name}</option>
                                                                ))}
                                                            </select>
                                                            <span className='text-danger text-[13px]'>{errors?.user_id}</span>
                                                        </div>
                                                    ) : null}



                                                    <hr className='my-4' />
                                                    <div className='text-center mb-2'>
                                                        <h6 className='font-extrabold'>Select Fields</h6>
                                                    </div>

                                                    <div className='mb-2'>
                                                        <div className="flex">
                                                            <div className="bg-danger-light w-[100px] flex  items-center ltr:rounded-l-md rtl:rounded-r-md px-2 text-[16px]  border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                State
                                                            </div>
                                                            <select onChange={(e) => changeValue(e)} name="state" value={params.state} className="form-select text-white-dark  py-2 text-xs ltr:rounded-l-none rtl:rounded-r-none">
                                                                <option value={''} >-- Select State --</option>

                                                                {states.map((state: any) => (
                                                                    <option key={state.id} value={state.value}>{state.value}</option>
                                                                ))}

                                                            </select>
                                                        </div>
                                                        <span className='text-danger text-[13px]'>{errors?.state}</span>
                                                    </div>

                                                    <div className='mb-5'>
                                                        <div className="flex">
                                                            <div className="bg-danger-light w-[100px] flex  items-center ltr:rounded-l-md rtl:rounded-r-md px-2 text-[16px]  border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                Status
                                                            </div>
                                                            <select onChange={(e) => changeValue(e)} name="status" className="form-select text-white-dark  py-2 text-xs ltr:rounded-l-none rtl:rounded-r-none">
                                                                <option value={''} >-- Select Status --</option>


                                                                {statuses.map((status: any) => (
                                                                    <option key={status.id} value={status.value}>{status.value}</option>
                                                                ))}

                                                            </select>
                                                        </div>
                                                        <span className='text-danger text-[13px]'>{errors?.status}</span>
                                                    </div>

                                                    <div className='mb-2'>
                                                        <div className="flex">
                                                            <div className="bg-danger-light w-[100px] flex  items-center ltr:rounded-l-md rtl:rounded-r-md px-2 text-[16px]  border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                Phone
                                                            </div>
                                                            <select onChange={(e) => changeValue(e)} name="phone" className="form-select text-white-dark  py-2 text-xs ltr:rounded-l-none rtl:rounded-r-none">
                                                                <option value={''} >-- Select Phone --</option>



                                                                {firstObjectKeys.map((data: any, index: number) => (
                                                                    <option key={index + 1} value={data}>{data}</option>
                                                                ))}


                                                            </select>
                                                        </div>
                                                        <span className='text-danger text-[13px]'>{errors?.phone}</span>
                                                    </div>


                                                    <div className='mb-2'>
                                                        <div className="flex">
                                                            <div className="bg-danger-light w-[100px] flex  items-center ltr:rounded-l-md rtl:rounded-r-md px-2 text-[16px]  border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                Source
                                                            </div>
                                                            <select onChange={(e) => changeValue(e)} name="source" className="form-select text-white-dark  py-2 text-xs ltr:rounded-l-none rtl:rounded-r-none">
                                                                <option value={''} >-- Select Source --</option>
                                                                {firstObjectKeys.map((data: any, index: number) => (
                                                                    <option key={index + 1} value={data}>{data}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <span className='text-danger text-[13px]'>{errors?.source}</span>
                                                    </div>

                                                    <div className='mb-2'>
                                                        <div className="flex">
                                                            <div className="bg-[#eee] w-[100px] flex  items-center ltr:rounded-l-md rtl:rounded-r-md px-2 text-[16px]  border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                Name
                                                            </div>
                                                            <select onChange={(e) => changeValue(e)} name="name" className="form-select text-white-dark  py-2 text-xs ltr:rounded-l-none rtl:rounded-r-none">
                                                                <option value={''} >-- Select Name --</option>
                                                                {firstObjectKeys.map((data: any, index: number) => (
                                                                    <option key={index + 1} value={data}>{data}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <span className='text-danger text-[13px]'>{errors?.name}</span>
                                                    </div>

                                                    <div className='mb-2'>
                                                        <div className="flex">
                                                            <div className="bg-[#eee] w-[100px] flex  items-center ltr:rounded-l-md rtl:rounded-r-md px-2 text-[16px]  border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                Email
                                                            </div>
                                                            <select onChange={(e) => changeValue(e)} name="email" className="form-select text-white-dark  py-2 text-xs ltr:rounded-l-none rtl:rounded-r-none">
                                                                <option value={''} >-- Select Email --</option>
                                                                {firstObjectKeys.map((data: any, index: number) => (
                                                                    <option key={index + 1} value={data}>{data}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <span className='text-danger text-[13px]'>{errors?.email}</span>
                                                    </div>


                                                    <div className='mb-2'>
                                                        <div className="flex">
                                                            <div className="bg-[#eee] w-[100px] flex  items-center ltr:rounded-l-md rtl:rounded-r-md px-2 text-[16px]  border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                City
                                                            </div>
                                                            <select onChange={(e) => changeValue(e)} name='city' className="form-select text-white-dark  py-2 text-xs ltr:rounded-l-none rtl:rounded-r-none">
                                                                <option value={''} >-- Select City --</option>
                                                                {firstObjectKeys.map((data: any, index: number) => (
                                                                    <option key={index + 1} value={data}>{data}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <span className='text-danger text-[13px]'>{errors?.city}</span>
                                                    </div>

                                                </div>
                                            </div>




                                            <div className="flex justify-between px-8 items-center mt-8">
                                                <button type="button" onClick={() => setModal3(false)} className="btn btn-danger shadow">
                                                    Discard
                                                </button>

                                                <button type="button" disabled={isValidating ? true : false} onClick={() => validateSelectField()} className="btn btn-success shadow ltr:ml-4 rtl:mr-4">
                                                    Validate
                                                </button>
                                            </div>
                                        </div>
                                    ) : tab == "import" ? <><ImportCsvData setModal3={setModal3} validInfo={validInfo} importData={importData} unique_id={unique_id} setAction={setAction} checkLeadUpload={checkLeadUpload} params={params} /></> : null}

                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}


const ImportCsvData = ({ setModal3, validInfo, importData, unique_id, setAction, checkLeadUpload, params }: any) => {

    const { logout, crmToken, apiUrl } = useAuth();


    const [per, setPer] = useState(0);
    const [isUploading, setIsUploading] = useState(false)

    const findChunkSize = (number: number) => {
        let n = 0;

        if (number <= 4999) {
            n = 200;
        } else if (number >= 5000 && number <= 9999) {
            n = 250;
        } else if (number >= 10000 && number <= 24999) {
            n = 500;
        } else if (number >= 25000 && number <= 49999) {
            n = 1000;
        } else if (number >= 50000 && number <= 99999) {
            n = 2000;
        } else if (number >= 100000 && number <= 249999) {
            n = 2500;
        } else if (number >= 250000 && number <= 499999) {
            n = 5000;
        } else n = 5000;

        return n;
    };

    const importToServer = async () => {

        const leads = importData;

        console.log(leads)


        const totalLeads = leads.length;

        if (totalLeads > 5000000) {
            alert("Maximum 5k records per upload")
            return 0;
        }
        let chunkSize = findChunkSize(totalLeads);
        const times = Math.ceil(totalLeads / chunkSize);
        const eachPercentage = 100 / times;
        setPer(0);
        console.log(totalLeads)
        setIsUploading(true)
        try {

            for (let i = 0; i < totalLeads; i += chunkSize) {
                const chunk = leads.slice(i, i + chunkSize);

                const data = {
                    leads: chunk.map((c: any) => c),
                    total: !i ? totalLeads : null,
                    unique_id: !i ? unique_id : null,
                    is_to_employee: !i ? params.is_to_employee : null,
                    user_id: !i ? params.user_id : null,
                }

                const response = await axios({
                    method: 'post',
                    data,
                    url: apiUrl + "/api/lead-bulk-upload",
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + crmToken,
                    },
                });
                if (response.data.status == "success") {
                    setPer(a => a + eachPercentage)
                    console.log(eachPercentage)

                }
            }
            setAction('move')
            checkLeadUpload()
            console.log("completed")
        } catch (error) {
            console.log(error)
            if (error?.response?.status == 401) logout()
        } finally {

        }
    }
    return (<>
        <div className="flex justify-around m-5 text-white">
            <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
                <div className="">
                    <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Total Leads</div>
                </div>
                <div className=" items-center mt-5">
                    <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{validInfo?.total}</div>
                </div>
            </div>

            <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
                <div className="">
                    <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Invali Leads</div>
                </div>
                <div className=" items-center mt-5">
                    <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{validInfo.invalid}</div>
                </div>
            </div>

            <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
                <div className="">
                    <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Duplicate Leads</div>
                </div>
                <div className=" items-center mt-5">
                    <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{validInfo.duplicate}</div>
                </div>
            </div>

            <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
                <div className="">
                    <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Valid Leads</div>
                </div>
                <div className=" items-center mt-5">
                    <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{validInfo.valid}</div>
                </div>
            </div>
        </div>

        <div className="h-[100px] items-center p-3.5 rounded text-primary  text-center ">



            {per ? <div className='bg-black/10 rounded-full w-2/3 m-auto'>
                <div
                    className={`bg-primary h-4 rounded-full animated-progress`}
                    style={{
                        backgroundImage:
                            'linear-gradient(45deg,hsla(0,0%,100%,.15) 25%,transparent 0,transparent 50%,hsla(0,0%,100%,.15) 0,hsla(0,0%,100%,.15) 75%,transparent 0,transparent)',
                        backgroundSize: '1rem 1rem',
                        width: `${Math.round(per)}%`
                    }}
                ></div>
            </div> : <span className="ltr:pr-2 rtl:pl-2">
                <strong className="ltr:mr-1 rtl:ml-1 text-2xl">{validInfo.valid} leads are ready to upload to server!</strong>
            </span>}

        </div>

        <div className="flex justify-between px-8 items-center mt-2 bg-danger/10 p-3">
            <button type="button" onClick={() => setModal3(false)} className="btn btn-danger shadow">
                Discard
            </button>

            {validInfo.valid ? <button type="button" onClick={() => importToServer()} className="btn btn-success shadow ltr:ml-4 rtl:mr-4">
                Upload To Server
            </button> : ''}

        </div>

    </>)
}

export default Upload;
