import type { ProductShowcase, ProductTool } from '@/types';
import {
  ArrowUpRight,
  Boxes,
  Braces,
  ImageDown,
  Palette,
  Send,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './index.css';

const icons = { Braces, ImageDown, Palette, Send };

interface CatalogCardProps {
  item: ProductShowcase | ProductTool;
  type: 'product' | 'tool';
}

export function CatalogCard({ item, type }: CatalogCardProps) {
  const isTool = type === 'tool';
  const tool = isTool ? (item as ProductTool) : null;
  const product = !isTool ? (item as ProductShowcase) : null;
  const Icon = tool ? icons[tool.icon] : null;
  const href = tool?.href ?? product?.href;
  const actionLabel = isTool ? '进入工具' : '查看项目';

  return (
    <article className={`catalog-card ${type}-card reveal-on-scroll`}>
      <div className='catalog-card-header'>
        <div className='catalog-card-media'>
          {Icon ? (
            <Icon size={22} strokeWidth={1.8} aria-hidden='true' />
          ) : null}
          {product ? (
            <>
              <Boxes
                className='catalog-card-fallback'
                size={22}
                strokeWidth={1.7}
                aria-hidden='true'
              />
              <img
                src={product.logo}
                alt=''
                width='52'
                height='52'
                loading='lazy'
                onError={event => {
                  event.currentTarget.hidden = true;
                }}
              />
            </>
          ) : null}
        </div>
        <span className='catalog-card-category'>{item.category}</span>
      </div>
      <div className='catalog-card-copy'>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
      </div>
      <div className='tag-row'>
        {item.tags.map(tag => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className='catalog-card-footer'>
        {tool ? <small>{tool.status}</small> : <small>ORZ2 Project</small>}
        {href ? (
          isTool ? (
            <Link className='card-link interactive' to={href}>
              {actionLabel}
              <ArrowUpRight size={16} aria-hidden='true' />
            </Link>
          ) : (
            <a
              className='card-link interactive'
              href={href}
              target='_blank'
              rel='noreferrer'
            >
              {actionLabel}
              <ArrowUpRight size={16} aria-hidden='true' />
            </a>
          )
        ) : (
          <span className='catalog-card-muted'>持续整理中</span>
        )}
      </div>
    </article>
  );
}
