#!/usr/bin/env node

/**
 * Gemini Code Collaboration Test
 * 
 * This script tests the H²GNN MCP server and collaboration features
 * by running various demos and monitoring the system
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class GeminiCollaborationTester {
  constructor() {
    this.processes = new Map();
    this.logFile = join(__dirname, 'collaboration-test.log');
    this.results = {
      tests: [],
      startTime: new Date(),
      status: 'running'
    };
  }

  /**
   * Start the MCP server in the background
   */
  async startMCPServer() {
    console.log('🚀 Starting H²GNN MCP Server...');
    
    const serverPath = join(__dirname, '..', 'src', 'mcp', 'h2gnn-mcp-server.ts');
    const serverProcess = spawn('npx', ['tsx', serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: join(__dirname, '..')
    });

    this.processes.set('mcp-server', serverProcess);

    serverProcess.stdout.on('data', (data) => {
      console.log(`[MCP Server] ${data.toString()}`);
      this.log(`[MCP Server] ${data.toString()}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[MCP Server Error] ${data.toString()}`);
      this.log(`[MCP Server Error] ${data.toString()}`);
    });

    serverProcess.on('close', (code) => {
      console.log(`MCP Server exited with code ${code}`);
      this.log(`MCP Server exited with code ${code}`);
    });

    // Wait a moment for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return serverProcess;
  }

  /**
   * Run the MCP collaboration demo
   */
  async runCollaborationDemo() {
    console.log('🤝 Running MCP Collaboration Demo...');
    
    const demoPath = join(__dirname, '..', 'src', 'demo', 'mcp-collaboration-demo.ts');
    const demoProcess = spawn('npx', ['tsx', demoPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: __dirname
    });

    this.processes.set('collaboration-demo', demoProcess);

    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      demoProcess.stdout.on('data', (data) => {
        const text = data.toString();
        console.log(`[Demo] ${text}`);
        this.log(`[Demo] ${text}`);
        output += text;
      });

      demoProcess.stderr.on('data', (data) => {
        const text = data.toString();
        console.error(`[Demo Error] ${text}`);
        this.log(`[Demo Error] ${text}`);
        errorOutput += text;
      });

      demoProcess.on('close', (code) => {
        const result = {
          name: 'MCP Collaboration Demo',
          success: code === 0,
          output,
          error: errorOutput,
          exitCode: code,
          timestamp: new Date()
        };
        
        this.results.tests.push(result);
        console.log(`Demo completed with exit code: ${code}`);
        
        if (code === 0) {
          resolve(result);
        } else {
          reject(new Error(`Demo failed with exit code ${code}`));
        }
      });
    });
  }

  /**
   * Run WordNet demo
   */
  async runWordNetDemo() {
    console.log('🌐 Running WordNet Demo...');
    
    const demoPath = join(__dirname, 'src', 'demo', 'simple-wordnet-test.ts');
    const demoProcess = spawn('npx', ['tsx', demoPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: __dirname
    });

    this.processes.set('wordnet-demo', demoProcess);

    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      demoProcess.stdout.on('data', (data) => {
        const text = data.toString();
        console.log(`[WordNet] ${text}`);
        this.log(`[WordNet] ${text}`);
        output += text;
      });

      demoProcess.stderr.on('data', (data) => {
        const text = data.toString();
        console.error(`[WordNet Error] ${text}`);
        this.log(`[WordNet Error] ${text}`);
        errorOutput += text;
      });

      demoProcess.on('close', (code) => {
        const result = {
          name: 'WordNet Demo',
          success: code === 0,
          output,
          error: errorOutput,
          exitCode: code,
          timestamp: new Date()
        };
        
        this.results.tests.push(result);
        console.log(`WordNet demo completed with exit code: ${code}`);
        
        if (code === 0) {
          resolve(result);
        } else {
          reject(new Error(`WordNet demo failed with exit code ${code}`));
        }
      });
    });
  }

  /**
   * Run code embedding demo
   */
  async runCodeEmbeddingDemo() {
    console.log('💻 Running Code Embedding Demo...');
    
    const demoPath = join(__dirname, 'src', 'demo', 'code-embedding-demo.ts');
    const demoProcess = spawn('npx', ['tsx', demoPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: __dirname
    });

    this.processes.set('code-embedding-demo', demoProcess);

    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      demoProcess.stdout.on('data', (data) => {
        const text = data.toString();
        console.log(`[Code Embedding] ${text}`);
        this.log(`[Code Embedding] ${text}`);
        output += text;
      });

      demoProcess.stderr.on('data', (data) => {
        const text = data.toString();
        console.error(`[Code Embedding Error] ${text}`);
        this.log(`[Code Embedding Error] ${text}`);
        errorOutput += text;
      });

      demoProcess.on('close', (code) => {
        const result = {
          name: 'Code Embedding Demo',
          success: code === 0,
          output,
          error: errorOutput,
          exitCode: code,
          timestamp: new Date()
        };
        
        this.results.tests.push(result);
        console.log(`Code embedding demo completed with exit code: ${code}`);
        
        if (code === 0) {
          resolve(result);
        } else {
          reject(new Error(`Code embedding demo failed with exit code ${code}`));
        }
      });
    });
  }

  /**
   * Run knowledge graph demo
   */
  async runKnowledgeGraphDemo() {
    console.log('🧠 Running Knowledge Graph Demo...');
    
    const demoPath = join(__dirname, 'src', 'demo', 'knowledge-graph-demo.ts');
    const demoProcess = spawn('npx', ['tsx', demoPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: __dirname
    });

    this.processes.set('knowledge-graph-demo', demoProcess);

    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      demoProcess.stdout.on('data', (data) => {
        const text = data.toString();
        console.log(`[Knowledge Graph] ${text}`);
        this.log(`[Knowledge Graph] ${text}`);
        output += text;
      });

      demoProcess.stderr.on('data', (data) => {
        const text = data.toString();
        console.error(`[Knowledge Graph Error] ${text}`);
        this.log(`[Knowledge Graph Error] ${text}`);
        errorOutput += text;
      });

      demoProcess.on('close', (code) => {
        const result = {
          name: 'Knowledge Graph Demo',
          success: code === 0,
          output,
          error: errorOutput,
          exitCode: code,
          timestamp: new Date()
        };
        
        this.results.tests.push(result);
        console.log(`Knowledge graph demo completed with exit code: ${code}`);
        
        if (code === 0) {
          resolve(result);
        } else {
          reject(new Error(`Knowledge graph demo failed with exit code ${code}`));
        }
      });
    });
  }

  /**
   * Run integrated demo
   */
  async runIntegratedDemo() {
    console.log('🔄 Running Integrated Demo...');
    
    const demoPath = join(__dirname, 'src', 'demo', 'integrated-demo.ts');
    const demoProcess = spawn('npx', ['tsx', demoPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: __dirname
    });

    this.processes.set('integrated-demo', demoProcess);

    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      demoProcess.stdout.on('data', (data) => {
        const text = data.toString();
        console.log(`[Integrated] ${text}`);
        this.log(`[Integrated] ${text}`);
        output += text;
      });

      demoProcess.stderr.on('data', (data) => {
        const text = data.toString();
        console.error(`[Integrated Error] ${text}`);
        this.log(`[Integrated Error] ${text}`);
        errorOutput += text;
      });

      demoProcess.on('close', (code) => {
        const result = {
          name: 'Integrated Demo',
          success: code === 0,
          output,
          error: errorOutput,
          exitCode: code,
          timestamp: new Date()
        };
        
        this.results.tests.push(result);
        console.log(`Integrated demo completed with exit code: ${code}`);
        
        if (code === 0) {
          resolve(result);
        } else {
          reject(new Error(`Integrated demo failed with exit code ${code}`));
        }
      });
    });
  }

  /**
   * Log message to file
   */
  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(this.logFile, logEntry);
  }

  /**
   * Generate test report
   */
  generateReport() {
    const endTime = new Date();
    const duration = endTime - this.results.startTime;
    
    const successfulTests = this.results.tests.filter(t => t.success);
    const failedTests = this.results.tests.filter(t => !t.success);
    
    const report = {
      summary: {
        totalTests: this.results.tests.length,
        successful: successfulTests.length,
        failed: failedTests.length,
        successRate: `${((successfulTests.length / this.results.tests.length) * 100).toFixed(2)}%`,
        duration: `${(duration / 1000).toFixed(2)}s`
      },
      tests: this.results.tests,
      startTime: this.results.startTime,
      endTime,
      logFile: this.logFile
    };

    const reportFile = join(__dirname, 'collaboration-test-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Test Report Generated:');
    console.log(`   📁 Report: ${reportFile}`);
    console.log(`   📝 Log: ${this.logFile}`);
    console.log(`   ✅ Successful: ${successfulTests.length}/${this.results.tests.length}`);
    console.log(`   ❌ Failed: ${failedTests.length}/${this.results.tests.length}`);
    console.log(`   ⏱️ Duration: ${(duration / 1000).toFixed(2)}s`);
    
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`   • ${test.name} (exit code: ${test.exitCode})`);
      });
    }

    return report;
  }

  /**
   * Cleanup all processes
   */
  async cleanup() {
    console.log('\n🧹 Cleaning up processes...');
    
    for (const [name, process] of this.processes) {
      console.log(`   Stopping ${name}...`);
      process.kill('SIGTERM');
      
      // Wait a moment for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force kill if still running
      if (!process.killed) {
        process.kill('SIGKILL');
      }
    }
    
    this.processes.clear();
    console.log('✅ Cleanup completed');
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🎯 Starting Gemini Code Collaboration Tests\n');
    this.log('Starting Gemini Code Collaboration Tests');
    
    try {
      // Start MCP server
      await this.startMCPServer();
      
      // Run demos sequentially
      const demos = [
        () => this.runWordNetDemo(),
        () => this.runCodeEmbeddingDemo(),
        () => this.runKnowledgeGraphDemo(),
        () => this.runCollaborationDemo(),
        () => this.runIntegratedDemo()
      ];

      for (const demo of demos) {
        try {
          await demo();
          console.log('✅ Demo completed successfully\n');
        } catch (error) {
          console.error(`❌ Demo failed: ${error.message}\n`);
        }
        
        // Wait between demos
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.log(`Test suite failed: ${error.message}`);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the test suite
async function main() {
  const tester = new GeminiCollaborationTester();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await tester.cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await tester.cleanup();
    process.exit(0);
  });

  await tester.runAllTests();
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { GeminiCollaborationTester };
