import { io } from "socket.io-client";

const io = io(process.env.BACKEND_IP);