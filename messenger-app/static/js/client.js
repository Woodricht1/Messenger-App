const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');

form.addEventListener('submit', (e) => {
    console.log("hit the function")
    e.preventDefault();
    if (input.value) {
        console.log("message")
        socket.emit('chat message', input.value);
        input.value = '';
    }
});