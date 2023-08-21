import filterFeatured from "../utils/filterFeatured.ts";

const OLX_FLAT_SCRAPPER_CONFIGURATION = {
  url: "https://www.olx.pl/nieruchomosci/stancje-pokoje/krakow/?search%5Border%5D=created_at:desc",
  callbacks: [filterFeatured],
};

export default OLX_FLAT_SCRAPPER_CONFIGURATION;
