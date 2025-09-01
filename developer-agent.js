const fs = require('fs').promises;
const path = require('path');
const { chromium } = require('playwright');

class DeveloperAgent {
    constructor(config = {}) {
        this.config = {
            outputDir: config.outputDir ?? './dev-analysis',
            analyzeCSS: config.analyzeCSS ?? true,
            analyzeHTML: config.analyzeHTML ?? true,
            analyzeJS: config.analyzeJS ?? true,
            generateOptimizations: config.generateOptimizations ?? true,
            checkBestPractices: config.checkBestPractices ?? true,
            validateCode: config.validateCode ?? true,
            ...config
        };

        this.results = {
            summary: {},
            files: {},
            optimizations: [],
            issues: [],
            metrics: {}
        };
    }

    async init() {
        try {
            await fs.mkdir(this.config.outputDir, { recursive: true });
        } catch (error) {
            // Directory already exists
        }
    }

    async analyzeCodebase() {
        console.log('🔧 Starting Developer Agent Analysis...\n');
        
        await this.init();

        // Analyze all files in current directory
        const files = await this.discoverFiles();
        console.log(`📁 Found ${files.length} files to analyze\n`);

        for (const file of files) {
            console.log(`🔍 Analyzing: ${file.name}`);
            await this.analyzeFile(file);
        }

        // Generate insights and recommendations
        await this.generateOptimizationReport();
        await this.checkBestPractices();
        await this.generateCodeMetrics();
        
        await this.generateDeveloperReport();
        
        return this.results;
    }

    async discoverFiles() {
        const files = [];
        const entries = await fs.readdir('.', { withFileTypes: true });
        
        for (const entry of entries) {
            if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                const relevantExtensions = ['.html', '.css', '.js', '.json'];
                
                if (relevantExtensions.includes(ext) && !entry.name.includes('node_modules')) {
                    files.push({
                        name: entry.name,
                        path: path.resolve(entry.name),
                        type: ext.substring(1),
                        size: (await fs.stat(entry.name)).size
                    });
                }
            }
        }
        
