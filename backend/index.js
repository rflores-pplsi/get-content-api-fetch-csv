const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Endpoint to fetch data from an external API
app.post("/fetch-posts", async (req, res) => {
  const { url } = req.body;
  try {
    const response = await axios.post(url);
    const posts = JSON.stringify(response.data);
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, "posts.txt");
    fs.writeFileSync(tempFilePath, posts, "utf-8");

    res.json({ message: `Posts saved to ${tempFilePath}` });
  } catch (error) {
    console.log(error.response?.data);
    console.error("Error fetching posts:", error.response?.data || error.message);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
