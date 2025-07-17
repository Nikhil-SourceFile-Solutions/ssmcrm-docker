import React, { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { IoReloadOutline } from 'react-icons/io5';
import Call from './Call';
import Free from './Free';
import Follow from './Follow';

const Tabs = {
    CALL: 'call',
    FREE: 'free',
    FOLLOW: 'follow',
};

const Index = () => {
    const [tab, setTab] = useState(Tabs.CALL);
    const [reload, setReload] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const tabComponents = {
        call: <Call reload={reload} isLoading={isLoading} setIsLoading={setIsLoading} />,
        free: <Free reload={reload} isLoading={isLoading} setIsLoading={setIsLoading} />,
        follow: <Follow reload={reload} isLoading={isLoading} setIsLoading={setIsLoading} />,
    };

    return (
        <div className="p-0 flex-1 overflow-x-hidden h-full">
            <div className="flex flex-col h-full">
                <div className='panel p-0 min-h-[500px]'>

                    <section className='flex justify-between bg-primary/[12%] h-12 items-center px-4 rounded-t-md'>
                        <nav className='flex gap-3'>
                            <button aria-pressed={tab === Tabs.CALL} className={`btn btn-sm shadow dark:text-[#d0d2d6] ${tab === Tabs.CALL ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setTab(Tabs.CALL)}>Call History</button>
                            <button aria-pressed={tab === Tabs.FREE} className={`btn btn-sm shadow dark:text-[#d0d2d6] ${tab === Tabs.FREE ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setTab(Tabs.FREE)}>Free Trials</button>
                            <button aria-pressed={tab === Tabs.FOLLOW} className={`btn btn-sm shadow dark:text-[#d0d2d6] ${tab === Tabs.FOLLOW ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setTab(Tabs.FOLLOW)}>Follow Up</button>
                        </nav>

                        <div className='p-4'>
                            <button onClick={() => setReload(!reload)} disabled={isLoading} className='bg-white rounded-md p-2 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed'>
                                <IoReloadOutline size={16} className={isLoading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </section>

                    <div className='p-4'>
                        {tabComponents[tab] || null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;
