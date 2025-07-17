import React from 'react';
import { useSelector } from "react-redux";
import { IRootState } from "../../store";

const Footer = () => {
    const crmVersion = useSelector((state: IRootState) => state.themeConfig.crmVersion);
    return <div className="flex justify-between p-1 mt-auto bg-[#000]/[0.08]">
        <div className="dark:text-white-dark text-center ltr:sm:text-left rtl:sm:text-right ">© {new Date().getFullYear()}. Sourcefile CRM All rights reserved.</div>
        <b>v {crmVersion}</b>
    </div>;
};

export default Footer;
