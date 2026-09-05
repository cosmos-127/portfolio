export const dynamic = "force-static";

export async function GET() {
  return Response.json(
    {
      name: "Gagan",
      role: "Generalist AI Engineer",
      specialization: "Compound AI Systems, Autonomous Agents, GraphRAG & LLMOps",
      bio: "Building AI systems that reason, retrieve & act. Specializing in compound AI architectures, autonomous agent workflows (LangGraph, ReWOO, ReAct), GraphRAG, Model Context Protocol (MCP), and production model serving with vLLM.",
      status: "Available for roles",
      responseTime: "< 2 Hours",
      location: "Pune, MH, India · Remote Worldwide",
      timezone: "Asia/Kolkata (IST / UTC+5:30)",
      contact: {
        email: "cosmos.dev.127@gmail.com",
        github: "https://github.com/cosmos-127",
        linkedin: "https://linkedin.com/in/gagan-parashar",
        medium: "https://medium.com/@gaganparashar127",
        website: "https://cosmos127.dev",
      },
      skills: [
        "Autonomous Agents (LangGraph, ReWOO, ReAct)",
        "Knowledge Systems (GraphRAG, Neo4j, Hybrid Vector Search)",
        "Inference & Serving (vLLM, Quantization, TTFT Optimization, FastAPI, Docker)",
        "Protocols & Data (Model Context Protocol / MCP, FastMCP, Trino SQL Federation)",
      ],
      projects: [
        {
          name: "LLMark",
          category: "Inference Benchmarking",
          description: "Load profiler for LLM endpoints measuring TTFT, throughput, and tail latencies on vLLM",
          deployment: "https://llmark.netlify.app/",
          github: "https://github.com/cosmos-127/llmark",
        },
        {
          name: "MCP Tool Server",
          category: "Agent Tooling",
          description: "Production MCP server giving agents standardized, typed tool access across APIs and databases",
          github: "https://github.com/cosmos-127/mcp-server",
        },
        {
          name: "GraphRAG Explorer",
          category: "Knowledge Retrieval",
          description: "Hybrid retrieval engine combining Neo4j knowledge graphs with vector search for multi-hop queries",
          github: "https://github.com/cosmos-127/graphrag-explorer",
        },
        {
          name: "Federated AI Analyst",
          category: "Multi-Agent Analytics",
          description: "Multi-agent system running ReWOO workflows and federated SQL via Trino",
          github: "https://github.com/cosmos-127/federated-analyst",
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
