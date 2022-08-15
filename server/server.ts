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
const requestScoreboardPath = "/scoreboard.json"
const blacklist = [];
const MAX_NAME_LENGTH = 128;
const SCOREBOARD_SIZE = 20;
let database = open({
    path: databaseDir,
    // any options go here, we can turn on compression like this:
    compression: true,
});
let dbPosition: lmdb.Database<DBPosEntry, number[]> = database.openDB({
    name: "position"
});
let dbPersionalBest: lmdb.Database<number[], string> = database.openDB({
    name: "personalBest"
});

// DB structure:
//
// [Score, (-)duration] -> {name, entry}
// name -> Score, (-)duration // (The best one)

function pairCompare(pairA, pairB) : number {
    if (pairA[0] != pairB[0]) return pairA[0] - pairB[0];
    return pairA[1] = pairB[1];
}



var server = http.createServer(
    async (req, res) => {
        Promise.race([
            (async () => {
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
            })(),
            promisify(setTimeout)(500)]);
    });
server.setTimeout(500);
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
        console.log("Scoreboard request.");
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
        res.end(await promisify(fs.readFile)(fileDir));
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
    for await (const r of req) buffer += r;
    var data = buffer.join('') as string;

    if (data.length == 0) return false;
    try {
        var jData = JSON.parse(data);
        if (jData["postType"] != "time") return false;
        if (!isScoreboardEntry(jData["entry"])) return false;

        let entry : ScoreboardEntry = jData["entry"];
        // Verify the name string
        if (entry.name.length > MAX_NAME_LENGTH) {
            console.log("Error 400: entry name too long.");
            res.writeHead(400);
            res.end();
            return true;
        }
        if (entry.level < 0 || entry.score < 0 || entry.duration <= 0) {
            console.log("Error 400: Numbers outside valid range.");
            res.writeHead(400);
            res.end();
            return true;
        } 
        var topN = await database.transaction(() => {
            var scoreDurationPair = dbPersionalBest.get(entry.name);
            if (scoreDurationPair === undefined) {
                dbPersionalBest.put(entry.name, [entry.score, -entry.duration]);
                dbPosition.put([entry.score, -entry.duration], { name: entry.name, level: entry.level });
            } else if (pairCompare(scoreDurationPair, [entry.score, -entry.duration]) > 0) {
                let worked = dbPosition.removeSync(scoreDurationPair);
                if (!worked) console.warn("Failed to remove old score from the position database! Possible database corruption!");
                dbPersionalBest.put(entry.name, [entry.score, -entry.duration]);
                dbPosition.put([entry.score, -entry.duration], { name: entry.name, level: entry.level });
            }
            var topNArray: ScoreboardEntry[] = [];
            dbPosition.getRange({ limit: SCOREBOARD_SIZE, reverse: true })
                .forEach(({ key, value }) => {
                    topNArray.push({ score: key[0], duration: -key[1], name: value.name, level: value.level });
                });
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