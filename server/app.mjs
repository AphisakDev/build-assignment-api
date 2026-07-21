import express from "express";
import cors from "cors";
import "dotenv/config";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments", async (req, res) => {
  const { title, content, category, length, user_id, status } = req.body;

  // เช็คว่า field ที่จำเป็นถูกส่งมาครบไหม
  if (!title || !content || !category) {
    return res.status(400).json({
      message: "Missing required fields: title, content, category",
    });
  }

  try {
    const query = `
      INSERT INTO assignments (title, content, category, length, user_id, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [title, content, category, length, user_id, status];

    const result = await connectionPool.query(query, values);

    return res.status(201).json({
      message: "Created assignment successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not create assignment due to a database issue",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
