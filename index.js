const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// 🔐 Replace with your deployed frontend domain (no trailing slash)
const allowedOrigin = 'https://videocall-app-azure.vercel.app';

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

const io = socketIo(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  socket.on('call-user', (data) => {
    io.to(data.to).emit('call-made', {
      offer: data.offer,
      socket: socket.id,
      type: data.type,
    });
  });

  socket.on('make-answer', (data) => {
    io.to(data.to).emit('answer-made', {
      answer: data.answer,
      socket: socket.id,
    });
  });

  socket.on('ice-candidate', (data) => {
    console.log('Forwarding ICE candidate to:', data.to);
    io.to(data.to).emit('ice-candidate', {
      candidate: data.candidate,
    });
  });

  socket.on('leave-call', ({ to }) => {
    console.log(`Call ended by ${socket.id}, notifying ${to}`);
    io.to(to).emit('leave-call');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// 🔁 Use environment port or fallback to 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
