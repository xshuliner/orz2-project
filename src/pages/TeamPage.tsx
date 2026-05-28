import { Seo } from "../components/Seo";
import { pageSeo } from "../data/seo";
import { teamMembers } from "../data/site";
import type { CSSProperties } from "react";

export function TeamPage() {
  return (
    <>
      <Seo config={pageSeo.team} />
      <section className="page-hero compact-hero">
        <h1>一支把工具做稳的小团队</h1>
        <p>ORZ2 团队横跨产品、研发、设计、商业和组织协作，让工具站从想法走到长期运营。</p>
      </section>
      <section className="team-grid" aria-label="ORZ2 团队成员">
        {teamMembers.map((member) => (
          <article className="team-card reveal-on-scroll" key={member.id} style={{ "--member-color": member.color } as CSSProperties}>
            <div className="avatar-sprite" style={{ backgroundPosition: member.avatarPosition }} role="img" aria-label={`${member.name} ${member.role} 头像`} />
            <div>
              <h2>{member.name}</h2>
              <strong>{member.role}</strong>
              <p>{member.bio}</p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
