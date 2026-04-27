import { useState } from "react";
import api from "../../services/api";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Select file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError(null);

      const res = await api.post("/bills/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response:", res.data);

      setResult(res.data); // 🔥 store extracted data
      alert("Uploaded & Extracted successfully");

    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Upload or extraction failed");
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">

      {/* Upload Box */}
      <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl text-center">
        
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Uploading..." : "Upload File"}
        </button>

      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 mt-4">{error}</p>
      )}

      {/* Extracted Result */}
      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
          <h3 className="font-semibold mb-2">Extracted Data:</h3>

          <pre className="text-sm whitespace-pre-wrap">
            {result.extractedText}
          </pre>
        </div>
      )}

    </div>
  );
};

export default FileUpload;