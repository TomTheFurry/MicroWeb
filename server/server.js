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
const port = process.env.port || 1337;
const baseWebDir = "../ia";
const blacklist = ["/script/game.ts"];
http.createServer((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let loc = (_a = req.url) !== null && _a !== void 0 ? _a : "/main.html";
    if (loc.endsWith('/') || loc.endsWith('\\'))
        loc += "main.html";
    let fileDir = baseWebDir + loc; //TODO: Prevent '..' excape
    console.log("File request on " + fileDir);
    let type = null;
    if (loc.endsWith(".css"))
        type = 'text/css';
    if (loc.endsWith(".js"))
        type = 'application/javascript';
    if (loc.endsWith(".html"))
        type = 'text/html';
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
    }
    else {
        console.log("Responded with 404 not found");
        res.writeHead(404);
        res.end();
    }
})).listen(port);
//# sourceMappingURL=server.js.map