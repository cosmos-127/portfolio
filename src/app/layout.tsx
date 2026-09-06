import type { Metadata } from "next";
import { Instrument_Serif, JetBrains_Mono, Plus_Jakarta_Sans, Syne } from "next/font/google";
import { SmoothScrollProvider } from "@/components/global/SmoothScroll";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cosmos127.dev"),
  title: "Gagan — Generalist AI Engineer | Agents, LLMs & Production Systems",
  description:
    "Portfolio of Gagan, an AI Engineer specializing in compound AI architectures, autonomous agent workflows (LangGraph, ReWOO, ReAct), GraphRAG, Model Context Protocol (MCP), and production model serving with vLLM.",
  keywords: [
    "AI Engineer",
    "LLMOps",
    "Autonomous Agents",
    "LangGraph",
    "GraphRAG",
    "Model Context Protocol",
    "MCP",
    "vLLM Production Serving",
    "ReWOO",
    "ReAct",
    "Trino SQL",
    "Neo4j Knowledge Graph",
    "FastMCP",
    "Gagan",
  ],
  authors: [{ name: "Gagan", url: "https://github.com/cosmos-127" }],
  creator: "Gagan",
  openGraph: {
    title: "Gagan — Generalist AI Engineer | Agents, LLMs & Production Systems",
    description:
      "Building AI systems that reason, retrieve & act. Compound AI systems, agentic workflows, GraphRAG, MCP, and high-throughput vLLM serving.",
    url: "https://cosmos127.dev",
    siteName: "Gagan — AI Engineer",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gagan — Generalist AI Engineer | Agents, LLMs & Production Systems",
    description:
      "Building AI systems that reason, retrieve & act. Compound AI systems, agentic workflows, GraphRAG, MCP, and high-throughput vLLM serving.",
    creator: "@cosmos_127",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://cosmos127.dev/#person",
      "name": "Gagan",
      "jobTitle": "AI Engineer",
      "worksFor": {
        "@type": "Organization",
        "name": "Strategy",
      },
      "alumniOf": {
        "@type": "EducationalOrganization",
        "name": "Vellore Institute of Technology",
      },
      "description":
        "AI Engineer specializing in compound AI architectures, autonomous agent workflows (LangGraph, ReWOO, ReAct), GraphRAG, Model Context Protocol (MCP), and production model serving with vLLM.",
      "url": "https://cosmos127.dev",
      "sameAs": [
        "https://github.com/cosmos-127",
        "https://www.linkedin.com/in/gagan-parashar/",
        "https://medium.com/@gaganparashar127",
      ],
      "knowsAbout": [
        "Artificial Intelligence",
        "Large Language Models",
        "LLMOps",
        "vLLM Serving",
        "LangGraph",
        "GraphRAG",
        "Model Context Protocol",
        "Multi-Agent Systems",
        "Neo4j",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://cosmos127.dev/#website",
      "url": "https://cosmos127.dev",
      "name": "Gagan — Generalist AI Engineer",
      "publisher": {
        "@id": "https://cosmos127.dev/#person",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${plusJakartaSans.variable} antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans text-text-main bg-background selection:bg-primary selection:text-white">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
