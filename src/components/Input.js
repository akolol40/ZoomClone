import React from 'react'



const Input = ({type, padding, margin, value}) => {
    return (<input value={value} type={type} style={{width: 400 , padding: padding, outline: 'none', margin: margin}}/>)
}

export default Input