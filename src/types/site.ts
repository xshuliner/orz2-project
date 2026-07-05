export interface HeroMedia {
  id: string;
  videoSrc: string;
  posterSrc: string;
  label: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  color: string;
  bio: string;
  avatarUrl: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  title: string;
}
