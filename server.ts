import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { spawn } from "child_process";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/calculate", (req, res) => {
    const { expression } = req.body;

    if (!expression || typeof expression !== 'string') {
      return res.status(400).json({ error: "Expression is required" });
    }

    // Validate expression to only allow numbers, basic operators, and spaces to prevent RCE
    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
      return res.status(400).json({ error: "Invalid characters in expression" });
    }

    // Execute Python script
    const pyProcess = spawn("python3", ["-c", "import sys; print(eval(sys.argv[1]))", expression]);
    
    let output = '';
    let errorOutput = '';

    pyProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pyProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pyProcess.on("close", (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: errorOutput || "Error executing calculation" });
      }
      res.json({ result: output.trim() });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
