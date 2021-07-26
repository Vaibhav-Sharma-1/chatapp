const socket = io();

//ELEMENTS
const messageForm = document.getElementById("message-form");
const messageFormInput = document.getElementById("message-form-input");
const messageFormButton = document.getElementById("message-form-button");
const sendLocation = document.getElementById("send-location");
const messages = document.getElementById("messages");
const sidebar = document.getElementById("sidebar");

//TEMPLATES
const messageTemplate = document.getElementById("message-template").innerHTML;
const LocationMessageTemplate = document.getElementById(
  "location-message-template"
).innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

//OPTIONS
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  const newMessage = messages.lastElementChild;

  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = messages.offsetHeight + newMessageMargin;

  const visibleHeight = messages.offsetHeight;

  const containerHeight = messages.scrollHeight;

  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  const { username, text, createdAt } = message;
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username,
    message: text,
    createdAt: moment(createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (urlLink) => {
  const { username, url, createdAt } = urlLink;
  console.log(urlLink);
  const html = Mustache.render(LocationMessageTemplate, {
    username,
    url,
    createdAt: moment(createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  sidebar.innerHTML = html;
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  messageFormButton.setAttribute("disabled", "disabled");

  const messageValue = e.target.elements.message.value;

  socket.emit("messageSend", messageValue, (error) => {
    messageFormButton.removeAttribute("disabled");
    messageFormInput.value = "";
    messageFormInput.focus();
    if (error) {
      console.log(error);
    } else {
      console.log("Delivered");
    }
  });
});

sendLocation.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  } else {
    sendLocation.setAttribute("disabled", "disabled");

    navigator.geolocation.getCurrentPosition((position) => {
      socket.emit(
        "sendLocation",
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        (message) => {
          sendLocation.removeAttribute("disabled");

          console.log(message);
        }
      );
    });
  }
});

socket.on("roomData", ({ room, users }) => {
  console.log(room, "***************", users);
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
