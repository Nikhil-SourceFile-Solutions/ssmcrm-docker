import { Navigate } from 'react-router-dom';
import React from 'react'
import { lazy } from 'react';
import Dashboard from '../pages/Dashboard';
import Subscriptions from '../pages/Subscriptions';
import Settings from '../pages/Settings';
import Contact from '../pages/Contact';
import Transactions from '../pages/Transactions';
import ListPlans from '../pages/Plans/ListPlans';
import ListCustomers from '../pages/Apple/ListCustomers';
import ListSubscriptions from '../pages/Subscriptions/ListSubscriptions';
import Login from '../pages/Authentication/Login';

import CheckCrm from '../pages/check-crm/Index'

import ViewCompany from '../pages/Apple/Show/Index';

const Index = lazy(() => import('../pages/Index'));

const Script = lazy(() => import('../pages/Scripts/Index'));


const token = localStorage.getItem('crmToken') || false;


console.log("token in route", token)
const routes = [
    // dashboard

    {
        path: '/login',
        element: <Login />,
        layout: 'blank',
    },

    {
        path: '/',
        element: !token ? <Navigate to="/login" /> : <Dashboard />,
        protected: true,
    },


    {
        path: '/customers',
        element: !token ? <Navigate to="/login" /> : <ListCustomers />,
        protected: true
    },

    {
        path: '/customers/:domain',
        element: !token ? <Navigate to="/login" /> : <ViewCompany />,
        protected: true
    },

    {
        path: '/check-crm/:domain',
        element: !token ? <Navigate to="/login" /> : <CheckCrm />,
        protected: true
    },
    {
        path: '/listplans',
        element: !token ? <Navigate to="/login" /> : <ListPlans />,
    },
    {
        path: '/listsubscriptions',
        element: !token ? <Navigate to="/login" /> : <ListSubscriptions />,
    },
    {
        path: '/transactions',
        element: !token ? <Navigate to="/login" /> : <Transactions />,
    },
    {
        path: '/settings',
        element: !token ? <Navigate to="/login" /> : <Settings />,
    },
    {
        path: '/contact',
        element: !token ? <Navigate to="/login" /> : <Contact />,
    },
    {
        path: '/scripts',
        element: !token ? <Navigate to="/login" /> : <Script />,
    },


];

export { routes };
