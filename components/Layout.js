import React from 'react';
import Navigation from './Navigation'

const Layout = ({ children }) => {
    
    return (
        <React.Fragment>
            <Navigation />
            {children}
        </React.Fragment>
    )
}

export default Layout