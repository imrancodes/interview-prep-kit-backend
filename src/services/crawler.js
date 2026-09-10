import axios from "axios";
import * as cheerio from "cheerio";
import { cleanPage } from "./pageCleaner.js";
const priority = /about|career|job|hiring|engineering|team|company/i;
const fetchPage = async (url) =>
  (
    await axios.get(url, {
      timeout: 10000,
      maxContentLength: 2000000,
      headers: { "User-Agent": "PrepFlow.ai research bot" },
    })
  ).data;
export const crawlCompany = async (companyUrl) => {
  let base;
  try {
    base = new URL(companyUrl);
  } catch {
    throw Object.assign(new Error("Provide a valid company website URL"), {
      statusCode: 400,
    });
  }
  if (!["http:", "https:"].includes(base.protocol))
    throw Object.assign(new Error("Company URL must use HTTP or HTTPS"), {
      statusCode: 400,
    });
  const pages = [];
  let homepage = "";
  try {
    homepage = await fetchPage(base.href);
    pages.push({ url: base.href, text: cleanPage(homepage) });
  } catch {
    return { pages, urls: [] };
  }
  const $ = cheerio.load(homepage);
  const links = $("a[href]")
    .map((_, el) => $(el).attr("href"))
    .get()
    .map((href) => {
      try {
        return new URL(href, base).href;
      } catch {
        return null;
      }
    })
    .filter(
      (url) => url && new URL(url).origin === base.origin && priority.test(url),
    );
  const results = await Promise.allSettled(
    [...new Set(links)]
      .slice(0, 5)
      .map(async (url) => ({ url, text: cleanPage(await fetchPage(url)) })),
  );
  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value.text)
      pages.push(result.value);
  });
  return {
    pages: pages.filter((page) => page.text),
    urls: pages.map((page) => page.url),
  };
};
