import responseDto from "../models/responseDto";

export default interface olxResponseDto extends responseDto {
    title: string;
    price: string;
    locationDate: string;
    url: string;
    featured?: string;
}