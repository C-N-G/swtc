import fs from 'node:fs/promises';
import { glob } from 'glob';
import fm from "front-matter";
import type { FrontMatterResult } from 'front-matter';
import { RoleData } from '../client/classes/role';
import { CharData } from '../client/classes/char';
import { ScenarioData } from '../client/classes/scenario';

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
  publish?: boolean;
}

interface VaultCharData extends CharData {
  publish?: boolean;
}

interface VaultScenarioData extends ScenarioData {
  publish?: boolean;
}

/**
 * Gets the front matter from a specified file
 * @param path
 * @returns object containing the front matter
 */
async function getFrontMatter(path: string): Promise<VaultRoleData | VaultCharData | VaultScenarioData | undefined> {
  try {
    const contents: FrontMatterResult<VaultRoleData | VaultCharData> = fm(await fs.readFile(path, {encoding: "utf8"}));
    if (Object.hasOwn(contents.attributes, "publish") && contents.attributes.publish === false) {
      return undefined;
    } else if (Object.hasOwn(contents.attributes, "publish")) {
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
  scenarios: VaultScenarioData[]
}

/**
 * Reads the front matter from all role and char files found in an array of file paths and converts them to an object for writing to disk
 * @param filePaths 
 * @returns object for returning
 */
async function convertFrontMatterToData(filePaths: string[]): Promise<StringData> {

  const frontMatterData: StringData = {chars: [], roles: [], scenarios: []};
  for (let i = 0; i < filePaths.length; i++) {

    // determine if a char or role is being processed
    const isChar = filePaths[i].toLowerCase().includes("characteristic") === true;
    const isRole = filePaths[i].toLowerCase().includes("role") === true;
    const isScenario = filePaths[i].toLowerCase().includes("scenario") === true;

    // skip the path if isn't a charcteristic or role
    if (!isChar && !isRole && !isScenario) continue;

    // get front matter from file
    const data = await getFrontMatter(filePaths[i]); 

    // stop processing if front matter is undefined
    if (data === undefined) continue; 

    // push data item to return data structure
    if (isRole) frontMatterData.roles.push(data as VaultRoleData);
    else if (isChar) frontMatterData.chars.push(data as VaultCharData);
    else if (isScenario) frontMatterData.scenarios.push(data as VaultScenarioData);

  }

  return frontMatterData;

}

/**
 * Writes char and role data to disk
 * @param dataObj 
 * @param basePath 
 */
async function convertDataToStrings(dataObj: StringData, basePath: string): Promise<void> {

  const create = async (type: "chars" | "roles" | "scenarios") => {

    // set the base path for file creation
    const dataPath = `${basePath}/${type}`;

    // check if the parent folder exists otherwise create it
    if (!await fileExists(dataPath)) await createDir(dataPath);

    // loop through all the entries of the specific dataObj param
    for (let i = 0; i < dataObj[type].length; i++) {
      
      // if the front matter doesnt have a name attribute then skip it
      if (!Object.hasOwn(dataObj[type][i], "name")) continue;

      // create the json string and write it to file
      const data = JSON.stringify(dataObj[type][i], null, 2);
      await createDataFile(`${dataPath}/${dataObj[type][i].name}.json5`, data);
    }

  }

  create("chars");
  create("roles");
  create("scenarios");

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
