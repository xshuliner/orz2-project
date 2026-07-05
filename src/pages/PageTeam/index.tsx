import { OCard } from '@/components/OCard';
import { OPageHero } from '@/components/OPageHero';
import { Seo } from '@/components/Seo';
import { getPageSeo } from '@/config/seo';
import { getTeamMembers, useI18n } from '@/i18n';
import type { CSSProperties } from 'react';
import './index.css';

export function PageTeam() {
  const { locale, messages } = useI18n();
  const pageSeo = getPageSeo(locale);
  const teamMembers = getTeamMembers(locale);
  const copy = messages.teamPage;
  return (
    <>
      <Seo config={pageSeo.team} />
      <OPageHero title={copy.heroTitle} description={copy.heroDescription} />
      <section className='team-grid' aria-label={copy.gridAriaLabel}>
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
              width={96}
              height={96}
              loading='lazy'
              decoding='async'
              alt={`${member.name} ${member.role} ${copy.avatarAlt}`}
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
