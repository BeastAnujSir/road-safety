const User = require("../models/User");
const Audit = require("../models/Audit")
const { verifyToken, verifyTokenAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const router = require("express").Router();

router.put("/:id",verifyTokenAuthorization,async(req,res)=>{
    if(req.body.password){
        req.body.password= CryptoJs.AES.encrypt(req.body.password,process.env.PASS_SEC).toString();
    }
    try{
        const updatedUser= await User.findByIdAndUpdate(req.params.id,{
            $set:req.body
        },{new:true})    
        res.status(200).json(updatedUser)
}catch(e){
res.status(500).json(e)
}
})

//DELETE
router.delete("/:id",verifyTokenAuthorization,async(req,res)=>{
    try{
        await User.findByIdAndDelete(req.params.id)
        res.status(200).json("User has been deleted....")
    }catch(e){
        res.status(500).json(e)
    }
})
//Get USER
router.get("/find/:id",verifyTokenAndAdmin,async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        const {password,...others}= user._doc
        res.status(200).json(others)
    }catch(e){
        res.status(500).json(e)
    }
})
//Get All USER
router.get("/",verifyTokenAndAdmin,async(req,res)=>{
    const query= req.query.new
    try{
        const users = query? await User.find().sort({_id:-1}).limit(5) : await User.find()
        res.status(200).json(users)
    }catch(e){
        console.log(e)
        res.status(500).json(e)
    }
})
//Get User Stats
router.get("/stats",verifyTokenAndAdmin,async(req,res)=>{
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear()-1));
    try{

        const data = await User.aggregate([{
            $match:{createdAt:{$gte:lastYear}}
        },
        {
            $project:{
                month:{$month:"$createdAt"}
            }
        },
        {
            $group:{
                _id:"$month",
                total:{$sum:1}
            }
        }
    ])
    res.status(200).json(data)

    }catch(e){
        res.status(500).json(e)
    }
})

router.post("/audit",async(req,res)=>{
    const newAudit = new Audit(req.body);
    try{
        const savedAudit = await newAudit.save()
        console.log(savedAudit)
        res.status(200).json(savedAudit)
    }
    catch(e){ 
        res.status(500).json(e)
    }
})

module.exports=router