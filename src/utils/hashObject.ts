import objectHash from "object-hash";
import responseDto from "../types/responseDto.ts";

export default (obj: responseDto) => {
    return objectHash({title: obj.title, price: obj.price})
}