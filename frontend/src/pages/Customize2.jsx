import React, { useContext, useState } from "react";
import axios from "axios";
import { userDataContext } from "../context/UserContext";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
function Customize2(){
    const {userData,backendImage,selectedImage, serverUrl, setUserData} = useContext(userDataContext)
    const [assistantName , setAssistantName] = useState(userData.assistantName || "")
    const [loading , setLoading] = useState(false)
    const navigate = useNavigate()
    const handleUpdateAssistant = async()=>{
        setLoading(true)
        try {
            let formData = new FormData()
            formData.append("assistantName" , assistantName)
            if(backendImage){
                formData.append("assistantImage" , backendImage)
            }else{
                formData.append("imageUrl", selectedImage)
            }
            const result = await axios.post(`${serverUrl}/api/user/update` , formData, {withCredentials: true})
            setLoading(false)
            //console.log(result.data)
            setUserData(result.data)
            navigate("/")
        } catch (error) {
            setLoading(false)
           // console.log(error)
        }
    }
    return(
        <div className="w-full min-h-[100vh] bg-gradient-to-t 
            from-black to-[#030353] flex justify-center 
            items-center flex-col p-5 relative">
                <IoArrowBack className="absolute top-[30px] left-[30px]
                text-white w-[25px] h-[25px]" onClick={() =>
                    navigate("/customize")
                }/>
                <h1 className="text-white mb-[30px] text-[30px] text-center">Enter Your  
                    <span  className="text-blue-200"> Assistant Name</span></h1>
                <input type="text" placeholder='Eg: Alexa' className='w-full max-w-[600px] h-[60px] outline-none
            border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full 
            text-[18px]' required onChange={(e)=> setAssistantName(e.target.value)} value={assistantName}/>
            {assistantName && <div className="flex justify-center w-full">
    <button className="inline-block mt-8 px-8 py-3 text-black 
    font-semibold cursor-pointer bg-white rounded-full text-lg
    hover:bg-blue-100 transition duration-200" disabled={loading}onClick={()=>{
        handleUpdateAssistant()
        }}>
        {!loading?"Finally Create Your Assistant" :"Loading.."}
    </button>
    </div>}
            
        </div>
    )
}
export default Customize2;