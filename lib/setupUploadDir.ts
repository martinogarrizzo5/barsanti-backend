import fs from "fs/promises";
import { join } from "path";

async function setupUploadDir() {
  const devPath = join(process.cwd(), "uploads");
  const baseDir = process.env.ROOT_DIR || devPath;

  try {
    await fs.stat(baseDir);
    await fs.access(baseDir, fs.constants.W_OK);
  } catch (e: any) {
    if (e.code === "ENOENT") {
      try {
        await fs.mkdir(baseDir, { recursive: true });
      } catch (err) {
        console.log(err);
        return null;
      }
    } else {
      console.error(e);
      return null;
    }
  }

  return baseDir;
}

export default setupUploadDir;

export const ensureDirExistance = async (dir: string) => {
  try {
    await fs.stat(dir);
  } catch (e: any) {
    if (e.code === "ENOENT") {
      await fs.mkdir(dir, { recursive: true });
    }
  }
};
