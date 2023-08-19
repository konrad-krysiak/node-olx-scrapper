import filterFeatured from "../utils/filterFeatured.ts";

const OLX_FLAT_SCRAPPER_CONFIGURATION = {
  xray: {
    instance: {
      source:
        "https://www.olx.pl/nieruchomosci/stancje-pokoje/krakow/?search%5Border%5D=created_at:desc",
      context: "[data-cy=l-card]",
      selector: [
        {
          title: "h6",
          price: "[data-testid=ad-price]",
          locationDate: "[data-testid=location-date]",
          url: "a@href",
          featured: "[data-testid=adCard-featured]",
        },
      ],
    },
    paginate: "[data-testid=pagination-forward]@href",
    pageLimit: 1,
    callbacks: [filterFeatured],
  },
};

export default OLX_FLAT_SCRAPPER_CONFIGURATION;
