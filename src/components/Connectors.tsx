import type { LayoutNode } from '../types/layout';

interface ConnectorsProps {
  layout: LayoutNode;
}

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function Connectors({ layout }: ConnectorsProps) {
  const lines: Line[] = [];

  function collectLines(node: LayoutNode): void {
    const parentX = node.position.x + node.width / 2;
    const parentY = node.position.y + node.height;

    for (const child of node.children) {
      const childX = child.position.x + child.width / 2;
      const childY = child.position.y;

      lines.push({
        x1: parentX,
        y1: parentY,
        x2: childX,
        y2: childY,
      });

      collectLines(child);
    }
  }

  collectLines(layout);

  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible">
      {lines.map((line, i) => {
        const midY = (line.y1 + line.y2) / 2;
        return (
          <path
            key={i}
            d={`M ${line.x1} ${line.y1} C ${line.x1} ${midY}, ${line.x2} ${midY}, ${line.x2} ${line.y2}`}
            fill="none"
            stroke="#9CA3AF"
            strokeWidth={2}
          />
        );
      })}
    </svg>
  );
}
