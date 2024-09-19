const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const port = 3000;

app.use(express.json());

const dataFile = path.join(__dirname, "data/data.json");

// Ensure the data file exists.
(async () => {
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, "[]");
  }
})();

// API endpoint to get data by dates.
app.get("/dates", async (req, res) => {
  try {
    const data = await fs.readFile(dataFile, "utf8");
    let jsonData = JSON.parse(data);

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Both startDate and endDate are required" });
    }

    // Assert that the dates are in the correct format
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(startDate) || !datePattern.test(endDate)) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }

    // Assert that the dates are of valid values
    const valuePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!valuePattern.test(startDate) || !valuePattern.test(endDate)) {
      return res.status(400).json({ error: "Invalid date. Check their values" });
    }

    // Convert the dates to Date objects and assert that they are valid
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }

    // Assert that the start date is not greater than the end date
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

// API endpoint to get data by id.
app.get("/id", async (req, res) => {
  try {
    const data = await fs.readFile(dataFile, "utf8");
    let jsonData = JSON.parse(data);

    const { value } = req.query;

    if (!value) {
      return res.status(400).json({ error: "Value is required" });
    }

    // Assert that the value is an integer.
    if (!Number.isInteger(Number(value))) {
      return res.status(400).json({ error: "Invalid id. Use an integer" });
    }

    jsonData = jsonData.filter((item) => item.id === value);

    res.json(jsonData);
  } catch (error) {
    res.status(500).json({ error: "Failed to read data" });
  }
});

app.listen(port, "localhost", () => {
  console.log(`API running on port ${port}`);
});
