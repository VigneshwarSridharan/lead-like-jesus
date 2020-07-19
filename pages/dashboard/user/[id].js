import Axios from "axios";
import { API_URL } from "../../../lib/constants";
import { Container, Row, Col, Card, FormGroup, Label, Input, Button, Form, CustomInput } from "reactstrap"
import { useState } from "react"
import { request } from "../../../lib/APIServices"
import Swal from 'sweetalert2'
import { useRouter } from 'next/router'

const EditUser = (props) => {
    const router = useRouter()
    const [username, setUsername] = useState(props.response.data.username || "");
    const [password, setPassword] = useState(props.response.data.password || "");
    const [role, setRole] = useState(props.response.data.role || '1');
    const [active, setActive] = useState(props.response.data.active || false)


    const addUser = (e) => {
        e.preventDefault();
        let params = { "username": username, "password": password, "role": role, "active": active ? 1 : 0 }
        request.post('/auth/user/' + props.id, params).then(res => {
            if (res.status) {
                Swal.fire(
                    'Success!',
                    'Added Successfully',
                    'success'
                )
                router.push('/dashboard/user');
            }

        })

    }
    return (
        <section className="py-3">
            <Container fluid>
                <Row>
                    <Col sm={{ size: 8, offset: 2 }}>
                        <Card className="border-0 my-5" body>
                            <h3 className="mb-4">Add User </h3>
                            <Form onSubmit={addUser}>
                                <FormGroup>
                                    <Label>Enter Username</Label>
                                    <Input required value={username} onChange={({ target }) => setUsername(target.value)} />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Enter Password</Label>
                                    <Input type="password" value={password} onChange={({ target }) => setPassword(target.value)} />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Select Role</Label>
                                    <Input type="select" name="select" value={role} onChange={({ target }) => setRole(target.value)}>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label>Active</Label>
                                    <div>
                                        <CustomInput type="switch" name="activeuser" id="exampleCustomSwitch" checked={active} onChange={({ target }) => setActive(target.checked)} />
                                    </div>
                                </FormGroup>
                                <Button color="primary" block>Update</Button>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>
    )

}


export async function getServerSideProps(context) {
    let response = await Axios.get(`${API_URL}/auth/user/` + context.params.id)
    response = response.data
    delete response.data.password
    return {
        props: {
            response,
            "id": context.params.id
        }, // will be passed to the page component as props
    }
}
export default EditUser