        return files.sort((a, b) => a.name.localeCompare(b.name));
    }

    async analyzeFile(file) {
        try {
            const content = await fs.readFile(file.name, 'utf8');
            const analysis = {
                file: file.name,
                type: file.type,
                size: file.size,
                lines: content.split('\n').length,
                issues: [],
                suggestions: [],
                metrics: {}
            };

            switch (file.type) {
                case 'html':
                    await this.analyzeHTML(content, analysis);
                    break;
                case 'css':
                    await this.analyzeCSS(content, analysis);
                    break;
                case 'js':
                    await this.analyzeJavaScript(content, analysis);
                    break;
                case 'json':
                    await this.analyzeJSON(content, analysis);
                    break;
            }

            this.results.files[file.name] = analysis;
            
        } catch (error) {
            console.log(`  ❌ Error analyzing ${file.name}: ${error.message}`);
        }
    }

    async analyzeHTML(content, analysis) {
        const issues = [];
        const suggestions = [];

        // Check for embedded styles
        const styleMatches = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
        if (styleMatches && styleMatches.length > 0) {
            const totalStyleLength = styleMatches.reduce((sum, match) => sum + match.length, 0);
            analysis.metrics.embeddedStylesSize = totalStyleLength;
            
            if (totalStyleLength > 50000) {
                issues.push({
                    type: 'performance',
                    severity: 'medium',
                    message: 'Large embedded styles detected. Consider external CSS files for better caching.',
                    line: this.findLineNumber(content, styleMatches[0])
                });
                suggestions.push('Extract large CSS blocks to external files for better performance and maintainability');
            }
        }

        // Check for inline styles
        const inlineStyleCount = (content.match(/style\s*=/gi) || []).length;
        analysis.metrics.inlineStyles = inlineStyleCount;
        if (inlineStyleCount > 10) {
            issues.push({
                type: 'maintainability',
                severity: 'low',
                message: `${inlineStyleCount} inline styles found. Consider using CSS classes.`
            });
        }

        // Check for embedded JavaScript
        const scriptMatches = content.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
        if (scriptMatches) {
            const jsContent = scriptMatches.filter(script => !script.includes('src=')).join('');
            analysis.metrics.embeddedJSSize = jsContent.length;
            
            if (jsContent.length > 10000) {
                issues.push({
                    type: 'performance',
                    severity: 'medium',
                    message: 'Large embedded JavaScript detected. Consider external JS files.'
                });
            }
        }

        // SEO and accessibility checks
        const titleMatch = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        if (titleMatch) {
            const titleLength = titleMatch[1].trim().length;
            analysis.metrics.titleLength = titleLength;
            if (titleLength < 30 || titleLength > 60) {
                issues.push({
                    type: 'seo',
                    severity: 'medium',
                    message: `Title length (${titleLength}) should be 30-60 characters`
                });
            }
        }

        // Check for meta description
        const metaDescMatch = content.match(/<meta\s+name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']*?)["'][^>]*>/i);
        if (metaDescMatch) {
            const descLength = metaDescMatch[1].length;
            analysis.metrics.metaDescriptionLength = descLength;
            if (descLength < 120 || descLength > 160) {
                issues.push({
                    type: 'seo',
                    severity: 'medium',
                    message: `Meta description length (${descLength}) should be 120-160 characters`
                });
            }
        }

        // Check for missing alt attributes
        const imgTags = content.match(/<img[^>]*>/gi) || [];
        const imagesWithoutAlt = imgTags.filter(img => !img.includes('alt=')).length;
        analysis.metrics.imagesWithoutAlt = imagesWithoutAlt;
        if (imagesWithoutAlt > 0) {
            issues.push({
                type: 'accessibility',
                severity: 'high',
                message: `${imagesWithoutAlt} images without alt attributes found`
            });
        }

        // Performance suggestions
        suggestions.push('Consider using WebP format for images to reduce file sizes');
        suggestions.push('Add preconnect links for external domains to improve loading speed');
        suggestions.push('Implement lazy loading for images below the fold');

        analysis.issues = issues;
        analysis.suggestions = suggestions;
    }

    async analyzeCSS(content, analysis) {
        const issues = [];
        const suggestions = [];

        // Check for unused selectors (basic heuristic)
        const selectors = content.match(/[^{}]*{/g) || [];
        analysis.metrics.totalSelectors = selectors.length;

        // Check for duplicate properties
        const properties = content.match(/[^{}]*:[^{}]*;/g) || [];
        const propertyCount = {};
        properties.forEach(prop => {
            const key = prop.split(':')[0].trim();
            propertyCount[key] = (propertyCount[key] || 0) + 1;
        });

        // Check for overly specific selectors
        const overlySpecific = selectors.filter(selector => 
            (selector.match(/\s/g) || []).length > 3
        ).length;
        
        if (overlySpecific > 0) {
            issues.push({
                type: 'maintainability',
                severity: 'low',
                message: `${overlySpecific} overly specific selectors found`
            });
        }

        // Check for !important usage
        const importantCount = (content.match(/!important/gi) || []).length;
        analysis.metrics.importantDeclarations = importantCount;
        if (importantCount > 5) {
            issues.push({
                type: 'maintainability',
                severity: 'medium',
                message: `${importantCount} !important declarations found. Consider refactoring CSS specificity.`
            });
        }

        // Check for vendor prefixes
        const vendorPrefixes = (content.match(/-webkit-|-moz-|-ms-|-o-/g) || []).length;
        analysis.metrics.vendorPrefixes = vendorPrefixes;

        // Performance suggestions
        suggestions.push('Use CSS custom properties (variables) for consistent theming');
        suggestions.push('Consider using CSS Grid and Flexbox for modern layouts');
        suggestions.push('Minimize use of complex selectors for better performance');

        analysis.issues = issues;
        analysis.suggestions = suggestions;
    }

    async analyzeJavaScript(content, analysis) {
        const issues = [];
        const suggestions = [];

        // Basic syntax and best practice checks
        const lines = content.split('\n');
        
        // Check for console.log statements
        const consoleLogCount = (content.match(/console\.log/g) || []).length;
        if (consoleLogCount > 0) {
            issues.push({
                type: 'production',
                severity: 'low',
                message: `${consoleLogCount} console.log statements found. Remove for production.`
            });
        }

        // Check for var usage (prefer let/const)
        const varCount = (content.match(/\bvar\s+/g) || []).length;
        if (varCount > 0) {
            issues.push({
                type: 'best-practice',
                severity: 'low',
                message: `${varCount} 'var' declarations found. Consider using 'let' or 'const'.`
            });
        }

        // Check for function complexity (basic heuristic)
        const functions = content.match(/function[^{]*{[^{}]*}/g) || [];
        const complexFunctions = functions.filter(fn => fn.split('\n').length > 20).length;
        if (complexFunctions > 0) {
            issues.push({
                type: 'maintainability',
                severity: 'medium',
                message: `${complexFunctions} functions with high complexity. Consider refactoring.`
            });
        }

        // Check for modern JavaScript features
        const hasArrowFunctions = content.includes('=>');
        const hasAsyncAwait = content.includes('async') && content.includes('await');
        
        analysis.metrics.usesModernJS = hasArrowFunctions || hasAsyncAwait;
        analysis.metrics.functionCount = (content.match(/function\s+\w+/g) || []).length;
        analysis.metrics.complexityScore = this.calculateComplexityScore(content);

        // Performance suggestions
        suggestions.push('Use event delegation for better performance with many elements');
        suggestions.push('Consider using requestAnimationFrame for smooth animations');
        suggestions.push('Minimize DOM manipulation by batching updates');

        analysis.issues = issues;
        analysis.suggestions = suggestions;
    }

    async analyzeJSON(content, analysis) {
        const issues = [];
        const suggestions = [];

        try {
            const json = JSON.parse(content);
            
            // Check package.json specific issues
            if (analysis.file === 'package.json') {
                if (!json.description || json.description.length === 0) {
                    issues.push({
                        type: 'metadata',
                        severity: 'low',
                        message: 'Missing package description'
                    });
                }

                if (!json.repository) {
                    issues.push({
                        type: 'metadata',
                        severity: 'low',
                        message: 'Missing repository information'
                    });
                }

                if (json.dependencies) {
                    analysis.metrics.dependencyCount = Object.keys(json.dependencies).length;
                }
            }

        } catch (error) {
            issues.push({
                type: 'syntax',
                severity: 'high',
                message: `Invalid JSON: ${error.message}`
            });
        }

        analysis.issues = issues;
        analysis.suggestions = suggestions;
    }

    calculateComplexityScore(jsContent) {
        let score = 0;
        
        // Count control structures
        score += (jsContent.match(/\b(if|for|while|switch|try)\b/g) || []).length;
        
        // Count logical operators
        score += (jsContent.match(/(\|\||&&)/g) || []).length;
        
        // Count nested functions
        const functionDepth = this.calculateMaxNestingDepth(jsContent, 'function');
        score += functionDepth * 2;
        
        return score;
    }

    calculateMaxNestingDepth(content, keyword) {
        let maxDepth = 0;
        let currentDepth = 0;
        
        for (let i = 0; i < content.length; i++) {
            if (content.substr(i, keyword.length) === keyword) {
                currentDepth++;
                maxDepth = Math.max(maxDepth, currentDepth);
            } else if (content[i] === '}') {
                currentDepth = Math.max(0, currentDepth - 1);
            }
        }
        
        return maxDepth;
    }

    findLineNumber(content, searchText) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(searchText.substring(0, 50))) {
                return i + 1;
            }
        }
        return 1;
    }

    async generateOptimizationReport() {
        console.log('⚡ Generating optimization recommendations...');
        
        const optimizations = [];

        // Analyze overall codebase patterns
        const htmlFiles = Object.values(this.results.files).filter(f => f.type === 'html');
        const totalEmbeddedCSS = htmlFiles.reduce((sum, f) => sum + (f.metrics.embeddedStylesSize || 0), 0);
        
        if (totalEmbeddedCSS > 100000) {
            optimizations.push({
                priority: 'high',
                type: 'performance',
                title: 'Extract Embedded CSS',
                description: `${Math.round(totalEmbeddedCSS/1000)}KB of embedded CSS found across HTML files`,
                impact: 'Improves caching, reduces HTML file sizes, enables parallel loading',
                implementation: [
                    'Create shared CSS file (e.g., styles.css)',
                    'Extract common styles and variables',
                    'Link CSS file in HTML head sections',
                    'Remove duplicate style blocks'
                ]
            });
        }

        // Check for code duplication
        const duplicateCSS = this.findDuplicateCSS();
        if (duplicateCSS.length > 0) {
            optimizations.push({
                priority: 'medium',
                type: 'maintainability',
                title: 'Eliminate CSS Duplication',
                description: `${duplicateCSS.length} duplicate CSS patterns found`,
                impact: 'Reduces file sizes, improves maintainability',
                implementation: [
                    'Create CSS utility classes',
                    'Use CSS custom properties for repeated values',
                    'Consolidate similar styles'
                ]
            });
        }

        // Performance optimizations
        optimizations.push({
            priority: 'medium',
            type: 'performance',
            title: 'Implement Asset Optimization',
            description: 'Optimize images, fonts, and other assets',
            impact: 'Faster page load times, better Core Web Vitals',
            implementation: [
                'Convert images to WebP format',
                'Implement responsive images with srcset',
                'Add font-display: swap for web fonts',
                'Enable gzip/brotli compression'
            ]
        });

        this.results.optimizations = optimizations;
    }

    findDuplicateCSS() {
        // Simplified duplicate detection
        const cssRules = [];
        const duplicates = [];
        
        Object.values(this.results.files).forEach(file => {
            if (file.type === 'css' || file.type === 'html') {
                // This would need more sophisticated CSS parsing in production
                // For now, return empty array
            }
        });
        
        return duplicates;
    }

    async checkBestPractices() {
        console.log('✅ Checking development best practices...');
        
        const practices = {
            hasReadme: await this.fileExists('README.md'),
            hasGitignore: await this.fileExists('.gitignore'),
            hasLicense: await this.fileExists('LICENSE') || await this.fileExists('LICENSE.md'),
            hasPackageJson: await this.fileExists('package.json'),
            hasSecurityPolicy: await this.fileExists('SECURITY.md'),
            usesSemver: await this.checkSemverUsage(),
            hasContributingGuide: await this.fileExists('CONTRIBUTING.md'),
            hasCodeOfConduct: await this.fileExists('CODE_OF_CONDUCT.md')
        };

        this.results.bestPractices = practices;
    }

    async fileExists(filename) {
        try {
            await fs.access(filename);
            return true;
        } catch {
            return false;
        }
    }

    async checkSemverUsage() {
        try {
            const packageJson = await fs.readFile('package.json', 'utf8');
            const pkg = JSON.parse(packageJson);
            return /^\d+\.\d+\.\d+/.test(pkg.version || '');
        } catch {
            return false;
        }
    }

    async generateCodeMetrics() {
        console.log('📊 Calculating code metrics...');
        
        const files = Object.values(this.results.files);
        const metrics = {
            totalFiles: files.length,
            totalLines: files.reduce((sum, f) => sum + f.lines, 0),
            totalSize: files.reduce((sum, f) => sum + f.size, 0),
            byFileType: {},
            issuesSeverityCount: { high: 0, medium: 0, low: 0 },
            totalIssues: 0,
            codeQualityScore: 0
        };

        // Group by file type
        files.forEach(file => {
            if (!metrics.byFileType[file.type]) {
                metrics.byFileType[file.type] = { count: 0, lines: 0, size: 0 };
            }
            metrics.byFileType[file.type].count++;
            metrics.byFileType[file.type].lines += file.lines;
            metrics.byFileType[file.type].size += file.size;

            // Count issues by severity
            file.issues.forEach(issue => {
                metrics.issuesSeverityCount[issue.severity]++;
                metrics.totalIssues++;
            });
        });

        // Calculate quality score (0-100)
        const maxIssues = metrics.totalLines / 10; // Assume 1 issue per 10 lines is reasonable
        const issueRatio = Math.min(metrics.totalIssues / maxIssues, 1);
        metrics.codeQualityScore = Math.round((1 - issueRatio) * 100);

        this.results.metrics = metrics;
    }

    async generateDeveloperReport() {
        const timestamp = new Date().toISOString();
        const report = {
            timestamp,
            summary: this.generateSummary(),
            metrics: this.results.metrics,
            files: this.results.files,
            optimizations: this.results.optimizations,
            bestPractices: this.results.bestPractices
        };

        // Write JSON report
        await fs.writeFile(
            `${this.config.outputDir}/developer-report-${timestamp.split('T')[0]}.json`,
            JSON.stringify(report, null, 2)
        );

        // Write HTML report
        const htmlReport = this.generateHTMLReport(report);
        await fs.writeFile(
            `${this.config.outputDir}/developer-report-${timestamp.split('T')[0]}.html`,
            htmlReport
        );

        console.log('\n' + '='.repeat(80));
        console.log('🔧 DEVELOPER AGENT ANALYSIS SUMMARY');
        console.log('='.repeat(80));
        console.log(this.generateConsoleSummary());
        console.log('='.repeat(80));
    }

    generateSummary() {
        const metrics = this.results.metrics;
        return {
            totalFiles: metrics.totalFiles,
            totalLines: metrics.totalLines,
            totalSize: Math.round(metrics.totalSize / 1024), // KB
            codeQualityScore: metrics.codeQualityScore,
            totalIssues: metrics.totalIssues,
            optimizationCount: this.results.optimizations.length
        };
    }

    generateConsoleSummary() {
        const summary = this.generateSummary();
        let output = `\n📊 Code Quality Score: ${summary.codeQualityScore}%\n`;
        output += `📁 Files Analyzed: ${summary.totalFiles} (${summary.totalLines} lines, ${summary.totalSize}KB)\n`;
        output += `⚠️  Issues Found: ${summary.totalIssues}\n`;
        output += `⚡ Optimizations Available: ${summary.optimizationCount}\n\n`;
        
        // Show file type breakdown
        Object.entries(this.results.metrics.byFileType).forEach(([type, data]) => {
            output += `📄 ${type.toUpperCase()}: ${data.count} files, ${data.lines} lines\n`;
        });

        return output;
    }

    generateHTMLReport(report) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Developer Analysis Report - ${report.timestamp.split('T')[0]}</title>
    <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 40px; background: #f5f5f5; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .section { background: white; margin-bottom: 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .section-header { padding: 20px; background: #667eea; color: white; }
        .section-content { padding: 20px; }
        .issue { padding: 10px; margin: 10px 0; border-radius: 4px; border-left: 4px solid; }
        .high { background: #fee; border-left-color: #ef4444; }
        .medium { background: #fef3cd; border-left-color: #f59e0b; }
        .low { background: #eff6ff; border-left-color: #3b82f6; }
        .optimization { background: #f0f9ff; padding: 15px; margin: 10px 0; border-radius: 6px; border: 1px solid #e0f2fe; }
        .score { font-size: 2em; font-weight: bold; color: #667eea; }
        .file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔧 Developer Analysis Report</h1>
        <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="metrics">
        <div class="metric-card">
            <div class="score">${report.summary.codeQualityScore}%</div>
            <div>Code Quality Score</div>
        </div>
        <div class="metric-card">
            <div class="score">${report.summary.totalFiles}</div>
            <div>Files Analyzed</div>
        </div>
        <div class="metric-card">
            <div class="score">${report.summary.totalIssues}</div>
            <div>Issues Found</div>
        </div>
        <div class="metric-card">
            <div class="score">${report.summary.optimizationCount}</div>
            <div>Optimizations</div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">
            <h2>⚡ Optimization Recommendations</h2>
        </div>
        <div class="section-content">
            ${report.optimizations.map(opt => `
                <div class="optimization">
                    <h3>${opt.title} (${opt.priority} priority)</h3>
                    <p><strong>Impact:</strong> ${opt.impact}</p>
                    <p><strong>Description:</strong> ${opt.description}</p>
                    <ul>
                        ${opt.implementation.map(step => `<li>${step}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <div class="section-header">
            <h2>📊 File Analysis</h2>
        </div>
        <div class="section-content">
            <div class="file-grid">
                ${Object.values(report.files).map(file => `
                    <div class="file-analysis">
                        <h4>${file.file} (${file.type})</h4>
                        <p>${file.lines} lines, ${Math.round(file.size/1024)}KB</p>
                        ${file.issues.map(issue => `
                            <div class="issue ${issue.severity}">
                                <strong>${issue.type}:</strong> ${issue.message}
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        </div>
    </div>

</body>
</html>`;
    }
}

// Export for use as module or run directly
if (require.main === module) {
    const agent = new DeveloperAgent({
        outputDir: './dev-analysis'
    });
    
    agent.analyzeCodebase().catch(console.error);
}

module.exports = DeveloperAgent;