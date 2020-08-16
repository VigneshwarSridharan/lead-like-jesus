import Link from 'next/link'
import React, { useState } from 'react';
import { Navbar, NavbarBrand, NavbarText, Container } from 'reactstrap';
import IconPersonFill from './icons/IconPersonFill';
import { useRouter } from 'next/router';

const Navigation = (props) => {

    const userDetails = JSON.parse(localStorage.getItem('user-details') || '{}')

    const router = useRouter();

    const { name = "" } = userDetails;

    return (
        <Navbar color="primary" dark expand="md" fixed="top">
            <Container>
                <Link href="/" passHref>
                    <a className="navbar-brand">Lead Like Jesus</a>
                </Link>
                <div>
                    {
                        name ?
                            (
                                <React.Fragment>
                                    <NavbarText className="mr-3"> <i className="fas fa-user"></i> {name}</NavbarText>
                                    <NavbarText style={{cursor:'pointer'}} onClick={() => {
                                        window.localStorage.removeItem('user-details')
                                        router.replace('/login')
                                    }}> Logout</NavbarText>
                                </React.Fragment>
                            ) : (
                                <NavbarText> <i className="fas fa-user"></i> Login</NavbarText>
                            )
                    }
                </div>
            </Container>
        </Navbar>
    );
}

export default Navigation;