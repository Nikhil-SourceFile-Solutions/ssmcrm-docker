// import React, { useEffect, Fragment, useState } from 'react'
// import Swal from 'sweetalert2';
// import { useDispatch, useSelector } from 'react-redux';
// import { IRootState } from '../../store';
// import { setCrmToken } from '../../store/themeConfigSlice';
// import axios from 'axios';
// export default function Application({ leads, selectedRecords }) {
//     const dispatch = useDispatch();
//     const crmToken = useSelector((state: IRootState) => state.themeConfig.crmToken);

//     const apiUrl = useSelector((state: IRootState) => state.themeConfig.apiUrl);
//     console.log('application selectedRecords', selectedRecords);

//     const [filteredData, setFilteredData] = useState(false);

//     useEffect(() => {
//         const mappedData = selectedRecords.map(item => ({
//             number: item.number,
//             phone: item.phone
//         }));

//         setFilteredData(mappedData);
//     }, []);

//     const [defaultParams] = useState({
//         id: '',
//         script_name: '',
//         price_range: '',
//         action: '',
//         stoploss: '',
//         target_one: '',
//         target_two: '',
//         duration: '',
//         contact_details: ''
//     });
//     const [params, setParams] = useState<any>(defaultParams);
//     const [errors, setErros] = useState<any>({});
//     const validate = () => {
//         setErros({});
//         let errors = {};
//         if (!params.script_name) {
//             errors = { ...errors, script_name: "Employee Id is required" };
//         }
//         console.log(errors);
//         setErros(errors);
//         return { totalErrors: Object.keys(errors).length };
//     };
//     const [btnLoading, setBtnLoading] = useState(false);

//     const changeValue = (e: any) => {
//         const { value, name } = e.target;
//         setErros({ ...errors, [name]: "" });
//         setParams({ ...params, [name]: value });
//         console.table(params)
//     };

//     // const AddEmployee = async (data: any) => {
//     //     setBtnLoading(true)
//     //     try {
//     //         const response = await axios({
//     //             method: 'post',
//     //             url: apiUrl + "/api/save-application-notification",
//     //             data,
//     //             headers: {
//     //                 "Content-Type": "multipart/form-data",
//     //                 Authorization: "Bearer " + crmToken,
//     //             },
//     //         });
//     //         if (response.data.status == 'success') {
//     //             showMessage(response.data.message)
//     //             setParams(defaultParams);
//     //             console.log('params', params);
//     //         } else { alert("Failed") }

//     //     } catch (error: any) {
//     //         console.log(error)
//     //         if (error.response.status == 401) dispatch(setCrmToken(''))
//     //         if (error?.response?.status === 422) {
//     //             const serveErrors = error.response.data.errors;
//     //             let serverErrors = {};
//     //             for (var key in serveErrors) {
//     //                 serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
//     //                 console.log(serveErrors[key][0])
//     //             }
//     //             setErros(serverErrors);
//     //             Swal.fire({
//     //                 title: "Server Validation Error! Please Solve",
//     //                 toast: true,
//     //                 position: 'top',
//     //                 showConfirmButton: false,
//     //                 showCancelButton: false,
//     //                 width: 450,
//     //                 timer: 2000,
//     //                 customClass: {
//     //                     popup: "color-danger"
//     //                 }
//     //             });
//     //         }
//     //     } finally {
//     //         setBtnLoading(false)
//     //     }
//     // };

//     const formSubmit = () => {
//         const isValid = validate();
//         if (isValid.totalErrors) return false;
//         const data = new FormData();
//         data.append("id", params.id);
//         data.append("script_name", params.script_name);
//         data.append("price_range", params.price_range);
//         data.append("action", params.action);
//         data.append("stoploss", params.stoploss);
//         data.append("target_one", params.target_one);
//         data.append("target_two", params.target_two);
//         data.append("duration", params.duration);
//         data.append("contact_details", JSON.stringify(filteredData));
//         // AddEmployee(data);
//     };
//     const showMessage = (msg = '', type = 'success') => {
//         const toast: any = Swal.mixin({
//             toast: true,
//             position: 'top',
//             showConfirmButton: false,
//             timer: 3000,
//             customClass: { container: 'toast' },
//         });
//         toast.fire({
//             icon: type,
//             title: msg,
//             padding: '10px 20px',
//         });
//     };

//     return (
//         <div className=" pt-5">
//             <div className=' grid grid-cols-1 md:grid-cols-2 gap-2' >

//                 <div className='mb-4'>
//                     <input type="text" placeholder="Enter Price Range" className="form-input"
//                         name="script_name" onChange={(e) => changeValue(e)} value={params.script_name}
//                     />
//                     <div className="text-danger font-semibold text-sm">{errors.script_name}</div>
//                 </div>
//                 <div className='mb-4'>
//                     <input type="text" placeholder="Enter Price Range" className="form-input"
//                         name="price_range" onChange={(e) => changeValue(e)} value={params.price_range}
//                     />
//                     <div className="text-danger font-semibold text-sm">{errors.price_range}</div>
//                 </div>
//                 <div className='mb-4'>
//                     <select onChange={(e) => changeValue(e)} name="action" className="form-select text-white-dark  py-2 text-sm ">
//                         <option value={''} >Select Action</option>
//                         <option value={'Buy'} >Buy</option>
//                         <option value={'Sell'} >Sell</option>
//                         <option value={'Hold'} >Hold</option>

//                     </select>
//                     <div className="text-danger font-semibold text-sm">{errors.action}</div>
//                 </div>


//                 <div className='mb-4'>
//                     <input type="text" placeholder="Enter Stoploss" className="form-input"
//                         name="stoploss" onChange={(e) => changeValue(e)} value={params.stoploss}
//                     />
//                     <div className="text-danger font-semibold text-sm">{errors.stoploss}</div>
//                 </div>
//                 <div className='mb-4'>
//                     <input type="text" placeholder="Enter Target 1" className="form-input"
//                         name="target_one" onChange={(e) => changeValue(e)} value={params.target_one}
//                     />
//                     <div className="text-danger font-semibold text-sm">{errors.target_one}</div>
//                 </div>
//                 <div className='mb-4'>
//                     <input type="text" placeholder="Enter Target 2" className="form-input"
//                         name="target_two" onChange={(e) => changeValue(e)} value={params.target_two}
//                     />
//                     <div className="text-danger font-semibold text-sm">{errors.target_two}</div>
//                 </div>

//                 <div className='mb-4'>
//                     <select onChange={(e) => changeValue(e)} name="duration" className="form-select text-white-dark  py-2 text-sm ">
//                         <option value={''} >Select Duration</option>
//                         <option value={'Intraday'} >Intraday</option>
//                         <option value={'Holding'} >Holding</option>
//                     </select>
//                     <div className="text-danger font-semibold text-sm">{errors.duration}</div>
//                 </div>
//             </div>

//             <footer className="w-full text-center border-t border-grey p-4">
//                 <div className='flex justify-end gap-5 py-2'>
//                     <button className='btn shadow' onClick={() => { alert('Under progess') }} >Close</button>
//                     <button onClick={() => { formSubmit() }} type='button' disabled={btnLoading} className='btn btn-dark'> {btnLoading ? 'Please Wait' : 'Send Notification'} </button>
//                 </div>
//             </footer>
//         </div>
//     )
// }

import React from 'react'

export default function Application() {
  return (
    <div>Application





    </div>
  )
}
