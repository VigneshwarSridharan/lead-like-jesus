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
                                    <NavbarText className="mr-3"> <IconPersonFill className="" /> {name}</NavbarText>
                                    {/* <NavbarText style={{cursor:'pointer'}} onClick={() => {
                                        window.localStorage.clear()
                                        router.replace('/login')
                                    }}> Logout</NavbarText> */}
                                </React.Fragment>
                            ) : (
                                <NavbarText> <IconPersonFill className="" /> Login</NavbarText>
                            )
                    }
                </div>
            </Container>
        </Navbar>
    );
}

export default Navigation;