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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const fs = require("fs");
const util_1 = require("util");
const port = process.env.port || 80;
const baseWebDir = "../ia";
const blacklist = [];
var times = [];
var server = http.createServer((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    Promise.race([
        (() => __awaiter(void 0, void 0, void 0, function* () {
            if (req.aborted) {
                console.log("req aborted");
                return;
            }
            if (req.method == "GET") {
                if (yield webGet(req, res))
                    return;
            }
            if (req.method == "POST") {
                if (yield timePost(req, res))
                    return;
            }
            console.log("bad request: Unknown method");
            res.writeHead(400, "bad request");
            res.end();
            return;
        }))(),
        (0, util_1.promisify)(setTimeout)(500)
    ]);
}));
server.setTimeout(500);
server.listen(port);
function webGet(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let loc = req.url;
        if (loc == null) {
            console.log("bad request: No 'url'");
            res.writeHead(400, "bad request");
            res.end();
            return true;
        }
        if (loc == "/") {
            console.log("folder redirection to index.html");
            loc += "index.html";
        }
        if (loc.includes("..")) { // Prevent '..' excape
            console.log("Invalid loc: Contains '..'");
            res.writeHead(404);
            res.end();
            return true;
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
            if (loc.endsWith(".js.map"))
                type = 'text/plain';
            if (loc.endsWith(".json"))
                type = 'application/json';
            if (type == null) {
                console.log("File type not on whitelist. Respond with 404");
                res.writeHead(404);
                res.end();
                return true;
            }
            if (blacklist.findIndex((s) => s == loc.toLowerCase()) != -1) {
                console.log("File blacklisted! Respond with 404");
                res.writeHead(404);
                res.end();
                return true;
            }
            res.writeHead(200, { 'Content-Type': type });
            res.end(yield (0, util_1.promisify)(fs.readFile)(fileDir));
            return true;
        }
        else {
            console.log("Error 404: File request on " + fileDir + " not found.");
            res.writeHead(404);
            res.end();
            return true;
        }
    });
}
function timePost(req, res) {
    var req_1, req_1_1;
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        var buffer = [];
        try {
            for (req_1 = __asyncValues(req); req_1_1 = yield req_1.next(), !req_1_1.done;) {
                const r = req_1_1.value;
                buffer += r;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (req_1_1 && !req_1_1.done && (_a = req_1.return)) yield _a.call(req_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var data = buffer.join('');
        if (data.length == 0)
            return false;
        try {
            var jData = JSON.parse(data);
            if (jData["postType"] != "time")
                return false;
            if (!(jData["duration"] instanceof Number))
                return false;
            var duration = jData["duration"];
            times.push(duration);
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ time: times }));
            return true;
        }
        catch (s) {
            if ((s instanceof SyntaxError) || (s instanceof ReferenceError))
                return false;
            throw s;
        }
    });
}
//# sourceMappingURL=server.js.map