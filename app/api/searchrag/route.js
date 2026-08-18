import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { Ollama } from "@langchain/ollama";
import { Buffer } from "buffer";  // Needed for handling file buffers, if necessary

const mainChatMessageHistory = new InMemoryChatMessageHistory();

export async function POST(req) {
  try {
    const { question, modelSelected, pdf } = await req.json();
    console.log(question, modelSelected, pdf);

    // If a PDF is provided, decode and load it using PDFLoader
    let pdfText = "";
    if (pdf) {
      // Decode the base64 string into a buffer
      const pdfBuffer = Buffer.from(pdf, 'base64');
      
      // Use PDFLoader to load the PDF buffer
      const loader = new PDFLoader(pdfBuffer);
      const docs = await loader.load();

      // Use RecursiveCharacterTextSplitter to split the documents into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,  // Adjust as needed
        chunkOverlap: 200,  // Adjust as needed
      });

      const splits = await textSplitter.splitDocuments(docs);
      pdfText = splits.map((split) => split.text).join("\n\n"); // Combine all the chunks into one string
      console.log("Extracted text from PDF:", pdfText);  // Log extracted PDF text
    }

    // Construct a system message for the AI
    const systemMessage = `You are a Professional Doctor who is tasked to give medical advice to a patient in a coherent, concise, and clear manner. Provide the patient with the necessary information to help them make an informed decision.`;

    // Add system message to history if not already set
    const existingMessages = await mainChatMessageHistory.getMessages();
    if (existingMessages.length === 0) {
      await mainChatMessageHistory.addMessage(new SystemMessage(systemMessage));
    }

    const model = new Ollama({
      model: modelSelected,
      baseUrl: "http://localhost:11434", // Adjust the base URL for your setup
      stream: true,
    });

    // Combine the extracted PDF text with the user's question
    const combinedText = `${pdfText}\n\nUser Question: ${question}`;

    // Add the user's question to message history
    await mainChatMessageHistory.addMessage(new HumanMessage(question));

    // Generate the model's response based on the combined input
    const completePrompt = `${systemMessage}\n\n${combinedText}\n\nAI: `;
    let fullResponse = "";

    for await (const chunk of await model.stream(completePrompt)) {
      fullResponse += chunk;
    }

    // Add the AI's response to the message history
    await mainChatMessageHistory.addMessage(new AIMessage(fullResponse));

    // Function to remove <think> tags and return only the content
    function extractMessage(response) {
      return response.replace(/<think>.*?<\/think>/g, '').trim();
    }

    // Clean the response by removing <think> tags
    fullResponse = extractMessage(fullResponse);

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
