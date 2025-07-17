import React, { useState } from 'react'
import AnimateHeight from 'react-animate-height';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Link } from 'react-router-dom';
import IconArrowLeft from '../../components/Icon/IconArrowLeft';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import LeftNav from './LeftNav';
import Main from './Main';
export default function Page2() {

    const [active, setActive] = useState<string>('1');
    const togglePara = (value: string) => {
        setActive((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    const [isShowChatMenu, setIsShowChatMenu] = useState(false);
    return (
        <Main>

            {/* <div className={`flex gap-5 relative sm:h-[calc(100vh_-_150px)] h-full sm:min-h-0 ${isShowChatMenu ? 'min-h-[999px]' : ''}`}>
<div className={`panel p-4 flex-none max-w-xs w-full absolute xl:relative z-10 space-y-4 xl:h-full hidden xl:block overflow-hidden ${isShowChatMenu ? '!block' : ''}`}>
     */}
            <div className="relative h-full">

                <div className="flex justify-between items-center p-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button type="button" className="xl:hidden hover:text-primary" onClick={() => setIsShowChatMenu(!isShowChatMenu)}>
                            a</button>
                        <div className="mx-3"><p className="font-semibold">pAGE2</p><p className="text-white-dark text-xs">Last seen at 2:05 PM</p></div>
                    </div>


                    <div className="flex sm:gap-5 gap-3">
                        <button>one</button>
                        <button>two</button>
                    </div>


                </div>
            </div>
        </Main>
    )
}
