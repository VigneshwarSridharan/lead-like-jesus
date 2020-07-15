import Link from 'next/link'
import { useRouter } from 'next/router'

const temp = props => {

    const router = useRouter();

    const goHome = () => {
        router.push('/')
    }

    return (
        <section className="p-5 m-5">
            <h1>Transactions page</h1>
            <div onClick={goHome}>Home</div>
        </section>
    )
}

export default temp