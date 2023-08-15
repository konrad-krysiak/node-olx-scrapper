import responseDto from "./olxResponseDto.ts";

export type dbEntity = responseDto & { hash: string, created: string };