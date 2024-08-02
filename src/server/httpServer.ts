import path from "node:path";
import { fileURLToPath } from 'url';
import fs from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import controlPanelController, { controlPanelUrl } from "./controlPanel";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, "..", "..", "dist");

export default function swtcHttpServer(req: IncomingMessage, res: ServerResponse) {
  
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === undefined) {
    res.statusCode = 404;
    res.write("Error 404");
    res.end();
    return;
  }

  // set header for content type
  if (req.url.endsWith("html")) {
    res.setHeader('Content-Type', 'text/html');
  } else if (req.url.endsWith("js")) {
    res.setHeader('Content-Type', 'application/javascript');
  } else if (req.url.endsWith("css")) {
    res.setHeader('Content-Type', 'text/css');
  }

  // redirect url to work with nginx server
  if (req.url === "/swtc") {
    req.url = "/"
  } else if (req.url.startsWith("/swtc/" + controlPanelUrl)) {
    return controlPanelController(req, res);
  } else if (req.url.startsWith("/swtc")) {
    req.url = req.url.slice(5)
  }

  let target;

  // redirect base path to app
  if (req.url === "/") {
    target = "index.html";
    res.setHeader('Content-Type', 'text/html');
  } else {
    target = req.url;
  }

  // try and read requested file
  try {
    const file = fs.readFileSync(path.join(basePath, target));
    res.statusCode = 200;
    res.write(file);
  } catch (error) {
    console.log(error);
    res.statusCode = 404;
    res.write("Error 404");
  }

  res.end();

}