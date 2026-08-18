import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { Ollama } from "@langchain/ollama";

const mainChatMessageHistory = new InMemoryChatMessageHistory();

export async function POST(req) {
    try {
        const { question, modelSelected } = await req.json();
        console.log(question, modelSelected);

        // Construct a dynamic system message based on user inputs
        const systemMessage = `You are a Professional Doctor who is tasked to give medical advice to a patient in a coherent, concise, and clear manner. Provide the patient with the necessary information to help them make an informed decision.`;

        // Add system message to history if not already set
        const existingMessages = await mainChatMessageHistory.getMessages();
        if (existingMessages.length === 0) {
            await mainChatMessageHistory.addMessage(new SystemMessage(systemMessage));
        }

        const model = new Ollama({
            model: modelSelected,
            baseUrl: "http://localhost:11434",
            stream: true,
        });

        // Add the user's question to message history
        await mainChatMessageHistory.addMessage(new HumanMessage(question));

        // Generate response, appending the system message in each call
        const completePrompt = `${systemMessage}\n\nUser: ${question}\nAI: `;
        let fullResponse = "";

        for await (const chunk of await model.stream(completePrompt)) {
            fullResponse += chunk;
            console.log(chunk);
        }

        // Add AI response to the message history
        await mainChatMessageHistory.addMessage(new AIMessage(fullResponse));

        // Function to remove <think> tags and return only the content
        function extractMessage(response) {
            // Use a regex to remove all <think>...</think> content
            return response.replace(/<think>.*?<\/think>/g, '').trim();
        }

        // Clean the response by removing <think> tags
        fullResponse = extractMessage(fullResponse);
        console.log(fullResponse);  // This will log the cleaned response without <think> tags

        return new Response(JSON.stringify({ text: fullResponse }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
