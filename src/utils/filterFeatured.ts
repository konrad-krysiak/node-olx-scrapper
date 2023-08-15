import olxResponseDto from "../types/olxResponseDto.ts";

export default (res: olxResponseDto[]) =>
  res.filter((obj) => obj.featured === undefined);