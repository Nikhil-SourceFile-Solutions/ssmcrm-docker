import React from 'react'
// import LeadCardLoader from './LeadCardLoader'
import { useNavigate } from 'react-router-dom';
import { TbHandClick } from "react-icons/tb";
import { useCallback } from 'react';
import IconChatDots from '../../../components/Icon/IconChatDots';
import IconUsersGroup from '../../../components/Icon/IconUsersGroup';
import IconLink from '../../../components/Icon/IconLink';

export default function Card({ cardData,hrData, filter, setFilter }) {

    console.log('hrData',hrData);

    // const { isFirstLoading, cardReload } = filter;
    const navigate = useNavigate();
    const navigateToLeads = useCallback((fStatus, fOwner) => {
        // alert(99)
        console.log('click event')
        // navigate('/leads/viewleads', {
        //     state: {
        //         fOwner,
        //         fStatus,
        //         fState: 0,
        //     },
        // });
    }, [navigate]);

    const cardItems = [
        { title: 'Todays Sales Amount', key: 'todaysales',amount:hrData.todaysSales, colors: 'from-cyan-500 to-cyan-400', fStatus: 0 },
        { title: 'This Month Sales Amount', key: 'monthlysale',amount:hrData.monthlySales, colors: 'from-[#6bed3d] to-[#09e1cd]', fStatus: 'Closed Won' },
        { title: 'This Year Sale Amount', key: 'yealysale',amount:hrData.yearlySales, colors: 'from-blue-500 to-blue-400', fStatus: 'Free Trial' },
        { title: 'Total Sales Amount', key: 'totalsale',amount:hrData.totalSales, colors: 'from-fuchsia-500 to-fuchsia-400', fStatus: 'Follow Up' },
    ];




    return (
        <>
            {/* {isFirstLoading | cardReload ? <LeadCardLoader /> : ( */}
                <>
                    {/* <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5 gap-6 mb-6 text-white">
                        {cardItems.map(({ title, key, colors, fStatus, fOwner = 0 }) => (
                            <div key={key} className={`panel bg-gradient-to-r ${colors} cursor-pointer group/item`} onClick={() => navigateToLeads(fStatus, fOwner)}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">{title}</div>
                                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">{cardData?.[key]}</div>
                                    </div>
                                    <span className="invisible group-hover/item:visible "><TbHandClick size={25} /></span>
                                </div>
                            </div>
                        ))}
                    </div> */}

                    <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-6 mb-6 text-white">
                        {cardItems.map(({ title, key,amount, colors, fStatus, fOwner = 0 }) => (
                            <div key={key} className={`panel bg-gradient-to-r ${colors} cursor-pointer group/item`} onClick={() => navigateToLeads(fStatus, fOwner)}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">{title}</div>
                                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">{cardData?.[key]}</div>
                                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">{amount}</div>

                                    </div>
                                    <span className="invisible group-hover/item:visible "><TbHandClick size={25} /></span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-6 mb-6 text-white">
                        {cardItems1.map(({ title, key,amount, colors, fStatus, fOwner = 0 }) => (
                            <div key={key} className={`panel bg-gradient-to-r ${colors} cursor-pointer group/item`} onClick={() => navigateToLeads(fStatus, fOwner)}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">{title}</div>
                                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">{cardData?.[key]}</div>
                                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">{amount}</div>

                                    </div>
                                    <span className="invisible group-hover/item:visible "><TbHandClick size={25} /></span>
                                </div>
                            </div>
                        ))}
                    </div> */}
                      <div className="grid sm:grid-cols-4 xl:grid-cols-4 gap-6 mb-6">
            <div className="panel h-full p-0">
                <div className="flex p-5">
                    <div className="shrink-0 bg-success/10 text-success rounded-xl w-11 h-11 flex justify-center items-center dark:bg-success dark:text-white-light">
                        <IconChatDots className="w-5 h-5" />
                    </div>
                    <div className="ltr:ml-3 rtl:mr-3 font-semibold">
                        <p className="text-xl dark:text-white-light">{hrData?.totalEmployees}</p>
                        <h5 className="text-[#506690] text-xs">Total Employee</h5>
                    </div>
                </div>
            </div>
            <div className="panel h-full p-0">
                <div className="flex p-5">
                    <div className="shrink-0 bg-success/10 text-success rounded-xl w-11 h-11 flex justify-center items-center dark:bg-success dark:text-white-light">
                        <IconChatDots className="w-5 h-5" />
                    </div>
                    <div className="ltr:ml-3 rtl:mr-3 font-semibold">
                        <p className="text-xl dark:text-white-light">{hrData?.activeEmployees}</p>
                        <h5 className="text-[#506690] text-xs">Total Active Employee</h5>
                    </div>
                </div>
            </div>
            <div className="panel h-full p-0">
                <div className="flex p-5">
                    <div className="shrink-0 bg-primary/10 text-primary rounded-xl w-11 h-11 flex justify-center items-center dark:bg-primary dark:text-white-light">
                        <IconUsersGroup className="w-5 h-5" />
                    </div>
                    <div className="ltr:ml-3 rtl:mr-3 font-semibold">
                        <p className="text-xl dark:text-white-light">{hrData?.inactiveEmployees}</p>
                        <h5 className="text-[#506690] text-xs">Total Inactive Employee</h5>
                    </div>
                </div>
            </div>
            <div className="panel h-full p-0">
                <div className="flex p-5">
                    <div className="shrink-0 bg-danger/10 text-danger rounded-xl w-11 h-11 flex justify-center items-center dark:bg-danger dark:text-white-light">
                        <IconLink className="w-5 h-5" />
                    </div>
                    <div className="ltr:ml-3 rtl:mr-3 font-semibold">
                        <p className="text-xl dark:text-white-light">{hrData?.presentEmployees}</p>
                        <h5 className="text-[#506690] text-xs">Total Present Employee</h5>
                    </div>
                </div>
            </div>
        </div>
                </>
            {/* )} */}
        </>
    );
}
