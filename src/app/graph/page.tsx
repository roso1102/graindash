"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getGraphData } from "@/lib/api";
import type { GraphData, GraphNode } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

const TOPIC_COLORS = [
  "#d4a574", "#58a6ff", "#3fb950", "#e5534b", "#d29922",
  "#8b5cf6", "#f472b6", "#06b6d4", "#84cc16", "#f97316",
];

const RELATION_COLORS: Record<string, string> = {
  extends: "#d4a574",
  related_to: "#58a6ff",
  contradicts: "#e5534b",
  depends_on: "#3fb950",
};

interface DragState {
  dragging: string | null;
  offsetX: number;
  offsetY: number;
}

interface ViewTransform {
  x: number;
  y: number;
  scale: number;
}

export default function GraphPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [view, setView] = useState<ViewTransform>({ x: 0, y: 0, scale: 1 });
  const [drag, setDrag] = useState<DragState>({ dragging: null, offsetX: 0, offsetY: 0 });
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState<string[]>([]);
  const [relationFilter, setRelationFilter] = useState<string[]>([]);

  const nodePositions = useRef<Map<string, { x: number; y: number; vx: number; vy: number }>>(new Map());
  const lastClickRef = useRef<{ id: string; time: number } | null>(null);
  const settledRef = useRef(false);
  const needsRenderRef = useRef(true);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: GraphNode } | null>(null);

  useEffect(() => {
    getGraphData()
      .then((d) => {
        setData(d);
        const positions = new Map<string, { x: number; y: number; vx: number; vy: number }>();
        d.nodes.forEach((n, i) => {
          const angle = (i / d.nodes.length) * 2 * Math.PI;
          const radius = 200 + Math.random() * 100;
          positions.set(n.id, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, vx: 0, vy: 0 });
        });
        nodePositions.current = positions;
        settledRef.current = false;
        needsRenderRef.current = true;

        const highlightId = searchParams.get("highlight");
        if (highlightId) {
          const node = d.nodes.find((n) => n.id === highlightId);
          if (node) {
            setSelectedNode(node);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]);

  const simulate = useCallback((): number => {
    if (!data) return 0;
    const nodes = data.nodes;
    const links = data.links;
    const positions = nodePositions.current;

    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = positions.get(nodes[i].id)!;
        const b = positions.get(nodes[j].id)!;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 800 / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx -= fx; a.vy -= fy;
        b.vx += fx; b.vy += fy;
      }
    }

    // Attraction
    for (const link of links) {
      const a = positions.get(link.source);
      const b = positions.get(link.target);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - 100) * 0.005;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx; a.vy += fy;
      b.vx -= fx; b.vy -= fy;
    }

    // Center gravity
    for (const n of nodes) {
      const pos = positions.get(n.id)!;
      pos.vx -= pos.x * 0.001;
      pos.vy -= pos.y * 0.001;
    }

    // Apply velocity and track energy
    let energy = 0;
    for (const n of nodes) {
      if (drag.dragging === n.id) continue;
      const pos = positions.get(n.id)!;
      pos.vx *= 0.9;
      pos.vy *= 0.9;
      pos.x += pos.vx;
      pos.y += pos.vy;
      energy += pos.vx * pos.vx + pos.vy * pos.vy;
    }
    return energy;
  }, [data, drag.dragging]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w / 2 + view.x, h / 2 + view.y);
    ctx.scale(view.scale, view.scale);

    const topicColorMap = new Map<string, string>();
    let colorIdx = 0;
    data.nodes.forEach((n) => {
      if (!topicColorMap.has(n.topic_name)) {
        topicColorMap.set(n.topic_name, TOPIC_COLORS[colorIdx % TOPIC_COLORS.length]);
        colorIdx++;
      }
    });

    // Draw links
    for (const link of data.links) {
      if (relationFilter.length > 0 && !relationFilter.includes(link.relation_type)) continue;
      const source = nodePositions.current.get(link.source);
      const target = nodePositions.current.get(link.target);
      if (!source || !target) continue;

      const isHighlighted = hoveredNode === link.source || hoveredNode === link.target;
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = RELATION_COLORS[link.relation_type] || "#666";
      ctx.globalAlpha = isHighlighted ? 0.8 : 0.2;
      ctx.lineWidth = 1 + link.score * 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw nodes
    ctx.font = "10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    for (const node of data.nodes) {
      if (topicFilter.length > 0 && !topicFilter.includes(node.topic_name)) continue;
      const pos = nodePositions.current.get(node.id);
      if (!pos) continue;

      const isHovered = hoveredNode === node.id;
      const isSelected = selectedNode?.id === node.id;
      const connections = data.links.filter((l) => l.source === node.id || l.target === node.id).length;
      const radius = Math.min(4 + connections * 1.5, 10);
      const color = topicColorMap.get(node.topic_name) || "#666";

      const matchesSearch = searchQuery && (node.title.toLowerCase().includes(searchQuery.toLowerCase()) || node.topic_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const nodeAlpha = isHovered || isSelected ? 1 : searchQuery && !matchesSearch ? 0.1 : 0.6;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = nodeAlpha;
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw node label
      if (nodeAlpha > 0.3 && (view.scale > 0.5 || isHovered || isSelected)) {
        const label = node.title.length > 20 ? node.title.slice(0, 18) + "…" : node.title;
        ctx.fillStyle = "#e0e0e0";
        ctx.globalAlpha = nodeAlpha * 0.9;
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 3;
        ctx.fillText(label, pos.x, pos.y + radius + 12);
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }, [data, view, hoveredNode, selectedNode, searchQuery, topicFilter, relationFilter]);

  useEffect(() => {
    let frame: number;
    const loop = () => {
      if (!settledRef.current || needsRenderRef.current) {
        const energy = simulate();
        draw();
        needsRenderRef.current = false;
        if (energy < 0.01 && !drag.dragging) {
          settledRef.current = true;
        }
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [draw, simulate, drag.dragging]);

  // Mark needs render when filters/search change
  useEffect(() => {
    needsRenderRef.current = true;
    settledRef.current = false;
  }, [searchQuery, topicFilter, relationFilter]);

  // Draw minimap
  useEffect(() => {
    const canvas = minimapRef.current;
    if (!canvas || !data || data.nodes.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mw = 150;
    const mh = 150;
    canvas.width = mw * window.devicePixelRatio;
    canvas.height = mh * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, mw, mh);
    ctx.fillStyle = "rgba(18, 18, 18, 0.85)";
    ctx.fillRect(0, 0, mw, mh);

    // Find bounds
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of data.nodes) {
      const pos = nodePositions.current.get(n.id);
      if (!pos) continue;
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    }
    const pad = 50;
    minX -= pad; maxX += pad; minY -= pad; maxY += pad;
    const scaleX = mw / (maxX - minX || 1);
    const scaleY = mh / (maxY - minY || 1);
    const scale = Math.min(scaleX, scaleY);
    const ox = (mw - (maxX - minX) * scale) / 2;
    const oy = (mh - (maxY - minY) * scale) / 2;

    // Draw edges
    ctx.strokeStyle = "#666";
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 0.5;
    for (const link of data.links) {
      const a = nodePositions.current.get(link.source);
      const b = nodePositions.current.get(link.target);
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(ox + (a.x - minX) * scale, oy + (a.y - minY) * scale);
      ctx.lineTo(ox + (b.x - minX) * scale, oy + (b.y - minY) * scale);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Draw nodes
    for (const node of data.nodes) {
      const pos = nodePositions.current.get(node.id);
      if (!pos) continue;
      ctx.beginPath();
      ctx.arc(ox + (pos.x - minX) * scale, oy + (pos.y - minY) * scale, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = selectedNode?.id === node.id ? "#d4a574" : "#888";
      ctx.fill();
    }

    // Draw viewport rectangle
    const mainCanvas = canvasRef.current;
    if (mainCanvas) {
      const cw = mainCanvas.offsetWidth;
      const ch = mainCanvas.offsetHeight;
      const vx1 = ox + (-view.x - cw / 2 / view.scale - minX) * scale;
      const vy1 = oy + (-view.y - ch / 2 / view.scale - minY) * scale;
      const vx2 = ox + (-view.x + cw / 2 / view.scale - minX) * scale;
      const vy2 = oy + (-view.y + ch / 2 / view.scale - minY) * scale;
      ctx.strokeStyle = "#d4a574";
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;
      ctx.strokeRect(vx1, vy1, vx2 - vx1, vy2 - vy1);
      ctx.globalAlpha = 1;
    }
  }, [data, view, selectedNode]);

  const getNodeAtPosition = (clientX: number, clientY: number): GraphNode | null => {
    if (!data || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = (clientX - rect.left - rect.width / 2 - view.x) / view.scale;
    const my = (clientY - rect.top - rect.height / 2 - view.y) / view.scale;

    for (const node of data.nodes) {
      const pos = nodePositions.current.get(node.id);
      if (!pos) continue;
      const dx = pos.x - mx;
      const dy = pos.y - my;
      const connections = data.links.filter((l) => l.source === node.id || l.target === node.id).length;
      const radius = Math.min(4 + connections * 1.5, 10) + 4;
      if (dx * dx + dy * dy < radius * radius) return node;
    }
    return null;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const node = getNodeAtPosition(e.clientX, e.clientY);
    if (node) {
      setContextMenu({ x: e.clientX, y: e.clientY, node });
    } else {
      setContextMenu(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) return; // right-click handled by context menu
    setContextMenu(null);
    const node = getNodeAtPosition(e.clientX, e.clientY);
    if (node) {
      // Double-click detection
      const now = Date.now();
      if (lastClickRef.current && lastClickRef.current.id === node.id && now - lastClickRef.current.time < 400) {
        router.push(`/notes/${node.id}`);
        lastClickRef.current = null;
        return;
      }
      lastClickRef.current = { id: node.id, time: now };

      setDrag({ dragging: node.id, offsetX: 0, offsetY: 0 });
      setSelectedNode(node);
      settledRef.current = false;
      needsRenderRef.current = true;
    } else {
      setPanning(true);
      setPanStart({ x: e.clientX - view.x, y: e.clientY - view.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (drag.dragging) {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left - rect.width / 2 - view.x) / view.scale;
      const my = (e.clientY - rect.top - rect.height / 2 - view.y) / view.scale;
      const pos = nodePositions.current.get(drag.dragging)!;
      pos.x = mx;
      pos.y = my;
      pos.vx = 0;
      pos.vy = 0;
      needsRenderRef.current = true;
    } else if (panning) {
      setView((v) => ({
        ...v,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      }));
    } else {
      const node = getNodeAtPosition(e.clientX, e.clientY);
      setHoveredNode(node?.id || null);
    }
  };

  const handleMouseUp = () => {
    setDrag({ dragging: null, offsetX: 0, offsetY: 0 });
    setPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setView((v) => ({ ...v, scale: Math.max(0.1, Math.min(5, v.scale * delta)) }));
  };

  const allTopics = data ? [...new Set(data.nodes.map((n) => n.topic_name))] : [];
  const allRelations = data ? [...new Set(data.links.map((l) => l.relation_type))] : [];

  if (loading) return <div className="flex items-center justify-center h-screen"><LoadingSpinner size="lg" /></div>;
  if (!data || data.nodes.length === 0) return <EmptyState icon="🕸️" title="No connections yet" description="Capture more notes to build your knowledge graph." />;

  return (
    <div className="h-screen flex flex-col -mx-6 -my-6">
      <div className="shrink-0 bg-surface border-b border-border px-4 py-2 flex items-center gap-4 z-10">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search nodes..."
          className="bg-bg-page border border-border rounded-md px-3 py-1.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent w-48"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Topics:</span>
          {allTopics.map((t) => (
            <button
              key={t}
              onClick={() => setTopicFilter((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])}
              className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                topicFilter.includes(t) ? "bg-accent text-bg-page" : "bg-surface border border-border text-text-secondary hover:text-text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Relations:</span>
          {allRelations.map((r) => (
            <button
              key={r}
              onClick={() => setRelationFilter((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r])}
              className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                relationFilter.includes(r) ? "bg-info text-bg-page" : "bg-surface border border-border text-text-secondary hover:text-text-primary"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <button
          onClick={() => setView({ x: 0, y: 0, scale: 1 })}
          className="text-xs px-3 py-1.5 bg-surface border border-border rounded-md text-text-secondary hover:text-text-primary transition-colors ml-auto"
        >
          Reset View
        </button>
      </div>

      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onContextMenu={handleContextMenu}
        />

        {/* Minimap */}
        <canvas
          ref={minimapRef}
          className="absolute bottom-4 border border-border rounded-md pointer-events-none"
          style={{ width: 150, height: 150, right: selectedNode ? 370 : 16 }}
        />

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="fixed z-50 bg-surface border border-border rounded-lg shadow-lg py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => { setSelectedNode(contextMenu.node); setContextMenu(null); }}
              className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
            >
              Select Node
            </button>
            <button
              onClick={() => { router.push(`/notes/${contextMenu.node.id}`); setContextMenu(null); }}
              className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
            >
              View Note
            </button>
            <button
              onClick={() => {
                const pos = nodePositions.current.get(contextMenu.node.id);
                if (pos) {
                  const canvas = canvasRef.current;
                  if (canvas) {
                    setView({ x: -pos.x, y: -pos.y, scale: 1.5 });
                  }
                }
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
            >
              Center on Node
            </button>
            <hr className="border-border my-1" />
            <button
              onClick={() => setContextMenu(null)}
              className="w-full text-left px-4 py-2 text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {selectedNode && (
          <div className="absolute right-0 top-0 bottom-0 w-[350px] bg-surface border-l border-border p-5 overflow-y-auto">
            <button
              onClick={() => setSelectedNode(null)}
              className="text-text-muted hover:text-text-primary mb-3 block"
            >
              ✕
            </button>
            <h3 className="text-base font-semibold text-text-primary mb-1">{selectedNode.title}</h3>
            <p className="text-xs text-text-muted mb-4">📂 {selectedNode.topic_name}</p>
            <div className="text-xs text-text-secondary mb-4">
              {data.links.filter((l) => l.source === selectedNode.id || l.target === selectedNode.id).length} connections
            </div>
            <Link
              href={`/notes/${selectedNode.id}`}
              className="block w-full text-center px-4 py-2 bg-accent text-bg-page rounded-md text-sm font-semibold hover:bg-accent-hover transition-colors no-underline"
            >
              View Note
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
