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
export default function Page3() {

    const [active, setActive] = useState<string>('1');
    const togglePara = (value: string) => {
        setActive((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    const [isShowChatMenu, setIsShowChatMenu] = useState(false);
    return (
        <Main>
            <div className="relative h-full">

                <div className="flex justify-between items-center p-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button type="button" className="xl:hidden hover:text-primary" onClick={() => setIsShowChatMenu(!isShowChatMenu)}>
                            a</button>
                        <div className="mx-3"><p className="font-semibold">pAGE3</p><p className="text-white-dark text-xs">Last seen at 2:05 PM</p></div>
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
