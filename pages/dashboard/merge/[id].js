import { withRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { API_URL } from '../../../lib/constants'
import { Card, Container, Col, Row } from 'reactstrap'

const Merge = props => {
    console.log(props)
    const [result, setResult] = useState(["<p>Please Wait...</p>"])
    const { id } = props.router.query
    useEffect(() => {
        if (typeof (EventSource) !== "undefined") {
            // Yes! Server-sent events support!
            // Some code.....
            let source = new EventSource(`${API_URL}/merge/${id}`);
            source.onmessage = function (e) {
                let res = JSON.parse(e.data)
                if (res.message == 'end') {
                    source.close(); // stop retry
                    return
                }
                result.push(res.message)
                setResult([...result])
                let content = document.getElementById('content')
                if(content) {
                    content.scrollTo(0, content.scrollHeight);
                }

            };
        } else {
            // Sorry! No server-sent events support.. href={`${API_URL}/merge/${activeEvent.id}`}
        }
    }, [])
    return (
        <section className="py-3">
            <Container fluid>
                <Row>
                    <Col sm={{ size: 8, offset: 2 }}>
                        <Card body className="mb-3">
                            <div dangerouslySetInnerHTML={{ __html: result.join(' ') }}></div>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>
    )
}

export default withRouter(Merge)