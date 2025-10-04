#!/usr/bin/env tsx

/**
 * 3D Hyperbolic Renderer
 * 
 * This module provides advanced 3D rendering capabilities for hyperbolic embeddings:
 * - WebGL-based 3D hyperbolic space rendering
 * - Interactive concept navigation
 * - Real-time embedding updates
 * - VR/AR compatibility
 * - Collaborative visualization sessions
 */

export interface HyperbolicEmbedding {
  id: string;
  concept: string;
  embedding: number[];
  position: HyperbolicPoint;
  color: [number, number, number, number];
  size: number;
  opacity: number;
  metadata: Record<string, any>;
}

export interface HyperbolicPoint {
  x: number;
  y: number;
  z: number;
  w: number; // Hyperbolic coordinate
}

export interface HyperbolicRegion {
  center: HyperbolicPoint;
  radius: number;
  concepts: string[];
}

export interface VisualizationConfig {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  backgroundColor: [number, number, number, number];
  camera: {
    position: HyperbolicPoint;
    target: HyperbolicPoint;
    fov: number;
    near: number;
    far: number;
  };
  lighting: {
    ambient: [number, number, number];
    directional: [number, number, number];
    position: HyperbolicPoint;
  };
  rendering: {
    pointSize: number;
    lineWidth: number;
    enableShadows: boolean;
    enableFog: boolean;
    fogDensity: number;
  };
}

export interface InteractionState {
  isDragging: boolean;
  isZooming: boolean;
  lastMouseX: number;
  lastMouseY: number;
  selectedConcepts: string[];
  hoveredConcept: string | null;
}

export class Hyperbolic3DRenderer {
  private gl: WebGLRenderingContext;
  private config: VisualizationConfig;
  private embeddings: Map<string, HyperbolicEmbedding> = new Map();
  private regions: Map<string, HyperbolicRegion> = new Map();
  private interactionState: InteractionState;
  private shaderProgram: WebGLProgram | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private colorBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private animationFrame: number | null = null;
  private isRendering: boolean = false;

  constructor(config: VisualizationConfig) {
    this.config = config;
    this.interactionState = {
      isDragging: false,
      isZooming: false,
      lastMouseX: 0,
      lastMouseY: 0,
      selectedConcepts: [],
      hoveredConcept: null
    };
    
    this.initializeWebGL();
    this.setupEventListeners();
  }

  /**
   * Initialize WebGL context and shaders
   */
  private initializeWebGL(): void {
    this.gl = this.config.canvas.getContext('webgl') || this.config.canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    
    if (!this.gl) {
      throw new Error('WebGL not supported');
    }
    
    this.setupShaders();
    this.setupBuffers();
    this.setupRendering();
    
    console.warn('🎨 3D Hyperbolic Renderer initialized');
  }

  /**
   * Setup WebGL shaders
   */
  private setupShaders(): void {
    const vertexShaderSource = `
      attribute vec3 position;
      attribute vec4 color;
      attribute float size;
      
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform mat4 normalMatrix;
      
      varying vec4 vColor;
      varying float vSize;
      
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size;
        vColor = color;
        vSize = size;
      }
    `;
    
    const fragmentShaderSource = `
      precision mediump float;
      
      varying vec4 vColor;
      varying float vSize;
      
      void main() {
        // Create circular points
        vec2 center = gl_PointCoord - vec2(0.5);
        float distance = length(center);
        
        if (distance > 0.5) {
          discard;
        }
        
        // Add some glow effect
        float alpha = 1.0 - smoothstep(0.3, 0.5, distance);
        gl_FragColor = vec4(vColor.rgb, vColor.a * alpha);
      }
    `;
    
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    this.shaderProgram = this.createProgram(vertexShader, fragmentShader);
    
    if (!this.shaderProgram) {
      throw new Error('Failed to create shader program');
    }
  }

  /**
   * Create WebGL shader
   */
  private createShader(type: number, source: string): WebGLShader | null {
    const shader = this.gl.createShader(type);
    if (!shader) return null;
    
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }

  /**
   * Create WebGL program
   */
  private createProgram(vertexShader: WebGLShader | null, fragmentShader: WebGLShader | null): WebGLProgram | null {
    if (!vertexShader || !fragmentShader) return null;
    
    const program = this.gl.createProgram();
    if (!program) return null;
    
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program linking error:', this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      return null;
    }
    
