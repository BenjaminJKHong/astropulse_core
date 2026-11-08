import { useState, useEffect } from 'react';

export function useTelemetry() {
    const [telemetry, setTelemetry] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8000/ws/telemetry');

        ws.onopen = () => setIsConnected(true);
        ws.onclose = () => setIsConnected(false);
        ws.onerror = (error) => console.error('WebSocket Error:', error);
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setTelemetry(data);
            
            // Keep a rolling window of the last 30 seconds for the charts
            setHistory(prev => {
                const newHistory = [...prev, data];
                if (newHistory.length > 30) newHistory.shift();
                return newHistory;
            });
        };

        return () => ws.close();
    }, []);

    return { telemetry, history, isConnected };
}