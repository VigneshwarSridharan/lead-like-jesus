import Axios from "axios";
import { API_URL } from "../../../lib/constants";
import { Container, Row, Col, Card, FormGroup, Label, Input, Button, Form, CustomInput } from "reactstrap"
import { useState } from "react"
import { request } from "../../../lib/APIServices"
import Swal from 'sweetalert2'
import { useRouter } from 'next/router'

const EditMailDetails = (props) => {
    const router = useRouter()
    const [subject, setsubject] = useState(props.response.data.subject || "");
    const [content, setContent] = useState(props.response.data.content || "");


    const updateMailDetails = (e) => {
        e.preventDefault();
        let params = { subject, content }
        request.put('/mail-config/' + props.id, params).then(res => {
            if (res.status) {
                Swal.fire(
                    'Success!',
                    'updated Successfully',
                    'success'
                )
                router.push('/dashboard/mails');
            }

        })

    }
    return (
        <section className="py-3">
            <Container fluid>
                <Row>
                    <Col sm={{ size: 8, offset: 2 }}>
                        <Card className="border-0 my-5" body>
                            <h3 className="mb-4">Mail Details </h3>
                            <Form onSubmit={updateMailDetails}>
                                <FormGroup>
                                    <Label>Enter Mail Subject</Label>
                                    <Input required value={subject} onChange={({ target }) => setsubject(target.value)} />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Enter Mail Content</Label>
                                    <Input type="textarea" rows={8} value={content} onChange={({ target }) => setContent(target.value)} />
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
    let response = await Axios.get(`${API_URL}/mail-config/` + context.params.id)
    response = response.data
    delete response.data.password
    return {
        props: {
            response,
            "id": context.params.id
        }, // will be passed to the page component as props
    }
}
export default EditMailDetails