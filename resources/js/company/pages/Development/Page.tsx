import React, { useState } from 'react'
import 'tippy.js/dist/tippy.css';

import Main from './Main';
export default function Page() {



    const [isShowChatMenu, setIsShowChatMenu] = useState(false);
    return (
        <Main>
            <div className="panel p-0 flex-1 bg-[url(/assets/images/auth/map.png)]">
                <div className="relative h-full">
                    <div className="flex justify-between items-center p-4">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <button type="button" className="xl:hidden hover:text-primary" onClick={() => setIsShowChatMenu(!isShowChatMenu)}>
                                a</button>
                            <div className="mx-3"><p className="font-semibold">pAGE</p><p className="text-white-dark text-xs">Last seen at 2:05 PM</p></div>
                        </div>
                        <div className="flex sm:gap-5 gap-3">
                            <button>one</button>
                            <button>two</button>
                        </div>
                    </div>
                </div>
            </div>
        </Main>
    )
}
