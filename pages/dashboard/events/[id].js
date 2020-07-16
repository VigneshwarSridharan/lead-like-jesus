import { Container, Row, Col, Card, FormGroup, Label, Input, Button, Form, CustomInput } from "reactstrap"
import { useState } from "react"
import { request } from "../../../lib/APIServices"
import Swal from 'sweetalert2'
import { useRouter } from 'next/router'
import { API_URL } from "../../../lib/constants"
import Axios from "axios"

const addUser = (props) => {
    console.log(props)
    const router = useRouter()
    const [username, setUsername] = useState(props.response.data.name || "");
    const [file, setFile] = useState(props.response.data.file||'');
    const [active, setActive] = useState(props.response.data.is_active||false)

    const addUser = (e) => {
        e.preventDefault();
        let params = { "name": username, "is_active": active, "file": file, "user_id": 1 }
        request.post('/event/event/'+props.id, params).then(res => {
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
                            <h3 className="mb-4">Edit Event </h3>
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
                                <Button color="primary" block>Upate</Button>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>
    )
}

export async function getServerSideProps(context) {

    let response = await Axios.get(`${API_URL}/event/event/` + context.params.id)
    response = response.data
    return {
        props: {
            response,
            "id": context.params.id
        }, // will be passed to the page component as props
    }
}

export default addUser