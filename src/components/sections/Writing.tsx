"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ArticleItem {
  title: string;
  excerpt: string;
  readTime: string;
  category: string;
  link: string;
  date: string;
  relatedProject?: string;
  status?: "published" | "draft";
}

const CURATED_ESSAYS: ArticleItem[] = [
  {
    title: "Why ChatGPT Searches the Web in 2 Seconds (And Your AI Agent Takes 15)",
    excerpt:
      "The real reason your AI agent is slow isn't code — it's architecture. A deep dive into latency waterfalls, distributed search fan-outs, and parallel tool orchestration in production AI agents.",
    readTime: "6 min read",
    category: "Agentic AI & Latency",
    link: "https://medium.com/@gaganparashar127/why-chatgpt-searches-the-web-in-2-seconds-and-your-ai-agent-takes-15-25a1e49d1394?sharedUserId=gaganparashar127",
    date: "Mar 23, 2026",
    relatedProject: "MCP Tool Server",
    status: "published",
  },
  {
    title: "The Architecture of MCP: Why Model Context Protocol Solves the Tool Integration Bottleneck",
    excerpt:
      "Exploring Anthropic's Model Context Protocol (MCP) as the universal standard for LLM tool invocation: strict JSON-Schema validation, client-server decoupling, and secure enterprise data access.",
    readTime: "6 min read",
    category: "Protocols & Tools",
    link: "https://medium.com/@gaganparashar127/the-architecture-of-mcp-why-model-context-protocol-solves-the-tool-integration-bottleneck-e7ba849d41b5?sharedUserId=gaganparashar127",
    date: "Mar 19, 2026",
    relatedProject: "MCP Tool Server",
    status: "published",
  },
  {
    title: "Beyond Naive RAG: Integrating Knowledge Graphs with Vector Search via LangGraph",
    excerpt:
      "A guide to overcoming vector retrieval limitations: constructing entity-relation knowledge graphs with Neo4j and orchestrating multi-hop relational retrieval for accurate agent reasoning.",
    readTime: "9 min read",
    category: "GraphRAG & Knowledge Graphs",
    link: "https://medium.com/@gaganparashar127/beyond-naive-rag-integrating-knowledge-graphs-with-vector-search-via-langgraph-7d0e51b14271?sharedUserId=gaganparashar127",
    date: "Mar 14, 2026",
    relatedProject: "GraphRAG Explorer",
    status: "published",
  },
];

export function Writing() {
  const [articles, setArticles] = useState<ArticleItem[]>(CURATED_ESSAYS);
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const mediumUsername = "gaganparashar127";

  useGSAP(
    () => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 22 },
          {
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            clearProps: "transform",
          }
        );
      }

      if (gridRef.current) {
        const cards = Array.from(gridRef.current.children);
        gsap.fromTo(
          cards,
          { opacity: 0, y: 28 },
          {
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.12,
            ease: "power3.out",
            clearProps: "transform",
          }
        );
      }
    },
    { scope: sectionRef }
  );

  useEffect(() => {
    async function fetchMediumArticles() {
      try {
        const res = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@${mediumUsername}`
        );
        const data = await res.json();
        if (data.status === "ok" && data.items && data.items.length > 0) {
          const fetched: ArticleItem[] = data.items.slice(0, 3).map((item: { title: string; link: string; pubDate: string; categories?: string[] }) => {
            const existing = CURATED_ESSAYS.find(e => e.title.toLowerCase().includes(item.title.toLowerCase().slice(0, 20)));
            return {
              title: item.title,
              excerpt: existing?.excerpt || "Published on Medium. Click to read the full deep dive with code and benchmarks.",
              readTime: existing?.readTime || "6 min read",
              category: existing?.category || (item.categories?.[0] ? item.categories[0].replace("-", " ") : "AI Engineering"),
              link: item.link,
              date: new Date(item.pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              relatedProject: existing?.relatedProject,
              status: "published" as const,
            };
          });
          if (fetched.length > 0) {
            setArticles(fetched);
          }
        }
      } catch (err) {
        console.log("Using curated technical notebook essays", err);
      }
    }

    fetchMediumArticles();
  }, [mediumUsername]);

  return (
    <section ref={sectionRef} id="writing" className="py-32 bg-transparent section-divider-shimmer relative">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-widest uppercase mb-3">
              <span>[03]</span>
              <span className="w-8 h-px bg-primary/40" />
              <span>{"//"} TECHNICAL WRITING</span>
            </div>
            <h2 className="font-gued font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-text-main tracking-tight leading-[1.12]">
              Thinking <span className="font-serif italic font-normal text-primary tracking-normal">out loud</span> about LLMs<span className="text-primary font-bold">.</span>
            </h2>
          </div>

          <Link
            href={`https://medium.com/@${mediumUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-xs text-primary hover:bg-white transition-colors shadow-2xs"
          >
            <span>Follow on Medium</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Articles Grid with Mouse-Tracking Sheen */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.title}
              data-cursor="read"
              data-cursor-label="READ ↗"
              className="glass-card glass-card-hover glow-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between group relative overflow-hidden will-change-transform select-none"
              style={{
                transform:
                  "perspective(800px) rotateY(var(--card-tilt-y, 0deg)) rotateX(var(--card-tilt-x, 0deg)) scale3d(var(--card-scale, 1), var(--card-scale, 1), 1)",
                transition:
                  "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s, box-shadow 0.2s",
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                e.currentTarget.style.setProperty("--card-tilt-y", `${(x * 7).toFixed(2)}deg`);
                e.currentTarget.style.setProperty("--card-tilt-x", `${(-y * 7).toFixed(2)}deg`);
                e.currentTarget.style.setProperty("--card-scale", "1.012");
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.setProperty("--card-tilt-y", "0deg");
                e.currentTarget.style.setProperty("--card-tilt-x", "0deg");
                e.currentTarget.style.setProperty("--card-scale", "1");
              }}
            >
              {/* Subtle top specular sheen highlight */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none z-20" />

              <div>
                {/* Badge Row */}
                <div className="flex items-center justify-between gap-2 mb-4 font-mono text-[11px]">
                  <span className="glass-pill px-2.5 py-0.5 rounded-full text-primary font-semibold border-primary/20 bg-primary/5">
                    {article.category}
                  </span>
                  <span className="text-text-muted flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-primary/70" />
                    {article.readTime}
                  </span>
                </div>

                {/* Article Title */}
                <h3 className="font-gued font-bold text-lg sm:text-xl text-text-main group-hover:text-primary transition-colors leading-snug mb-3">
                  <Link href={article.link} target="_blank" rel="noopener noreferrer">
                    {article.title}
                  </Link>
                </h3>

                {/* Excerpt */}
                <p className="font-sans text-xs sm:text-sm text-text-muted leading-relaxed mb-6 line-clamp-3">
                  {article.excerpt}
                </p>
              </div>

              {/* Bottom Row */}
              <div className="pt-4 border-t border-white/60 flex flex-col gap-2 font-mono text-xs">
                {article.relatedProject && (
                  <div className="text-[11px] text-primary/90 flex items-center gap-1">
                    <span>→ Related project:</span>
                    <span className="font-bold underline">{article.relatedProject}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-text-muted pt-1">
                  <span className="text-[11px]">{article.date}</span>
                  <Link
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary group-hover:translate-x-0.5 transition-transform font-semibold"
                  >
                    <span>Read</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
