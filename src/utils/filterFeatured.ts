import responseDto from "../models/responseDto.ts";

export default <T extends responseDto>(res: T[]) =>
  res.filter((obj) => obj.featured === undefined);
