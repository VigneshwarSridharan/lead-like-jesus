import Head from 'next/head';
import "../static/assets/scss/app.scss";
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";


const App = ({ Component, pageProps, router }) => {
    const [checkAuth, setCheckAuth] = useState(false)
    useEffect(() => {
        const userDetails = JSON.parse(localStorage.getItem('user-details') || '{}')
        if (!userDetails.id) {
            router.push('/login')
        }
        setCheckAuth(true);
        window.oncontextmenu = function (event) {
            // event.preventDefault();
            event.stopPropagation();
            return false;
        };
    }, [])

    if (!checkAuth) {
        return (
            <div>Please Wait</div>
        )
    }

    return (
        <React.Fragment>
            <Head>
                <title>Lead Like Jesus</title>
            </Head>
            <Navigation />
            <Component {...pageProps} />
        </React.Fragment>
    )
}

export default App