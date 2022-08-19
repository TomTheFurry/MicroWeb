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
const lmdb_1 = require("lmdb"); // or require
function isScoreboardEntry(arg) {
    return arg
        && (arg.score !== undefined) && typeof (arg.score) == 'number'
        && (arg.duration !== undefined) && typeof (arg.duration) == 'number'
        && (arg.name !== undefined) && typeof (arg.name) == 'string'
        && (arg.level !== undefined) && typeof (arg.level) == 'number';
}
const port = process.env.port || 80;
const baseWebDir = "../ia";
const databaseDir = "../database/scoreboard";
// By sending 'GET' request with following path, the server will
// respond with a json file of the current scoreboard.
const requestScoreboardPath = "/scoreboard.json";
const requestScoreboardDumpPath = "/DEBUG/scoreboard.json";
const requestPersionalBestDumpPath = "/DEBUG/personalBest.json";
const blacklist = [];
const MAX_NAME_LENGTH = 128;
const SCOREBOARD_SIZE = 20;
const VERBOSE = true;
let database = (0, lmdb_1.open)({
    path: databaseDir,
    // any options go here, we can turn on compression like this:
    compression: true,
});
let dbPosition = database.openDB({
    name: "position",
    dupSort: true,
});
let dbPersionalBest = database.openDB({
    name: "personalBest"
});
const USE_FILE_CACHE = false;
let fileCache = new Map();
// DB structure:
//
// [Score, (-)duration] -> {name, entry}
// name -> Score, (-)duration // (The best one)
function pairCompare(pairA, pairB) {
    if (pairA[0] != pairB[0])
        return pairA[0] - pairB[0];
    return pairA[1] - pairB[1];
}
var server = http.createServer((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    console.log("bad request: Unknown method - " + req.method);
    res.writeHead(501, "unsupported method");
    res.end();
    return;
}));
//server.setTimeout(500);
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
            if (VERBOSE)
                console.log("folder redirection to index.html");
            loc += "index.html";
        }
        if (loc.includes("..")) { // Prevent '..' excape
            console.log("Invalid loc: Contains '..'");
            res.writeHead(404);
            res.end();
            return true;
        }
        if (loc == requestScoreboardPath || '/' + loc == requestScoreboardPath) {
            if (VERBOSE)
                console.log("Scoreboard request.");
            var topN = yield database.transaction(() => {
                var topNArray = [];
                dbPosition.getRange({ limit: SCOREBOARD_SIZE, reverse: true })
                    .forEach(({ key, value }) => {
                    topNArray.push({ score: key[0], duration: -key[1], name: value.name, level: value.level });
                });
                return topNArray;
            });
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ scoreboard: topN }));
            return true;
        }
        if (loc == requestScoreboardDumpPath || '/' + loc == requestScoreboardDumpPath) {
            if (VERBOSE)
                console.log("DEBUG scoreboard dump request");
            var all = yield database.transaction(() => {
                var allArray = [];
                dbPosition.getRange({ reverse: true })
                    .forEach(({ key, value }) => {
                    allArray.push({ score: key[0], duration: -key[1], name: value.name, level: value.level });
                });
                return allArray;
            });
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ scoreboard: all }));
            return true;
        }
        if (loc == requestPersionalBestDumpPath || '/' + loc == requestPersionalBestDumpPath) {
            if (VERBOSE)
                console.log("DEBUG personalBest dump request");
            var all = yield database.transaction(() => {
                var allArray = [];
                dbPersionalBest.getRange({ reverse: true })
                    .forEach(({ key, value }) => {
                    allArray.push({ score: value[0], duration: -value[1], name: key, level: undefined });
                });
                return allArray;
            });
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ persionalBest: all }));
            return true;
        }
        let fileDir = baseWebDir + loc;
        if (yield (0, util_1.promisify)(fs.exists)(fileDir)) {
            if ((yield (0, util_1.promisify)(fs.lstat)(fileDir)).isDirectory()) {
                if (VERBOSE)
                    console.log("folder redirection to index.html");
                loc += "/index.html";
                fileDir = baseWebDir + loc;
            }
            if (VERBOSE)
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
            let fileData = USE_FILE_CACHE ? fileCache.get(loc.toLowerCase()) : undefined;
            if (fileData === undefined) {
                fileData = yield (0, util_1.promisify)(fs.readFile)(fileDir);
                if (USE_FILE_CACHE)
                    fileCache.set(loc.toLowerCase(), fileData);
            }
            res.end(fileData);
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
                buffer.push(r);
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
            if (!isScoreboardEntry(jData["entry"])) {
                console.log("Error 400: POST entry format is invalid.");
                res.writeHead(400, "Invalid format");
                res.end();
                return true;
            }
            let entry = jData["entry"];
            // Verify the name string
            if (entry.name.length > MAX_NAME_LENGTH) {
                console.log("Error 400: POST entry name too long.");
                res.writeHead(400);
                res.end();
                return true;
            }
            if (entry.level < 0 || entry.score < 0 || entry.duration <= 0 ||
                entry.duration > 10000000 || (entry.score % 1 != 0.0) || entry.level > 1000 || entry.score > 1000000) {
                console.log("Error 400: POST entry has invalid numbers.");
                res.writeHead(400);
                res.end();
                return true;
            }
            let addSomething = false;
            if (VERBOSE)
                console.log("POST to scoreboard: {name:" + entry.name + ", score:" + entry.score + ", time:" + entry.duration + ", level:" + entry.level + "}");
            var topN = yield database.transaction(() => {
                var scoreDurationPair = dbPersionalBest.get(entry.name);
                if (scoreDurationPair === undefined) {
                    if (VERBOSE)
                        console.log("New player entry created for " + entry.name);
                    dbPersionalBest.put(entry.name, [entry.score, -entry.duration]);
                    dbPosition.put([entry.score, -entry.duration], { name: entry.name, level: entry.level });
                    addSomething = true;
                }
                else if (pairCompare([entry.score, -entry.duration], scoreDurationPair) > 0) {
                    if (VERBOSE)
                        console.log("Player entry Personal-Best updated for " + entry.name);
                    {
                        let targets = dbPosition.getValues(scoreDurationPair).filter(e => e.name == entry.name).asArray;
                        if (targets.length != 1) {
                            console.warn("Failed to remove old score from the position database! Possible database corruption!");
                        }
                        targets.forEach(e => dbPosition.remove(scoreDurationPair, e));
                    }
                    dbPersionalBest.put(entry.name, [entry.score, -entry.duration]);
                    dbPosition.put([entry.score, -entry.duration], { name: entry.name, level: entry.level });
                    addSomething = true;
                }
                else {
                    if (VERBOSE)
                        console.log("POST to scoreboard for " + entry.name + " needs no action: Below Personal-Best.");
                }
                var topNArray = [];
                dbPosition.getRange({ limit: SCOREBOARD_SIZE, reverse: true })
                    .forEach(({ key, value }) => {
                    topNArray.push({ score: key[0], duration: -key[1], name: value.name, level: value.level });
                });
                if (VERBOSE)
                    console.log("Returning " + topNArray.length + " scoreboard entries for the POST");
                return topNArray;
            });
            res.writeHead(addSomething ? 201 : 200, { "content-type": "application/json" });
            res.end(JSON.stringify({ scoreboard: topN }));
            return true;
        }
        catch (s) {
            if ((s instanceof SyntaxError) || (s instanceof ReferenceError)) {
                console.log("Error 400?: " + s.message);
                res.writeHead(400, "Possible invalid JSON");
                res.end();
                return true;
            }
        }
    });
}
//# sourceMappingURL=server.js.map