import './../index.css'

function Button(OnClick, label ){
    return(
        <button 
        onClick = {onClick}
        >{label}</button>
    );
}

export default Button