import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const newsPagePath = new URL("../app/news/page.tsx", import.meta.url);

test("Actualidad lists Albacete Basket among official news sources without a social block", async () => {
  const newsPage = await readFile(newsPagePath, "utf8");

  assert.match(newsPage, /title="Albacete Basket"/);
  assert.match(newsPage, /logo="\/logoAlbaceteBasket\.png"/);
  assert.match(newsPage, /news=\{albaceteNews\}/);
  assert.doesNotMatch(newsPage, /officialSocialLinks/);
  assert.doesNotMatch(newsPage, /Redes oficiales/);
  assert.doesNotMatch(newsPage, /ArticleCard/);
});
