#!/usr/bin/env tsx

/**
 * Comprehensive Test Runner for Phase 3 Team Collaboration Features
 * 
 * This test runner provides:
 * - Organized test execution
 * - Performance monitoring
 * - Coverage reporting
 * - Test result aggregation
 * - CI/CD integration support
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface TestResult {
  suite: string;
  test: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

export interface TestSuiteResult {
  name: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  results: TestResult[];
}

export interface TestRunnerConfig {
  verbose: boolean;
  coverage: boolean;
  performance: boolean;
  parallel: boolean;
  timeout: number;
  outputDir: string;
}

export class TeamCollaborationTestRunner {
  private config: TestRunnerConfig;
  private results: TestSuiteResult[] = [];

  constructor(config: Partial<TestRunnerConfig> = {}) {
    this.config = {
      verbose: false,
      coverage: true,
      performance: true,
      parallel: true,
      timeout: 30000,
      outputDir: './test-results',
      ...config
    };

    this.ensureOutputDirectory();
  }

  /**
   * Run all Phase 3 team collaboration tests
   */
  async runAllTests(): Promise<TestSuiteResult[]> {
    console.log('🚀 Starting Phase 3 Team Collaboration Test Suite');
    console.log('================================================');

    const testSuites = [
      {
        name: 'Shared Learning Database',
        pattern: '**/shared-learning-database.test.ts',
        description: 'Tests for shared learning database functionality'
      },
      {
        name: 'Coding Standard Engine',
        pattern: '**/coding-standard-engine.test.ts',
        description: 'Tests for coding standard engine functionality'
      },
      {
        name: 'Team Collaboration Workflows',
        pattern: '**/team-collaboration-workflow.test.ts',
        description: 'Tests for team collaboration workflows'
      },
      {
        name: 'MCP Tools',
        pattern: '**/team-collaboration-mcp.test.ts',
        description: 'Tests for MCP tools integration'
      },
      {
        name: 'End-to-End Integration',
        pattern: '**/team-collaboration-e2e.test.ts',
        description: 'End-to-end integration tests'
      }
    ];

    for (const suite of testSuites) {
      console.log(`\n📋 Running ${suite.name} Tests`);
      console.log('─'.repeat(50));
      console.log(suite.description);

      const result = await this.runTestSuite(suite.name, suite.pattern);
      this.results.push(result);

      this.printSuiteResult(result);
    }

    this.printOverallResults();
    this.generateReport();

    return this.results;
  }

  /**
   * Run a specific test suite
   */
  private async runTestSuite(suiteName: string, pattern: string): Promise<TestSuiteResult> {
    const startTime = Date.now();
    const results: TestResult[] = [];

    try {
      const jestConfig = this.generateJestConfig(pattern);
      const jestConfigPath = path.join(this.config.outputDir, 'jest.config.js');
      
      fs.writeFileSync(jestConfigPath, jestConfig);

      const command = this.buildJestCommand(jestConfigPath);
      const output = execSync(command, { 
        encoding: 'utf-8',
        timeout: this.config.timeout,
        cwd: process.cwd()
      });

      const parsedResults = this.parseJestOutput(output);
      results.push(...parsedResults);

    } catch (error) {
      console.error(`❌ Test suite ${suiteName} failed:`, error);
      results.push({
        suite: suiteName,
        test: 'Test Suite Execution',
        status: 'failed',
        duration: 0,
        error: error.message
      });
    }

    const duration = Date.now() - startTime;
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;

    return {
      name: suiteName,
      total: results.length,
      passed,
      failed,
      skipped,
      duration,
      results
    };
  }

  /**
   * Generate Jest configuration for specific test pattern
   */
  private generateJestConfig(pattern: string): string {
    return `
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['${pattern}'],
  collectCoverage: ${this.config.coverage},
  coverageDirectory: '${this.config.outputDir}/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: ${this.config.verbose},
  testTimeout: ${this.config.timeout},
  maxWorkers: ${this.config.parallel ? '50%' : 1},
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/core/shared-learning-database.ts',
    'src/rules/coding-standard-engine.ts',
    'src/workflows/team-collaboration-workflow.ts',
    'src/workflows/knowledge-sharing-workflow.ts',
    'src/workflows/team-standards-workflow.ts',
    'src/mcp/enhanced-h2gnn-mcp-server.ts',
    'src/demo/team-collaboration-demo.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
    `.trim();
  }

  /**
   * Build Jest command with appropriate flags
   */
  private buildJestCommand(configPath: string): string {
    const flags = [
      `--config=${configPath}`,
      this.config.verbose ? '--verbose' : '',
      this.config.coverage ? '--coverage' : '',
      this.config.parallel ? '--runInBand' : '',
      '--detectOpenHandles',
      '--forceExit'
    ].filter(Boolean);

    return `npx jest ${flags.join(' ')}`;
  }

  /**
   * Parse Jest output to extract test results
   */
  private parseJestOutput(output: string): TestResult[] {
    const results: TestResult[] = [];
    const lines = output.split('\n');

    let currentSuite = '';
    let currentTest = '';
    let testStatus: 'passed' | 'failed' | 'skipped' = 'passed';
    let testDuration = 0;

    for (const line of lines) {
      // Parse test suite start
      if (line.includes('describe(') || line.includes('Test Suites:')) {
        currentSuite = line.trim();
      }

      // Parse individual test
      if (line.includes('✓') || line.includes('✗') || line.includes('○')) {
        if (line.includes('✓')) {
          testStatus = 'passed';
        } else if (line.includes('✗')) {
          testStatus = 'failed';
        } else if (line.includes('○')) {
          testStatus = 'skipped';
        }

        currentTest = line.trim();
        
        // Extract duration if available
        const durationMatch = line.match(/\((\d+)ms\)/);
        if (durationMatch) {
          testDuration = parseInt(durationMatch[1]);
        }

        results.push({
          suite: currentSuite,
          test: currentTest,
          status: testStatus,
          duration: testDuration
        });
      }
    }

    return results;
  }

  /**
   * Print suite result summary
   */
  private printSuiteResult(result: TestSuiteResult): void {
    const statusIcon = result.failed === 0 ? '✅' : '❌';
    const duration = `${result.duration}ms`;

    console.log(`${statusIcon} ${result.name}: ${result.passed}/${result.total} passed (${duration})`);
    
    if (result.failed > 0) {
      console.log(`   ❌ ${result.failed} failed, ${result.skipped} skipped`);
      
      result.results
        .filter(r => r.status === 'failed')
        .forEach(r => {
          console.log(`      • ${r.test}: ${r.error || 'Unknown error'}`);
        });
    }
  }

  /**
   * Print overall test results
   */
  private printOverallResults(): void {
    console.log('\n📊 Overall Test Results');
    console.log('======================');

    const totalTests = this.results.reduce((sum, r) => sum + r.total, 0);
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const totalSkipped = this.results.reduce((sum, r) => sum + r.skipped, 0);
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`⏭️  Skipped: ${totalSkipped}`);
    console.log(`⏱️  Duration: ${totalDuration}ms`);

    const successRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
    console.log(`📈 Success Rate: ${successRate}%`);

    if (totalFailed === 0) {
      console.log('\n🎉 All tests passed! Phase 3 team collaboration features are working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the results above.');
    }
  }

  /**
   * Generate comprehensive test report
   */
  private generateReport(): void {
    const reportPath = path.join(this.config.outputDir, 'test-report.json');
    const htmlReportPath = path.join(this.config.outputDir, 'test-report.html');

    // Generate JSON report
    const report = {
      timestamp: new Date().toISOString(),
      config: this.config,
      results: this.results,
      summary: {
        totalTests: this.results.reduce((sum, r) => sum + r.total, 0),
        totalPassed: this.results.reduce((sum, r) => sum + r.passed, 0),
        totalFailed: this.results.reduce((sum, r) => sum + r.failed, 0),
        totalSkipped: this.results.reduce((sum, r) => sum + r.skipped, 0),
        totalDuration: this.results.reduce((sum, r) => sum + r.duration, 0),
        successRate: this.results.reduce((sum, r) => sum + r.total, 0) > 0 
          ? Math.round((this.results.reduce((sum, r) => sum + r.passed, 0) / this.results.reduce((sum, r) => sum + r.total, 0)) * 100)
          : 0
      }
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHtmlReport(report);
    fs.writeFileSync(htmlReportPath, htmlReport);

    console.log(`\n📄 Test report generated: ${reportPath}`);
    console.log(`🌐 HTML report: ${htmlReportPath}`);
  }

  /**
   * Generate HTML test report
   */
  private generateHtmlReport(report: any): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phase 3 Team Collaboration Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #e8f4fd; padding: 15px; border-radius: 5px; text-align: center; }
        .metric h3 { margin: 0; color: #2c5aa0; }
        .metric .value { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .suite { margin: 20px 0; border: 1px solid #ddd; border-radius: 5px; }
        .suite-header { background: #f8f9fa; padding: 15px; font-weight: bold; }
        .suite-content { padding: 15px; }
        .test-result { margin: 5px 0; padding: 5px; border-radius: 3px; }
        .passed { background: #d4edda; color: #155724; }
        .failed { background: #f8d7da; color: #721c24; }
        .skipped { background: #fff3cd; color: #856404; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Phase 3 Team Collaboration Test Report</h1>
        <p>Generated: ${report.timestamp}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <div class="value">${report.summary.totalTests}</div>
        </div>
        <div class="metric">
            <h3>Passed</h3>
            <div class="value" style="color: #28a745;">${report.summary.totalPassed}</div>
        </div>
        <div class="metric">
            <h3>Failed</h3>
            <div class="value" style="color: #dc3545;">${report.summary.totalFailed}</div>
        </div>
        <div class="metric">
            <h3>Success Rate</h3>
            <div class="value" style="color: #007bff;">${report.summary.successRate}%</div>
        </div>
    </div>

    ${report.results.map(suite => `
        <div class="suite">
            <div class="suite-header">
                ${suite.name} (${suite.passed}/${suite.total} passed, ${suite.duration}ms)
            </div>
            <div class="suite-content">
                ${suite.results.map(test => `
                    <div class="test-result ${test.status}">
                        ${test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️'} 
                        ${test.test}
                        ${test.error ? `<br><small>Error: ${test.error}</small>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('')}
</body>
</html>
    `.trim();
  }

  /**
   * Ensure output directory exists
   */
  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  /**
   * Run performance tests
   */
  async runPerformanceTests(): Promise<void> {
    if (!this.config.performance) return;

    console.log('\n⚡ Running Performance Tests');
    console.log('============================');

    const performanceTests = [
      {
        name: 'Large Team Creation',
        test: 'src/tests/performance/large-team-creation.test.ts'
      },
      {
        name: 'Concurrent Operations',
        test: 'src/tests/performance/concurrent-operations.test.ts'
      },
      {
        name: 'Memory Usage',
        test: 'src/tests/performance/memory-usage.test.ts'
      }
    ];

    for (const perfTest of performanceTests) {
      console.log(`\n🔬 ${perfTest.name}`);
      try {
        const startTime = Date.now();
        execSync(`npx jest ${perfTest.test} --verbose`, { 
          encoding: 'utf-8',
          timeout: 60000 
        });
        const duration = Date.now() - startTime;
        console.log(`✅ Completed in ${duration}ms`);
      } catch (error) {
        console.log(`❌ Failed: ${error.message}`);
      }
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const config: Partial<TestRunnerConfig> = {
    verbose: process.argv.includes('--verbose'),
    coverage: !process.argv.includes('--no-coverage'),
    performance: process.argv.includes('--performance'),
    parallel: !process.argv.includes('--no-parallel'),
    outputDir: process.argv.find(arg => arg.startsWith('--output='))?.split('=')[1] || './test-results'
  };

  const runner = new TeamCollaborationTestRunner(config);
  
  runner.runAllTests()
    .then(() => {
      if (config.performance) {
        return runner.runPerformanceTests();
      }
    })
    .then(() => {
      console.log('\n🎉 Test execution completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test execution failed:', error);
      process.exit(1);
    });
}

export { TeamCollaborationTestRunner };
