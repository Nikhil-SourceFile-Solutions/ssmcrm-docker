import React, { useState, Fragment, useEffect } from 'react'
import LeadCardLoader from './LeadCardLoader'
import { useNavigate } from 'react-router-dom';
import { TbHandClick } from "react-icons/tb";
import { useCallback } from 'react';
import { GiSandsOfTime } from 'react-icons/gi';
import { Dialog, Transition } from '@headlessui/react';
import PageLoader from '../../../components/Layouts/PageLoader';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';

export default function Card({ cardData, filter, setFilter, serviceData }) {

    const { isFirstLoading, cardReload } = filter;
    const navigate = useNavigate();
    const navigateToLeads = useCallback((fStatus, fOwner) => {
        navigate('/leads/viewleads', {
            state: {
                fOwner,
                fStatus,
                fState: 0,
            },
        });
    }, [navigate]);

    const cardItems = [
        { title: 'Total Leads', key: 'total', colors: 'from-cyan-500 to-cyan-400', fStatus: 0 },
        { title: 'Closed Won', key: 'closedWon', colors: 'from-[#6bed3d] to-[#09e1cd]', fStatus: 'Closed Won' },
        { title: 'Free Trial', key: 'freeTrail', colors: 'from-blue-500 to-blue-400', fStatus: 'Free Trial' },
        { title: 'Follow UP', key: 'followup', colors: 'from-fuchsia-500 to-fuchsia-400', fStatus: 'Follow Up' },
        { title: 'Admin Leads', key: 'admin', colors: 'from-violet-500 to-violet-400', fStatus: 0, fOwner: 1 },
    ];

    const serviceItems = [
        {
            title: "Active Services",
            key: "activeservices",
            color: "text-success",
            bgColor: "dark:bg-success",
        },
        {
            title: "Expired Today",
            key: "expiredtoday",
            color: "text-danger",
            bgColor: "dark:bg-success",
        },
        {
            title: "Expiring Tomorrow",
            key: "expiringtomorrow",
            color: "text-danger",
            bgColor: "dark:bg-primary",
        },
        {
            title: "Expiring This Week",
            key: "expiringthisweek",
            color: "text-danger",
            bgColor: "dark:bg-danger",
        },
        {
            title: "Expiring This Month",
            key: "expiringthismonth",
            color: "text-danger",
            bgColor: "dark:bg-danger",
        },
    ];


    return (
        <>
            {isFirstLoading | cardReload ? <LeadCardLoader /> : (
                <>

                    <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5 gap-6 mb-6 text-white ">
                        {cardItems.map(({ title, key, colors, fStatus, fOwner = 0 }) => (
                            <div key={key} className={`py-2 px-3 rounded hover:scale-105 bg-gradient-to-r ${colors} cursor-pointer group/item`} onClick={() => navigateToLeads(fStatus, fOwner)}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">{title}</div>
                                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-3">{cardData?.[key]}</div>
                                    </div>
                                    <span className="invisible group-hover/item:visible "><TbHandClick size={25} /></span>
                                </div>
                            </div>
                        ))}
                    </div>



                    <div className="grid sm:grid-cols-4 xl:grid-cols-5 gap-6 mb-6">
                        {serviceItems.map((status, index) => (
                            <StatusCard
                                key={index}
                                title={status.title}
                                value={serviceData?.[status.key]}
                                color={status.color}
                                bgColor={status.bgColor}
                                datakey={status.key}
                            />
                        ))}
                    </div>






                </>
            )}
        </>
    );
}


const StatusCard = ({ title, value, color, bgColor, datakey }) => {

    const { logout, crmToken, apiUrl, selectedBranch } = useAuth();
    const [modal5, setModal5] = useState(false);

    const [data, setData] = useState(null);
    const [tableData, seTtableData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async (data) => {

        setIsLoading(true)
        try {
            // 
            seTtableData([])
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/home-data-services-details",
                params: {
                    action: data.key,
                },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") seTtableData(response.data.data)
        } catch (error) {
            seTtableData([])
        } finally {
            setTimeout(() => {
                setIsLoading(false)
            }, 500);
        }
    }

    useEffect(() => {
        if (data) {
            setModal5(true)
            fetchData(data)
        }
    }, [data])

    return (
        <>
            <div className="panel h-full p-0 cursor-pointer hover:scale-105">
                <div className="flex p-2" onClick={() => setData({ title: title, key: datakey })}>
                    <div
                        className={`shrink-0 ${color} rounded-xl flex justify-center items-center ${bgColor} dark:text-white-light`}
                    >
                        <GiSandsOfTime size={25} />
                    </div>
                    <div className="ltr:ml-3 rtl:mr-3 font-semibold">
                        <p className="text-xl dark:text-white-light">{value}</p>
                        <h5 className="text-[#506690] text-xs">{title}</h5>
                    </div>
                </div>
            </div>


            <Transition appear show={modal5} as={Fragment}>
                <Dialog as="div" open={modal5} onClose={() => { }}>
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
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-5xl my-8 text-black dark:text-white-dark animate__animated animate__slideInDown">
                                    <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                        <h5 className="font-bold text-lg">{data?.title}</h5>
                                    </div>
                                    <div className="">
                                        {isLoading ? <PageLoader /> : (
                                            <div className="table-responsive max-h-[calc(100vh-300px)] overflow-y-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr>
                                                            <th>Client</th>
                                                            <th>Phone</th>
                                                            <th>Product</th>
                                                            <th className="w-[125px]">Start Date</th>
                                                            <th className="w-[125px]">Due Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {tableData.map((data) => {
                                                            return (
                                                                <tr key={data.id}>

                                                                    <td className="max-w-[250px] truncate"> {/* Set max-width and apply truncate */}
                                                                        <div className="whitespace-nowrap">{data.first_name} {data.last_name}</div>
                                                                    </td>
                                                                    <td>{data.phone}</td>
                                                                    <td>{data.product}</td>
                                                                    <td>{data.start_date}</td>
                                                                    <td>{data.due_date}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center p-5">
                                            <span className="badge bg-[#075E54]">
                                                Total {tableData.length}
                                            </span>
                                            <button onClick={() => setModal5(false)} disabled={isLoading} type="button" className="btn btn-outline-danger">
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

        </>
    );
};
