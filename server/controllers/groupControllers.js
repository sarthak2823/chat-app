const Group = require("../models/groupModel");

module.exports.createGroup = async (req,res,next)=>{
    try{
        const name=req.body.name;
        const members =req.body.members.split(",");
        console.log(name,members);
        const group =await Group.create({
            name:{text:name},
            members:members,
        });
        if (group) return res.json({ msg: "Group created successfully",groupId:group._id });
        else return res.json({ msg: "Failed to create the group" });
    }catch(ex){
        next(ex);
    }
};

module.exports.joinGroup = async (req,res,next)=>{
    try{
        const {groupId ,userId} = req.body;
        const group = await Group.findById(groupId);
        if(group){
            group.members.push(userId);
            await group.save();
            return res.json( {msg: "Successfully joined group" , group });
        }
        else return res.json( {msg: "Error joining group" });
    }catch(ex){
        next(ex);
    }
};

module.exports.leaveGroup = async(req,res,next)=>{
    try{
        const {groupId ,userId} = req.body;
        const group = await Group.findById(groupId);
        if(group){
            let newMembers = group.members.filter(id=> id.toString() != userId);
            group.members = newMembers;
            await group.save();
            return res.json( {msg: "successfully left group", group });
        }
        else return res.json( {msg: "Error leaving group" });
    }catch(ex){
        next(ex);
    }
};

module.exports.sendMessages = async(req,res,next)=>{
    try{
        const { groupId, userId, message} = req.body;
        const group = await Group.findById(groupId);
        if(group){
            group.messages.push({ sender: userId, message});
            await group.save();
            return res.json( {msg: "Message sent" , group });
        }
        else return res.json( {msg: "Error sending message" });
    }catch(ex){
        next(ex);
    }
};
