/**
 * DragConnect - Collaboration / Alignment Puzzle
 * 
 * DNA Library 3.4: "SVG Canvas with nodes. User draws lines between concepts"
 * Telemetry: Path Deviation - Calculate RMS Error from straight line
 */

import { useState, useRef, useCallback } from 'react';
import { DesignSettings } from '../../template-steps/types';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  group: 'left' | 'right';
}

interface Connection {
  from: string;
  to: string;
}

interface DragConnectProps {
  designSettings: DesignSettings;
  isGhostState: boolean;
  leftNodes?: string[];
  rightNodes?: string[];
  onConnect?: (connections: Connection[]) => void;
  disabled?: boolean;
}

export function DragConnect({
  designSettings,
  isGhostState,
  leftNodes = ['Concept A', 'Concept B', 'Concept C'],
  rightNodes = ['Result 1', 'Result 2', 'Result 3'],
  onConnect,
  disabled = false,
}: DragConnectProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [dragging, setDragging] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Create node positions
  const allNodes: Node[] = [
    ...leftNodes.map((label, i) => ({
      id: `left-${i}`,
      label,
      x: 20,
      y: 20 + i * 35,
      group: 'left' as const,
    })),
    ...rightNodes.map((label, i) => ({
      id: `right-${i}`,
      label,
      x: 180,
      y: 20 + i * 35,
      group: 'right' as const,
    })),
  ];

  const getNodeById = (id: string) => allNodes.find(n => n.id === id);

  const handleNodeMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    if (disabled) return;
    const node = getNodeById(nodeId);
    if (node?.group !== 'left') return; // Only drag from left nodes
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setDragging({
      nodeId,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, [disabled, allNodes]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    setDragging({
      ...dragging,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, [dragging]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!dragging || !svgRef.current) {
      setDragging(null);
      return;
    }
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find if we're over a right node
    const targetNode = allNodes.find(n => 
      n.group === 'right' && 
      Math.abs(n.x + 30 - x) < 30 && 
      Math.abs(n.y + 12 - y) < 20
    );
    
    if (targetNode) {
      // Check if connection already exists
      const existingIdx = connections.findIndex(c => c.from === dragging.nodeId);
      const newConnections = existingIdx >= 0 
        ? connections.map((c, i) => i === existingIdx ? { from: dragging.nodeId, to: targetNode.id } : c)
        : [...connections, { from: dragging.nodeId, to: targetNode.id }];
      
      setConnections(newConnections);
      onConnect?.(newConnections);
    }
    
    setDragging(null);
  }, [dragging, allNodes, connections, onConnect]);

  return (
    <div className="px-4 py-2">
      <p 
        className={`text-xs text-center mb-2 ${isGhostState ? 'opacity-40 italic' : ''}`}
        style={{ color: designSettings.text }}
      >
        Draw lines to connect related concepts
      </p>
      
      <svg 
        ref={svgRef}
        className="w-full h-32 rounded-lg"
        style={{ backgroundColor: `${designSettings.secondary}10` }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setDragging(null)}
      >
        {/* Existing connections */}
        {connections.map(conn => {
          const from = getNodeById(conn.from);
          const to = getNodeById(conn.to);
          if (!from || !to) return null;
          
          return (
            <line
              key={`${conn.from}-${conn.to}`}
              x1={from.x + 60}
              y1={from.y + 12}
              x2={to.x}
              y2={to.y + 12}
              stroke={designSettings.primary}
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}
        
        {/* Dragging line */}
        {dragging && (() => {
          const from = getNodeById(dragging.nodeId);
          if (!from) return null;
          return (
            <line
              x1={from.x + 60}
              y1={from.y + 12}
              x2={dragging.x}
              y2={dragging.y}
              stroke={designSettings.highlight}
              strokeWidth={2}
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
          );
        })()}
        
        {/* Nodes */}
        {allNodes.map(node => (
          <g 
            key={node.id}
            onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
            style={{ cursor: node.group === 'left' && !disabled ? 'grab' : 'default' }}
          >
            <rect
              x={node.x}
              y={node.y}
              width={60}
              height={24}
              rx={12}
              fill={connections.some(c => c.from === node.id || c.to === node.id)
                ? `${designSettings.highlight}40`
                : `${designSettings.background}`
              }
              stroke={designSettings.text}
              strokeWidth={1}
              strokeOpacity={0.3}
            />
            <text
              x={node.x + 30}
              y={node.y + 16}
              textAnchor="middle"
              fill={designSettings.text}
              fontSize={9}
              fontWeight={500}
            >
              {node.label.length > 8 ? node.label.slice(0, 7) + '…' : node.label}
            </text>
          </g>
        ))}
      </svg>
      
      <p 
        className="text-[9px] text-center mt-1 opacity-50"
        style={{ color: designSettings.text }}
      >
        Drag from left nodes to right nodes
      </p>
    </div>
  );
}
