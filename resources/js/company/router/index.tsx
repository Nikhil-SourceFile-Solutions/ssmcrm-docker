import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import BlankLayout from '../components/Layouts/BlankLayout';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import { routes } from './routes';
import AuthGuard from '../AuthGuard';

const finalRoutes = routes.map((route) => {
    const Layout = route.layout === 'blank' ? BlankLayout : DefaultLayout;
    const element = route.protected ? (
        <AuthGuard>
            <Layout>{route.element}</Layout>
        </AuthGuard>
    ) : (
        <Layout>{route.element}</Layout>
    );

    return {
        ...route,
        element,
    };
});

const router = createBrowserRouter(finalRoutes);

export default router;
