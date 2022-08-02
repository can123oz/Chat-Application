const socket = io();
const userDiv = document.getElementsByClassName("userDiv");
const userNameButton = document.querySelector(".userNameButton");
const sendButton = document.querySelector(".sendButton");
let chatHistory = document.querySelector(".messageHistory");
let lastTimeMessage = new Date().getTime();

//User need to see the people in the chat who logged in before User.
//so we hold the people in an array and another endpoint gets the array.
fetch("http://localhost:5055/people").then(res => res.json()).then((data) => {
    data.peopleArray.forEach(element => {
        const userList = document.querySelector(".userList");
        console.log("userlist : ", userList);
        userList.innerHTML += `<span>${element.sender}<br></span>`;
    });
});

//Message sending function
const sendMessage = () => {
    //console.log("lasttime", new Date().getTime() - lastTimeMessage);
    if (new Date().getTime() - lastTimeMessage < 500 ) {
        console.log("date kontrol");
        return;
    }
    lastTimeMessage = new Date().getTime();
    let sender = document.querySelector(".hiddenUserName").innerHTML;
    let message = document.getElementById("message").value;  //value for input types
    //console.log("sender : ", sender);
    //console.log("message : ", message);
    if (sender != "" && message != "") {
        //chatHistory.innerHTML += `<div class="messageItem"><span class="senderSpan">${sender}:</span><br>${message}</div>`; //comment this line when running server.
        socket.emit("chat", { sender, message });
        document.getElementById("message").value = null;
    }
}

//For picking a user name and not able to change it again.
userNameButton.addEventListener("click", () => {
    let sender = document.querySelector(".userName").value;
    if (sender != "") {
        socket.emit("people", {sender}); //for people array that endpoint gets and socket listens.
        userDiv[0].style.visibility = "visible";
        userNameButton.style.visibility = "hidden";
        document.querySelector(".userName").style.visibility = "hidden";
        document.getElementById("message").focus(); //for better user experience.
        document.querySelector(".hiddenUserName").innerHTML = sender;
    }
});

//sending message with send button
sendButton.addEventListener("click", () => {
    sendMessage();
});

//sending message with Enter Button in keyboard
document.getElementById("message").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

//For showing the users in the chat
socket.on("people", (data) => {
    const userList = document.querySelector(".userList");
    console.log("userlist : ", userList);
    userList.innerHTML = "";
    data.forEach( item => userList.innerHTML += `<span>${item.sender}<br></span>`);
});

//for actualy messaging and chating.
socket.on("chat", (data) => {
    if (data.sender === document.querySelector(".hiddenUserName").innerHTML) {
        chatHistory.innerHTML += `<div class="messageBox right"><div class="messageItem"><span class="senderSpan">${data.sender}:</span><br>${data.message}</div></div>`;
        console.log("gelen data : ", data);
    } else {
        chatHistory.innerHTML += `<div class="messageBox left"><div class="messageItem"><span class="senderSpan">${data.sender}:</span><br>${data.message}</div></div>`;
        console.log("gelen data : ", data);
    }
});