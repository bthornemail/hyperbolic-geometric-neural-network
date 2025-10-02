/**
 * Geometric Visualization System for H²GNN
 * 
 * Implements real-time visualization of hyperbolic geometry including:
 * - Poincaré Disk Model
 * - Hyperbolic Tilings {5,3} and {3,5}
 * - Geodesic paths
 * - Interactive exploration
 */

import { HyperbolicArithmetic, Vector, createVector } from '../math/hyperbolic-arithmetic';

export interface VisualizationConfig {
  canvas: HTMLCanvasElement;
  width?: number;
  height?: number;
  model?: 'poincare-disk' | 'klein-disk' | 'upper-half-plane';
  tiling?: '{5,3}' | '{3,5}' | 'none';
  showGeodesics?: boolean;
  showGrid?: boolean;
  backgroundColor?: string;
  pointColor?: string;
  edgeColor?: string;
  geodesicColor?: string;
  tilingColor?: string;
  pointRadius?: number;
  lineWidth?: number;
  animationSpeed?: number;
}

export interface VisualizationPoint {
  position: Vector;
  label?: string;
  color?: string;
  radius?: number;
  highlight?: boolean;
}

export interface VisualizationEdge {
  from: number;
  to: number;
  color?: string;
  width?: number;
  style?: 'solid' | 'dashed' | 'dotted';
}

/**
 * Main Geometric Visualizer Class
 */
