import React from 'react'
import PageLoader from '../../../components/Layouts/PageLoader'

export default function Sales({ fetchingSale, saleData }) {


    return (
        <>
            {fetchingSale ? (<PageLoader />) : (
                <>

                    <div className='panel bg-gradient-to-r from-[#ed3d3d] to-[#0980e1] mb-4'>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6  ">
                            <div className="panel bg-white">
                                <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Today's Sales</div>
                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">₹{saleData?.today}</div>
                            </div>

                            <div className="panel bg-white">
                                <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">This Month Sales</div>
                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">₹{saleData?.thisMonth}</div>
                            </div>

                            <div className="panel bg-white">
                                <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Last Month Sales</div>
                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">₹{saleData?.lastMonth}</div>
                            </div>

                            <div className="panel bg-white">
                                <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">All Time Sales</div>
                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">₹{saleData?.allTime}</div>
                            </div>
                        </div>
                    </div>

                    <div className='panel bg-gradient-to-r from-[#6bed3d] to-[#09e1cd] mb-4'>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6  ">
                            <div className="panel bg-white">
                                <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Today's Team Sales</div>
                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">₹{saleData?.teamSales?.today}</div>
                            </div>

                            <div className="panel bg-white">
                                <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">This Month Team Sales</div>
                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">₹{saleData?.teamSales?.thisMonth}</div>
                            </div>

                            <div className="panel bg-white">
                                <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Last Month Team Sales</div>
                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">₹{saleData?.teamSales?.lastMonth}</div>
                            </div>

                            <div className="panel bg-white">
                                <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">All Time Team Sales</div>
                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">₹{saleData?.teamSales?.allTime}</div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
