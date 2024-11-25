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
        if (currentGroup.messages.length < 1) {
            const placeholder = document.createElement('div');
            placeholder.innerHTML = `<h5>no messages yet</h5>`;
            container.appendChild(placeholder);
        }
        currentGroup.messages.sort(function(x, y){
            return y.timestamp - x.timestamp;
        })
        .forEach(msg => {
            //TODO need to actually get message info from the message... this will require a DB hit??
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

//TODO add a listener for an update to currentGroup to rerender (if needed)
window.addEventListener('load', appInit, true);