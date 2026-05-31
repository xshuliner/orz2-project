import { Seo } from '@/components/Seo';
import { pageSeo } from '@/config/seo';
import { teamMembers } from '@/config/site';
import type { CSSProperties } from 'react';
import './index.css';

export function PageTeam() {
  return (
    <>
      <Seo config={pageSeo.team} />
      <section className='page-hero compact-hero'>
        <h1>核心团队</h1>
        <p>
          ORZ2
          团队横跨产品、研发、设计、商业和组织协作，让工具站从想法走到长期运营。
        </p>
      </section>
      <section className='team-grid' aria-label='ORZ2 团队成员'>
        {teamMembers.map(member => (
          <article
            className='team-card reveal-on-scroll'
            key={member.id}
            style={{ '--member-color': member.color } as CSSProperties}
          >
            <img
              className='team-avatar'
              src={member.avatarUrl}
              alt={`${member.name} ${member.role} 头像`}
            />
            <div>
              <h2 className='!m-0 !mb-1 text-[22px]'>{member.name}</h2>
              <strong className='text-sm' style={{ color: member.color }}>
                {member.role}
              </strong>
              <p className='!mt-[10px] text-sm'>{member.bio}</p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
