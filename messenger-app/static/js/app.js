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

        // Listen for new messages
        socket.on('receiveMessage', (msg) => {
            currentGroup.messages.push(msg); // Update the current group's messages
            appendMessage(msg); // Append new message to chat
        });
    } catch (error) {
        console.error('Error loading chat:', error);
    }
}

function appendMessage(msg) {
    const subcontainer = document.getElementById('chat-log');
    const msgDiv = document.createElement('div');
    const timestamp = new Date(msg.timestamp);
    msgDiv.innerHTML = `
        <p class="messageinfo">${msg.sender.username} • ${timestamp.toLocaleString("en-US")}</p>
        <p class="message">${msg.message}</p>`;
    subcontainer.appendChild(msgDiv);
    subcontainer.scrollTop = subcontainer.scrollHeight;
}

function appInit() {
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