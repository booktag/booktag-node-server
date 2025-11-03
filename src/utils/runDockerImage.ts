import {spawn} from "node:child_process";
import * as fs from "node:fs";
import path from "node:path";

function run(cmd: string, args: string[]) {
    return new Promise<{code:number, out:string, err:string}>(res=>{
        const p = spawn(cmd, args, { stdio: ["ignore","pipe","pipe"] });
        let out="", err="";
        p.stdout.on("data", d=> out+=d.toString());
        p.stderr.on("data", d=> err+=d.toString());
        p.on("close", code=> res({ code: code ?? -1, out: out.trim(), err: err.trim() }));
    });
}

export async function runDockerImage(name: string, image: string, env: Record<string, string>, mirrorToConsole = false) {

    const logsDir = path.resolve("logs");
    fs.mkdirSync(logsDir, { recursive: true });
    const logFile = path.join(logsDir, `${name}.log`);
    console.log("Creating log file: ", logFile)


    console.log(`→ Creating ${name} worker.`);
    const args = [
        "run", "--rm", "--name", name,
        ...Object.entries(env).flatMap(([k, v]) => ["-e", `${k}=${v}`]),
        image,
    ];
    const proc = spawn("docker", args, { stdio: ["ignore", "pipe", "pipe"] });
    const ws = fs.createWriteStream(logFile, { flags: "a" });
    proc.stdout.pipe(ws);
    proc.stderr.pipe(ws);

    if (mirrorToConsole) {
        proc.stdout.pipe(process.stdout);
        proc.stderr.pipe(process.stderr);
    }

    // const start = await run("docker", ["start", name]);
    // if (start.code !== 0) throw new Error(start.err);

    // Expose a completion promise but do not await it here.
    const done: Promise<number> = new Promise((resolve) => {
        proc.on("close", (code) => {
            ws.end(); resolve(code ?? -1); });
        proc.on("error", () => {
            ws.end(); resolve(-1); });
    });

    // Return immediately.
    return { name, logFile, done };
}
