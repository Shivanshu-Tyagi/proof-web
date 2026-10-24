import React from 'react'

function ListRendering() {
    let fruits = ["Apple", "Banana", "Mango"]
  return (
    <>
    <h1>
      {fruits.length}
    </h1>
    <ul>
        {
        fruits.map((f,k)=>(
             <li key={k}>{f}</li>
        ))
    }
    </ul>
    </>
    
  )
}

export default ListRendering