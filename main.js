const { fork } = require("child_process");

const path = require("path");



// Helper function to run a file

function runFile(filename) {

  const filePath = path.join(__dirname, filename); // Resolve the full path

  const child = fork(filePath); // Use fork to spawn a Node.js child process



  // Handle standard output

  child.on("message", (message) => {

    console.log(`[${filename} MESSAGE]:`, message);

  });



  // Handle errors

  child.on("error", (error) => {

    console.error(`[${filename} ERROR]:`, error);

  });



  // Handle process exit

  child.on("exit", (code) => {

    console.log(`[${filename}] exited with code ${code}`);

  });

}



// Run app.js and server.js

runFile("app.js");

runFile("server.js");