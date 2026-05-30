import { Link } from "react-router-dom";
import { siteConfig } from "../config";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src="/assets/logo-dark.png" alt="ORZ2" />
          <p>ORZ2 专注在线 AI 工具、效率工具与可定制工具站方案，帮助团队把重复工作交给更稳定的流程。</p>
        </div>
        <nav aria-label="页脚导航">
          <h2>导航</h2>
          <Link to="/">首页</Link>
          <Link to="/products">产品</Link>
          <Link to="/team">团队</Link>
          <Link to="/privacy">隐私协议</Link>
        </nav>
        <div>
          <h2>联系</h2>
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          <p>支持工具定制、商业化落地与效率工作流搭建。</p>
        </div>
        <div>
          <h2>合规</h2>
          <p>清晰标注数据使用、第三方服务、广告说明与用户权利。</p>
          <Link to="/privacy">查看隐私协议</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 ORZ2. All rights reserved.</span>
        <span>Built for useful, compliant online tools.</span>
      </div>
    </footer>
  );
}
