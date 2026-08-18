import WebSocket from 'ws';
import { NextResponse } from 'next/server';  // Import NextResponse

// Create a WebSocket client to connect to the WebSocket server
const connectToWebSocket = (data) => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('ws://localhost:8765');

    ws.on('open', () => {
      console.log('Connected to WebSocket server');
      ws.send(JSON.stringify(data)); // Send data to WebSocket server
    });

    ws.on('message', (message) => {
      console.log('Received from WebSocket:', message);
      resolve(message); // Resolve the promise when the message is received
    });

    ws.on('error', (error) => {
      reject('WebSocket error: ' + error);
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed.');
    });
  });
};

// Named export for POST method (use uppercase 'POST')
export const POST = async (req) => {
  try {
    const { model, question } = await req.json();

    console.log('Received POST data:', { model, question });

    // Connect to WebSocket and send data
    const response = await connectToWebSocket({ model, question });

    // Send the streamed response back to the client using NextResponse
    return NextResponse.json({ message: response }, { status: 200 });
  } catch (error) {
    console.error('Error in POST request handler:', error);
    
    // Return an error response using NextResponse
    return NextResponse.json({ error: 'Error processing your request' }, { status: 500 });
  }
};
