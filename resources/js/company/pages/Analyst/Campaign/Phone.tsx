import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../AuthContext';


export default function Phone({ data }: any) {
    const phones = JSON.parse(data?.phones)
    const [search, setSearch] = useState('');
    const [filteredPhone, setFilterdPhone] = useState([]);
    const { settingData, authUser } = useAuth();

    useEffect(() => {
        if (search) {
            setFilterdPhone(phones.filter((p: any) => RegExp(search).test(p)));
        } else setFilterdPhone(phones)
    }, [search])

    const formatPhoneNumber = (number) => {
        const numStr = number.toString();
        if (numStr.length !== 10) {
            throw new Error('Number must be exactly 10 digits long.');
        }
        const masked = numStr.slice(0, 2) + '****' + numStr.slice(6);
        return masked;
    };
    return (
        <div className="table-responsive mb-5 max-w-[350px] m-auto">
            <input type="text" placeholder='Search By phone Number' className='form-input mb-4' onChange={(e) => setSearch(e.target.value)} />
            <table>
                <thead>
                    <tr>
                        <th>Phone - {phones.length}</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPhone.map((phone: any, index: any) => {
                        return (
                            <tr key={index}>
                                {/* <td>{phone}</td> */}
                                <td>
                                    {
                                        authUser.user_type === 'Analyst' &&
                                            settingData?.crm_phones && JSON.parse(settingData?.crm_phones).includes('Analyst')

                                            ? formatPhoneNumber(phone)
                                            : phone}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    )
}
