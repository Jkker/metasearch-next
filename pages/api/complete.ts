
const url = 'http://google.com/complete/search?client=chrome&q=';

export default async function AutoSuggest(req, res) {
  const query = req.query.q;
  const response = await fetch(url + encodeURIComponent(query));
  const data = await response.json();
  res.json(data);
}