import type { LayoutNode } from '../types/layout';

interface ConnectorsProps {
  layout: LayoutNode;
}

interface Connection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function Connectors({ layout }: ConnectorsProps) {
  const connections: Connection[] = [];

  function collectConnections(node: LayoutNode): void {
    const parentX = node.position.x + node.width / 2;
    const parentY = node.position.y + node.height;

    for (const child of node.children) {
      const childX = child.position.x + child.width / 2;
      const childY = child.position.y;

      connections.push({
        x1: parentX,
        y1: parentY,
        x2: childX,
        y2: childY,
      });

      collectConnections(child);
    }
  }

  collectConnections(layout);

  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
        </marker>
      </defs>
      {connections.map((conn, i) => {
        // Calculate control points for smooth bezier curve
        const deltaY = conn.y2 - conn.y1;
        const controlOffset = Math.min(deltaY * 0.5, 30);

        const path = `M ${conn.x1} ${conn.y1}
          C ${conn.x1} ${conn.y1 + controlOffset},
            ${conn.x2} ${conn.y2 - controlOffset},
            ${conn.x2} ${conn.y2}`;

        return (
          <path
            key={i}
            d={path}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth={2}
            markerEnd="url(#arrowhead)"
          />
        );
      })}
    </svg>
  );
}
