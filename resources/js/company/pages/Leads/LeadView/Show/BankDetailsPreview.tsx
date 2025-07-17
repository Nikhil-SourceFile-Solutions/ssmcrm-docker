import React from 'react';
import { useAuth } from '../../../../AuthContext';

const BankDetailsPreview = ({ one, two }) => {

// console.log(two)

    const { apiUrl, settingData } = useAuth()
    return (
        <div className="flex justify-center items-center  ">
            <div className="w-80 min-h-[500px] bg-[#E5DDD5] rounded-lg overflow-hidden shadow-xl flex flex-col">
                <div className="bg-[#075E54] text-white p-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>

                    <div className="flex-shrink-0 w-10 h-10 bg-gray-300 rounded-full mr-3">
                        <img className='rounded-full h-full' src={`${apiUrl}/storage/${settingData?.favicon}`} />
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold text-lg truncate w-[150px]">{settingData?.crm_name}</p>
                        <p className="text-sm">online</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                </div>

                <div className="flex-grow p-4 overflow-y-auto">

                    <div className="bg-[#DCF8C6] rounded-lg p-2 max-w-[80%] ml-auto mb-2">
                        <p className="text-sm font-semibold">This is just a priview of your message</p>
                        <p className="text-right text-xs text-gray-500">11:38 <span className="text-blue-500">✓✓</span></p>
                    </div>


                    {one ? (<div className="bg-white rounded-lg mb-4 p-2 max-w-[80%] ">
                        <p className="text-sm font-semibold" style={{ whiteSpace: 'pre-line' }}>{one}</p>

                        <p className="text-right text-xs text-gray-500">8:45</p>
                    </div>) : null}

                    {two ? (<div className="bg-white rounded-lg p-2 max-w-[80%] ">
                        <p className="text-sm font-semibold" style={{ whiteSpace: 'pre-line' }}>{two}</p>
                        <p className="text-right text-xs text-gray-500">8:45</p>
                    </div>) : null}


                </div>

                <div className="bg-[#F0F0F0] p-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <input type="text" disabled placeholder="Type a message" className="flex-grow bg-white rounded-full py-2 px-4 text-sm focus:outline-none" />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default BankDetailsPreview;
