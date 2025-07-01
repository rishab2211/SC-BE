import express from "express";
import cors from "cors";
const app = express();
const PORT = 3000;

// Middleware to parse text body
app.use(express.text());

// Allow CORS for frontend running at localhost:5173
app.use(cors({
  origin: "https://sc-be-jrui.vercel.app",
  methods: ["GET", "PUT"],
  allowedHeaders: ["Content-Type", "If-None-Match", "If-Modified-Since"],
  exposedHeaders: ["ETag", "Last-Modified"]  
}));


// In-memory storage for resources
type Resource = {
  content: string;
  lastModified: Date;
  etag: string;
};

const resources: Record<string, Resource> = {};

// Utility to generate a simple hash (ETag)
const generateETag = (text: string) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return `"${hash}"`; // ETag usually in quotes
};

// GET with ETag / Last-Modified
app.get("/resource/:name", (req:any, res:any) => {
  const { name } = req.params;
  const resource = resources[name];

  if (!resource) {
    return res.status(404).send("Resource not found");
  }

  const ifNoneMatch = req.headers["if-none-match"];
  const ifModifiedSince = req.headers["if-modified-since"];

  const modifiedSinceDate = ifModifiedSince ? new Date(ifModifiedSince) : null;

  const isETagMatch = ifNoneMatch === resource.etag;
  const isNotModified =
    modifiedSinceDate && modifiedSinceDate >= resource.lastModified;

  if (isETagMatch || isNotModified) {
    return res.status(304).end();
  }

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("ETag", resource.etag);
  res.setHeader("Last-Modified", resource.lastModified.toUTCString());

  return res.send(resource.content);
});

// PUT to create or update resource
app.put("/resource/:name", (req:any, res:any) => {
  const { name } = req.params;
  const content = req.body || "";

  const etag = generateETag(content);
  const lastModified = new Date();

  resources[name] = { content, etag, lastModified };

  return res.status(201).send("Resource updated");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
