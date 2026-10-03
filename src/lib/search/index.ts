import { articles, type Article } from "@/lib/data/blog";
import { catalog } from "@/lib/data/collections";
import { productDetails } from "@/lib/data/product-details";
import type { ProductSummary } from "@/types/home";
import type { ProductDetail } from "@/types/product";

interface IndexedProduct {
  summary: ProductSummary;
  title: string;
  meta: string;
  body: string;
}

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

function sectionText(product: ProductDetail) {
  return product.sections
    .map((section) => {
      switch (section.type) {
        case "ingredients":
          return section.items.map((item) => `${item.title} ${item.text}`).join(" ");
        case "benefits":
          return section.items.map((item) => item.text).join(" ");
        case "steps":
          return section.items.map((item) => item.text).join(" ");
        case "faq":
          return section.items.map((item) => `${item.question} ${stripHtml(item.answerHtml)}`).join(" ");
        default:
          return "";
      }
    })
    .join(" ");
}

let index: IndexedProduct[] | null = null;

function getIndex(): IndexedProduct[] {
  if (index) return index;
  index = Object.values(catalog).flatMap((summary) => {
    const detail = productDetails[summary.handle];
    if (!detail) return [];
    const description = detail.accordions
      .filter((accordion) => accordion.kind === "html")
      .map((accordion) => (accordion.kind === "html" ? stripHtml(accordion.html) : ""))
      .join(" ");
    return [
      {
        summary,
        title: summary.title.toLowerCase(),
        meta: [summary.subtitle, detail.subtitle, detail.netQty, ...detail.badges.map((b) => b.label)]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
        body: `${description} ${sectionText(detail)}`.toLowerCase(),
      },
    ];
  });
  return index;
}

const tokenize = (query: string) =>
  query
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

function scoreProduct(entry: IndexedProduct, tokens: string[]) {
  return tokens.reduce((total, token) => {
    if (entry.title.includes(token)) return total + 10;
    if (entry.meta.includes(token)) return total + 4;
    if (entry.body.includes(token)) return total + 1;
    return total;
  }, 0);
}

function scoreArticle(article: Article, tokens: string[]) {
  const title = article.title.toLowerCase();
  const excerpt = article.excerpt.toLowerCase();
  return tokens.reduce((total, token) => {
    if (title.includes(token)) return total + 10;
    if (excerpt.includes(token)) return total + 2;
    return total;
  }, 0);
}

export interface SearchResults {
  products: ProductSummary[];
  articles: Article[];
}

/** Full results for the search page: matching products first, then journal articles. */
export function searchCatalog(query: string): SearchResults {
  const tokens = tokenize(query);
  if (tokens.length === 0) return { products: [], articles: [] };

  const products = getIndex()
    .map((entry, order) => ({ entry, order, score: scoreProduct(entry, tokens) }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((match) => match.entry.summary);

  const matchedArticles = articles
    .map((article, order) => ({ article, order, score: scoreArticle(article, tokens) }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((match) => match.article);

  return { products, articles: matchedArticles };
}
