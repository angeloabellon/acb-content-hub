import assert from "node:assert/strict";
import test from "node:test";

import { extractAlbaceteNews } from "../lib/news-parsers.ts";

const albaceteArchiveMarkup = `
  <article class="uagb-post__inner-wrap">
    <div class="uagb-post__image">
      <a href="https://albacetebasket.es/primera-noticia/"><img src="https://albacetebasket.es/wp-content/uploads/2026/10/primera.jpeg" /></a>
    </div>
    <h4 class="uagb-post__title uagb-post__text"><a href="https://albacetebasket.es/primera-noticia/">Primera noticia &amp; protagonista</a></h4>
    <div class="uagb-post-grid-byline"><time datetime="2026-10-10T12:51:29+02:00" class="uagb-post__date">10 de octubre de 2026</time></div>
  </article>
  <article class="uagb-post__inner-wrap">
    <h4 class="uagb-post__title"><a href="https://albacetebasket.es/segunda-noticia/">Segunda noticia sin imagen</a></h4>
    <time class="uagb-post__date" datetime="2026-10-09T12:00:00+02:00">9 de octubre de 2026</time>
  </article>
  <article class="uagb-post__inner-wrap">
    <h4 class="uagb-post__title"><a href="https://albacetebasket.es/primera-noticia/">Primera noticia duplicada</a></h4>
  </article>
`;

test("the Albacete adapter reads WordPress archive cards and preserves optional media", () => {
  const news = extractAlbaceteNews(albaceteArchiveMarkup);

  assert.equal(news.length, 2);
  assert.deepEqual(news[0], {
    title: "Primera noticia & protagonista",
    slug: "primera-noticia-protagonista",
    url: "/news/primera-noticia-protagonista",
    externalUrl: "https://albacetebasket.es/primera-noticia/",
    source: "Albacete Basket",
    content: "",
    pubDate: "2026-10-10T12:51:29+02:00",
    imageUrl: "https://albacetebasket.es/wp-content/uploads/2026/10/primera.jpeg",
  });
  assert.equal(news[1]?.imageUrl, undefined);
  assert.equal(news[1]?.pubDate, "2026-10-09T12:00:00+02:00");
});
