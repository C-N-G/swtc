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
    console.log(path + " does not exist");
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

interface StringData {
  chars: VaultCharData[]
  roles: VaultRoleData[]
}

/**
 * Reads the front matter from all role and char files found in an array of file paths and converts them to an object for writing to disk
 * @param filePaths 
 * @returns object for returning
 */
async function convertFrontMatterToData(filePaths: string[]): Promise<StringData> {

  const frontMatterData: StringData = {chars: [], roles: []};
  for (let i = 0; i < filePaths.length; i++) {

    // determine if a char or role is being processed
    const isChar = filePaths[i].toLowerCase().includes("characteristic") === true;
    const isRole = filePaths[i].toLowerCase().includes("role") === true;

    // skip the path if isn't a charcteristic or role
    if (!isChar && !isRole) continue;

    // get front matter from file
    const data = await getFrontMatter(filePaths[i]); 

    // stop processing if front matter is undefined or does not include a module
    if (data === undefined) continue; 

    // push data item to return data structure
    if (isRole) frontMatterData.roles.push(data as VaultRoleData);
    else if (isChar) frontMatterData.chars.push(data);

  }

  return frontMatterData;

}

/**
 * Writes char and role data to disk
 * @param dataObj 
 * @param basePath 
 */
async function convertDataToStrings(dataObj: StringData, basePath: string): Promise<void> {

  const create = async (type: "chars" | "roles") => {

    const modulePath = `${basePath}/${type}`;
    if (!await fileExists(modulePath)) await createDir(modulePath);
    for (let i = 0; i < dataObj[type].length; i++) {
      const data = JSON.stringify(dataObj[type][i], null, 2);
      if (!Object.hasOwn(dataObj[type][i], "name")) continue;
      await createDataFile(`${modulePath}/${dataObj[type][i].name}.json5`, data);
    }

  }

  create("chars");
  create("roles");

}

const vaultPath = ("../swtc-site/vault");
const stringsPath = ("./src/client/strings");
// const scenarioPath = stringsPath + "/scenarios";

// check if vault directory exists before continuing
if (!await fileExists(vaultPath)) {
  throw new Error("Error: obsidian vault directory does not exist");
}

const mdFiles = await glob(`${vaultPath}/**/*.md`);
const data = await convertFrontMatterToData(mdFiles);
await convertDataToStrings(data, stringsPath);
console.log("front matter conversion complete");
