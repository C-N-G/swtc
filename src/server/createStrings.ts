import fs from 'node:fs/promises';
import { glob } from 'glob';
import fm from "front-matter";
import type { FrontMatterResult } from 'front-matter';
import { RoleData } from '../client/classes/role';
import { CharData } from '../client/classes/char';

/**
 * Checks to see if a file path exists and returns true or false
 * @param path
 * @returns boolean showing if the file exists
 */
async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path, fs.constants.F_OK);
    console.log(path + " already exists");
    return true;
  } catch {
    console.error(path + " does not exist");
    return false;
  }
}

interface VaultRoleData extends RoleData {
  module?: string;
  publish?: boolean;
}

interface VaultCharData extends CharData {
  module?: string;
  publish?: boolean;
}

/**
 * Gets the front matter from a specified file
 * @param path
 * @returns object containing the front matter
 */
async function getFrontMatter(path: string): Promise<VaultRoleData | VaultCharData | undefined> {
  try {
    const contents: FrontMatterResult<VaultRoleData | VaultCharData> = fm(await fs.readFile(path, {encoding: "utf8"}));
    if (Object.hasOwn(contents.attributes, "publish")) {
      delete contents.attributes.publish;
    }
    return contents.attributes;
  } catch (err) {
    console.error("failed to get frontmatter from", path);
    console.error(err);
  }
}

/**
 * Creates a strings data file at a specified directory
 * @param path
 * @param jsonData 
 */
async function createDataFile(path: string, jsonData: string) {
  try {
    await fs.writeFile(path, jsonData);
  } catch (err) {
    console.error("failed to create data file", path);
    console.error(err);
  }
}

/**
 * Creates a new directory
 * @param path
 */
async function createDir(path: string) {
  try {
    await fs.mkdir(path);
    console.log("successfully created dir ", path);
  } catch (err) {
    console.error("failed to create new dir", path);
    console.error(err);
  }
}

interface moduleData {
  [moduleName: string]: {
    chars: VaultCharData[]
    roles: VaultRoleData[]
  }
}

/**
 * Reads the front matter from every file in an array of file and converts them to an object for writing to disk
 * @param filePaths 
 * @returns object for returning
 */
async function convertFiles(filePaths: string[]): Promise<moduleData> {
  const frontMatterData: moduleData = {};
  for (let i = 0; i < filePaths.length; i++) {
    // get front matter from file
    const data = await getFrontMatter(filePaths[i]); 

    // stop processing if front matter is undefined or does not include a module
    if (data?.module === undefined) continue; 

    // save module string
    const module = data.module; 

    // define module structure if it wasn't already defined
    if (!Object.hasOwn(frontMatterData, module)) frontMatterData[module] = {chars: [], roles: []}; 
    
    // remove module data as its not used in the game
    delete data.module; 
    
    // determine if a char or role is being processed
    const isRole = filePaths[i].toLowerCase().includes("role") === true;
    const isChar = filePaths[i].toLowerCase().includes("characteristic") === true;

    // push data item to return data structure
    if (isRole) frontMatterData[module].roles.push(data as VaultRoleData);
    else if (isChar) frontMatterData[module].chars.push(data);
  }

  return frontMatterData;
}

/**
 * Writes module data to the module directory
 * Uses existing module folders if they are present
 * Checks for module folders with prefixes and uses them if found
 * @param dataObj 
 * @param basePath 
 */
async function createModules(dataObj: moduleData, basePath: string): Promise<void> {

  // read the module directory and create an array of module names
  const existingModules = await fs.readdir(basePath);
  // and an array of module names with the prefixes taken out
  const cleanExistingModules = existingModules.map(module => {
    if (module.split("_").length > 1) return module.split("_")[1];
    else return module;
  })

  const modules = Object.keys(dataObj);

  for (let i = 0; i < modules.length; i++) {
    let modulePath = `${basePath}/${modules[i]}`;

    // if the module already exists in the modules folder
    if (cleanExistingModules.includes(modules[i])) {
      // then use the directory that might have a prefix with it
      const index = cleanExistingModules.indexOf(modules[i]);
      const moduleDir = existingModules[index];
      modulePath = `${basePath}/${moduleDir}`;
      console.log(`"${modules[i]}" already exists, using directory "${moduleDir}"`)
      // else create a new directory
    } else if (!await fileExists(modulePath)) await createDir(modulePath);

    // add char data to the module directory
    const charData = JSON.stringify(dataObj[modules[i]].chars, null, 2)
    await createDataFile(modulePath + "/chars.json5", charData);

    // add role data to the module directory
    const roleData = JSON.stringify(dataObj[modules[i]].roles, null, 2)
    await createDataFile(modulePath + "/roles.json5", roleData);
    
  }

}

const vaultPath = ("../swtc-site/vault");
const stringsPath = ("./src/client/strings");
const modulePath = stringsPath + "/modules";

// check if vault directory exists before continuing
if (!await fileExists(vaultPath)) {
  throw new Error("Error: obsidian vault directory does not exist");
}

const mdFiles = await glob(`${vaultPath}/**/*.md`);
const data = await convertFiles(mdFiles);
await createModules(data, modulePath);
console.log("front matter conversion complete");
