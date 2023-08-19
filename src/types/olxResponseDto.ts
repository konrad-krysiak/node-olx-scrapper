import { ResponseDto } from "../models/index.ts";

export default interface OlxResponseDto extends ResponseDto {
  title: string;
  price: string;
  locationDate: string;
  url: string;
  featured?: string;
}
