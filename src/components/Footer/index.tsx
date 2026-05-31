import { siteConfig } from '@/config';
import { Link } from 'react-router-dom';
import './index.css';

export function Footer() {
  return (
    <footer className='bg-[#0f1712] text-[#dfeee6]'>
      <div className='footer-grid'>
        <div>
          <img
            className='h-[46px] w-[46px] overflow-hidden rounded-[10px] object-contain'
            src='https://cos.xshuliner.online/Orz2/Logo/logo_dark_320x320.webp'
            alt='ORZ2'
          />
          <p className='mt-2 text-sm leading-relaxed text-[#b8c9c0]'>
            ORZ2 专注在线 AI
            工具、效率工具与可定制工具站方案，帮助团队把重复工作交给更稳定的流程。
          </p>
        </div>
        <nav className='grid content-start gap-2' aria-label='页脚导航'>
          <h2 className='!mb-[14px] text-[15px] !text-white'>导航</h2>
          <Link
            className='interactive w-fit text-sm leading-relaxed text-[#b8c9c0] underline-offset-[3px] hover:!text-white hover:underline'
            to='/'
          >
            首页
          </Link>
          <Link
            className='interactive w-fit text-sm leading-relaxed text-[#b8c9c0] underline-offset-[3px] hover:!text-white hover:underline'
            to='/products'
          >
            产品
          </Link>
          <Link
            className='interactive w-fit text-sm leading-relaxed text-[#b8c9c0] underline-offset-[3px] hover:!text-white hover:underline'
            to='/team'
          >
            团队
          </Link>
          <Link
            className='interactive w-fit text-sm leading-relaxed text-[#b8c9c0] underline-offset-[3px] hover:!text-white hover:underline'
            to='/privacy'
          >
            隐私协议
          </Link>
        </nav>
        <div className='grid content-start gap-2'>
          <h2 className='!mb-[14px] text-[15px] !text-white'>联系</h2>
          <a
            className='interactive w-fit text-sm leading-relaxed text-[#b8c9c0] underline-offset-[3px] hover:!text-white hover:underline'
            href={`mailto:${siteConfig.contactEmail}`}
          >
            {siteConfig.contactEmail}
          </a>
          <p className='text-sm leading-relaxed text-[#b8c9c0]'>
            支持工具定制、商业化落地与效率工作流搭建。
          </p>
        </div>
        <div className='grid content-start gap-2'>
          <h2 className='!mb-[14px] text-[15px] !text-white'>合规</h2>
          <p className='text-sm leading-relaxed text-[#b8c9c0]'>
            清晰标注数据使用、第三方服务、广告说明与用户权利。
          </p>
          <Link
            className='interactive w-fit text-sm leading-relaxed text-[#b8c9c0] underline-offset-[3px] hover:!text-white hover:underline'
            to='/privacy'
          >
            查看隐私协议
          </Link>
        </div>
      </div>
      <div className='mx-auto flex w-[min(var(--max),calc(100%-40px))] justify-between gap-4 border-t border-white/10 px-0 pt-[18px] pb-[26px] text-[13px] text-[#92a399] max-sm:w-[calc(100%-28px)] max-sm:flex-col'>
        <span>© 2026 ORZ2. All rights reserved.</span>
        <span>Built for useful, compliant online tools.</span>
      </div>
    </footer>
  );
}