export class GeometricVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: Required<VisualizationConfig>;
  
  // Visualization state
  private points: VisualizationPoint[] = [];
  private edges: VisualizationEdge[] = [];
  private geodesics: [Vector, Vector][] = [];
  private animationFrame?: number;
  
  // Interaction state
  private isDragging = false;
  private dragPoint?: number;
  private mousePos = { x: 0, y: 0 };
  private zoom = 1.0;
  private center = { x: 0, y: 0 };
  
  constructor(config: VisualizationConfig) {
    this.canvas = config.canvas;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D rendering context');
    }
    this.ctx = ctx;
    
    this.config = {
      width: 800,
      height: 800,
      model: 'poincare-disk',
      tiling: '{5,3}',
      showGeodesics: true,
      showGrid: false,
      backgroundColor: '#000011',
      pointColor: '#00ff88',
      edgeColor: '#4488ff',
      geodesicColor: '#ff8844',
      tilingColor: '#333355',
      pointRadius: 4,
      lineWidth: 2,
      animationSpeed: 1.0,
      ...config
    };
    
    this.setupCanvas();
    this.setupEventListeners();
    this.startAnimation();
  }

  private setupCanvas(): void {
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;
    this.canvas.style.width = `${this.config.width}px`;
    this.canvas.style.height = `${this.config.height}px`;
    
    // Enable high DPI rendering
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.config.width * dpr;
    this.canvas.height = this.config.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  private setupEventListeners(): void {
    // Mouse interaction for exploring hyperbolic space
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this.onWheel.bind(this));
    
    // Touch support for mobile
    this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
  }

  /**
   * Render embeddings from H²GNN
   */
  renderEmbeddings(embeddings: Vector[], edges?: [number, number][]): void {
    this.points = embeddings.map((embedding, i) => ({
      position: embedding,
      label: `Node ${i}`,
      color: this.config.pointColor,
      radius: this.config.pointRadius
    }));
    
    if (edges) {
      this.edges = edges.map(([from, to]) => ({
        from,
        to,
        color: this.config.edgeColor,
        width: this.config.lineWidth
      }));
    }
    
    this.render();
  }

  /**
   * Add geodesic path between two points
   */
  addGeodesic(from: Vector, to: Vector): void {
    this.geodesics.push([from, to]);
  }

  /**
   * Clear all geodesics
   */
  clearGeodesics(): void {
    this.geodesics = [];
  }

  /**
   * Main rendering function
   */
  private render(): void {
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, this.config.width, this.config.height);
    
    // Render in order: tiling -> grid -> geodesics -> edges -> points
    if (this.config.tiling !== 'none') {
      this.renderTiling();
    }
    
    if (this.config.showGrid) {
      this.renderHyperbolicGrid();
    }
    
    if (this.config.showGeodesics) {
      this.renderGeodesics();
    }
    
    this.renderEdges();
    this.renderPoints();
    
    // Render UI elements
    this.renderUI();
  }

  /**
   * Render hyperbolic tiling
   */
  private renderTiling(): void {
    this.ctx.strokeStyle = this.config.tilingColor;
    this.ctx.lineWidth = 1;
    
    if (this.config.tiling === '{5,3}') {
      this.render53Tiling();
    } else if (this.config.tiling === '{3,5}') {
      this.render35Tiling();
    }
  }

  /**
   * Render {5,3} tiling (5 triangles meet at each vertex)
   */
  private render53Tiling(): void {
    const numRings = 3;
    const centerRadius = 0.1;
    
    // Central pentagon
    this.drawHyperbolicPolygon(
      createVector([0, 0]),
      centerRadius,
      5
    );
    
    // Surrounding rings
    for (let ring = 1; ring <= numRings; ring++) {
      const numPentagons = 5 * ring;
      const ringRadius = centerRadius * Math.pow(1.618, ring); // Golden ratio scaling
      
      for (let i = 0; i < numPentagons; i++) {
        const angle = (2 * Math.PI * i) / numPentagons;
        const center = this.hyperbolicPolarToCartesian(ringRadius, angle);
        
        if (HyperbolicArithmetic.norm(center) < 0.95) {
          this.drawHyperbolicPolygon(center, centerRadius * 0.8, 5);
        }
      }
    }
  }

  /**
   * Render {3,5} tiling (3 pentagons meet at each vertex)
   */
  private render35Tiling(): void {
    const numRings = 4;
    const centerRadius = 0.15;
    
    // Central triangle
    this.drawHyperbolicPolygon(
      createVector([0, 0]),
      centerRadius,
      3
    );
    
    // Surrounding rings
    for (let ring = 1; ring <= numRings; ring++) {
      const numTriangles = 3 * ring * 2;
      const ringRadius = centerRadius * Math.pow(1.732, ring); // √3 scaling
      
      for (let i = 0; i < numTriangles; i++) {
        const angle = (2 * Math.PI * i) / numTriangles;
        const center = this.hyperbolicPolarToCartesian(ringRadius, angle);
        
        if (HyperbolicArithmetic.norm(center) < 0.95) {
          this.drawHyperbolicPolygon(center, centerRadius * 0.7, 3);
        }
      }
    }
  }

  /**
   * Draw hyperbolic polygon
   */
  private drawHyperbolicPolygon(center: Vector, radius: number, sides: number): void {
    this.ctx.beginPath();
    
    for (let i = 0; i <= sides; i++) {
      const angle = (2 * Math.PI * i) / sides;
      const localPoint = createVector([
        radius * Math.cos(angle),
        radius * Math.sin(angle)
      ]);
      
      // Transport to center using parallel transport
      const worldPoint = HyperbolicArithmetic.mobiusAdd(center, localPoint);
      const screenPoint = this.hyperbolicToScreen(worldPoint);
      
      if (i === 0) {
        this.ctx.moveTo(screenPoint.x, screenPoint.y);
      } else {
        this.ctx.lineTo(screenPoint.x, screenPoint.y);
      }
    }
    
    this.ctx.stroke();
  }

  /**
   * Convert hyperbolic polar coordinates to Cartesian
   */
  private hyperbolicPolarToCartesian(r: number, theta: number): Vector {
    // In hyperbolic space, use tanh for radial coordinate
    const hyperbolicR = Math.tanh(r);
    return createVector([
      hyperbolicR * Math.cos(theta),
      hyperbolicR * Math.sin(theta)
    ]);
  }

  /**
   * Render hyperbolic grid
   */
  private renderHyperbolicGrid(): void {
    this.ctx.strokeStyle = this.config.tilingColor;
    this.ctx.lineWidth = 0.5;
    
    const gridSize = 0.2;
    
    // Radial lines
    for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 8) {
      this.drawHyperbolicLine(
        createVector([0, 0]),
        createVector([0.95 * Math.cos(angle), 0.95 * Math.sin(angle)])
      );
    }
    
    // Concentric circles (hyperbolic circles are Euclidean circles in Poincaré disk)
    for (let r = gridSize; r < 1.0; r += gridSize) {
      this.ctx.beginPath();
      const screenCenter = this.hyperbolicToScreen(createVector([0, 0]));
      const screenRadius = r * this.config.width / 2 * this.zoom;
      this.ctx.arc(screenCenter.x, screenCenter.y, screenRadius, 0, 2 * Math.PI);
      this.ctx.stroke();
    }
  }

  /**
   * Render geodesic paths
   */
  private renderGeodesics(): void {
    this.ctx.strokeStyle = this.config.geodesicColor;
    this.ctx.lineWidth = this.config.lineWidth;
    
    for (const [from, to] of this.geodesics) {
      this.drawHyperbolicLine(from, to);
    }
  }

  /**
   * Draw hyperbolic line (geodesic) between two points
   */
  private drawHyperbolicLine(from: Vector, to: Vector): void {
    // In Poincaré disk, geodesics are either:
    // 1. Straight lines through origin
    // 2. Circular arcs orthogonal to unit circle
    
    const fromScreen = this.hyperbolicToScreen(from);
    const toScreen = this.hyperbolicToScreen(to);
    
    // Check if line passes through origin
    const crossProduct = from.data[0] * to.data[1] - from.data[1] * to.data[0];
    
    if (Math.abs(crossProduct) < 1e-6) {
      // Straight line through origin
      this.ctx.beginPath();
      this.ctx.moveTo(fromScreen.x, fromScreen.y);
      this.ctx.lineTo(toScreen.x, toScreen.y);
      this.ctx.stroke();
    } else {
      // Circular arc
      this.drawGeodesicArc(from, to);
    }
  }

  /**
   * Draw geodesic arc for non-diametral geodesics
   */
  private drawGeodesicArc(from: Vector, to: Vector): void {
    // Compute the center and radius of the circular arc
    const { center, radius, startAngle, endAngle } = this.computeGeodesicArc(from, to);
    
    this.ctx.beginPath();
    this.ctx.arc(center.x, center.y, radius, startAngle, endAngle);
    this.ctx.stroke();
  }

  /**
   * Compute parameters for geodesic arc
   */
  private computeGeodesicArc(from: Vector, to: Vector): {
    center: { x: number; y: number };
    radius: number;
    startAngle: number;
    endAngle: number;
  } {
    // Complex calculation for hyperbolic geodesic in Poincaré disk
    // This is a simplified version - full implementation requires more geometry
    
    const fromScreen = this.hyperbolicToScreen(from);
    const toScreen = this.hyperbolicToScreen(to);
    
    // Approximate with circular arc
    const midX = (fromScreen.x + toScreen.x) / 2;
    const midY = (fromScreen.y + toScreen.y) / 2;
    
    const dx = toScreen.x - fromScreen.x;
    const dy = toScreen.y - fromScreen.y;
    
    // Perpendicular direction for arc center
    const perpX = -dy;
    const perpY = dx;
    const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
    
    if (perpLength < 1e-6) {
      // Fallback to straight line
      return {
        center: { x: midX, y: midY },
        radius: 0,
        startAngle: 0,
        endAngle: 0
      };
    }
    
    const curvature = 0.5; // Adjust based on hyperbolic geometry
    const centerX = midX + (perpX / perpLength) * curvature * perpLength;
    const centerY = midY + (perpY / perpLength) * curvature * perpLength;
    
    const radius = Math.sqrt(
      (fromScreen.x - centerX) ** 2 + (fromScreen.y - centerY) ** 2
    );
    
    const startAngle = Math.atan2(fromScreen.y - centerY, fromScreen.x - centerX);
    const endAngle = Math.atan2(toScreen.y - centerY, toScreen.x - centerX);
    
    return {
      center: { x: centerX, y: centerY },
      radius,
      startAngle,
      endAngle
    };
  }

  /**
   * Render edges between points
   */
  private renderEdges(): void {
    for (const edge of this.edges) {
      if (edge.from < this.points.length && edge.to < this.points.length) {
        const fromPoint = this.points[edge.from];
        const toPoint = this.points[edge.to];
        
        this.ctx.strokeStyle = edge.color || this.config.edgeColor;
        this.ctx.lineWidth = edge.width || this.config.lineWidth;
        
        if (edge.style === 'dashed') {
          this.ctx.setLineDash([5, 5]);
        } else if (edge.style === 'dotted') {
          this.ctx.setLineDash([2, 3]);
        } else {
          this.ctx.setLineDash([]);
        }
        
        this.drawHyperbolicLine(fromPoint.position, toPoint.position);
      }
    }
  }

  /**
   * Render points
   */
  private renderPoints(): void {
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      const screenPos = this.hyperbolicToScreen(point.position);
      
      // Draw point
      this.ctx.fillStyle = point.color || this.config.pointColor;
      this.ctx.beginPath();
      const radius = (point.radius || this.config.pointRadius) * (point.highlight ? 1.5 : 1);
      this.ctx.arc(screenPos.x, screenPos.y, radius, 0, 2 * Math.PI);
      this.ctx.fill();
      
      // Draw highlight ring
      if (point.highlight) {
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, screenPos.y, radius + 2, 0, 2 * Math.PI);
        this.ctx.stroke();
      }
      
      // Draw label
      if (point.label) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(point.label, screenPos.x, screenPos.y - radius - 5);
      }
    }
  }

  /**
   * Render UI elements
   */
  private renderUI(): void {
    // Draw unit circle boundary
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    const center = { x: this.config.width / 2, y: this.config.height / 2 };
    const radius = Math.min(this.config.width, this.config.height) / 2 - 10;
    this.ctx.arc(center.x, center.y, radius * this.zoom, 0, 2 * Math.PI);
    this.ctx.stroke();
    
    // Draw coordinate axes
    this.ctx.strokeStyle = '#444444';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([2, 2]);
    
    // X-axis
    this.ctx.beginPath();
    this.ctx.moveTo(center.x - radius * this.zoom, center.y);
    this.ctx.lineTo(center.x + radius * this.zoom, center.y);
    this.ctx.stroke();
    
    // Y-axis
    this.ctx.beginPath();
    this.ctx.moveTo(center.x, center.y - radius * this.zoom);
    this.ctx.lineTo(center.x, center.y + radius * this.zoom);
    this.ctx.stroke();
    
    this.ctx.setLineDash([]);
    
    // Draw info panel
    this.drawInfoPanel();
  }

  /**
   * Draw information panel
   */
  private drawInfoPanel(): void {
    const panelX = 10;
    const panelY = 10;
    const panelWidth = 200;
    const panelHeight = 120;
    
    // Panel background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // Panel text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'left';
    
    const lines = [
      `Model: ${this.config.model}`,
      `Tiling: ${this.config.tiling}`,
      `Points: ${this.points.length}`,
      `Edges: ${this.edges.length}`,
      `Geodesics: ${this.geodesics.length}`,
      `Zoom: ${this.zoom.toFixed(2)}x`,
      `Center: (${this.center.x.toFixed(2)}, ${this.center.y.toFixed(2)})`
    ];
    
    lines.forEach((line, i) => {
      this.ctx.fillText(line, panelX + 10, panelY + 20 + i * 14);
    });
  }

  /**
   * Convert hyperbolic coordinates to screen coordinates
   */
  private hyperbolicToScreen(point: Vector): { x: number; y: number } {
    const centerX = this.config.width / 2;
    const centerY = this.config.height / 2;
    const radius = Math.min(this.config.width, this.config.height) / 2 - 10;
    
    // Apply zoom and center offset
    const x = (point.data[0] - this.center.x) * this.zoom;
    const y = (point.data[1] - this.center.y) * this.zoom;
    
    return {
      x: centerX + x * radius,
      y: centerY - y * radius // Flip Y for screen coordinates
    };
  }

  /**
   * Convert screen coordinates to hyperbolic coordinates
   */
  private screenToHyperbolic(screenX: number, screenY: number): Vector {
    const centerX = this.config.width / 2;
    const centerY = this.config.height / 2;
    const radius = Math.min(this.config.width, this.config.height) / 2 - 10;
    
    const x = ((screenX - centerX) / radius) / this.zoom + this.center.x;
    const y = -((screenY - centerY) / radius) / this.zoom + this.center.y; // Flip Y
    
    const point = createVector([x, y]);
    return HyperbolicArithmetic.projectToPoincareBall(point);
  }

  /**
   * Animation loop
   */
  private startAnimation(): void {
    const animate = () => {
      this.render();
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  /**
   * Stop animation
   */
  stopAnimation(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  // Event handlers
  private onMouseDown(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    // Check if clicking on a point
    const hyperbolicPos = this.screenToHyperbolic(this.mousePos.x, this.mousePos.y);
    
    for (let i = 0; i < this.points.length; i++) {
      const distance = HyperbolicArithmetic.distance(this.points[i].position, hyperbolicPos);
      if (distance < 0.1) {
        this.isDragging = true;
        this.dragPoint = i;
        this.points[i].highlight = true;
        return;
      }
    }
  }

  private onMouseMove(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const newMousePos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    if (this.isDragging && this.dragPoint !== undefined) {
      // Drag point in hyperbolic space
      const newPos = this.screenToHyperbolic(newMousePos.x, newMousePos.y);
      this.points[this.dragPoint].position = newPos;
    } else {
      // Pan the view
      if (event.buttons === 1) {
        const dx = (newMousePos.x - this.mousePos.x) / (this.config.width / 2);
        const dy = -(newMousePos.y - this.mousePos.y) / (this.config.height / 2);
        
        this.center.x -= dx / this.zoom;
        this.center.y -= dy / this.zoom;
      }
    }
    
    this.mousePos = newMousePos;
  }

  private onMouseUp(): void {
    if (this.dragPoint !== undefined) {
      this.points[this.dragPoint].highlight = false;
    }
    
    this.isDragging = false;
    this.dragPoint = undefined;
  }

  private onWheel(event: WheelEvent): void {
    event.preventDefault();
    
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    this.zoom = Math.max(0.1, Math.min(10, this.zoom * zoomFactor));
  }

  // Touch event handlers
  private onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.onMouseDown({
        clientX: touch.clientX,
        clientY: touch.clientY
      } as MouseEvent);
    }
  }

  private onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.onMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY,
        buttons: 1
      } as MouseEvent);
    }
  }

  private onTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this.onMouseUp();
  }

  /**
   * Public API methods
   */
  
  /**
   * Set visualization configuration
   */
  setConfig(newConfig: Partial<VisualizationConfig>): void {
    Object.assign(this.config, newConfig);
  }

  /**
   * Add a point to the visualization
   */
  addPoint(point: VisualizationPoint): void {
    this.points.push(point);
  }

  /**
   * Remove a point from the visualization
   */
  removePoint(index: number): void {
    if (index >= 0 && index < this.points.length) {
      this.points.splice(index, 1);
      
      // Update edge indices
      this.edges = this.edges
        .filter(edge => edge.from !== index && edge.to !== index)
        .map(edge => ({
          ...edge,
          from: edge.from > index ? edge.from - 1 : edge.from,
          to: edge.to > index ? edge.to - 1 : edge.to
        }));
    }
  }

  /**
   * Clear all visualization elements
   */
  clear(): void {
    this.points = [];
    this.edges = [];
    this.geodesics = [];
  }

  /**
   * Reset view to default
   */
  resetView(): void {
    this.zoom = 1.0;
    this.center = { x: 0, y: 0 };
  }

  /**
   * Export visualization as image
   */
  exportImage(): string {
    return this.canvas.toDataURL('image/png');
  }
}

// Convenience factory function
export function createVisualizer(canvas: HTMLCanvasElement, config?: Partial<VisualizationConfig>): GeometricVisualizer {
  return new GeometricVisualizer({ canvas, ...config });
}

export default GeometricVisualizer;
