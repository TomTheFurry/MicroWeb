import http = require('http');
import fs = require('fs');
const port = process.env.port || 80
const baseWebDir = "../ia";
const blacklist = ["/script/game.js"];

http.createServer(async (req, res) => {

    let loc: String = req.url;
    if (loc == null) {
        console.log("bad request");
        res.writeHead(400, "bad request");
        res.end();
        return;
    }
    if (loc == "/") {
        console.log("root redirect");
        res.writeHead(301, { "Location": "/index.html" });
        res.end();
        return;
    }

    if (loc.includes("..")) { // Prevent '..' excape
        console.log("Invalid loc: Contains '..'");
        res.writeHead(404);
        res.end();
        return;
    }

    let fileDir = baseWebDir + loc; 
    console.log("File request on " + fileDir);

    let type : string = null;
    if (loc.endsWith(".css")) type = 'text/css';
    if (loc.endsWith(".js")) type = 'application/javascript';
    if (loc.endsWith(".html")) type = 'text/html';
    if (loc.endsWith(".svg")) type = 'text/plain';
    
    if (type == null) {
        console.log("Responded with 404");
        res.writeHead(404);
        res.end();
        return;
    }

    if (blacklist.findIndex((s) => s == loc.toLowerCase()) != -1) {
        console.log("Blacklisted! Responding with 404");
        res.writeHead(404);
        res.end();
        return;
    }

    if (fs.existsSync(fileDir)) {
        res.writeHead(200, { 'Content-Type': type });
        res.end(fs.readFileSync(fileDir));
    } else {
        console.log("Responded with 404 not found");
        res.writeHead(404);
        res.end()
    }
}).listen(port);