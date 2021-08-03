import React from 'react'

const Button = ({onClick, color, padding, name}) => {
    return (
        <button 
        onClick={() => onClick()} 
        style={{padding: padding, backgroundColor: color, outline: 'none', borderRadius: 0}}
        >{name}</button>
    )
}

export default Button