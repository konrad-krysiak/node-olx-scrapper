export default ({
  title,
  price,
  location,
  url,
}: {
  title: string;
  price: string;
  location: string;
  url: string;
}) =>
  `<h2>New offer appeared!</h2><p>title: ${title}</p><p>price: ${price}</p><p>location: ${location}</p><p>url: ${url}</p>`;
