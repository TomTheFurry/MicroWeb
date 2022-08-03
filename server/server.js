"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const fs = require("fs");
const util_1 = require("util");
const port = process.env.port || 80;
const baseWebDir = "../ia";
const blacklist = ["/script/game.js"];
http.createServer((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.method != "GET") {
        console.log("bad request: Method isn't 'GET'");
        res.writeHead(400, "bad request");
        res.end();
        return;
    }
    else {
        yield webGet(req, res);
    }
})).listen(port);
function webGet(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let loc = req.url;
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
        if (yield (0, util_1.promisify)(fs.exists)(fileDir)) {
            if ((yield (0, util_1.promisify)(fs.lstat)(fileDir)).isDirectory()) {
                console.log("folder redirection to index.html");
                loc += "/index.html";
                fileDir = baseWebDir + loc;
            }
            console.log("File request on " + fileDir);
            let type = null;
            if (loc.endsWith(".css"))
                type = 'text/css';
            if (loc.endsWith(".js"))
                type = 'application/javascript';
            if (loc.endsWith(".html"))
                type = 'text/html';
            if (loc.endsWith(".svg"))
                type = 'image/svg+xml';
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
            res.end(yield (0, util_1.promisify)(fs.readFile)(fileDir));
        }
        else {
            console.log("Error 404: File request on " + fileDir + " not found.");
            res.writeHead(404);
            res.end();
        }
    });
}
//# sourceMappingURL=server.js.map