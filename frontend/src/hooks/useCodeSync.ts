/**
 * useCodeSync Hook
 * 
 * Manages WebSocket connection for real-time code synchronization.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseCodeSyncProps {
    clientId: string;
    appId: string;
    onRemoteChange: (filePath: string, content: string) => void;
}

export const useCodeSync = ({ clientId, appId, onRemoteChange }: UseCodeSyncProps) => {
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('disconnected');
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host;
        const socketUrl = `${protocol}//${host}/api/v1/editor/ws/${clientId}/${appId}`;

        console.log(`Connecting to WebSocket: ${socketUrl}`);
        const socket = new WebSocket(socketUrl);
        ws.current = socket;

        socket.onopen = () => {
            console.log('WebSocket Connected');
            setStatus('connected');
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'PUSH_CONTENT') {
                    onRemoteChange(message.file_path, message.content);
                }
            } catch (err) {
                console.error('Error parsing WebSocket message:', err);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket Disconnected');
            setStatus('disconnected');
        };

        socket.onerror = (err) => {
            console.error('WebSocket Error:', err);
            setStatus('error');
        };

        return () => {
            socket.close();
        };
    }, [clientId, appId, onRemoteChange]);

    const pushChange = useCallback((filePath: string, content: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                action: 'CODE_UPDATE',
                file_path: filePath,
                content: content
            }));
        }
    }, []);

    const sendPing = useCallback(() => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ action: 'PING' }));
        }
    }, []);

    return { status, pushChange, sendPing };
};
