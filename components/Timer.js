const { useState, useEffect } = require("react")


const Timer = props => {
    let [count, setCount] = useState(0)
    useEffect(() => {
        var handleTimer = setInterval(() => {
            count++
            setCount(count)
        }, 100);
        return () => {
            clearInterval(handleTimer)
        }
    }, [])

    var milliseconds = count % 10
    var seconds = Math.floor(count / 10) % 60
    var minutes = (Math.floor(Math.floor(count / 10) / 60)) % 60
    const map = val => val < 10 ? "0" + val : val
    // return `${map(minutes)}:${map(seconds)}:${map(milliseconds * 10)}`
    return (
        <React.Fragment>
            <span>{map(minutes)}</span>:<span>{map(seconds)}</span>:<span>{map(milliseconds * 10)}</span>
        </React.Fragment>
    )
}

export default Timer