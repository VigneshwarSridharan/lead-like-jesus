import { Container, Row, Col, Card, FormGroup, Label, Input, Button, Form, CustomInput } from "reactstrap"
import { useState } from "react"
import { request, EventServices } from "../../../lib/APIServices"
import Swal from 'sweetalert2'
import { useRouter } from 'next/router'
import { API_URL } from "../../../lib/constants"
import Axios from "axios"

const addUser = (props) => {
    console.log(props)
    const router = useRouter()
    const { event, activeEvent } = props.response.data
    const [name, setName] = useState(event.name || "");
    const [file, setFile] = useState(event.file || '');
    const [active, setActive] = useState(event.id == activeEvent.value)

    const updateEvent = (e) => {
        e.preventDefault();
        const formData = new FormData();
        const nameListFile = document.querySelector('#file');
        formData.append("name", name)
        formData.append("is_active", active ? 1 : 0);
        if (nameListFile.files[0]) {
            formData.append("file", nameListFile.files[0]);
        }

        EventServices.update(event.id, formData, {
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
                            <h3 className="mb-4">Edit Event </h3>
                            <Form onSubmit={updateEvent}>
                                <FormGroup>
                                    <Label>Enter name of the event</Label>
                                    <Input required value={name} onChange={({ target }) => setName(target.value)} />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Upload name list of the event</Label>
                                    <Input type="file" name="file" id="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
                                    <div className="mt-1">
                                        {(() => {
                                            let name = event.file.split('/').pop()
                                            return <a href={event.file} download>{name}</a>
                                        })()}
                                    </div>
                                </FormGroup>
                                {
                                    activeEvent.value != event.id && (

                                        <FormGroup>
                                            <Label>Active</Label>
                                            <div>
                                                <CustomInput type="switch" name="activeuser" id="exampleCustomSwitch" checked={active} onChange={({ target }) => setActive(target.checked)} />
                                            </div>
                                        </FormGroup>
                                    )
                                }
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

    let response = await Axios.get(`${API_URL}/event/` + context.params.id)
    response = response.data
    return {
        props: {
            response,
            "id": context.params.id
        }, // will be passed to the page component as props
    }
}

export default addUser