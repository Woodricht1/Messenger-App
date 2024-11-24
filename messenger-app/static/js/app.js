async function showGroups() {
    //console.log("ShowGroups:")
    try {
        const container = document.getElementById('groups-container');
        groups.forEach(group => {
            //console.log(`group ${group.name} members: ${group.members}`);
            // Create a div for each group
            const groupDiv = document.createElement('div');
            groupDiv.innerHTML = `<button>${group.name}</button>`;

            // Attach a click event listener to the button
            const button = groupDiv.querySelector('button');
            button.addEventListener('click', () => {
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
        currentGroup.messages.forEach(msg => {
            //TODO need to actually get message info from the message... this will require a DB hit??
            console.log(`msg.message ${msg.message}`);
            const msgDiv = document.createElement('div');
            msgDiv.innerHTML = `<h4>${msg.message}</h4>`;
            container.appendChild(msgDiv);
        })
    } catch (error) {
        console.error('Error loading chat:', error);
    }
}

function chatViewInit() {
    showGroups();
    showChat();
}

//TODO add a listener for an update to currentGroup to rerender (if needed)
window.addEventListener('load', chatViewInit, true);