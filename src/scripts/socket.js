import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_IP);

socket.on("connect", () => console.log("Socket connecté, id:", socket.id));
socket.on("connect_error", (err) => console.error("Erreur connexion:", err.message));

socket.onAny((event, ...args) => {
    console.log("📡 Événement reçu:", event, args);
});

function createLobby() {
    return new Promise((resolve, reject) => {
        const send = () => {
            socket.once("host:created", (response) => {
                resolve(response.roomCode);
            });

            socket.emit("role", "host");
            socket.emit("host:create");
        };

        if (socket.connected) {
            send();
        } else {
            socket.once("connect", send);
            socket.once("connect_error", reject);
        }
    });
}

function onPlayerListUpdate(callback) {
    socket.on("player:joined", ({ id, name }) => {
        callback({ id, name });
    });
}

function offPlayerListUpdate() {
    socket.off("player:joined");
}

export { createLobby, onPlayerListUpdate, offPlayerListUpdate };