const socket = io();

async function showGroups() {
    //console.log("ShowGroups:")
    try {
        const container = document.getElementById('groups-container');
        groups.forEach(group => {
            //console.log(`group ${group.name} members: ${group.members}`);

            const groupDiv = document.createElement('div');
            groupDiv.innerHTML = `<button id="groupbutton">${group.name}</button>`;

            const groupButton = groupDiv.querySelector('button');
            
            groupButton.addEventListener('click', () => {
                currentGroup = group; // Update the currentGroup
                console.log(`Current group set to: ${currentGroup.name}`);
                showChat();
            });

            container.appendChild(groupDiv);
        });
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

async function showChat() {
    try {
        const container = document.getElementById('chat-container');
        container.innerHTML=`<h1 id="chatheader">${currentGroup.name}</h1>`
        const subcontainer = document.createElement('div')
        subcontainer.id = "chat-log"
        if (currentGroup.messages.length < 1) {
            const placeholder = document.createElement('div');
            placeholder.innerHTML = `<h5>no messages yet</h5>`;
            subcontainer.appendChild(placeholder);
        }
        currentGroup.messages.sort(function(x, y){
            return new Date(x.timestamp) - new Date(y.timestamp);
        })
        .forEach(msg => {
            const msgDiv = document.createElement('div');
            const timestamp = new Date(msg.timestamp)
            if (!msg.sender) {
                msg.sender = currentGroup.members[0];
                msg.sender.username = "Unknown"
            }
            msgDiv.innerHTML = `
                <p class="messageinfo">${msg.sender.username} • ${timestamp.toLocaleString("en-US")}</p>
                <p class="message">${msg.message}</p>`;
                subcontainer.appendChild(msgDiv);
        })
        script = document.createElement('script')
        script.innerHTML = 'var element = document.getElementById("chat-log"); element.scrollTop = element.scrollHeight;'
        subcontainer.appendChild(script)
        container.appendChild(subcontainer)

        // Join the current group room
        socket.emit('joinGroup', currentGroup.id);
    } catch (error) {
        console.error('Error loading chat:', error);
    }
}

function appendMessage(msg) {
    console.log("appending message")
    const subcontainer = document.getElementById('chat-log');
    const msgDiv = document.createElement('div');
    const timestamp = new Date(msg.timestamp);
    msgDiv.innerHTML = `
        <p class="messageinfo">${msg.sender.username} • ${timestamp.toLocaleString("en-US")}</p>
        <p class="message">${msg.message}</p>`;
    subcontainer.appendChild(msgDiv);
    subcontainer.scrollTop = subcontainer.scrollHeight;
}

async function setUpEmojiPicker() {
    //hide emoji picker at first
    var picker = document.getElementById('emoji-picker');
    picker.style.display = "none";

    document.getElementById('emoji-picker').addEventListener('emoji-click', e => {
        //insert emoji into input field at cursor position
        var cursorPos = $('#message-input').prop('selectionStart');
        var msg = $('#message-input').val();
        var textBefore = msg.substring(0, cursorPos);
        var textAfter  = msg.substring(cursorPos, msg.length);
        $('#message-input').val(textBefore + e.detail.unicode + textAfter);
    });

    //show or hide emoji picker when button is clicked
    document.getElementById("emojibutton").addEventListener('click', e => {
        e.preventDefault();
        if (picker.style.display === "none") {
            picker.style.display = "block";
          } else {
            picker.style.display = "none";
          }
    });

    //when we submit the message, close emoji picker
    document.getElementById("message-writer").addEventListener('submit', e => {
        picker.style.display = "none";
    });
}

function appInit() {
    setUpEmojiPicker();
    showGroups();
    showChat();
}

async function ensureGlobalChatExists() {
    try {
        const globalChat = await models.Group.findOne({ name: "Global Chat" });
        if (!globalChat) {
            const newGroup = new models.Group({ name: "Global Chat", members: [] });
            await newGroup.save();
            console.log("Global Chat group created.");
        }
    } catch (error) {
        console.error("Error ensuring Global Chat exists:", error);
    }
}

//TODO add a listener for an update to currentGroup to rerender (if needed)
window.addEventListener('load', appInit, true);