import responseDto from "./responseDto.ts";
import executeOptions from "../types/executeOptions.ts";



abstract class Scrapper<T extends responseDto> {
    protected abstract _execute(cb: (res: T[]) => void, options?: executeOptions<T>): void;
    abstract executeToPrefill(pageLimit: number): void;
    abstract executeAndCheck(): void;
    abstract executeAndCheckInterval(ms: number): void;
}

export default Scrapper;