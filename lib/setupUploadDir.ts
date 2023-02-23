import { mkdir, stat, access, constants } from "fs/promises";
import { join } from "path";

async function setupUploadDir() {
  const baseDir = join(process.env.ROOT_DIR || process.cwd(), "/uploads");

  try {
    await stat(baseDir);
    await access(baseDir, constants.W_OK);
  } catch (e: any) {
    if (e.code === "ENOENT") {
      try {
        await mkdir(baseDir, { recursive: true });
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
