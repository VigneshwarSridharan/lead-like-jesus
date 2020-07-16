import { Container, Row, Col, Card, FormGroup, Label, Input, Button, Form, CustomInput } from "reactstrap"
import { useState } from "react"
import { request } from "../../../lib/APIServices"
import Swal from 'sweetalert2'
import { useRouter } from 'next/router'

const addUser = (props) => {
    const router = useRouter()
    const [username, setUsername] = useState(props.username || "");
    const [file, setFile] = useState('');
    const [active, setActive] = useState(true)

    const addUser = (e) => {
        e.preventDefault();
        let params = { "name": username, "is_active": active, "file": file,"user_id":1 }
        request.post('/event/addevent', params).then(res => {
            if (res.status) {
                Swal.fire(
                    'Success!',
                    'Added Successfully',
                    'success'
                )
                router.push('/dashboard/events');
            }

        })

    }

    return (
        <section className="py-5">
            <Container>
                <Row>
                    <Col sm={{ size: 8, offset: 2 }}>
                        <Card className="border-0 my-5" body>
                            <h3 className="mb-4">Add User </h3>
                            <Form onSubmit={addUser}>
                                <FormGroup>
                                    <Label>Enter Eventname</Label>
                                    <Input required value={username} onChange={({ target }) => setUsername(target.value)} />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Add File</Label>
                                    <Input type="file" name="file" id="exampleFile" onChange={({ target }) => setFile(target.value)} />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Active</Label>
                                    <div>
                                        <CustomInput type="switch" name="activeuser" id="exampleCustomSwitch" checked={active} onChange={({ target }) => setActive(target.checked)} />
                                    </div>
                                </FormGroup>
                                <Button color="primary" block>Create</Button>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>
    )
}

export async function getServerSideProps(context) {

    return {
        props: {
            // username: "sgdfgdfgd",
            // password: "passwordd",
            // role: "2"
        }, // will be passed to the page component as props
    }
}

export default addUser