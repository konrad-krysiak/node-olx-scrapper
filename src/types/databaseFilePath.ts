import { dbFilePaths } from "src/utils/index.ts";

export type DatabaseFilePath = (typeof dbFilePaths)[keyof typeof dbFilePaths];
