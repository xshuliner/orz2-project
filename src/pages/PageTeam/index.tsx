import { OCard } from '@/components/OCard';
import { OPageHero } from '@/components/OPageHero';
import { Seo } from '@/components/Seo';
import { pageSeo } from '@/config/seo';
import { teamMembers } from '@/config/site';
import type { CSSProperties } from 'react';
import './index.css';

export function PageTeam() {
  return (
    <>
      <Seo config={pageSeo.team} />
      <OPageHero
        title='核心团队'
        description='ORZ2 团队横跨产品、研发、设计、商业和组织协作，让工具站从想法走到长期运营。'
      />
      <section className='team-grid' aria-label='ORZ2 团队成员'>
        {teamMembers.map(member => (
          <OCard
            as='article'
            className='team-card reveal-on-scroll'
            interactive
            key={member.id}
            padding='md'
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
          </OCard>
        ))}
      </section>
    </>
  );
}
