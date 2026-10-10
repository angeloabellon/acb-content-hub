import assert from "node:assert/strict";
import test from "node:test";

import { siteConfig } from "../config/site.ts";

test("la navegación pública no promociona las secciones retiradas", () => {
  const navigationPaths = siteConfig.navigation.map((item) => item.href);

  assert.equal(navigationPaths.includes("/episodios"), false);
  assert.equal(navigationPaths.includes("/directo"), false);
});
