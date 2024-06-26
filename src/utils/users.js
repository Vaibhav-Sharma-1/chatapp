const users = [];

const addUser = ({ id, username, room }) => {
  //  CLEAN THE DATA
  username = username?.trim()?.toLowerCase();
  room = room?.trim()?.toLowerCase();

  //VALIDATE THE DATA
  if (!username || !room) {
    return {
      error: "Username and Room can't be empty!",
    };
  }

  //CHECKOUT FOR EXISTING USER
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //VALIDATING THE USER
  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }

  //STORE THE USER
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUserInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
};
