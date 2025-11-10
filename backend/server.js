import express from "express";
import dotenv from "dotenv";
import { sql } from "./config/db.js";

dotenv.config();
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 5001;

async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(255) NOT NULL,
  created_at DATE NOT NULL DEFAULT CURRENT_DATE
)`;
    console.log("Database initialized successfully");
  } catch (error) {
    console.log("Error initialized DB", error);
    process.exit(1); // status code 1 means faliur and 0 means success
  }
}

app.get("/", (req, res) => {
  res.send("its working");
});

app.get("/api/transactions/:userid", async (req, res) => {
  try {
    const { user_id } = req.params;

    const transaction = await sql`
SELECT * FROM transactions WHERE user_id = ${user_id} ORDER BY created_at DESC

`;

    res.status(200).json(transaction);
  } catch (error) {
    console.log("Error getting the transaciton", error);
    res.status(500).json({ message: "Internal server Error" });
  }
});

app.post("/api/transactions", async (req, res) => {
  try {
    const { title, amount, category, user_id } = req.body;

    if (!title || !category || !user_id || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const transaction = await sql`

INSERT INTO transactions(user_id,title,amount,category)
VALUES (${user_id},${title},${amount},${category})
RETURNING *
`;
    console.log(transaction);
    res.status(201).json(transaction[0]);
  } catch (error) {
    console.log("Error creating the transaciton", error);
    res.status(500).json({ message: "Internal server Error" });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`
DELETE FROM transactions WHERE  id = ${id} RETURNING *
`;
    if (result.length === 0) {
      return res.status(404).json({ message: "Transaction does not found " });
    }
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.log("Error creating the transaciton", error);
    res.status(500).json({ message: "Internal server Error" });
  }
});

console.log("my port:", process.env.PORT);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log("server is up and running on port:", PORT);
  });
});
