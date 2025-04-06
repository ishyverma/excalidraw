import { useCallback, useEffect, useRef, useState } from "react";

export const useWebsocket = (url: string) => {
    const [data, setData] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [connected, setConnected] = useState<boolean>(false);
    const ws = useRef<WebSocket | null>(null);

    const sendMessage = useCallback((message: any) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message))
        } else {
            console.error("Websocket is not connected")
        }
    }, [])

    useEffect(() => {
        if (ws.current) {
            ws.current.close();
        }

        ws.current = new WebSocket(url);
        ws.current.onopen = () => {
            setConnected(true);
        }

        ws.current.onmessage = (message) => {
            setData(message.data.toString());
        }

        ws.current.onerror = (error) => {
            setError("Websocket Error");
        }

        ws.current.onclose = () => {
            setConnected(false);
        }

        return () => {
            ws.current?.close();
        }

    }, [url])

    return {
        data, error, connected, sendMessage
    }
}