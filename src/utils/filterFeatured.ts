import responseDto from "src/types/responseDto.ts";

export default (res: responseDto[]) =>
  res.filter((obj) => obj.featured === undefined);