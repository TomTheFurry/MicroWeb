import http = require('http');
import fs = require('fs');
import { promisify } from 'util';
const port = process.env.port || 80
const baseWebDir = "../ia";
const blacklist = ["/script/game.js"];

http.createServer(async (req, res) => {
    if (req.method == "GET") {


    }

    if (req.method != "GET") {
        console.log("bad request: Method isn't 'GET'");
        res.writeHead(400, "bad request");
        res.end();
        return;
    } else {
        await webGet(req, res);
    }
}).listen(port);




async function webGet(req: http.IncomingMessage, res: http.ServerResponse) {
    let loc: String = req.url;
    if (loc == null) {
        console.log("bad request: No 'url'");
        res.writeHead(400, "bad request");
        res.end();
        return;
    }
    if (loc == "/") {
        console.log("folder redirection to index.html");
        loc += "index.html";
    }

    if (loc.includes("..")) { // Prevent '..' excape
        console.log("Invalid loc: Contains '..'");
        res.writeHead(404);
        res.end();
        return;
    }

    let fileDir = baseWebDir + loc;
    if (await promisify(fs.exists)(fileDir)) {
        if ((await promisify(fs.lstat)(fileDir)).isDirectory()) {
            console.log("folder redirection to index.html");
            loc += "/index.html";
            fileDir = baseWebDir + loc;
        }

        console.log("File request on " + fileDir);

        let type: string = null;
        if (loc.endsWith(".css")) type = 'text/css';
        if (loc.endsWith(".js")) type = 'application/javascript';
        if (loc.endsWith(".html")) type = 'text/html';
        if (loc.endsWith(".svg")) type = 'image/svg+xml';

        if (type == null) {
            console.log("File type not on whitelist. Respond with 404");
            res.writeHead(404);
            res.end();
            return;
        }

        if (blacklist.findIndex((s) => s == loc.toLowerCase()) != -1) {
            console.log("File blacklisted! Respond with 404");
            res.writeHead(404);
            res.end();
            return;
        }
        res.writeHead(200, { 'Content-Type': type });
        res.end(await promisify(fs.readFile)(fileDir));
    } else {
        console.log("Error 404: File request on " + fileDir + " not found.");
        res.writeHead(404);
        res.end();
    }
}


async function timePost(req: http.IncomingMessage, res: http.ServerResponse) {
    

}