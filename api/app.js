const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const port = 3000;

app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

const dataFile = path.join(__dirname, "data.json");

// Ensure the data file exists
(async () => {
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, "[]");
  }
})();

app.get("/api/data", async (req, res) => {
  try {
    const data = await fs.readFile(dataFile, "utf8");
    let jsonData = JSON.parse(data);

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Both startDate and endDate are required" });
    }

    // Define the regex pattern for YYYY-MM-DD
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    // Validate the date format
    if (!datePattern.test(startDate) || !datePattern.test(endDate)) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }

    // Define the regex pattern for YYYY-MM-DD
    const valuePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

    // Validate the date format
    if (!valuePattern.test(startDate) || !valuePattern.test(endDate)) {
      return res.status(400).json({ error: "Invalid date. Check their values" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if the dates are valid
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }

    // Check if start date is greater than end date
    if (start > end) {
      return res.status(400).json({ error: "startDate cannot be greater than endDate" });
    }

    jsonData = jsonData.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= start && itemDate <= end;
    });

    res.json(jsonData);
  } catch (error) {
    res.status(500).json({ error: "Failed to read data, are the dates correct?" });
  }
});

app.listen(port, "localhost", () => {
  console.log(`API running on port ${port}`);
});
