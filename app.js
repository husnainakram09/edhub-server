const express = require("express");
const app = express();
const mysql = require("mysql");
app.use(express.json());
require('dotenv').config();

// app.listen(4000,()=>{})
// app.post("/api",(req,res)=>{
//   console.log(req.body)
// })
// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: process.env.HOST,
  port: process.env.PORT, // The default port for MAMP MySQL is 8889
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});
connection.connect((error) => {
  if (error) {
    console.error("Error connecting to the database:", error);
    return;
  }
  console.log("Connected to the database");
});

//   WEBSOCKETS
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3000 });

wss.on("connection", (ws) => {
  let user_data = {};

  function delete_rocket(user_id) {
    // Perform the DELETE operation
    //  const sql = `DELETE FROM rq_grammars_rocket_state WHERE grammar_id = ${user_data?.grammar_id}`;
    const sql = `DELETE FROM rq_grammars_rocket_state WHERE user_id = ${user_id}`;
    connection.query(sql, (error, result) => {
      if (error) {
        console.error("Error executing the query:", error);
        return;
      }
      console.log("Number of rows deleted:", result.affectedRows);
    });
  }

  ws.on("message", (data) => {
    user_data = JSON.parse(data);
    console.log(`Received from Client ${user_data?.user_name} ${data}!`);
    // Process the WebSocket message and send a response if needed
    ws.send("Response: " + data);
  });

  ws.on("close", () => {
    // Remove the WebSocket connection from the active clients set
    if (user_data?.user_id) {
      delete_rocket(user_data?.user_id);
    }
    console.log(`WebSocket connection closed: Client ${user_data?.user_name}`);
  });
});

console.log("WebSocket server running on port 8080");
