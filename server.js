const express = require("express");
const app = express();
const ExpressPeerServer = require('peer').ExpressPeerServer;
//express node.js --> allow us to build web application
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});


//using socket io
const io = require("socket.io")(server);

app.set("view engine", "ejs"); //set our view engine as ejs

app.use(express.static("public")); //for all our frontend js to live

//suppose the root port is 3030 however we want to append the unique id behind
//Hence we need to redirect the uuid behind(for generating the unqiue id)

//listen on the server
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`); //redirect us to the uuid
});

app.use('/peerjs', peerServer);

//--> took us to the room and we can render those thing in that uuid
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  //user will join the room
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    //when somebody joined the room and tell everybody in the room that somebody has cmon in
    //certain user has just connectec to the room 
    socket.on('message', message=>{
        io.to(roomId).emit('createMessage', message)
    });
  });
});

//server is our local host
server.listen(3030);

//why are we using uuid --> generate random id
