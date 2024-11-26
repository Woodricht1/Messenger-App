const socket = io();

async function showGroups() {
    //console.log("ShowGroups:")
    try {
        const container = document.getElementById('groups-container');
        groups.forEach(group => {
            //console.log(`group ${group.name} members: ${group.members}`);
            // Create a div for each group
            const groupDiv = document.createElement('div');
            groupDiv.innerHTML = `<button>${group.name}</button>`;

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
        container.innerHTML=`<h1>${currentGroup.name}</h1>`
        if (currentGroup.messages.length < 1) {
            const placeholder = document.createElement('div');
            placeholder.innerHTML = `<h5>no messages yet</h5>`;
            container.appendChild(placeholder);
        }
        currentGroup.messages.sort(function(x, y){
            return new Date(x.timestamp) - new Date(y.timestamp);
        })
        .forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.innerHTML = `
                <h5>${msg.message}</h5>
                <h6>sent by ${msg.sender.username} at ${msg.timestamp}</h6>`;
            container.appendChild(msgDiv);
        })
    } catch (error) {
        console.error('Error loading chat:', error);
    }
}



function appInit() {
    showGroups();
    showChat();
}


const messageComposer = document.getElementById("textbox");
const messageInput = document.getElementById('input');

messageComposer.addEventListener('submit', async (e) => {
    e.preventDefault();

    const msg = messageInput.value.trim(); // Get the message text
    if (!msg) return; // Do nothing if the input is empty


    //TODO this seems overcomplicated... how do we do this elsewhere?
    console.log("sender: ", currentUser._id);
    console.log("currentUser: ", currentUser);
    console.log("recipient: ", currentGroup._id);

    const payload = {
        sender: currentUser._id,
        recipient: currentGroup._id,
        message: msg,
    };

    console.log('Payload:', payload); // Log the payload

    try {
        // Send the message to the server
        const response = await fetch('/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: payload
        });

        if (!response.ok) {
            throw new Error(`Failed to send message`);
        }

        // Clear the input
        messageInput.value = '';
    } catch (error) {
        console.error('Error sending message:', error);
    }
});

window.addEventListener('load', appInit, true);