import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from "../store";
import { useAuth } from "../AuthContext";

const useFetch = async (url: string, method: string = 'get', data: any = null) => {

    const { crmToken, apiUrl, logout } = useAuth()


    let response = '';
    try {
        response = await axios({
            method: method,
            url: apiUrl + '/api/' + url,
            data: data,
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + crmToken,
            },
        });
    } catch (error) {
        if (error?.response?.status == 401) logout()
    }

    return response;

};

export default useFetch;
