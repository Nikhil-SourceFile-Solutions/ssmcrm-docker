import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IRootState } from '../../../store';

import { setPageTitle } from '../../../store/themeConfigSlice';

export default function Campaign() {
    const settingData = useSelector((state: IRootState) => state.themeConfig.settingData);
    const dispatch = useDispatch()
    useEffect(() => { dispatch(setPageTitle('Campaign')); });

    const [a, b] = useState(settingData?.sms_enabled ? 's' : settingData?.whatsapp_enabled ? 'w' : settingData?.app_enabled ? 'a' : '');
    return (
        <div className="panel flex-1 overflow-x-hidden h-full">
            <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar">
                    <div className="mb-5">
                        <div className="mb-5 flex items-center justify-between">
                            <h5 className="text-lg font-semibold dark:text-white-light">Campaign </h5>
                            <div className='flex gap-4'>


                            </div>
                        </div>

                    </div>
                </section>
            </div>
        </div>

    )
}
