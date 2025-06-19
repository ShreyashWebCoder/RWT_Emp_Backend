// server/routes/verify.js
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/verify", upload.single("image"), async (req, res) => {
  const form = new FormData();
  form.append("file", fs.createReadStream(req.file.path));

  try {
    const response = await axios.post(
      "http://127.0.0.1:5000/verify", 
      form,
      {
        headers: form.getHeaders(),
      }
    );
    if (!response.data || !response.data.name) {
      return res.status(400).json({ error: "Face not recognized" });
    }
    res.json(response.data);
  } catch (error) {
    console.error("Face verification failed:", error.message);
    res.status(500).json({ error: "Verification failed" });
  } finally {
    fs.unlinkSync(req.file.path); // Clean up uploaded file
  }
});



router.get("/ping", async (req, res) => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/");
      res.json({ message: "✅ FastAPI server reachable", status: response.status });
    } catch (error) {
      res.status(500).json({ error: "❌ Cannot reach FastAPI server" });
    }
  });
  
module.exports = router;
