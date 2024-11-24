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

window.onload = showGroups;