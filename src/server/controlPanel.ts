import keys from "./keys.json";
import { IncomingMessage, ServerResponse } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from 'url';
import { URL } from "node:url";
import config from "../appConfig";
import { exec } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function controlPanelController(req: IncomingMessage, res: ServerResponse) {

  res.setHeader('Content-Type', 'text/html');

  const params = new URL(`http://${config.addr}:${config.port}${req.url}`).searchParams;
  const auth = params.get("auth");

  if (auth !== keys.auth) {
    res.statusCode = 401;
    res.write("Error 401");
    return res.end();
  }

  const command = params.get("command");

  if (command && command === "strings") {

    // const commandString =
    //   "git fetch" +
    //   " && git reset --hard HEAD" +
    //   " && cd ../swtc-site" +
    //   " && git pull" +
    //   " && cd ../swtc" +
    //   " && npm run createStrings" + 
    //   " && npm run build" +
    //   " && pm2 restart swtc"
    
    const commandString =
      "cd ../swtc-site" +
      " && git pull" +
      " && cd ../swtc" +
      " && npm run createStrings" + 
      " && npm run build"

      // cd ../swtc-site && git pull && cd ../swtc && npm run createStrings && npm run build && pm2 restart swtc
 
    exec(commandString, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        res.statusCode = 200;
        res.write(JSON.stringify(`error: ${error.message}`));
        res.end();
        return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          res.statusCode = 200;
          res.write(JSON.stringify(`stderr: ${stderr}`));
          res.end();
          return;
      }
      console.log(`stdout: ${stdout}`);
      res.statusCode = 200;
      res.write(JSON.stringify(stdout));
      res.end();
    })

    return;

  }

  try {
    const file = fs.readFileSync(path.join(__dirname, "controlPanel.html"));
    res.statusCode = 200;
    res.write(file);
  } catch (error) {
    console.log(error);
    res.statusCode = 404;
    res.write("Error 404");
  }

  res.end();

}

export const controlPanelUrl = keys.url;