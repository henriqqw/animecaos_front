import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

const ASCII_SOURCE_PATH = path.join(process.cwd(), "public", "caosdev_ascii");

export const getCaosdevAscii = cache(async (): Promise<string> => {
  try {
    const content = await readFile(ASCII_SOURCE_PATH, "utf8");
    return content.replace(/\r\n/g, "\n").trimEnd();
  } catch {
    return "";
  }
});

