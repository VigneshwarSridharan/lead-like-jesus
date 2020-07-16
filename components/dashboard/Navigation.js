import { Navbar, Container, NavbarText } from "reactstrap";
import Link from "next/link";
import { useRouter } from "next/router";


const Navigation = (props) => {
    const userDetails = JSON.parse(localStorage.getItem('dashboard-details') || '{}')

    const { username = "" } = userDetails;
    const router = useRouter();
    return (
        <Navbar color="primary" dark expand="md">
            <Container fluid>
                <div></div>
                <div>
                    {
                        username ?
                            (
                                <React.Fragment>
                                    <NavbarText className="mr-3"> <i className="fas fa-user"></i> {username}</NavbarText>
                                    {<NavbarText style={{cursor:'pointer'}} onClick={() => {
                                        window.localStorage.clear()
                                        router.replace('/dashboard/login')
                                    }}> Logout</NavbarText>}
                                </React.Fragment>
                            ) : (
                                <NavbarText> <i className="fas fa-user"></i> Login</NavbarText>
                            )
                    }
                </div>
            </Container>
        </Navbar>
    )
}

export default Navigation