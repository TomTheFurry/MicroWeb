import http = require('http');
import fs = require('fs');
import { promisify } from 'util';
import { open } from 'lmdb'; // or require
import lmdb = require('lmdb');

interface ScoreboardEntry {
    score: number; // primary order
    duration: number; // secondary order
    name: string; // String is encoded to be in base64 format
    level: number;
}
function isScoreboardEntry(arg: any): arg is ScoreboardEntry {
    return arg
        && arg.score && typeof (arg.score) == 'number'
        && arg.duration && typeof (arg.duration) == 'number'
        && arg.name && typeof (arg.name) == 'string'
        && arg.level && typeof (arg.level) == 'number';
}
interface DBPosEntry {
    name: string;
    level: number;
}

const port = process.env.port || 80
const baseWebDir = "../ia";
const databaseDir = "../database/scoreboard"
// By sending 'GET' request with following path, the server will
// respond with a json file of the current scoreboard.
const requestScoreboardPath = "/scoreboard.json"
const requestScoreboardDumpPath = "/DEBUG/scoreboard.json"
const requestPersionalBestDumpPath = "/DEBUG/personalBest.json"
const blacklist = [];
const MAX_NAME_LENGTH = 128;
const SCOREBOARD_SIZE = 20;
const VERBOSE = true;
let database = open({
    path: databaseDir,
    // any options go here, we can turn on compression like this:
    compression: true,
});
let dbPosition: lmdb.Database<DBPosEntry, number[]> = database.openDB({
    name: "position",
    dupSort: true,
});
let dbPersionalBest: lmdb.Database<number[], string> = database.openDB({
    name: "personalBest"
});

const USE_FILE_CACHE = false;
let fileCache: Map<string, Buffer> = new Map();


// DB structure:
//
// [Score, (-)duration] -> {name, entry}
// name -> Score, (-)duration // (The best one)

function pairCompare(pairA, pairB) : number {
    if (pairA[0] != pairB[0]) return pairA[0] - pairB[0];
    return pairA[1] - pairB[1];
}



var server = http.createServer(
    async (req, res) => {
                if (req.aborted) {
                    console.log("req aborted");
                    return;
                }
                if (req.method == "GET") {
                    if (await webGet(req, res)) return;
                }
                if (req.method == "POST") {
                    if (await timePost(req, res)) return;
                }
                console.log("bad request: Unknown method");
                res.writeHead(400, "bad request");
                res.end();
                return;
            });
//server.setTimeout(500);
server.listen(port);




