import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import AnimateHeight from 'react-animate-height';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Link } from 'react-router-dom';
import IconArrowLeft from '../../components/Icon/IconArrowLeft';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
// import LeftNav from './LeftNav';
export default function Main({ children }: PropsWithChildren) {

    const [active, setActive] = useState<string>('1');
    const togglePara = (value: string) => {
        setActive((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    const [isShowChatMenu, setIsShowChatMenu] = useState(false);

    const [data, setData] = useState(0);
    const [loading, setLoading] = useState(true); // Optional loading state

    return (
        <div className={`flex gap-5 relative sm:h-[calc(100vh_-_150px)] h-full sm:min-h-0 ${isShowChatMenu ? 'min-h-[999px]' : ''}`}>
            {/* <div className={`panel p-4 flex-none max-w-xs w-full absolute xl:relative z-10 space-y-4 xl:h-full h-full hidden xl:block overflow-hidden ${isShowChatMenu ? '!block' : ''}`}> */}
            <div className={`panel w-[250px]`}>
                {/* <LeftNav /> */}sdfgsdfgsd
            </div>
            <div className={`bg-black/60 z-[5] w-full h-full absolute rounded-md hidden ${isShowChatMenu ? '!block xl:!hidden' : ''}`} onClick={() => setIsShowChatMenu(!isShowChatMenu)}>ssss</div>

            {children}
             {/* Right Part End */}
        </div>
    )
}
