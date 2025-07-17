import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import { setPageTitle } from '../../../store/themeConfigSlice';
import Upload from './Upload';
import MoveLead from './MoveLead';
import PageLoader from '../../../components/Layouts/PageLoader';
import Main from '../../Development/Main';
import { useAuth } from '../../../AuthContext';


export default function Index() {

    const { logout, crmToken, apiUrl } = useAuth();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (crmToken) {
            dispatch(setPageTitle("Upload Lead"))
            checkLeadUpload();
        }
    }, [crmToken])
    const [isLoading, setIsLoading] = useState(true);
    const [action, setAction] = useState('');
    const [states, setStates] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [fileInfo, setFileInfo] = useState([]);
    const [employees, setEmployees] = useState([]);
    const checkLeadUpload = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/check-upload-lead",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });
            if (response.data.status == "success") {
                setAction(response.data.action)
                if (response.data.action == 'upload') {
                    setStatuses(response.data.statuses)
                    setStates(response.data.states)
                    setEmployees(response.data.employees)
                } else if (response.data.action == 'move') {
                    setFileInfo(response.data.fileInfo)
                }
            }

        } catch (error) {

            console.log(error)
            if (error?.response?.status == 401) logout()

        } finally {
            setIsLoading(false)
        }
    }
    return (
        <div className="panel p-3 flex-1 ">
            <div className="relative h-full">

                {isLoading ? <PageLoader /> : action == 'upload' ? (
                    <Upload states={states} statuses={statuses} setAction={setAction} checkLeadUpload={checkLeadUpload} employees={employees} />
                ) : action == "move" ? <MoveLead fileInfo={fileInfo} setAction={setAction} checkLeadUpload={checkLeadUpload} /> : null}
                {/* <div className="flex justify-between items-center p-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button type="button" className="xl:hidden hover:text-primary" onClick={() => setIsShowChatMenu(!isShowChatMenu)}>
                            a</button>
                        <div className="mx-3"><p className="font-semibold">pAGE</p><p className="text-white-dark text-xs">Last seen at 2:05 PM</p></div>
                    </div>
                    <div className="flex sm:gap-5 gap-3">
                        <button>one</button>
                        <button>two</button>
                    </div>
                </div> */}


            </div>
        </div>
    );

}
