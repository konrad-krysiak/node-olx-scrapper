import olxResponseDto from "./olxResponseDto";

export type olxDbEntity = olxResponseDto & { hash: string, created: string };