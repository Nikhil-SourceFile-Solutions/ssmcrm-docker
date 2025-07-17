import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Whatsapp from './Whantsapp/Index';
import Sms from './Sms/Index';
import { setPageTitle } from '../../../../store/themeConfigSlice';
import Application from './Application/Index';
import { useAuth } from '../../../../AuthContext';

export default function Index() {


    const { settingData } = useAuth();
    const dispatch = useDispatch()
    useEffect(() => { dispatch(setPageTitle('Campaign')); });

    const [a, b] = useState(settingData?.sms_enabled ? 's' : settingData?.whatsapp_enabled ? 'w' : settingData?.app_enabled ? 'a' : '');
    return (
        <div className="panel flex-1 overflow-x-hidden h-full">
            <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar">
                    <div className="mb-5">
                        <div className="mb-5 flex items-center justify-between">
                            <h5 className="text-lg font-semibold dark:text-white-light">Campaign</h5>
                            <div className='flex gap-4'>
                                {settingData?.sms_enabled ? <button className={`${a == "s" && 'text-secondary !outline-none before:!w-full'} before:inline-block' relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`} onClick={() => b('s')}>Sms </button> : ''}
                                {settingData?.whatsapp_enabled ? <button className={`${a == "w" && 'text-secondary !outline-none before:!w-full'} before:inline-block' relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`} onClick={() => b('w')}> Whatsapp </button> : ''}
                                {/* {settingData?.app_enabled ? <button className={`${a == "a" && 'text-secondary !outline-none before:!w-full'} before:inline-block' relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`} onClick={() => b('a')}> Application </button> : ''} */}

                            </div>
                        </div>
                        {a == 's' && settingData.sms_enabled ? <Sms /> :
                            a == 'w' && settingData.whatsapp_enabled ? <Whatsapp /> :''
                                // a == 'a' && settingData.app_enabled ? <Application /> : ''
                        }
                    </div>
                </section>
            </div>
        </div>

    )
}
