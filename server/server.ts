import http = require('http');
import fs = require('fs');
import { Console } from 'console';
import { debug } from 'util';
const port = process.env.port || 1337
const baseWebDir = "../ia";
const blacklist = ["/script/game.ts"];

http.createServer(async (req, res) => {

    let loc: String = req.url ?? "/main.html";
    if (loc.endsWith('/') || loc.endsWith('\\')) loc += "main.html";
    let fileDir = baseWebDir + loc; //TODO: Prevent '..' excape
    console.log("File request on " + fileDir);

    let type : string = null;
    if (loc.endsWith(".css")) type = 'text/css';
    if (loc.endsWith(".js")) type = 'application/javascript';
    if (loc.endsWith(".html")) type = 'text/html';
    
    if (type == null) {
        console.log("Responded with 400");
        res.writeHead(400);
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