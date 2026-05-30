import { Seo } from "../components/Seo";
import { siteConfig } from "../config";
import { pageSeo } from "../data/seo";

const sections = [
  { id: "overview", title: "协议概述" },
  { id: "collection", title: "我们收集的信息" },
  { id: "usage", title: "信息使用方式" },
  { id: "cookies", title: "Cookie 与本地存储" },
  { id: "third-party", title: "第三方服务与广告" },
  { id: "rights", title: "用户权利" },
  { id: "contact", title: "联系我们" },
];

export function PrivacyPage() {
  return (
    <>
      <Seo config={pageSeo.privacy} />
      <section className="page-hero compact-hero">
        <h1>隐私协议</h1>
        <p>我们以必要、透明、可替换为原则设计数据与合规说明，便于后续接入广告和商业化服务。</p>
      </section>
      <section className="privacy-layout">
        <aside className="privacy-toc" aria-label="隐私协议目录">
          {sections.map((section) => (
            <a href={`#${section.id}`} key={section.id}>
              {section.title}
            </a>
          ))}
        </aside>
        <article className="privacy-article">
          <section id="overview">
            <h2>协议概述</h2>
            <p>
              本协议说明 ORZ2 在提供在线工具、产品展示、定制合作沟通和网站分析时可能涉及的信息处理方式。首版联系和主体信息为可替换占位，正式上线前应替换为真实运营主体。
            </p>
          </section>
          <section id="collection">
            <h2>我们收集的信息</h2>
            <p>
              我们尽量减少信息收集。用户主动联系时，可能提供邮箱、需求描述或项目背景；访问网站时，浏览器可能传递设备类型、页面路径、来源页面和基础日志信息。
            </p>
          </section>
          <section id="usage">
            <h2>信息使用方式</h2>
            <p>
              信息主要用于回复咨询、改进工具体验、排查异常、衡量页面质量和维护服务安全。我们不会出售用户个人信息，也不会用不必要的信息限制用户访问公开页面。
            </p>
          </section>
          <section id="cookies">
            <h2>Cookie 与本地存储</h2>
            <p>
              ORZ2 可使用必要 Cookie 或本地存储保存偏好设置、减少重复输入，并在接入分析或广告服务时提供必要的提示与配置入口。
            </p>
          </section>
          <section id="third-party">
            <h2>第三方服务与广告</h2>
            <p>
              后续如接入 Google Ads、统计分析、托管服务或邮件服务，相关第三方可能依据其政策处理必要数据。我们会在页面中保持隐私入口、联系渠道和广告说明清晰可见。
            </p>
          </section>
          <section id="rights">
            <h2>用户权利</h2>
            <p>
              用户可以请求了解、更正或删除通过联系渠道提交的信息，也可以通过浏览器设置管理 Cookie。我们会在合理时间内响应与隐私相关的请求。
            </p>
          </section>
          <section id="contact">
            <h2>联系我们</h2>
            <p>
              如对本协议或数据处理方式有疑问，请联系{" "}
              <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
              。正式上线前，请将该邮箱替换为真实运营主体的联系渠道。
            </p>
          </section>
        </article>
      </section>
    </>
  );
}