async function webGet(req: http.IncomingMessage, res: http.ServerResponse): Promise<boolean> {
    let loc: String = req.url;
    if (loc == null) {
        console.log("bad request: No 'url'");
        res.writeHead(400, "bad request");
        res.end();
        return true;
    }
    if (loc == "/") {
        if (VERBOSE) console.log("folder redirection to index.html");
        loc += "index.html";
    }

    if (loc.includes("..")) { // Prevent '..' excape
        console.log("Invalid loc: Contains '..'");
        res.writeHead(404);
        res.end();
        return true;
    }

    if (loc == requestScoreboardPath || '/' + loc == requestScoreboardPath) {
        if (VERBOSE) console.log("Scoreboard request.");
        var topN = await database.transaction(() => {
            var topNArray: ScoreboardEntry[] = [];
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
        if (VERBOSE) console.log("DEBUG scoreboard dump request");
        var all = await database.transaction(() => {
            var allArray: ScoreboardEntry[] = [];
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
        if (VERBOSE) console.log("DEBUG personalBest dump request");
        var all = await database.transaction(() => {
            var allArray: ScoreboardEntry[] = [];
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
    if (await promisify(fs.exists)(fileDir)) {
        if ((await promisify(fs.lstat)(fileDir)).isDirectory()) {
            if (VERBOSE) console.log("folder redirection to index.html");
            loc += "/index.html";
            fileDir = baseWebDir + loc;
        }

        if (VERBOSE) console.log("File request on " + fileDir);

        let type: string = null;
        if (loc.endsWith(".css")) type = 'text/css';
        if (loc.endsWith(".js")) type = 'application/javascript';
        if (loc.endsWith(".html")) type = 'text/html';
        if (loc.endsWith(".svg")) type = 'image/svg+xml';
        if (loc.endsWith(".js.map")) type = 'text/plain';
        if (loc.endsWith(".json")) type = 'application/json';

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
            fileData = await promisify(fs.readFile)(fileDir);
            if (USE_FILE_CACHE) fileCache.set(loc.toLowerCase(), fileData);
        }
        res.end(fileData);
        return true;
    } else {
        console.log("Error 404: File request on " + fileDir + " not found.");
        res.writeHead(404);
        res.end();
        return true;
    }
}


async function timePost(req: http.IncomingMessage, res: http.ServerResponse) {
    var buffer = [];
    for await (const r of req)
        buffer.push(r);
    var data = buffer.join('') as string;

    if (data.length == 0) return false;
    try {
        var jData = JSON.parse(data);
        if (jData["postType"] != "time") return false;
        if (!isScoreboardEntry(jData["entry"])) return false;

        let entry : ScoreboardEntry = jData["entry"];
        // Verify the name string
        if (entry.name.length > MAX_NAME_LENGTH) {
            console.log("Error 400: POST entry name too long.");
            res.writeHead(400);
            res.end();
            return true;
        }
        if (entry.level < 0 || entry.score < 0 || entry.duration <= 0 ||
            entry.duration > 10000 || (entry.score % 1 != 0.0) || entry.level > 1000 || entry.score > 1000000) {
            console.log("Error 400: POST entry has invalid numbers.");
            res.writeHead(400);
            res.end();
            return true;
        }

        if (VERBOSE) console.log("POST to scoreboard: {name:" + entry.name + ", score:" + entry.score + ", time:" + entry.duration + ", level:" + entry.level + "}");
        var topN = await database.transaction(() => {
            var scoreDurationPair = dbPersionalBest.get(entry.name);
            if (scoreDurationPair === undefined) {
                if (VERBOSE) console.log("New player entry created for " + entry.name);
                dbPersionalBest.put(entry.name, [entry.score, -entry.duration]);
                dbPosition.put([entry.score, -entry.duration], { name: entry.name, level: entry.level });
            } else if (pairCompare([entry.score, -entry.duration], scoreDurationPair) > 0) {
                if (VERBOSE) console.log("Player entry Personal-Best updated for " + entry.name);
                {
                    let targets: DBPosEntry[] =
                        dbPosition.getValues(scoreDurationPair).filter(e => e.name == entry.name).asArray;
                    if (targets.length != 1) {
                        console.warn("Failed to remove old score from the position database! Possible database corruption!");
                    }
                    targets.forEach(e => dbPosition.remove(scoreDurationPair, e));
                }
                dbPersionalBest.put(entry.name, [entry.score, -entry.duration]);
                dbPosition.put([entry.score, -entry.duration], { name: entry.name, level: entry.level });
            } else {
                if (VERBOSE) console.log("POST to scoreboard for " + entry.name + " needs no action: Below Personal-Best.");
            }
            var topNArray: ScoreboardEntry[] = [];
            dbPosition.getRange({ limit: SCOREBOARD_SIZE, reverse: true })
                .forEach(({ key, value }) => {
                    topNArray.push({ score: key[0], duration: -key[1], name: value.name, level: value.level });
                });
            if (VERBOSE) console.log("Returning "+ topNArray.length +" scoreboard entries for the POST");
            return topNArray;
        });
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({scoreboard: topN}));
        return true;
    } catch (s) {
        if ((s instanceof SyntaxError) || (s instanceof ReferenceError)) return false;
        throw s;
    }
}