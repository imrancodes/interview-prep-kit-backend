import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { generateInterviewKit } from "../src/services/kitGenerator.js";

dotenv.config();
const directory = path.dirname(fileURLToPath(import.meta.url));
const inputDirectory = path.join(directory, "..", "samples", "input");
const outputDirectory = path.join(directory, "..", "samples", "output");
await fs.mkdir(outputDirectory, { recursive: true });
const files = (await fs.readdir(inputDirectory, { withFileTypes: true }).catch(() => [])).filter((file) => file.isFile() && file.name.endsWith(".json"));
let succeeded = 0; let failed = 0;
for (const file of files) {
  try {
    const input = JSON.parse(await fs.readFile(path.join(inputDirectory, file.name), "utf8"));
    const kit = await generateInterviewKit(input);
    await fs.writeFile(path.join(outputDirectory, file.name), JSON.stringify(kit, null, 2));
    succeeded += 1;
  } catch (error) { failed += 1; console.error(`Failed ${file.name}: ${error.message}`); }
}
console.log(`Processed: ${files.length}\nSucceeded: ${succeeded}\nFailed: ${failed}`);
