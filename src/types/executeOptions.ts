import responseDto from "../models/responseDto";

export default interface executeOptions<T extends responseDto> {
    pageLimit: number;
    filterCb?: (res: T[]) => T[]
  }
  