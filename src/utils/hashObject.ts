import objectHash from "object-hash";
import responseDto from "../models/responseDto.ts";

export default <T extends responseDto>(
  obj: T & { title: string; price: string }
) => {
  return objectHash({ title: obj.title, price: obj.price });
};
