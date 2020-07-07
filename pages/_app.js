// import Layout from "./components/layout";
import "../static/assets/scss/app.scss";
import { useEffect, useState } from "react";


const App = ({ Component, pageProps, router }) => {
    const [checkAuth, setCheckAuth] = useState(false)
    useEffect(() => {
        const userDetails = JSON.parse(localStorage.getItem('user-details') || '{}')
        if(!userDetails.id) {
            router.push('/login')
        }
        setCheckAuth(true);
    }, [])

    if (!checkAuth) {
        return (
            <div>Please Wait</div>
        )
    }

    return (
        // <Layout>
            <Component {...pageProps} />
        // </Layout>
    )
}

export default App