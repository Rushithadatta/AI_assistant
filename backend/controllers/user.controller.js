import geminiResponse from "../gemini.js"
import User from "../models/user.model.js"
import moment from "moment"
export const getCurrentUser = async(req , res) =>{
    try {
        const userId = req.userId
        const user = await User.findById(userId).select("-password")
        if(!user){
            return res.status(400).json({message:"user not found"})
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(400).json({message:"get current user error"})
    }
}
export const updateAssistant=async(req, res)=>{
    try {
        const {assistantName, imageUrl}=req.body
        let assistantImage;
        if(req.file){
            assistantImage=await uploadOnCloudinary(req.file.path)
        }else{
            assistantImage=imageUrl
        }
        const user= await User.findByIdAndUpdate(req.userId, {
            assistantName, assistantImage
        },{new: true}).select("-password")
          return res.status(200).json(user)
    } catch (error) {
        return res.status(400).json({message:"updateAssistantError user error"})
    }
}
export const askToAssistant =async (req,res)=>{
 try {
    const {command} = req.body
    if (!command) {
        return res.status(400).json({ response: "Command is required." });
    }
    const user=await User.findById(req.userId);
    if (!user) {
       console.log("User not found with ID:", req.userId);
         return res.status(404).json({ response: "User not found." });
    }
     console.log("User found:", user.name);
    const userName = user.name
    const assistantName = user.assistantName
    const result = await geminiResponse(command, assistantName, userName);
    const jsonMatch=result.match(/{[\s\S]*}/);
    if(!jsonMatch) {
        console.log("No JSON match in Gemini result.");
        return res.status(400).json({response:"sorry, I can't understand"})
    }
    const gemResult = JSON.parse(jsonMatch[0])
    const type=gemResult.type
    console.log("Parsed Gemini result:", gemResult);
    switch(type){
        case 'get-date' : 
            return res.json({
                type,
                userInput: gemResult.userInput,
                response:`current date is ${moment().format("YYYY-MM-DD")}`
            });
        case 'get-time' :
            return res.json({
                type,
                userInput: gemResult.userInput,
                response:`current Time is ${moment().format("hh:mm A")}`
            });
        case 'get-day' :
            return res.json({
                type,
                userInput: gemResult.userInput,
                response:`Today is ${moment().format("dddd")}`
            });
        case 'get-month' :
            return res.json({
                type,
                userInput: gemResult.userInput,
                response:`Today is ${moment().format("MMMM")}`
            });
        case 'google-search':
        case 'youtube_search':
        case 'youtube_play':
        case 'general':
        case 'calculator-open':
        case 'instagram-open':
        case 'facebook-open':
        case 'weather-show':
            return res.json({
                type,
                userInput:gemResult.userInput,
                response:gemResult.response
            });
        default:
             return res.status(400).json({response:"I didn't understand that command."})

    }
      
 } catch (error) {
    console.error("ASK ASSISTANT ERROR ===>", error);
    return res.status(500).json({response:"ask assistant error"})
 }
}
