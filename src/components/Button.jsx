import './../index.css'


function Button({ buttonFunc, label }) {
    return (
        <div className = "blueButton">
        <button onClick={buttonFunc}>
            {label}
        </button>
        </div>
    );
}


export default Button