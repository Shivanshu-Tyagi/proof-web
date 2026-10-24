import React,{useState} from 'react'

function UpdateProfile() {
    const [profile,setprofile] = useState({
        name:"",
        age:""
    })
    const [isEdit,setisEdit] = useState(false)
const handleEdit = ()=>(
    setisEdit(true)
)
const handleChange = (e)=>{
 
    const {name,value} = e.target
    setprofile((prev)=>({
        ...prev,
        [name]:value
 } ))
}

const handleSave = ()=>{
    setisEdit(false)
}
  return (
    <div>
        <button onClick={handleEdit}>edit</button>
        <button onClick={handleSave}>save</button>
 
      
        {
            isEdit ? (
               <> <input name='name' value={profile.name} placeholder='name' onChange={handleChange}  disabled={!isEdit}/>
               <input name='age' value={profile.age} placeholder='age' onChange={handleChange}  disabled={!isEdit}/></>
            ) : (
                <> <h1>{profile.name}</h1>
            <h1>{profile.age}</h1></>
            )
        }
        
    </div>
  )
}

export default UpdateProfile