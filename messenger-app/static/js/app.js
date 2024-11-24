

async function showGroups() {
    console.log("ShowGroups:")
    try {
        const container = document.getElementById('groups-container');
        groups.forEach(group => {
            console.log(`group ${group.name} members: ${group.members}`);
            // Create a div for each group
            const groupDiv = document.createElement('div');
            //TODO this button should do something
            groupDiv.innerHTML = `
                <button>${group.name}</button>
            `;
            container.appendChild(groupDiv);
        });
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

async function showChat() {
    try {
        const container = document.getElementById('chat-container');

        currentGroup.messages.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.innerHTML = `
                <h4>${msg.message}</h4>
            `;
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