export function getSystemPrompt(hasDocument: boolean): string {
  if (hasDocument) {
    return [
      "You are a professional medical assistant.",
      "The user uploaded a document and its extracted text is provided below under DOCUMENT CONTENT.",
      "Answer the user's question using that content.",
      "Do not ask the user to share the document again — you already have it.",
      "If the answer is not in the document, say what is missing.",
      "Always note that a licensed healthcare provider should interpret medical documents.",
    ].join(" ");
  }

  return [
    "You are a professional medical assistant.",
    "Provide clear, concise, evidence-informed guidance.",
    "Always remind the user to consult a licensed healthcare provider for diagnosis or treatment decisions.",
  ].join(" ");
}

export function buildContextBlock(question: string, documentText?: string): string {
  if (!documentText) return question;
  return `DOCUMENT CONTENT:\n"""${documentText}"""\n\nUSER QUESTION: ${question}`;
}
