import Head from 'next/head';
import "../static/assets/scss/app.scss";
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import DashboardNavigation from "../components/dashboard/Navigation";
import Sidebar from '../components/dashboard/Sideboar';



const App = ({ Component, pageProps, router }) => {
    const [checkAuth, setCheckAuth] = useState(false)
    useEffect(() => {
        const userDetails = JSON.parse(localStorage.getItem('user-details') || '{}')
        const dashboardDetails = JSON.parse(localStorage.getItem('dashboard-details') || '{}')

        if (router.pathname.startsWith('/dashboard') ) {
            if(!router.pathname.startsWith('/dashboard/login') && !dashboardDetails.id) {
                router.push('/dashboard/login')
            }
        }
        if (!router.pathname.startsWith('/dashboard') && !userDetails.id) {
            router.push('/login')
        }
        setCheckAuth(true);
    }, [])

    if (!checkAuth) {
        return (
            <div>Please Wait</div>
        )
    }

    if (router.pathname.startsWith('/dashboard') && !router.pathname.startsWith('/dashboard/login')) {
        return (
            <React.Fragment>
                <Head>
                    <title>Lead Like Jesus</title>
                    <link href="/static/assets/css/all.css" rel="stylesheet" />
                </Head>
                <div className="dashboard-wrapper">
                    <Sidebar />
                    <div className="content-wrapper">
                        <DashboardNavigation />
                        <div className="content">
                            <Component {...pageProps} />
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }

    return (
        <React.Fragment>
            <Head>
                <title>Lead Like Jesus</title>
                <link href="/static/assets/css/all.css" rel="stylesheet" />
            </Head>
            <Navigation />
            <Component {...pageProps} />
        </React.Fragment>
    )
}

export default App