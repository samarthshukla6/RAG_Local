"use client"
import { useState } from "react";

export default function FileUpload() {
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState("");

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      alert("Please upload a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("fileBlob", pdfFile);

    setLoading(true);
    setResponseText("");

    try {
      const res = await fetch("/api/blobpdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Something went wrong with the upload");
      }

      const data = await res.json();
      setResponseText(JSON.stringify(data, null, 2)); // Display the response text
    } catch (error) {
      setResponseText("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Upload a PDF</h1>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload PDF"}
      </button>

      <div>
        <h2>Extracted Text:</h2>
        <pre>{responseText}</pre>
      </div>

      <style jsx>{`
        .container {
          padding: 20px;
          max-width: 500px;
          margin: 0 auto;
          text-align: center;
        }
        input[type="file"] {
          margin-bottom: 10px;
        }
        button {
          padding: 10px 20px;
          background-color: #0070f3;
          color: white;
          border: none;
          cursor: pointer;
        }
        button:disabled {
          background-color: #ccc;
        }
      `}</style>
    </div>
  );
}
