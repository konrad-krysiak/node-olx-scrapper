abstract class Scrapper {
  protected abstract _execute(pageLimit: number): void;
  abstract prefill(): void;
  abstract check(): void;
}

export default Scrapper;
