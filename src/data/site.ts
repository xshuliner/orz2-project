import type { HeroMedia, ProductTool, TeamMember, Testimonial } from "../types";
import tools from "./tools.json";

const heroBase = "https://cos.xshuliner.online/Xshuliner/TeamWebsite/Assets/Hero";

export const heroMedia: HeroMedia[] = [
  {
    id: "shuxiaolan",
    label: "鼠小蓝",
    videoSrc: `${heroBase}/hero_video_shuxiaolan.mp4`,
    posterSrc: `${heroBase}/hero_poster_shuxiaolan.jpg`,
  },
  {
    id: "shuxiaolv",
    label: "鼠小绿",
    videoSrc: `${heroBase}/hero_video_shuxiaolv.mp4`,
    posterSrc: `${heroBase}/hero_poster_shuxiaolv.jpg`,
  },
  {
    id: "shuxiaozi",
    label: "鼠小紫",
    videoSrc: `${heroBase}/hero_video_shuxiaozi.mp4`,
    posterSrc: `${heroBase}/hero_poster_shuxiaozi.jpg`,
  },
  {
    id: "shuxiaohong",
    label: "鼠小红",
    videoSrc: `${heroBase}/hero_video_shuxiaohong.mp4`,
    posterSrc: `${heroBase}/hero_poster_shuxiaohong.jpg`,
  },
  {
    id: "shuxiaohuang",
    label: "鼠小黄",
    videoSrc: `${heroBase}/hero_video_shuxiaohuang.mp4`,
    posterSrc: `${heroBase}/hero_poster_shuxiaohuang.jpg`,
  },
  {
    id: "shuxiaocheng",
    label: "鼠小橙",
    videoSrc: `${heroBase}/hero_video_shuxiaocheng.mp4`,
    posterSrc: `${heroBase}/hero_poster_shuxiaocheng.jpg`,
  },
];

export const productTools = tools as ProductTool[];

export const testimonials: Testimonial[] = [
  {
    id: "ops",
    quote: "ORZ2 的工具入口足够直接，不需要培训，新同事也能很快找到该用的功能。",
    name: "林青",
    title: "增长运营负责人",
  },
  {
    id: "studio",
    quote: "我们喜欢这种轻量但完整的产品感，既能做日常任务，也适合接入自有流程。",
    name: "Mia Chen",
    title: "独立工作室主理人",
  },
  {
    id: "dev",
    quote: "SEO 和合规信息摆得很清楚，对准备商业化的工具站来说很省心。",
    name: "周远",
    title: "全栈开发者",
  },
];

export const teamMembers: TeamMember[] = [
  {
    id: "lan",
    name: "鼠小蓝",
    role: "项目经理",
    color: "#3b82f6",
    bio: "负责项目节奏、需求拆解和交付质量，让想法稳定变成可上线产品。",
    avatarPosition: "0% 0%",
  },
  {
    id: "lv",
    name: "鼠小绿",
    role: "全栈开发",
    color: "#16a34a",
    bio: "打通前端、服务端与部署链路，关注性能、可维护性和工程扩展。",
    avatarPosition: "50% 0%",
  },
  {
    id: "zi",
    name: "鼠小紫",
    role: "产品经理",
    color: "#8b5cf6",
    bio: "把用户场景翻译成清晰功能，平衡商业目标、体验和上线成本。",
    avatarPosition: "100% 0%",
  },
  {
    id: "hong",
    name: "鼠小红",
    role: "UI设计师",
    color: "#ef4444",
    bio: "建立一致的界面语言，让工具网站既专业、易用，也有品牌记忆点。",
    avatarPosition: "0% 100%",
  },
  {
    id: "huang",
    name: "鼠小黄",
    role: "财务",
    color: "#eab308",
    bio: "关注成本、收入与商业化指标，帮助产品走向长期健康运营。",
    avatarPosition: "50% 100%",
  },
  {
    id: "cheng",
    name: "鼠小橙",
    role: "HR",
    color: "#f97316",
    bio: "维护团队协作、人才成长和文化建设，让每个人在合适的位置发光。",
    avatarPosition: "100% 100%",
  },
];

export const productCategories = ["全部", ...Array.from(new Set(productTools.map((tool) => tool.category)))];
