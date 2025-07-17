import React, { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
function Home(){
    const {userData, serverUrl, setUserData, getGeminiResponse} = useContext(userDataContext)
    const navigate = useNavigate()
    const recognitionRef = useRef(null);
    const isSpeakingRef = useRef(false);
    const isRecognizingRef = useRef(false);
    const [textToSpeak, setTextToSpeak] = useState("");
    const [listening , setListening] = useState(false);
     const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
    const synth =  window.speechSynthesis
    const handleLogOut=async()=>{
        try {
            const result = await axios.get(`${serverUrl}/api/auth//logout`,{withCredentials: true})
            setUserData(null)
            navigate("/signin")
        } catch (error) {
            setUserData(null)
            console.log(error)
        }
    };
    const Speak=()=>{
        if(textToSpeak){
       const utterance = new SpeechSynthesisUtterance(textToSpeak)
       isSpeakingRef.current = true;
        setIsSpeaking(true);
       utterance.onend = () => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        safeRecognition();
      };

        synth.speak(utterance);
        }
    };
    const handleCommand = (data)=>{
        const {type, userInput, response} = data
        setTextToSpeak(response);
        setConversationHistory((prev) => [
      ...prev,
      { userInput, response, timestamp: new Date().toISOString() },
    ]);
        if(type === 'google-search'){
            const query = encodeURIComponent(userInput);
            window.open(`https://www.google.com/search?q=${query}`, '_blank');
        }
        if(type === 'calculator-open'){
            window.open(`https://www.google.com/search?q=calculator`, '_blank');
        }
        if(type === 'instagram-open'){
            window.open(`https://www.instagram.com/`, '_blank');
        }
        if(type === 'facebook-open'){
            window.open(`https://www.facebook.com/`, '_blank');
        }
        if(type === 'weather-show'){
            window.open(`https://www.google.com/search?q=weather`, '_blank');
        }
        if(type === 'youtube_search' || type === 'youtube_play'){
             let query = userInput
               .replace(/play|search|open/gi, '')
               .replace(/on youtube/gi, '')
               .trim();
             if (!query) {
              console.error("No valid search query for YouTube.");
                return;
                }
               query = encodeURIComponent(userInput);
           console.log("Opening YouTube with query:", query);
            window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
        }
    };
    const startAssistant = () => {
        if (!userData) {
            setTextToSpeak("Please wait, loading your assistant...");
            return;
        }
       safeRecognition();
    };
    const safeRecognition = () =>{
        if(!isSpeakingRef.current && !isRecognizingRef.current){
            try {
               recognitionRef.current.start();
                console.log("Recognition Requested to start");
            } catch (err) {
                if(err.name !== "InvalidStateError"){
                    console.error("Start error:", err);
                }  
            }
        }
    };

   useEffect(()=>{
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition
    recognition.onstart = () =>{
       console.log("Recognization started");
        isRecognizingRef.current = true;
        setListening(true);
    };
    recognition.onend = () =>{
      console.log("Recognition ended");
        isRecognizingRef.current = false;
        setListening(false);
        if(!isSpeakingRef.current){
            setTimeout(() => {
                safeRecognition();
            } , 1000);
        }
    };
    recognition.onerror = (event) =>{
      console.warn("Recognition error:" , event.error);
        isRecognizingRef.current = false;
        setListening(false);
        if(event.error !== "aborted" && !isSpeakingRef.current){
            setTimeout(() =>{
                safeRecognition();
            }, 1000);
        }
    };

     recognition.onresult = async (e) => {
            const transcript = e.results[e.results.length - 1][0].transcript.trim();
            console.log("Transcript:", transcript);
            if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
                recognition.stop()
                isRecognizingRef.current =  false
                setListening(false)
                const data = await getGeminiResponse(transcript);
               console.log("Gemini Response:", data);
                if (data) {
                    handleCommand(data);
                } else {
                    setTextToSpeak("Sorry, I could not understand that.");
                }
            }
        };
        const fallback= setInterval(() =>{
            if(!isSpeakingRef.current && !isRecognizingRef.current){
                safeRecognition()
            }
        }, 10000)
        return ()=>{
            recognition.stop()
            setListening(false)
            isRecognizingRef.current = false
            clearInterval(fallback)
        };
   },[]);
    useEffect(() => {
    if (textToSpeak) {
      Speak();
    }
  }, [textToSpeak]);
    return (
        <div className="w-full min-h-[100vh] bg-gradient-to-t 
            from-black to-[#02023d] flex justify-center 
            items-center flex-col gap-[15px]">
                <button className='min-w-[150px] h-[60px] mt-[30px] text-black 
            font-semibold absolute top-[20px] right-[20px] cursor-pointer bg-white rounded-full
             text-[19px]' onClick={handleLogOut}>Log Out</button>
            <button className='min-w-[150px] h-[60px] mt-[30px] text-black 
            font-semibold absolute top-[100px] right-[20px] cursor-pointer bg-white rounded-full text-[19px] px-[20px] 
            py-[10px]' onClick={() => navigate("/customize")}>Customize your Assistant</button>
             <button className='min-w-[180px] h-[60px] mt-[30px] text-black 
                font-semibold absolute top-[180px] right-[20px] cursor-pointer bg-white rounded-full 
                text-[18px] px-[20px] py-[10px]' onClick={startAssistant}>
                🎤 Start Assistant
            </button>
            {listening && (
        <div className="text-green-400 text-lg mt-2 animate-pulse absolute top-[260px] right-[20px]">
        </div>
      )}
      {isSpeaking && (
        <div className="text-yellow-300 text-lg mt-2 animate-pulse absolute top-[300px] right-[20px]">
        </div>
      )}
                <div className="w-[300px] h-[400px] flex justify-center
                items-center overflow-hidden rounded-4xl shadow-lg">
                    <img src={userData?.assistantImage} alt="" className="
                    h-full object-cover "/>
                </div>
                <h1 className="text-white text-[18px]">I'm {userData?.assistantName}</h1>
        </div>
    )
}
export default Home;
