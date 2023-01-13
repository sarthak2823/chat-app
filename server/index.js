const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const groupRoutes = require("./routes/group");
const app = express();
const socket = require("socket.io");
const Group = require('./models/groupModel');
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/group", groupRoutes);

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

const activeUsers = new Map();




global.onlineUsers = new Map();
io.on("connection", async(socket) => {
  console.log("connected");
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    
  });

  socket.on("is-online", (userId) => {
     activeUsers.set(socket.id,userId);
     console.log(activeUsers);
     socket.broadcast.emit("activeUsers",[...activeUsers]);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });

  socket.on("join-group", async(groupId) => {
    const group = await Group.findById(groupId);
    if(group){
      socket.join(groupId);
      io.to(groupId).emit('new-member' , { userId : activeUsers.get(socket.id) , group});
    }
  });

  socket.on("leave-group", async(groupId) => {
    const group = await Group.findById(groupId);
    if(group){
      socket.leave(groupId);
      io.to(groupId).emit('member-left' , { userId : activeUsers.get(socket.id) , group});
    }
  });

  socket.on("send-group-message", async(groupId,message) => {
    const group = await Group.findById(groupId);
    if(group){
      group.messages.push({userId : activeUsers.get(socket.id) , message});
      await group.save();
      io.to(groupId).emit('new-message' , { userId : activeUsers.get(socket.id) , message , group});
    }
  });

  socket.on("disconnect",()=>{
    console.log(activeUsers.get(socket.id), socket.id,"offline");
    activeUsers.delete(socket.id);
    console.log(activeUsers);
    socket.broadcast.emit("activeUsers",[...activeUsers]);
  })
  


});


