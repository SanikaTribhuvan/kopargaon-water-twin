// HTML5 Canvas Interactive Cascading Failure & Particle Flow Renderer
export class CascadeRenderer {
  constructor(canvasId, onNodeSelected) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.onNodeSelected = onNodeSelected;
    this.nodes = [];
    this.edges = [];
    this.particles = [];
    this.animFrameId = null;
    this.selectedNodeId = null;
    this.hoveredNodeId = null;
    this.isCascading = false;
    this.language = "en";

    this.initEvents();
  }

  setLanguage(lang) {
    this.language = lang;
    this.draw();
  }

  setData(graphData, isCascading = false) {
    this.isCascading = isCascading;
    // Map spatial nodes to canvas coordinates
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Node layout positions normalized to canvas
    const nodeLayout = {
      "NALA_2": { x: width * 0.25, y: height * 0.28 },
      "VALVE_4": { x: width * 0.52, y: height * 0.25 },
      "SLUM_DRAIN": { x: width * 0.22, y: height * 0.68 },
      "ESR_2": { x: width * 0.65, y: height * 0.60 },
      "HOSP_LINE": { x: width * 0.88, y: height * 0.65 },
      "RIVER_INTAKE": { x: width * 0.12, y: height * 0.45 },
      "ROAD_SUBHASH": { x: width * 0.48, y: height * 0.75 },
      "TANKER_DEPOT": { x: width * 0.82, y: height * 0.30 }
    };

    this.nodes = graphData.nodes.map(n => ({
      ...n,
      x: nodeLayout[n.id]?.x || width * 0.5,
      y: nodeLayout[n.id]?.y || height * 0.5,
      radius: n.id === "NALA_2" || n.id === "VALVE_4" || n.id === "HOSP_LINE" ? 32 : 26
    }));

    this.edges = graphData.edges.map(e => {
      const fromNode = this.nodes.find(n => n.id === e.from);
      const toNode = this.nodes.find(n => n.id === e.to);
      return {
        ...e,
        fromNode,
        toNode
      };
    });

    if (isCascading) {
      this.spawnCascadeParticles();
    } else {
      this.particles = [];
    }

    this.startAnimation();
  }

  spawnCascadeParticles() {
    this.particles = [];
    this.edges.forEach(edge => {
      if (edge.fromNode.riskScore > 50) {
        for (let i = 0; i < 4; i++) {
          this.particles.push({
            edge,
            progress: (i / 4) + Math.random() * 0.1,
            speed: 0.008 + (edge.probability * 0.006),
            size: 4 + Math.random() * 3,
            color: edge.fromNode.riskScore > 75 ? '#ef4444' : '#f59e0b'
          });
        }
      }
    });
  }

  initEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      let found = null;
      for (const node of this.nodes) {
        const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
        if (dist < node.radius) {
          found = node.id;
          break;
        }
      }

      if (this.hoveredNodeId !== found) {
        this.hoveredNodeId = found;
        this.canvas.style.cursor = found ? 'pointer' : 'default';
      }
    });

    this.canvas.addEventListener('click', () => {
      if (this.hoveredNodeId) {
        this.selectedNodeId = this.hoveredNodeId;
        if (this.onNodeSelected) {
          const node = this.nodes.find(n => n.id === this.selectedNodeId);
          this.onNodeSelected(node);
        }
      } else {
        this.selectedNodeId = null;
      }
    });
  }

  startAnimation() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const animate = () => {
      this.updateParticles();
      this.draw();
      this.animFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  updateParticles() {
    for (const p of this.particles) {
      p.progress += p.speed;
      if (p.progress >= 1.0) {
        p.progress = 0;
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }

    // Draw Edges
    this.edges.forEach(edge => {
      if (!edge.fromNode || !edge.toNode) return;
      const isHighlighted = (this.selectedNodeId === edge.from || this.selectedNodeId === edge.to);
      const isCritical = edge.fromNode.riskScore > 75;

      ctx.beginPath();
      ctx.moveTo(edge.fromNode.x, edge.fromNode.y);
      ctx.lineTo(edge.toNode.x, edge.toNode.y);

      if (isCritical) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([6, 6]);
      } else if (isHighlighted) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw arrow head
      const angle = Math.atan2(edge.toNode.y - edge.fromNode.y, edge.toNode.x - edge.fromNode.x);
      const arrowDist = edge.toNode.radius + 6;
      const arrowX = edge.toNode.x - Math.cos(angle) * arrowDist;
      const arrowY = edge.toNode.y - Math.sin(angle) * arrowDist;

      ctx.save();
      ctx.translate(arrowX, arrowY);
      ctx.rotate(angle);
      ctx.fillStyle = isCritical ? '#ef4444' : (isHighlighted ? '#38bdf8' : '#94a3b8');
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-8, -5);
      ctx.lineTo(-8, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // Draw Animated Flow Particles
    this.particles.forEach(p => {
      if (!p.edge.fromNode || !p.edge.toNode) return;
      const x = p.edge.fromNode.x + (p.edge.toNode.x - p.edge.fromNode.x) * p.progress;
      const y = p.edge.fromNode.y + (p.edge.toNode.y - p.edge.fromNode.y) * p.progress;

      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw Nodes
    const time = Date.now() * 0.003;
    this.nodes.forEach(node => {
      const isSelected = this.selectedNodeId === node.id;
      const isHovered = this.hoveredNodeId === node.id;
      const isCritical = node.riskScore > 75;
      const isWarning = node.riskScore > 45 && !isCritical;

      let baseColor = '#10b981'; // Green
      if (isCritical) baseColor = '#ef4444'; // Red
      else if (isWarning) baseColor = '#f59e0b'; // Amber

      // Outer pulse ring if critical
      if (isCritical) {
        const pulseR = node.radius + 6 + Math.sin(time + node.x) * 5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Node background
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#1e293b' : '#0f172a';
      ctx.fill();
      ctx.lineWidth = isSelected ? 4 : (isHovered ? 3 : 2);
      ctx.strokeStyle = baseColor;
      ctx.stroke();

      // Inner icon or score
      ctx.fillStyle = baseColor;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${node.riskScore}%`, node.x, node.y - 3);

      // Node Label Below
      const labelText = this.language === "mr" ? (node.labelMr || node.label) : node.label;
      ctx.fillStyle = '#f8fafc';
      ctx.font = isSelected ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif';
      ctx.fillText(labelText.length > 22 ? labelText.slice(0, 20) + '..' : labelText, node.x, node.y + node.radius + 14);

      // Ward tag
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText(`(${node.ward})`, node.x, node.y + node.radius + 25);
    });
  }
}