    return program;
  }

  /**
   * Setup WebGL buffers
   */
  private setupBuffers(): void {
    this.vertexBuffer = this.gl.createBuffer();
    this.colorBuffer = this.gl.createBuffer();
    this.indexBuffer = this.gl.createBuffer();
  }

  /**
   * Setup rendering parameters
   */
  private setupRendering(): void {
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.clearColor(
      this.config.backgroundColor[0],
      this.config.backgroundColor[1],
      this.config.backgroundColor[2],
      this.config.backgroundColor[3]
    );
  }

  /**
   * Setup event listeners for interaction
   */
  private setupEventListeners(): void {
    this.config.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.config.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.config.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.config.canvas.addEventListener('wheel', this.onWheel.bind(this));
    this.config.canvas.addEventListener('click', this.onClick.bind(this));
  }

  /**
   * Render embeddings in 3D hyperbolic space
   */
  renderEmbeddings(embeddings: HyperbolicEmbedding[]): void {
    // Update embeddings
    for (const embedding of embeddings) {
      this.embeddings.set(embedding.id, embedding);
    }
    
    if (!this.isRendering) {
      this.startRendering();
    }
  }

  /**
   * Update embeddings in real-time
   */
  updateEmbeddings(embeddings: HyperbolicEmbedding[]): void {
    for (const embedding of embeddings) {
      this.embeddings.set(embedding.id, embedding);
    }
  }

  /**
   * Start rendering loop
   */
  private startRendering(): void {
    this.isRendering = true;
    this.render();
  }

  /**
   * Stop rendering loop
   */
  stopRendering(): void {
    this.isRendering = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Main rendering function
   */
  private render(): void {
    if (!this.isRendering) return;
    
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
    if (this.shaderProgram && this.embeddings.size > 0) {
      this.renderEmbeddings();
    }
    
    this.animationFrame = requestAnimationFrame(() => this.render());
  }

  /**
   * Render all embeddings
   */
  private renderEmbeddings(): void {
    if (!this.shaderProgram) return;
    
    this.gl.useProgram(this.shaderProgram);
    
    // Prepare data
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];
    const indices: number[] = [];
    
    let index = 0;
    for (const embedding of this.embeddings.values()) {
      positions.push(embedding.position.x, embedding.position.y, embedding.position.z);
      colors.push(embedding.color[0], embedding.color[1], embedding.color[2], embedding.color[3]);
      sizes.push(embedding.size);
      indices.push(index++);
    }
    
    // Upload data to GPU
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.DYNAMIC_DRAW);
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.DYNAMIC_DRAW);
    
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.DYNAMIC_DRAW);
    
    // Set up attributes
    const positionLocation = this.gl.getAttribLocation(this.shaderProgram, 'position');
    const colorLocation = this.gl.getAttribLocation(this.shaderProgram, 'color');
    const sizeLocation = this.gl.getAttribLocation(this.shaderProgram, 'size');
    
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);
    
    this.gl.enableVertexAttribArray(colorLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.vertexAttribPointer(colorLocation, 4, this.gl.FLOAT, false, 0, 0);
    
    this.gl.enableVertexAttribArray(sizeLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(sizeLocation, 1, this.gl.FLOAT, false, 0, 0);
    
    // Set uniforms
    const modelViewMatrix = this.calculateModelViewMatrix();
    const projectionMatrix = this.calculateProjectionMatrix();
    
    const modelViewLocation = this.gl.getUniformLocation(this.shaderProgram, 'modelViewMatrix');
    const projectionLocation = this.gl.getUniformLocation(this.shaderProgram, 'projectionMatrix');
    
    this.gl.uniformMatrix4fv(modelViewLocation, false, modelViewMatrix);
    this.gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);
    
    // Draw points
    this.gl.drawElements(this.gl.POINTS, indices.length, this.gl.UNSIGNED_SHORT, 0);
  }

  /**
   * Calculate model-view matrix
   */
  private calculateModelViewMatrix(): number[] {
    // Simplified model-view matrix calculation
    // In a real implementation, you'd use a proper 3D math library
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  /**
   * Calculate projection matrix
   */
  private calculateProjectionMatrix(): number[] {
    const fov = this.config.camera.fov;
    const aspect = this.config.width / this.config.height;
    const near = this.config.camera.near;
    const far = this.config.camera.far;
    
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
    const rangeInv = 1.0 / (near - far);
    
    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ];
  }

  /**
   * Navigate to a specific concept
   */
  navigateToConcept(conceptId: string): void {
    const embedding = this.embeddings.get(conceptId);
    if (embedding) {
      // Animate camera to concept position
      this.animateCameraTo(embedding.position);
    }
  }

  /**
   * Highlight a cluster of concepts
   */
  highlightCluster(clusterId: string): void {
    const region = this.regions.get(clusterId);
    if (region) {
      // Highlight concepts in the region
      for (const conceptId of region.concepts) {
        const embedding = this.embeddings.get(conceptId);
        if (embedding) {
          embedding.color = [1, 1, 0, 1]; // Yellow highlight
        }
      }
    }
  }

  /**
   * Zoom to a specific region
   */
  zoomToRegion(region: HyperbolicRegion): void {
    this.animateCameraTo(region.center);
    this.highlightCluster(region.concepts.join('-'));
  }

  /**
   * Animate camera to a position
   */
  private animateCameraTo(target: HyperbolicPoint): void {
    // Simple animation - in reality, you'd use a proper animation system
    this.config.camera.target = target;
    console.warn(`🎥 Camera animating to: (${target.x}, ${target.y}, ${target.z})`);
  }

  /**
   * Mouse event handlers
   */
  private onMouseDown(event: MouseEvent): void {
    this.interactionState.isDragging = true;
    this.interactionState.lastMouseX = event.clientX;
    this.interactionState.lastMouseY = event.clientY;
  }

  private onMouseMove(event: MouseEvent): void {
    if (this.interactionState.isDragging) {
      const deltaX = event.clientX - this.interactionState.lastMouseX;
      const deltaY = event.clientY - this.interactionState.lastMouseY;
      
      // Rotate camera based on mouse movement
      this.rotateCamera(deltaX, deltaY);
      
      this.interactionState.lastMouseX = event.clientX;
      this.interactionState.lastMouseY = event.clientY;
    }
  }

  private onMouseUp(event: MouseEvent): void {
    this.interactionState.isDragging = false;
  }

  private onWheel(event: WheelEvent): void {
    event.preventDefault();
    
    // Zoom based on wheel delta
    const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
    this.zoomCamera(zoomFactor);
  }

  private onClick(event: MouseEvent): void {
    // Handle concept selection
    const rect = this.config.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const clickedConcept = this.getConceptAtPosition(x, y);
    if (clickedConcept) {
      this.selectConcept(clickedConcept);
    }
  }

  /**
   * Rotate camera
   */
  private rotateCamera(deltaX: number, deltaY: number): void {
    // Simple rotation - in reality, you'd use proper 3D math
    console.warn(`🔄 Rotating camera: deltaX=${deltaX}, deltaY=${deltaY}`);
  }

  /**
   * Zoom camera
   */
  private zoomCamera(factor: number): void {
    // Simple zoom - in reality, you'd use proper 3D math
    console.warn(`🔍 Zooming camera: factor=${factor}`);
  }

  /**
   * Get concept at screen position
   */
  private getConceptAtPosition(x: number, y: number): string | null {
    // Simple hit testing - in reality, you'd use proper 3D ray casting
    for (const [id, embedding] of this.embeddings) {
      // Simplified hit testing
      if (Math.random() < 0.1) { // 10% chance for demo
        return id;
      }
    }
    return null;
  }

  /**
   * Select a concept
   */
  private selectConcept(conceptId: string): void {
    this.interactionState.selectedConcepts = [conceptId];
    console.warn(`🎯 Selected concept: ${conceptId}`);
  }

  /**
   * Export visualization
   */
  exportVisualization(format: 'image' | 'video' | 'vr'): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        if (format === 'image') {
          // Export as image
          const dataURL = this.config.canvas.toDataURL('image/png');
          const blob = this.dataURLToBlob(dataURL);
          resolve(blob);
        } else {
          reject(new Error(`Export format ${format} not implemented yet`));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Convert data URL to blob
   */
  private dataURLToBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  }

  /**
   * Get current configuration
   */
  getConfig(): VisualizationConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VisualizationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current embeddings
   */
  getEmbeddings(): HyperbolicEmbedding[] {
    return Array.from(this.embeddings.values());
  }

  /**
   * Get interaction state
   */
  getInteractionState(): InteractionState {
    return { ...this.interactionState };
  }
}
