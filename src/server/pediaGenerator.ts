import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import wikiLinkPlugin from "remark-wiki-link";

import fs from "node:fs/promises";
import path from "node:path";
import {glob} from "glob";

console.log(import.meta.url);
const docsDir = path.join(__dirname, "docs", "Secrets Within the Compound Wiki");

async function processFile(filePath: string): Promise<void> {

  // const file = await fs.readFile("./docs/Secrets Within the Compound Wiki/Roles/Loyalist/Agent/Analyst.md");
  const file = await fs.readFile(filePath);

  const html = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml', 'toml'])
    .use(() => {
      return (tree) => {console.dir(tree)}
    })
    .use(wikiLinkPlugin, {
      permalinks: ["subversive"],
      aliasDivider: "|"
    })
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(file)
  
  
  console.log(String(html));
  
  await fs.writeFile("./docs/pedia/analyst.html", String(html));

}


async function getFileNames(baseDir: string) {
  const searchString = path.join(baseDir, "**", "*.md");
  console.log(searchString)
  const mdFiles = await glob(searchString);
  console.log(mdFiles);
}

getFileNames(docsDir)