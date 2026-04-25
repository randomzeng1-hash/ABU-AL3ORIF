const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

let gameRooms = {};

app.get('/', (req, res) => {
    res.send('Welcome to the Game Server!');
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('createRoom', (roomName) => {
        if (!gameRooms[roomName]) {
            gameRooms[roomName] = { players: [] };
            socket.join(roomName);
            console.log(`Room ${roomName} created`);
            io.to(roomName).emit('roomCreated', roomName);
        } else {
            socket.emit('roomExists', roomName);
        }
    });

    socket.on('joinRoom', (roomName) => {
        if (gameRooms[roomName]) {
            socket.join(roomName);
            gameRooms[roomName].players.push(socket.id);
            console.log(`Client ${socket.id} joined room ${roomName}`);
            io.to(roomName).emit('playerJoined', socket.id);
        } else {
            socket.emit('roomNotFound', roomName);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
