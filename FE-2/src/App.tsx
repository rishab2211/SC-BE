import { useState } from "react";

function App() {
  const [resourceName, setResourceName] = useState("test.txt");
  const [content, setContent] = useState("");
  const [fetched, setFetched] = useState("");
  const [etag, setEtag] = useState("");
  const [lastModified, setLastModified] = useState("");
  const [status, setStatus] = useState("");

  const API_URL = `https://sc-be.vercel.app/resource/${resourceName}`;

  const fetchData = async () => {
    const headers:any = {};
    if (etag) headers["If-None-Match"] = etag;
    if (lastModified) headers["If-Modified-Since"] = lastModified;

    try {
      const response = await fetch(API_URL, { headers });
      setStatus(`${response.status} ${response.statusText}`);

      if (response.status === 200) {
        const text = await response.text();
        setFetched(text);
        setEtag(response.headers.get("ETag") || "");
        setLastModified(response.headers.get("Last-Modified") || "");
      } else if (response.status === 304) {
        setFetched("(Using cached version)");
      } else {
        setFetched("(Error or no data)");
      }
    } catch (err:any) {
      setStatus("Error fetching resource");
      setFetched(err.message);
    }
  };

  const updateResource = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "text/plain" },
        body: content,
      });

      setStatus(`${response.status} ${response.statusText}`);
      if (response.ok) {
        setFetched(content);
        setEtag(""); // reset to force fresh fetch
        setLastModified("");
      }
    } catch (err) {
      setStatus("Error updating resource");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif", maxWidth: "700px", margin: "auto" }}>
      <h2>🧠 HTTP Caching Demo</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label><strong>Resource Name:</strong></label>
        <input
          style={{ marginLeft: "1rem", padding: "4px", width: "200px" }}
          value={resourceName}
          onChange={(e) => setResourceName(e.target.value)}
        />
      </div>

      <textarea
        placeholder="Type resource content here..."
        rows={5}
        cols={60}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", padding: "8px", fontFamily: "monospace" }}
      />

      <button onClick={updateResource} style={{ padding: "6px 12px" }}>💾 Save / Update</button>
      <button onClick={fetchData} style={{ marginLeft: "1rem", padding: "6px 12px" }}>
        🔄 Fetch with Caching
      </button>

      <div style={{ marginTop: "2rem" }}>
        <div style={{ marginBottom: "0.5rem" }}><strong>Status:</strong> <span>{status}</span></div>
        <div style={{ marginBottom: "0.5rem" }}><strong>ETag:</strong> <code>{etag || "(none)"}</code></div>
        <div style={{ marginBottom: "0.5rem" }}><strong>Last-Modified:</strong> <code>{lastModified || "(none)"}</code></div>
      </div>

      <h4>📄 Response Content:</h4>
      <pre style={{
        background: "#f4f4f4",
        padding: "1rem",
        borderRadius: "8px",
        border: "1px solid #ddd",
        whiteSpace: "pre-wrap",
        fontFamily: "monospace",
        maxHeight: "300px",
        overflowY: "auto"
      }}>
        {fetched}
      </pre>
    </div>
  );
}

export default App;
