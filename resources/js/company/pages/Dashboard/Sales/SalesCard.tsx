import React from 'react'
import IconLink from '../../../components/Icon/IconLink'
import IconUsersGroup from '../../../components/Icon/IconUsersGroup'
import IconChatDots from '../../../components/Icon/IconChatDots'
import Skeleton from 'react-loading-skeleton'

export default function SalesCard({ saleData }) {
    return (
        <div className="grid sm:grid-cols-4 xl:grid-cols-4 gap-6 mb-6">
            <div className="panel h-full p-0">
                <div className="flex p-5">
                    <div className="shrink-0 bg-success/10 text-success rounded-xl w-11 h-11 flex justify-center items-center dark:bg-success dark:text-white-light">
                        <IconChatDots className="w-5 h-5" />
                    </div>
                    <div className="ltr:ml-3 rtl:mr-3 font-semibold">
                        <p className="text-xl dark:text-white-light">{saleData.todaySales}</p>
                        <h5 className="text-[#506690] text-xs">Today Sales</h5>
                    </div>
                </div>
            </div>
            <div className="panel h-full p-0">
                <div className="flex p-5">
                    <div className="shrink-0 bg-success/10 text-success rounded-xl w-11 h-11 flex justify-center items-center dark:bg-success dark:text-white-light">
                        <IconChatDots className="w-5 h-5" />
                    </div>
                    <div className="ltr:ml-3 rtl:mr-3 font-semibold">
                        <p className="text-xl dark:text-white-light">{saleData.thisMonthSales}</p>
                        <h5 className="text-[#506690] text-xs">Monthly Sales</h5>
                    </div>
                </div>
            </div>
            <div className="panel h-full p-0">
                <div className="flex p-5">
                    <div className="shrink-0 bg-primary/10 text-primary rounded-xl w-11 h-11 flex justify-center items-center dark:bg-primary dark:text-white-light">
                        <IconUsersGroup className="w-5 h-5" />
                    </div>
                    <div className="ltr:ml-3 rtl:mr-3 font-semibold">
                        <p className="text-xl dark:text-white-light">{saleData.yearlySales}</p>
                        <h5 className="text-[#506690] text-xs">Yearly Sales</h5>
                    </div>
                </div>
            </div>
            <div className="panel h-full p-0">
                <div className="flex p-5">
                    <div className="shrink-0 bg-danger/10 text-danger rounded-xl w-11 h-11 flex justify-center items-center dark:bg-danger dark:text-white-light">
                        <IconLink className="w-5 h-5" />
                    </div>
                    <div className="ltr:ml-3 rtl:mr-3 font-semibold">
                        <p className="text-xl dark:text-white-light">{saleData.totalSales}</p>
                        <h5 className="text-[#506690] text-xs">Total Sales</h5>
                    </div>
                </div>
            </div>
        </div>
    )
}
