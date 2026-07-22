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

app.get("/assignments", async (req, res) => {
  try {
    const result = await connectionPool.query("SELECT * FROM assignments");
    return res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not read assignment due to a database issue",
    });
  }
});

app.get("/assignments/:assignmentId", async (req, res) => {
  const assignmentId = req.params.assignmentId;

  try {
    const query = `SELECT * FROM assignments WHERE assignment_id = $1`;
    const result = await connectionPool.query(query, [assignmentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    return res.status(200).json({
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not read assignment due to a database issue",
    });
  }
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const assignmentId = req.params.assignmentId;
  const { title, content, category, length, user_id, status } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({
      message: "Missing required fields: title, content, category",
    });
  }

  try {
    const query = `
      UPDATE assignments
      SET title = $1, content = $2, category = $3, length = $4, user_id = $5, status = $6
      WHERE assignment_id = $7
      RETURNING *
    `;
    const values = [title, content, category, length, user_id, status, assignmentId];

    const result = await connectionPool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    return res.status(200).json({
      message: "Updated assignment successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not update assignment due to a database issue",
    });
  }
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentId = req.params.assignmentId;

  try {
    const query = `
      DELETE FROM assignments
      WHERE assignment_id = $1
      RETURNING *
    `;
    const result = await connectionPool.query(query, [assignmentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    return res.status(200).json({
      message: "Deleted assignment successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not delete assignment due to a database issue",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
