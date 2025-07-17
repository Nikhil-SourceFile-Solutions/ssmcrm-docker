import React, { useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useSelector } from 'react-redux';
import LeftTab from './LeftTab';
import Settings from './Settings';
import ListEmployee from './Employee/Index';
import Dropdown from './Dropdown';
import ProductSales from './Product/Index';
import AddEmployee from './Employee/AddEmployee';
import { IRootState } from '../../store';
import LeadAutomation from './LeadAutomation';
import Iptracking from './Iptracking';
import Payments from './PaymentGateWay/Payments';
import Permission from './Permission';

export default function Index() {

    const settingTap = useSelector((state: IRootState) => state.themeConfig.settingTap);

    return (

        <div className="flex gap-5 relative  h-full">
            <div className={`panel w-[280px] h-[calc(100vh-200px)]`}>
                <div className="flex flex-col h-full pb-2">
                    <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
                        <LeftTab />
                    </PerfectScrollbar>
                </div>
            </div>

            {
                settingTap == 'general' ?
                    <Settings /> :
                    settingTap == "employee" ? <ListEmployee /> :
                        settingTap == "addemployee" ? <AddEmployee /> :
                            settingTap == "permission" ? <Permission /> :
                                settingTap == "dropdown" ? <Dropdown /> :
                                    settingTap == "product" ? <ProductSales /> :
                                        settingTap == "leadautomation" ? <LeadAutomation /> :
                                            settingTap == "iptracking" ? <Iptracking /> :
                                                settingTap == "payments" ? <Payments /> :
                                                    null

            }

        </div>
    )
}
