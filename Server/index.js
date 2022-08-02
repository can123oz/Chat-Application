const http = require("http");
const express = require("express");
const app = express();
const {Server} = require("socket.io");
const path = require("path");
const { id } = require("ethers/lib/utils");
const server = http.createServer(app)
const io = new Server(server);

let peopleArray = []; //for listening online users at chat screen.


io.on("connection", (socket) => {
    console.log("A user connected.", socket.conn.id); //checking the users unique id when logged in.
    peopleArray.push({sender:"",socketId: socket.conn.id}); //for getting a unique id for each user connects.
    
    //chat connection
    socket.on("chat", (data) => {
      io.emit("chat",data);
    });
    
    socket.on("people", (data) => {
      console.log("data : ",data);
      let idx = peopleArray.findIndex((query) => query.socketId === socket.conn.id);
      peopleArray[idx].sender = data.sender;
      io.emit("people",peopleArray);
    });

    //After a user leaves we have to delete the user in the array
    socket.on('disconnect', () => {
      let idx = peopleArray.findIndex(p => p.socketId === socket.conn.id);
      peopleArray.splice(idx,1);
      console.log('user disconnected',socket.conn.id);
      io.emit("people",peopleArray);
    });
});

app.use(express.static('../Client')); //for connecting the js and css files in the client side.

app.get('.', express.static(path.join(__dirname.replace("Server","Client")), { maxAge: '1y' }));

//we need an endpoint in the beginning the hold the users and return them all. 
app.get("/people" , (req, res) => {
  res.json({peopleArray});
}); 

app.all('*', (req, res) => {
  res.status(200).sendFile(`/`, { root: path.join(__dirname.replace("Server","Client"))});
});

let port = 5055;
server.listen(port,() => {console.log(`server is alive at http://localhost:${port}`)});