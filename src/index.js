const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 8000;
const publicPath = path.join(__dirname, "../Public");

app.use(express.static(publicPath));

let message = "";
let locationMessage = "";

io.on("connection", (socket) => {
  console.log("New Web Socket Connection");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      username,
      room,
    });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined the chat!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(user.room),
    });

    callback();
  });

  socket.on("messageSend", (messageValue, callback) => {
    message = messageValue;
    const filter = new Filter();
    const user = getUser(socket.id);

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    } else {
      io.to(user.room).emit("message", generateMessage(user.username, message));
      callback("Delivered");
    }
  });

  socket.on("sendLocation", (position, callback) => {
    const user = getUser(socket.id);
    locationMessage = `https://google.com/maps?q=${position.latitude},${position.longitude}`;
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(user.username, locationMessage)
    );
    callback("Location Shared!");
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left the chat!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUserInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up at port ${port}`);
});
