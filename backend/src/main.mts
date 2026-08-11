import express from "express";


const server = express();

server.get("/", (req, res) => {
    res.send({
        message: "Hello, World!",
        version: "1.0.0",
        status: "success"
    });
});



server.listen(3000, () => {
  console.log("Server is running on port 3000");
});