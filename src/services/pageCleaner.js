import * as cheerio from "cheerio";
export const cleanPage = (html) => {
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header, noscript, svg, iframe").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
};
