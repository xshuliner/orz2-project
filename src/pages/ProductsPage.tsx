import { ProductDirectory } from "../components/ProductDirectory";
import { Seo } from "../components/Seo";
import { pageSeo } from "../data/seo";

export function ProductsPage() {
  return (
    <>
      <Seo config={pageSeo.products} />
      <section className="page-hero compact-hero">
        <h1>工具目录</h1>
        <p>把高频任务整理成可搜索、可扩展、可长期运营的工具入口。</p>
      </section>
      <ProductDirectory />
    </>
  );
}
