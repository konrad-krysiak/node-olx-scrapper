import objectHash from "object-hash";
import responseDto from "../models/responseDto.ts";

export default <T extends responseDto>(
  obj: T & { title: string; price: string }
) => objectHash({ title: obj.title, price: obj.price });
