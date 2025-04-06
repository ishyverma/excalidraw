import { WebSocketServer, WebSocket } from "ws";

interface User {
    ws: WebSocket
}

interface Rectangle {

}

const wss = new WebSocketServer({ port: 8080 })

let users: User[] = []
let rectangle = []

wss.on("connection", socket => {
    socket.on("message", (data) => {
        const message = JSON.parse(data.toString());

        switch (message.type) {
            case "join_canvas": {
                users.push({
                    ws: socket
                })
                break;
            }

            case "send_shape": {
               const shapeType = message.payload 
               switch (shapeType) {
                    case "rectangle": {
                        break;
                    }
                    case "circle": {
                        break;
                    }
               }
            }
        }
    })
})