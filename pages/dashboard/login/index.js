import { useRouter } from 'next/router'
import { Container, Row, Col, Card, FormGroup, Label, Input, Button, Form } from "reactstrap"
import IconBoxArrowRight from "../../../components/icons/IconBoxArrowRight"
import { useState } from "react"
import { DashboardServices } from "../../../lib/APIServices"
import Swal from 'sweetalert2'

const Login = () => {

    const [username, setUername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter()

    const handleLogin = (e) => {
        e.preventDefault();
        DashboardServices.login(username.trim(), password.trim()).then(res => {
            if (res.status) {
                let token = res.data.token;
                delete res.data.token;
                localStorage.setItem('dashboard-details', JSON.stringify(res.data))
                localStorage.setItem('token', token)
                router.replace('/dashboard')
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

    return (
        <section className="login py-5">
            <Container>
                <Row className="justify-content-center">
                    <Col sm={{ size: 5 }}>
                        <Card className="border-0 my-5" body>
                            <h3 className="mb-4">Dashboard Login </h3>
                            <Form onSubmit={handleLogin}>
                                <FormGroup>
                                    <Label>Enter Username</Label>
                                    <Input required value={username} onChange={({ target }) => setUername(target.value)} />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Enter Password</Label>
                                    <Input type="password" required value={password} onChange={({ target }) => setPassword(target.value)} />
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

export default Login