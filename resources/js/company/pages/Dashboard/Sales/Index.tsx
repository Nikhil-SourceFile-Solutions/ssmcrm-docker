import React, { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import SalesCard from './SalesCard';
import SalesCardLoader from './SalesCardLoader';
import Index from './graph/Index';



function getCurrentFinancialYear() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfFinancialYear = new Date(currentYear, 3, 1);
    if (now < startOfFinancialYear) {
        return currentYear - 1;
    }
    return currentYear;
}


function getCurrentYear() {
    const now = new Date();
    return now.getFullYear();
}

function getCurrentMonthNumber() {
    const now = new Date();
    const month = now.getMonth() + 1;
    return String(month).padStart(2, '0');
}


const SalesDashboard = () => {

    const { logout, crmToken, apiUrl } = useAuth();
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Sales Dashboard'))
    }, [])

    // CARD SECTION
    const [cardData, setCardData] = useState([]);
    const [fetchingCard, setFetchingCard] = useState(true);



    const [tab, setTab] = useState('graph');

    function getCurrentMonthDateRange() {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const formattedFirstDay = [
            firstDay.getFullYear(),
            String(firstDay.getMonth() + 1).padStart(2, '0'),
            String(firstDay.getDate()).padStart(2, '0')
        ].join('-');
        const lastDay = new Date();
        const formattedLastDay = [
            lastDay.getFullYear(),
            String(lastDay.getMonth() + 1).padStart(2, '0'),
            String(lastDay.getDate()).padStart(2, '0')
        ].join('-');
        return [formattedFirstDay, formattedLastDay];
    }

    const [isLoading, setIsLoading] = useState(true);

    const [filter, setFilter] = useState({
        subTab: 'all-sales',
        allSaleFilter: {
            manager: 0,
            leader: 0,
            isActiveUsers: "active",
            chart: "column",
            reload: false,
            dateRange: getCurrentMonthDateRange()
        },
        employeeSaleFilter: {
            manager: 0,
            leader: 0,
            isActiveUsers: "active",
            chart: "column",
            reload: false,
            dateRange: getCurrentMonthDateRange()
        },
        yearlyReportFilter: {
            selectedYear: getCurrentYear(),
            pageSize: 10,
            page: 1
        },
        monthlyReportFilter: {
            selectedYear: getCurrentYear(),
            selectedMonth: getCurrentMonthNumber(),
            pageSize: 10,
            page: 1
        }
    })

    const [allSales, setAllSales] = useState([]);
    const [employeeSales, setEmployeeAllSales] = useState([]);
    const [count, setCount] = useState(0);
    const [filterUsers, setFilterUsers] = useState([]);
    const [yearlyReport, setYearlyReport] = useState([]);
    const [monthlyReport, setMonthlyReport] = useState([]);

    useEffect(() => {
        fetchLeadDashboardData();
    }, [filter]);


    const fetchLeadDashboardData = async () => {
        console.log("Fecheing Sales Dashboard Data ......")
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/home-data-sales-dashboard",
                params: {
                    fetchingCard: fetchingCard,
                    tab: tab,
                    filter: JSON.stringify(filter)
                },

                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {

                if (fetchingCard) {
                    setCardData(response.data.data['cardData'])
                }


                if (tab == "graph") {
                    setCount(response.data.data.count)
                    setFilterUsers(response.data.data.filterUsers)
                    if (filter.subTab == 'all-sales') setAllSales(response.data.data['allSales'])
                    else if (filter.subTab == 'employee-sales') setEmployeeAllSales(response.data.data['employeeSales'])
                    else if (filter.subTab == "yearly-report") setYearlyReport(response.data.data['yearlyReport'])
                    else if (filter.subTab == "monthly-report") setMonthlyReport(response.data.data['monthlyReport'])
                }



            }

        } catch (error) {

            if (error?.response?.status == 401) logout()


        } finally {
            if (fetchingCard) setFetchingCard(false)

            setIsLoading(false)

        }
    }









    return (
        <div className="p-0 flex-1 overflow-x-hidden h-full">
            <>
                <div className="flex flex-col h-full">
                    {fetchingCard ? <SalesCardLoader /> :
                        <SalesCard saleData={cardData} />}

                </div>


                {/* <div className='flex gap-4'>
                    <button className='btn btn-sm shadow'>Graph</button>
                    <button className='btn btn-sm shadow'>Table</button>
                    <button className='btn btn-sm shadow'>Charts</button>
                </div> */}

                <div className=''>

                    {tab == "graph" ? <Index
                        filterUsers={filterUsers}
                        count={count}
                        allSales={allSales}
                        employeeSales={employeeSales}
                        yearlyReport={yearlyReport}
                        monthlyReport={monthlyReport}
                        setFilter={setFilter}
                        filter={filter}
                        isLoading={isLoading} /> : null}
                </div>

                {/* <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
                    <MontlyReport mrData={mrData} mrMonth={mrMonth} mrYear={mrYear} setMrYear={setMrYear} setMrMonth={setMrMonth} mrPageSize={mrPageSize}
                        mrPage={mrPage} setMrPage={setMrPage} MR_PAGE_SIZES={MR_PAGE_SIZES} setMrPageSize={setMrPageSize} mrReload={mrReload} />
                    <YearlyReport
                        yrData={yrData} yrYear={yrYear} setYrYear={setYrYear} YRPageSize={YRPageSize}
                        yrPage={yrPage} setYrPage={setYrPage} YR_PAGE_SIZES={YR_PAGE_SIZES} setYrPageSize={setYrPageSize} YRReload={YRReload}
                    />
                </div>
                <div className='mb-5 mt-5'>
                    <EmployeeSalesGraph data={esData} esReload={esReload} esFilter={esFilter} setEsFilter={setEsFilter} esDateRange={esDateRange} setEsDateRange={setEsDateRange} />
                    <SalesGraph data={asData} asReload={asReload} asFilter={asFilter} setAsFilter={setAsFilter} asDateRange={asDateRange} setAsDateRange={setAsDateRange} />
                </div> */}
            </>
        </div>
    );
};
export default SalesDashboard;
