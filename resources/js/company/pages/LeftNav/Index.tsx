import React from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Link } from 'react-router-dom';
import IconArrowLeft from '../../components/Icon/IconArrowLeft';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import AnimateHeight from 'react-animate-height';
import { useState } from 'react';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import LeadUploadedActivity from './LeadUploadedActivity';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { useAuth } from '../../AuthContext';

const tableData = [
    {
        id: 1,
        Value: 'Calls',
        Daily: '0',
        Monthly: '0',
    },
    {
        id: 2,
        Value: 'Free Trial',
        Daily: '0',
        Monthly: '0',
    },
    {
        id: 3,
        Value: 'Follow Up',
        Daily: '0',
        Monthly: '0',
    },
];

const ManagertableData = [
    {
        id: 1,
        MangName: 'Prabunath',
        MangAmount: '0',
        MangStatus: 'Requested',
    },
    {
        id: 2,
        MangName: 'Prakash',
        MangAmount: '0',
        MangStatus: 'Requested',
    },
    {
        id: 3,
        MangName: 'Bharath',
        MangAmount: '0',
        MangStatus: 'Requested',
    },
];
export default function LeftNav() {

    const {crmToken} = useAuth()


    const [active, setActive] = useState<string>('1');

    const togglePara = (value: string) => {
        setActive((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };
    return (
        <div>
            <div className="mb-5">
                <div className="space-y-2 font-semibold">
                    {/* --------------------------------------For Admin-------------------------------------- */}
                    <LeadUploadedActivity togglePara={togglePara} active={active} crmToken={crmToken} />
                    {/* --------------------------------------For All-------------------------------------- */}
                    <div className="border border-[#d3d3d3] rounded dark:border-[#1b2e4b]">
                        <button
                            type="button"
                            className={`p-4 w-full flex items-center text-white-dark dark:bg-[#1b2e4b] ${active === '2' ? '!text-primary' : ''}`}
                            onClick={() => togglePara('2')}
                        >
                            Recent Activities
                            <div className={`ltr:ml-auto rtl:mr-auto ${active === '2' ? 'rotate-180' : ''}`}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <div>
                            <AnimateHeight duration={300} height={active === '2' ? 'auto' : 0}>
                                <div className="space-y-2 p-4 text-white-dark text-[13px] border-t border-[#d3d3d3] dark:border-[#1b2e4b]">
                                    <PerfectScrollbar className="relative h-[160px] ltr:pr-3 rtl:pl-3 ltr:-mr-3 rtl:-ml-3 mb-4">
                                        <div className="text-sm cursor-pointer">

                                            <div className="flex items-center py-1.5 relative group">
                                                <div className="flex-1">Send Mail to HR and Admin</div>
                                                <div className="ltr:ml-auto rtl:mr-auto text-xs text-white-dark dark:text-gray-500">2 min ago</div>
                                            </div>
                                            <div className="flex items-center py-1.5 relative group">
                                                <div className="flex-1">Backup Files EOD</div>
                                                <div className="ltr:ml-auto rtl:mr-auto text-xs text-white-dark dark:text-gray-500">14:00</div>
                                            </div>
                                            <div className="flex items-center py-1.5 relative group">
                                                <div className="flex-1">Collect documents from Sara</div>
                                                <div className="ltr:ml-auto rtl:mr-auto text-xs text-white-dark dark:text-gray-500">16:00</div>
                                            </div>
                                            <div className="flex items-center py-1.5 relative group">
                                                <div className="flex-1">Conference call with Marketing Manager.</div>
                                                <div className="ltr:ml-auto rtl:mr-auto text-xs text-white-dark dark:text-gray-500">17:00</div>
                                            </div>
                                            <div className="flex items-center py-1.5 relative group">
                                                <div className="flex-1">Rebooted Server</div>
                                                <div className="ltr:ml-auto rtl:mr-auto text-xs text-white-dark dark:text-gray-500">17:00</div>
                                            </div>
                                            <div className="flex items-center py-1.5 relative group">
                                                <div className="flex-1">Send contract details to Freelancer</div>
                                                <div className="ltr:ml-auto rtl:mr-auto text-xs text-white-dark dark:text-gray-500">18:00</div>
                                            </div>
                                            <div className="flex items-center py-1.5 relative group">
                                                <div className="flex-1">Updated Server Logs</div>
                                                <div className="ltr:ml-auto rtl:mr-auto text-xs text-white-dark dark:text-gray-500">Just Now</div>
                                            </div>
                                        </div>
                                    </PerfectScrollbar>
                                </div>
                            </AnimateHeight>
                        </div>
                    </div>
                    {/* --------------------------------------For BDE and Manager-------------------------------------- */}
                    <div className="border border-[#d3d3d3] dark:border-[#1b2e4b] rounded">
                        <button
                            type="button"
                            className={`p-4 w-full flex items-center text-white-dark dark:bg-[#1b2e4b] `}
                            onClick={() => togglePara('3')}
                        >
                            Last 4 Month Sales
                            <div className={`ltr:ml-auto rtl:mr-auto `}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <div>
                            <AnimateHeight duration={300} height={active === '3' ? 'auto' : 0}>
                                <div className="p-4 text-[13px] border-t border-[#d3d3d3] dark:border-[#1b2e4b]">
                                    <PerfectScrollbar className="relative h-[160px] ltr:pr-3 rtl:pl-3 ltr:-mr-3 rtl:-ml-3 mb-4">
                                        <div className="text-sm cursor-pointer">
                                            <div className="flex items-center py-1.5 relative group">
                                                <div className="flex-1">Feburary 2024</div>
                                                <div className="ltr:ml-auto rtl:mr-auto text-xs text-white-dark dark:text-gray-500">0</div>
                                            </div>
                                            <div className="flex items-center py-1.5 relative group">
                                                <div className="flex-1">March 2024</div>
                                                <div className="ltr:ml-auto rtl:mr-auto text-xs text-white-dark dark:text-gray-500">0</div>
                                            </div>
                                            <div className="flex items-center py-1.5 relative group">
                                                <div className="flex-1">April 2024</div>
                                                <div className="ltr:ml-auto rtl:mr-auto text-xs text-white-dark dark:text-gray-500">0</div>
                                            </div>
                                            <div className="flex items-center py-1.5 relative group">
                                                <div className="flex-1">May 2024</div>
                                                <div className="ltr:ml-auto rtl:mr-auto text-xs text-white-dark dark:text-gray-500">0</div>
                                            </div>
                                            <div className="flex items-center py-1.5 relative group">
                                                <div className="flex-1">June 2024</div>
                                                <div className="ltr:ml-auto rtl:mr-auto text-xs text-white-dark dark:text-gray-500">0</div>
                                            </div>

                                        </div>
                                    </PerfectScrollbar>
                                </div>
                            </AnimateHeight>
                        </div>
                    </div>
                    {/* --------------------------------------For BDE and Manager-------------------------------------- */}
                    <div className="border border-[#d3d3d3] dark:border-[#1b2e4b] rounded">
                        <button
                            type="button"
                            className={`p-4 w-full flex items-center text-white-dark dark:bg-[#1b2e4b] `}
                            onClick={() => togglePara('4')}
                        >
                            Call Details
                            <div className={`ltr:ml-auto rtl:mr-auto `}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <div>
                            <AnimateHeight duration={300} height={active === '4' ? 'auto' : 0}>
                                <div className="p-1 text-[13px] border-t border-[#d3d3d3] dark:border-[#1b2e4b]">
                                    <div className="table-responsive mb-5">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Value</th>
                                                    <th>Daily</th>
                                                    <th>Monthly</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tableData.map((data) => {
                                                    return (
                                                        <tr key={data.id}>
                                                            <td>
                                                                <div className="whitespace-nowrap">{data.Value}</div>
                                                            </td>
                                                            <td>{data.Daily}</td>
                                                            <td>{data.Monthly}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </AnimateHeight>
                        </div>
                    </div>
                    {/* --------------------------------------For Admin, Accounts and Manager(View)-------------------------------------- */}
                    <div className="border border-[#d3d3d3] dark:border-[#1b2e4b] rounded">
                        <button
                            type="button"
                            className={`p-4 w-full flex items-center text-white-dark dark:bg-[#1b2e4b] `}
                            onClick={() => togglePara('5')}
                        >
                            Sales Details
                            <div className={`ltr:ml-auto rtl:mr-auto `}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <div>
                            <AnimateHeight duration={300} height={active === '5' ? 'auto' : 0}>
                                <div className="p-1 text-[13px] border-t border-[#d3d3d3] dark:border-[#1b2e4b]">
                                    <div className="table-responsive mb-5">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ManagertableData.map((data) => {
                                                    return (
                                                        <tr key={data.id}>
                                                            <td>
                                                                <div className="whitespace-nowrap">{data.MangName}</div>
                                                            </td>
                                                            <td>{data.MangAmount}</td>
                                                            <td>{data.MangStatus}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </AnimateHeight>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
