const WebSocket = require('ws');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8765 });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('message', async (message) => {
    try {
      const requestData = JSON.parse(message);
      const { model = 'deepseek-r1:8b', question = 'What is the best strategy to learn coding?' } = requestData;

      console.log(`Received request to use model: ${model}, question: ${question}`);

      // Simulate streaming response (replace with actual model response if needed)
      const simulatedChunks = [
        "To learn coding effectively, start by mastering the fundamentals of programming.",
        "Next, practice coding regularly through small projects and challenges.",
        "Once you're comfortable, explore advanced topics like algorithms and data structures."
      ];

      let buffer = '';
      for (let chunk of simulatedChunks) {
        buffer += chunk;
        if (buffer.length > 200) {
          ws.send(buffer); // Send accumulated data
          buffer = ''; // Clear buffer after sending
        }
        // Simulate a delay between chunks
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Send remaining content
      if (buffer) {
        ws.send(buffer);
      }

      console.log('Streaming completed.');
      ws.close();
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      ws.send('Error occurred while processing your request.');
      ws.close();
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed.');
  });
});

console.log('WebSocket server running on ws://localhost:8765');
