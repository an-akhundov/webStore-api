import fs from "node:fs/promises";

import bodyParser from "body-parser";
import express from "express";

const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/goods", async (req, res) => {
  const meals = await fs.readFile("./data/goods.json", "utf8");
  res.json(JSON.parse(meals));
});

app.get("/admin", async (req, res) => {
  const adminCredentials = await fs.readFile("./data/admin.json", "utf-8");
  res.json(JSON.parse(adminCredentials));
});

app.get("/orders", async (req, res) => {
  const data = await fs.readFile("./data/orders.json");

  const orders = JSON.parse(data);

  res.status(200).json({ orders });
});

app.post("/orders", async (req, res) => {
  const orderData = req.body.order;

  if (
    orderData === null ||
    orderData.items === null ||
    orderData.items.length === 0
  ) {
    return res.status(400).json({ message: "Missing data." });
  }

  if (
    orderData.customer.email === null ||
    !orderData.customer.email.includes("@") ||
    orderData.customer.name === null ||
    orderData.customer.name.trim() === "" ||
    orderData.customer.number === null ||
    orderData.customer.number.trim() === ""
  ) {
    return res.status(400).json({
      message: "Missing data: Email, name or number",
    });
  }

  const newOrder = {
    ...orderData,
    id: (Math.random() * 1000).toString(),
  };
  const orders = await fs.readFile("./data/orders.json", "utf8");
  const allOrders = JSON.parse(orders);
  allOrders.push(newOrder);
  await fs.writeFile("./data/orders.json", JSON.stringify(allOrders));
  res.status(201).json({ message: "Order created!" });
});

app.delete("/orders/:id", async (req, res) => {
  const deleteId = req.params.id;
  const storedData = JSON.parse(
    await fs.readFile("./data/orders.json", "utf8")
  );
  const updatedData = storedData.filter((order) => order.id !== deleteId);
  await fs.writeFile("./data/orders.json", JSON.stringify(updatedData));
  res.status(201).json({ message: "Order deleted." });
});

app.use((req, res) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  res.status(404).json({ message: "Not found" });
});

app.listen(3000);
