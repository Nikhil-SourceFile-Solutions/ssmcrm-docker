import axios from 'axios';
import React, { useEffect } from 'react'
import { useAuth } from '../../AuthContext';

export default function Index() {

    const { apiUrl, crmToken } = useAuth();

    const fetch = async () => {
        const response = await axios({
            method: 'get',

            url: apiUrl + '/api/migration',

            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + crmToken,
            },
        });

        console.log(response)
    }

    useEffect(() => {
        fetch()
    }, [])
    return (
        <div>Index</div>
    )
}
