import Link from 'next/link'
import React, { useState } from 'react';
import { Navbar, NavbarBrand, NavbarText, Container } from 'reactstrap';
import IconPersonFill from './icons/IconPersonFill';

const Navigation = (props) => {

    const userDetails = JSON.parse(localStorage.getItem('user-details') || '{}')

    const { name = "" } = userDetails;

    return (
        <Navbar color="primary" dark expand="md" fixed="top">
            <Container>
                <Link href="/" passHref>
                    <a className="navbar-brand">Lead Like Jesus</a>
                </Link>

                {
                    name ?
                        (
                            <NavbarText> <IconPersonFill className="" /> {name}</NavbarText>
                        ) : (
                            <NavbarText> <IconPersonFill className="" /> Login</NavbarText>
                        )
                }
            </Container>
        </Navbar>
    );
}

export default Navigation;