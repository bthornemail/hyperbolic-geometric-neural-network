#!/usr/bin/env tsx

/**
 * Coverage Analysis Tool
 * 
 * Analyzes the codebase to identify components without test coverage
 * and generates a report of missing tests.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface CoverageAnalysis {
  totalFiles: number;
  testedFiles: number;
  untestedFiles: string[];
  coverageByCategory: Record<string, {
    total: number;
    tested: number;
    untested: string[];
  }>;
  recommendations: string[];
}

export class CoverageAnalyzer {
  private srcPath: string;
  private testsPath: string;

  constructor() {
    this.srcPath = path.join(process.cwd(), 'src');
    this.testsPath = path.join(process.cwd(), 'src/tests');
  }

  /**
   * Analyze codebase coverage
   */
  async analyzeCoverage(): Promise<CoverageAnalysis> {
    console.log('🔍 Analyzing codebase coverage...');

    const allSourceFiles = this.getAllSourceFiles();
    const existingTestFiles = this.getExistingTestFiles();
    const untestedFiles = this.findUntestedFiles(allSourceFiles, existingTestFiles);
    
    const coverageByCategory = this.categorizeCoverage(allSourceFiles, untestedFiles);
    const recommendations = this.generateRecommendations(untestedFiles, coverageByCategory);

    return {
      totalFiles: allSourceFiles.length,
      testedFiles: allSourceFiles.length - untestedFiles.length,
      untestedFiles,
      coverageByCategory,
      recommendations
    };
  }

  /**
   * Get all source files that should be tested
   */
  private getAllSourceFiles(): string[] {
    const sourceFiles: string[] = [];
    
    const scanDirectory = (dir: string, relativePath: string = '') => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativeItemPath = path.join(relativePath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip certain directories
          if (!['tests', 'node_modules', '.git'].includes(item)) {
            scanDirectory(fullPath, relativeItemPath);
          }
        } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
          // Skip test files, config files, and entry points
          if (!item.includes('.test.') && 
              !item.includes('.spec.') && 
              !item.includes('.config.') &&
              !item.includes('.setup.') &&
              !['main.tsx', 'App.tsx', 'index.css', 'vite-env.d.ts'].includes(item)) {
            sourceFiles.push(relativeItemPath);
          }
        }
      }
    };

    scanDirectory(this.srcPath);
    return sourceFiles;
  }

  /**
   * Get existing test files
   */
  private getExistingTestFiles(): string[] {
    const testFiles: string[] = [];
    
    const scanTestDirectory = (dir: string, relativePath: string = '') => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativeItemPath = path.join(relativePath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanTestDirectory(fullPath, relativeItemPath);
        } else if (item.endsWith('.test.ts') || item.endsWith('.spec.ts')) {
          testFiles.push(relativeItemPath);
        }
      }
    };

    scanTestDirectory(this.testsPath);
    return testFiles;
  }

  /**
   * Find files without corresponding tests
   */
  private findUntestedFiles(sourceFiles: string[], testFiles: string[]): string[] {
    const untestedFiles: string[] = [];
    
    for (const sourceFile of sourceFiles) {
      const baseName = path.basename(sourceFile, '.ts');
      const hasTest = testFiles.some(testFile => 
        testFile.includes(baseName) || 
        testFile.includes(baseName.replace(/-/g, ''))
      );
      
      if (!hasTest) {
        untestedFiles.push(sourceFile);
      }
    }
    
    return untestedFiles;
  }

  /**
   * Categorize coverage by component type
   */
  private categorizeCoverage(sourceFiles: string[], untestedFiles: string[]): Record<string, any> {
    const categories: Record<string, any> = {};
    
    const categorizeFile = (file: string, isTested: boolean) => {
      const category = this.getFileCategory(file);
      
      if (!categories[category]) {
        categories[category] = {
          total: 0,
          tested: 0,
          untested: []
        };
      }
      
      categories[category].total++;
      
      if (isTested) {
        categories[category].tested++;
      } else {
        categories[category].untested.push(file);
      }
    };

    // Categorize all files
    for (const file of sourceFiles) {
      const isTested = !untestedFiles.includes(file);
      categorizeFile(file, isTested);
    }

    return categories;
  }

  /**
   * Get category for a file based on its path
   */
  private getFileCategory(file: string): string {
    if (file.startsWith('core/')) return 'Core Components';
    if (file.startsWith('math/')) return 'Mathematical Components';
    if (file.startsWith('analysis/')) return 'Analysis Components';
    if (file.startsWith('intelligence/')) return 'Intelligence Components';
    if (file.startsWith('mcp/')) return 'MCP Servers';
    if (file.startsWith('integration/')) return 'Integration Components';
    if (file.startsWith('workflows/')) return 'Workflows';
    if (file.startsWith('rules/')) return 'Rules Engine';
    if (file.startsWith('generation/')) return 'Code Generation';
    if (file.startsWith('training/')) return 'Training Pipeline';
    if (file.startsWith('transfer/')) return 'Transfer Learning';
    if (file.startsWith('visualization/')) return 'Visualization';
    if (file.startsWith('llm/')) return 'LLM Components';
    if (file.startsWith('refactoring/')) return 'Refactoring Tools';
    if (file.startsWith('layers/')) return 'Neural Layers';
    if (file.startsWith('datasets/')) return 'Datasets';
    return 'Other Components';
  }

  /**
   * Generate recommendations for improving coverage
   */
  private generateRecommendations(untestedFiles: string[], coverageByCategory: Record<string, any>): string[] {
    const recommendations: string[] = [];
    
    // Priority recommendations based on category
    const priorityCategories = [
      'Core Components',
      'Mathematical Components',
      'MCP Servers',
      'Workflows',
      'Rules Engine'
    ];
    
    for (const category of priorityCategories) {
      if (coverageByCategory[category] && coverageByCategory[category].untested.length > 0) {
        const coverage = Math.round((coverageByCategory[category].tested / coverageByCategory[category].total) * 100);
        recommendations.push(`🎯 Priority: ${category} has ${coverage}% coverage. Add tests for: ${coverageByCategory[category].untested.slice(0, 3).join(', ')}`);
      }
    }
    
    // General recommendations
    if (untestedFiles.length > 0) {
      recommendations.push(`📊 ${untestedFiles.length} files need test coverage`);
      recommendations.push(`🔧 Run 'npm run test:coverage' to see current coverage`);
      recommendations.push(`📝 Create test files for untested components`);
    }
    
    return recommendations;
  }

  /**
   * Generate coverage report
   */
  generateReport(analysis: CoverageAnalysis): string {
    const totalCoverage = Math.round((analysis.testedFiles / analysis.totalFiles) * 100);
    
    let report = `
# Codebase Coverage Analysis Report
=====================================

## 📊 Overall Coverage
- **Total Files**: ${analysis.totalFiles}
- **Tested Files**: ${analysis.testedFiles}
- **Untested Files**: ${analysis.untestedFiles.length}
- **Coverage**: ${totalCoverage}%

## 📋 Coverage by Category
`;

    for (const [category, data] of Object.entries(analysis.coverageByCategory)) {
      const categoryCoverage = Math.round((data.tested / data.total) * 100);
      report += `
### ${category}
- **Total**: ${data.total}
- **Tested**: ${data.tested}
- **Coverage**: ${categoryCoverage}%
- **Untested**: ${data.untested.length > 0 ? data.untested.slice(0, 5).join(', ') : 'None'}
`;
    }

    report += `
## 🎯 Recommendations
`;

    for (const recommendation of analysis.recommendations) {
      report += `- ${recommendation}\n`;
    }

    report += `
## 🚀 Next Steps
1. Run coverage analysis: \`npm run test:coverage\`
2. Create missing test files
3. Focus on high-priority categories first
4. Aim for 80%+ coverage across all categories
`;

    return report;
  }

  /**
   * Run Jest coverage and analyze results
   */
  async runCoverageAnalysis(): Promise<void> {
    try {
      console.log('🧪 Running Jest coverage analysis...');
      execSync('npx jest --coverage --passWithNoTests', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (error) {
      console.warn('⚠️ Coverage analysis completed with warnings');
    }
  }

  /**
   * Generate test templates for untested files
   */
  generateTestTemplates(untestedFiles: string[]): void {
    const templatesDir = path.join(this.testsPath, 'templates');
    
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    for (const file of untestedFiles.slice(0, 10)) { // Limit to first 10 for demo
      const template = this.generateTestTemplate(file);
      const templatePath = path.join(templatesDir, `${path.basename(file, '.ts')}.test.ts`);
      
      fs.writeFileSync(templatePath, template);
    }

    console.log(`📝 Generated test templates in ${templatesDir}`);
  }

  /**
   * Generate a test template for a specific file
   */
  private generateTestTemplate(file: string): string {
    const baseName = path.basename(file, '.ts');
    const category = this.getFileCategory(file);
    
    return `#!/usr/bin/env tsx

/**
 * ${baseName} Tests
 * 
 * Test suite for ${file}
 * Category: ${category}
 */

import { ${baseName} } from '../../${file.replace('.ts', '')}';

describe('${baseName}', () => {
  let instance: ${baseName};

  beforeEach(() => {
    // Setup test instance
    instance = new ${baseName}();
  });

  afterEach(() => {
    // Cleanup
  });

  describe('Initialization', () => {
    test('should create instance successfully', () => {
      expect(instance).toBeDefined();
    });
  });

  // Add more tests based on the component's functionality
  // TODO: Implement comprehensive test coverage
});
`;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new CoverageAnalyzer();
  
  analyzer.analyzeCoverage()
    .then(analysis => {
      const report = analyzer.generateReport(analysis);
      console.log(report);
      
      // Save report to file
      const reportPath = path.join(process.cwd(), 'coverage-analysis-report.md');
      fs.writeFileSync(reportPath, report);
      console.log(`📄 Report saved to: ${reportPath}`);
      
      // Generate test templates
      if (analysis.untestedFiles.length > 0) {
        analyzer.generateTestTemplates(analysis.untestedFiles);
      }
    })
    .catch(error => {
      console.error('❌ Coverage analysis failed:', error);
      process.exit(1);
    });
}

// Export is already defined above
