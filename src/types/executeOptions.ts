import responseDto from "./responseDto.ts";

export default interface executeOptions {
    pageLimit: number;
    filterCb?: (res: responseDto[]) => responseDto[];
  }
  