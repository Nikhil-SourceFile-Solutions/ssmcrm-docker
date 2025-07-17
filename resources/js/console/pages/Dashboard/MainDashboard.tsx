import React from 'react'

export default function Card() {
    return (
        <>
                <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-3 gap-6 mb-6 text-white">
                    <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
                            <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Total Products</div>
                            <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">5000</div>
                    </div>
                    <div className="panel bg-gradient-to-r from-blue-500 to-blue-400">
                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Total Category</div>
                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">30</div>
                    </div>
                    <div className="panel bg-gradient-to-r from-[#6bed3d] to-[#09e1cd]">
                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Total Enquiry</div>
                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">90</div>
                    </div>




                </div>

        </>

    )
}
