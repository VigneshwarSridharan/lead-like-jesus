import { Container, Row, Col, Card, FormGroup, Label, Input, Button, Form, CustomInput } from "reactstrap"
import { useState } from "react"
import { request, EventServices } from "../../../lib/APIServices"
import Swal from 'sweetalert2'
import { useRouter } from 'next/router'

const addUser = (props) => {
    const router = useRouter()
    const [name, setName] = useState(props.username || "");
    const [file, setFile] = useState('');
    const [active, setActive] = useState(false)

    const addEvent = (e) => {
        e.preventDefault();
        const formData = new FormData();
        const nameListFile = document.querySelector('#file');
        formData.append("name", name)
        formData.append("is_active", active ? 1 : 0);
        formData.append("user_id", 1);
        formData.append("file", nameListFile.files[0]);

        EventServices.add(formData, {
            onUploadProgress: progressEvent => console.log(progressEvent.loaded),
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => {
            console.log(res)
            if (res.status) {
                Swal.fire(
                    'Success!',
                    'Added Successfully',
                    'success'
                )
                router.push('/dashboard/events');
            }
        }).catch(err => {
            console.log(err)
        })

    }

    return (
        <section className="py-3">
            <Container fluid>
                <Row>
                    <Col sm={{ size: 8, offset: 2 }}>
                        <Card className="border-0 my-5" body>
                            <h3 className="mb-4"><i className="fas fa-microphone ml-2"></i> Add New Event</h3>
                            <Form onSubmit={addEvent}>
                                <FormGroup>
                                    <Label>Enter name of the event</Label>
                                    <Input required value={name} onChange={({ target }) => setName(target.value)} />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Upload name list of the event</Label>
                                    <Input type="file" name="file" id="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required />
                                </FormGroup>
                                {<FormGroup>
                                    <Label>Active</Label>
                                    <div>
                                        <CustomInput type="switch" name="activeuser" id="exampleCustomSwitch" checked={active} onChange={({ target }) => setActive(target.checked)} />
                                    </div>
                                </FormGroup>}
                                <Button color="primary" block size="lg">Create</Button>
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