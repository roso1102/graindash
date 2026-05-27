"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { GraphNode, GraphLink } from "@/types";

interface MiniGraphProps {
  centerNodeId: string;
  nodes: GraphNode[];
  links: GraphLink[];
  width?: number;
  height?: number;
}

const TOPIC_COLORS = [
  "#d4a574", "#58a6ff", "#3fb950", "#e5534b", "#d29922",
  "#8b5cf6", "#f472b6", "#06b6d4", "#84cc16", "#f97316",
];

export default function MiniGraph({ centerNodeId, nodes, links, width = 300, height = 200 }: MiniGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const topicColorMap = new Map<string, string>();
    let colorIdx = 0;
    nodes.forEach((n) => {
      if (!topicColorMap.has(n.topic_name)) {
        topicColorMap.set(n.topic_name, TOPIC_COLORS[colorIdx % TOPIC_COLORS.length]);
        colorIdx++;
      }
    });

    // Simple radial layout centered on the center node
    const positions = new Map<string, { x: number; y: number }>();
    const cx = width / 2;
    const cy = height / 2;
    positions.set(centerNodeId, { x: cx, y: cy });

    const neighbors = nodes.filter((n) => n.id !== centerNodeId);
    const radius = Math.min(width, height) * 0.35;
    neighbors.forEach((n, i) => {
      const angle = (i / neighbors.length) * 2 * Math.PI - Math.PI / 2;
      positions.set(n.id, {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      });
    });

    // Draw links
    for (const link of links) {
      const a = positions.get(link.source);
      const b = positions.get(link.target);
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = "#666";
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw nodes
    ctx.textAlign = "center";
    ctx.font = "9px -apple-system, BlinkMacSystemFont, sans-serif";
    for (const node of nodes) {
      const pos = positions.get(node.id);
      if (!pos) continue;
      const isCenter = node.id === centerNodeId;
      const connections = links.filter((l) => l.source === node.id || l.target === node.id).length;
      const r = isCenter ? 6 : Math.min(3 + connections, 6);
      const color = topicColorMap.get(node.topic_name) || "#666";

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = isCenter ? 1 : 0.7;
      ctx.fill();

      if (isCenter) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Label
      const label = node.title.length > 15 ? node.title.slice(0, 13) + "…" : node.title;
      ctx.fillStyle = "#e0e0e0";
      ctx.globalAlpha = 0.8;
      ctx.fillText(label, pos.x, pos.y + r + 10);
      ctx.globalAlpha = 1;
    }
  }, [centerNodeId, nodes, links, width, height]);

  if (nodes.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-text-primary mb-3">🕸️ Connections</h2>
      <div className="bg-surface border border-border rounded-lg p-4 flex justify-center">
        <canvas
          ref={canvasRef}
          style={{ width, height, cursor: "pointer" }}
          className="rounded"
          onClick={() => router.push(`/graph?highlight=${centerNodeId}`)}
        />
      </div>
    </div>
  );
}
