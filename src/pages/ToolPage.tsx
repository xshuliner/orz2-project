import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Seo } from "../components/Seo";
import { pageSeo, toolSeo } from "../data/seo";
import { productTools } from "../data/site";

export function ToolPage() {
  const { slug = "" } = useParams();
  const tool = productTools.find((item) => item.slug === slug);

  if (!tool) {
    return (
      <>
        <Seo config={pageSeo.products} />
        <section className="page-hero compact-hero">
          <h1>工具暂未找到</h1>
          <p>这个工具入口可能还在整理中，可以先返回产品目录查看已有工具。</p>
          <Link className="button primary" to="/products">
            <ArrowLeft size={18} aria-hidden="true" />
            返回产品
          </Link>
        </section>
      </>
    );
  }

  return (
    <>
      <Seo config={toolSeo[tool.slug]} />
      <section className="tool-placeholder">
        <Link className="back-link" to="/products">
          <ArrowLeft size={16} aria-hidden="true" />
          产品目录
        </Link>
        <div className="tool-placeholder-card">
          <span>{tool.category}</span>
          <h1>{tool.name}</h1>
          <p>{tool.description}</p>
          <div className="tag-row">
            {tool.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <p className="placeholder-note">
            首版保留工具详情页结构与独立 SEO，真实工具功能可在后续迭代中接入。
          </p>
        </div>
      </section>
    </>
  );
}
