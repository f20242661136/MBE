import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const baseUrl = "https://molvibusiness.shop";

  // Fetch products
  const { data: products } = await supabase
    .from("products")
    .select("id, created_at");

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("name");

  const staticPages = ["", "/about", "/contact", "/shop"];

  const urls = [
    // STATIC PAGES
    ...staticPages.map(
      (page) => `
      <url>
        <loc>${baseUrl}${page}</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
      </url>`
    ),

    // CATEGORY PAGES
    ...(categories ?? []).map(
      (cat) => `
      <url>
        <loc>${baseUrl}/category/${encodeURIComponent(cat.name)}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
      </url>`
    ),

    // PRODUCT PAGES
    ...(products ?? []).map(
      (product) => `
      <url>
        <loc>${baseUrl}/product/${product.id}</loc>
        <lastmod>${new Date(product.created_at).toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>`
    ),
  ].join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls}
    </urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
