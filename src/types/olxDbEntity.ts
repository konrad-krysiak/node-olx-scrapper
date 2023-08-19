import OlxResponseDto from "./olxResponseDto";

export default interface OlxDbEntity extends OlxResponseDto {
  hash: string;
  created: string;
}
