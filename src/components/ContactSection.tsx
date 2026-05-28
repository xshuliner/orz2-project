import { ArrowUpRight, Mail, Sparkles } from "lucide-react";

export function ContactSection() {
  return (
    <section className="contact-section reveal-on-scroll" aria-labelledby="contact-title">
      <div>
        <h2 id="contact-title">把 ORZ2 定制成你的商业工具入口</h2>
        <p>
          我们可以围绕你的行业、团队流程和商业化目标，定制工具页面、数据接入、广告合规内容与独立 SEO 架构。
        </p>
      </div>
      <div className="contact-panel">
        <div className="contact-line">
          <Sparkles size={20} aria-hidden="true" />
          <span>工具目录设计、AI 流程接入、企业落地页、隐私合规模块</span>
        </div>
        <a className="button primary" href="mailto:hello@orz2.com">
          <Mail size={18} aria-hidden="true" />
          hello@orz2.com
        </a>
        <a className="button ghost" href="/products">
          查看可扩展入口
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
