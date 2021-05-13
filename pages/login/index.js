import { useRouter } from 'next/router'
import { Container, Row, Col, Card, FormGroup, Label, Input, Button, Form } from "reactstrap"
import IconBoxArrowRight from "../../components/icons/IconBoxArrowRight"
import { useEffect, useState } from "react"
import { AuthServie } from "../../lib/APIServices"
import Swal from 'sweetalert2'


const Login = (props) => {
    console.log({ props })
    const [username, setUername] = useState('');
    const router = useRouter()
    const { id = "" } = router.query

    useEffect(() => {
        if(id) {
            setUername(id)
            loginToApp(id)
        }
    }, [])

    const loginToApp = username => {
        AuthServie.login(username.trim().toLowerCase()).then(res => {
            if (res.status == "success") {
                localStorage.setItem('user-details', JSON.stringify(res.data.userDetails))
                router.replace('/')
            }
            else {
                Swal.fire(
                    "Sorry!",
                    res.message,
                    "error"
                )
            }
        })
    }

    const handleLogin = (e) => {
        e.preventDefault();
        loginToApp(username)
    }

    return (
        <section className="login py-5">
            <Container>
                <Row className="justify-content-center">
                    <Col sm={{ size: 5 }}>
                        <Card className="border-0 my-5" body>
                            <h3 className="mb-4"> Login </h3>
                            <Form onSubmit={handleLogin}>
                                <FormGroup>
                                    <Label>Enter Email Address \ Phone Number</Label>
                                    <Input required value={username} onChange={({ target }) => setUername(target.value)} />
                                </FormGroup>
                                <Button color="primary" block>Login <IconBoxArrowRight /></Button>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>
    )
}

export function getServerSideProps(context) {
    return {
        props: {
            name: process.env.APP_NAME
        }
    }
}

export default Login