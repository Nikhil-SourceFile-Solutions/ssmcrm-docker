import React, { useEffect } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Link } from 'react-router-dom';
import IconArrowLeft from '../../components/Icon/IconArrowLeft';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import AnimateHeight from 'react-animate-height';
import { useState } from 'react';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import axios from 'axios';
import PageLoader from '../../components/Layouts/PageLoader';
import { useSelector, useDispatch } from 'react-redux'
import { IRootState } from '../../store';

export default function LeadUploadedActivity({ togglePara, active, crmToken }: any) {


    const [isLoading, setIsLoading] = useState(true);

    const apiUrl = useSelector((state: IRootState) => state.themeConfig.apiUrl);

    const [files, setFiles] = useState([]);
    const fetchData = async () => {

        setIsLoading(true)
        try {
            //

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/uploded-fileinfo",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") {
                setFiles(response.data.files)
            }


        } catch (error) {

        } finally {
            setIsLoading(false)
        }

    }
    useEffect(() => {

        if (active == 1) fetchData()

    }, [active])
    return (
        <div className="border border-[#d3d3d3] rounded dark:border-[#1b2e4b]">
            <button
                type="button"
                className={`p-4 w-full flex items-center text-white-dark dark:bg-[#1b2e4b] ${active === '1' ? '!text-primary' : ''}`}
                onClick={() => togglePara('1')}
            >
                Leads Uploaded Activities
                <div className={`ltr:ml-auto rtl:mr-auto ${active === '1' ? 'rotate-180' : ''}`}>
                    <IconCaretDown />
                </div>
            </button>
            <div>
                <AnimateHeight duration={300} height={active === '1' ? 'auto' : 0}>

                    <div className="space-y-2 p-4 text-white-dark text-[13px] border-t border-[#d3d3d3] dark:border-[#1b2e4b]">
                        <PerfectScrollbar className="relative h-[160px] ltr:pr-3 rtl:pl-3 ltr:-mr-3 rtl:-ml-3 mb-4">
                            {isLoading ? <PageLoader /> : (
                                <div className="text-sm cursor-pointer">
                                    {files.map((file) => (
                                        <Tippy
                                            placement='right'
                                            content={`Inseted: ${file.inserted}  Duplicate: ${file.duplicate} Invalid: ${file.invalid
                                                }`}>
                                            <div className="flex items-center py-1.5 relative group">
                                                <div className="flex-1">{file.unique_id}</div>
                                                <div className="ltr:ml-auto rtl:mr-auto text-xs text-white-dark dark:text-gray-500">{file.created_at
                                                }</div>

                                            </div>
                                        </Tippy>
                                    ))}


                                </div>
                            )}


                        </PerfectScrollbar>
                    </div>
                </AnimateHeight>
            </div>
        </div>
    )
}
