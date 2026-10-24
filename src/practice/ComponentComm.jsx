import React, { useEffect, useState } from 'react'

function ComponentComm() {
    const [data,setData] = useState([]);
    const [,setloading] = useState(false);
    useEffect(()=>{
       const fetchData = async()=>{
       
        try {
            setloading(true)
           let d = await fetch('https://jsonplaceholder.typicode.com/posts')
           if(!d.ok){
           throw new console.error(d.status);
           }
         const res = await d.json();
         setData(res)
         setloading(false)
        } catch (error) {
            console.log(error);
        }
       }
       fetchData()
    },[])

  return (
    <div>
        
        {data.map((d,i)=>(
            <li key={i}>{d.title}</li>
        ))}
    </div>
  )
}

export default ComponentComm