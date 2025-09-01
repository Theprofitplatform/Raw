#!/usr/bin/env node

const DeveloperAgent = require('./developer-agent');
const TesterAgent = require('./tester-agent');
const EnhancedUITestingAgent = require('./enhanced-ui-testing-agent');
const fs = require('fs').promises;
const path = require('path');

/**
 * Agent Orchestrator - Coordinates multiple testing and development agents
 * Usage: node agent-orchestrator.js [--config=path] [--agents=dev,test,ui] [--parallel] [--help]
 */

class AgentOrchestrator {
    constructor(config = {}) {
        this.config = {
            outputDir: config.outputDir ?? './orchestrator-results',
            runDeveloperAgent: config.runDeveloperAgent ?? true,
            runTesterAgent: config.runTesterAgent ?? true,
            runUITestingAgent: config.runUITestingAgent ?? true,
            runInParallel: config.runInParallel ?? false,
            generateCombinedReport: config.generateCombinedReport ?? true,
            ...config
        };

        this.results = {
            summary: {},
            agents: {},
            recommendations: [],
            timestamp: new Date().toISOString()
        };
    }

    async init() {
        try {
            await fs.mkdir(this.config.outputDir, { recursive: true });
        } catch (error) {
            // Directory already exists
        }
    }

    async orchestrateAgents() {
        console.log('🎭 Starting Agent Orchestrator...\n');
        console.log('🔧 Coordinating Developer, Tester, and UI Testing Agents\n');
        
        await this.init();
        const startTime = Date.now();

        if (this.config.runInParallel) {
            await this.runAgentsInParallel();
        } else {
            await this.runAgentsSequentially();
        }

        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);

        // Analyze results and generate insights
        await this.analyzeResults();
        
        // Generate combined report
        if (this.config.generateCombinedReport) {
            await this.generateCombinedReport(duration);
        }

        console.log(`\n✅ All agents completed in ${duration} seconds`);
        console.log(`📊 Combined results saved to: ${this.config.outputDir}`);
        
        return this.results;
    }

    async runAgentsInParallel() {
        console.log('🚀 Running agents in parallel...\n');
        
        const agentPromises = [];

        if (this.config.runDeveloperAgent) {
            agentPromises.push(this.runDeveloperAgent());
        }

        if (this.config.runTesterAgent) {
            agentPromises.push(this.runTesterAgent());
        }

        if (this.config.runUITestingAgent) {
            agentPromises.push(this.runUITestingAgent());
        }

        const results = await Promise.allSettled(agentPromises);
        
        // Process results
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const agentName = ['developer', 'tester', 'ui'][index];
                if (agentName && this.config[`run${agentName.charAt(0).toUpperCase() + agentName.slice(1)}Agent`]) {
                    this.results.agents[agentName] = result.value;
                }
            } else {
                console.error(`Agent failed:`, result.reason);
            }
        });
    }

    async runAgentsSequentially() {
        console.log('📋 Running agents sequentially...\n');

        if (this.config.runDeveloperAgent) {
            console.log('1️⃣ Running Developer Agent...');
            this.results.agents.developer = await this.runDeveloperAgent();
        }

        if (this.config.runTesterAgent) {
            console.log('2️⃣ Running Tester Agent...');
            this.results.agents.tester = await this.runTesterAgent();
        }

        if (this.config.runUITestingAgent) {
            console.log('3️⃣ Running UI Testing Agent...');
            this.results.agents.ui = await this.runUITestingAgent();
        }
    }

    async runDeveloperAgent() {
        try {
            const agent = new DeveloperAgent({
                outputDir: `${this.config.outputDir}/developer-analysis`
            });
            return await agent.analyzeCodebase();
        } catch (error) {
            console.error('❌ Developer Agent failed:', error.message);
            return { error: error.message };
        }
    }

    async runTesterAgent() {
        try {
            const agent = new TesterAgent({
                outputDir: `${this.config.outputDir}/comprehensive-tests`,
                headless: true,
                runUITests: true,
                runPerformanceTests: true,
                runAccessibilityTests: true,
                runSecurityTests: true,
                runFunctionalTests: true,
                mobileDeviceTesting: true,
                crossBrowserTesting: false // Disable for faster execution
            });
            return await agent.runAllTests();
        } catch (error) {
            console.error('❌ Tester Agent failed:', error.message);
            return { error: error.message };
        }
    }

    async runUITestingAgent() {
        try {
            const agent = new EnhancedUITestingAgent({
                outputDir: `${this.config.outputDir}/ui-tests`,
                headless: true,
                generateScreenshots: false, // Disable for faster execution
                checkAccessibility: true,
                checkPerformance: true,
                checkSEO: true,
                checkResponsive: true
            });
            return await agent.runAllTests();
        } catch (error) {
            console.error('❌ UI Testing Agent failed:', error.message);
            return { error: error.message };
        }
    }

    async analyzeResults() {
        console.log('🔍 Analyzing cross-agent results...');
        
        const insights = [];
        const recommendations = [];
        
        // Analyze Developer Agent results
        if (this.results.agents.developer && !this.results.agents.developer.error) {
            const devResults = this.results.agents.developer;
            
            if (devResults.metrics && devResults.metrics.codeQualityScore < 70) {
                insights.push({
                    type: 'code-quality',
                    severity: 'medium',
                    agent: 'developer',
                    message: `Code quality score is ${devResults.metrics.codeQualityScore}% - below recommended 70%`,
                    recommendation: 'Focus on addressing high-severity issues identified in the developer report'
                });
            }

            if (devResults.optimizations && devResults.optimizations.length > 0) {
                const highPriorityOptimizations = devResults.optimizations.filter(opt => opt.priority === 'high');
                if (highPriorityOptimizations.length > 0) {
                    recommendations.push({
                        category: 'performance',
                        priority: 'high',
                        title: 'High Priority Code Optimizations Available',
                        actions: highPriorityOptimizations.map(opt => opt.title),
                        impact: 'Significant improvement in site performance and maintainability'
                    });
                }
            }
        }

        // Analyze Tester Agent results
        if (this.results.agents.tester && !this.results.agents.tester.error) {
            const testResults = this.results.agents.tester;
            
            if (testResults.summary && testResults.summary.overallScore < 80) {
                insights.push({
                    type: 'test-coverage',
                    severity: 'high',
                    agent: 'tester',
                    message: `Overall test score is ${testResults.summary.overallScore}% - below recommended 80%`,
                    recommendation: 'Review failed tests and prioritize fixes for critical functionality'
                });
            }

            // Analyze specific test suite failures
            if (testResults.testSuites) {
                testResults.testSuites.forEach(suite => {
                    if (suite.summary.score < 60) {
                        insights.push({
                            type: 'test-failure',
                            severity: suite.type === 'security' ? 'high' : 'medium',
                            agent: 'tester',
                            message: `${suite.name} scored ${suite.summary.score}% - needs attention`,
                            recommendation: `Focus on improving ${suite.type} aspects of the website`
                        });
                    }
                });
            }
        }

        // Analyze UI Testing Agent results
        if (this.results.agents.ui && !this.results.agents.ui.error) {
            const uiResults = this.results.agents.ui;
            
            if (Array.isArray(uiResults) && uiResults.length > 0) {
                const averageScore = uiResults.reduce((sum, result) => sum + (result.overallScore || 0), 0) / uiResults.length;
                
                if (averageScore < 70) {
                    insights.push({
                        type: 'ui-consistency',
                        severity: 'medium',
                        agent: 'ui',
                        message: `UI consistency score is ${Math.round(averageScore)}% - below recommended 70%`,
                        recommendation: 'Review UI consistency issues across pages and implement standardized components'
                    });
                }
            }
        }

        // Cross-agent correlation analysis
        await this.performCrossAgentAnalysis(insights, recommendations);

        this.results.insights = insights;
        this.results.recommendations = recommendations;
    }

    async performCrossAgentAnalysis(insights, recommendations) {
        // Correlate findings from different agents
        const performanceIssues = insights.filter(i => 
            i.type === 'code-quality' || i.message.toLowerCase().includes('performance')
        );

        if (performanceIssues.length > 1) {
            recommendations.push({
                category: 'performance',
                priority: 'high',
                title: 'Multiple Performance Issues Detected',
                actions: [
                    'Review code optimization recommendations from Developer Agent',
                    'Address performance test failures from Tester Agent',
                    'Implement Core Web Vitals improvements'
                ],
                impact: 'Comprehensive performance improvements across code and user experience',
                correlation: 'Issues identified by multiple agents suggest systemic performance problems'
            });
        }

        const accessibilityIssues = insights.filter(i => 
            i.message.toLowerCase().includes('accessibility') || i.type === 'accessibility'
        );

        if (accessibilityIssues.length > 0) {
            recommendations.push({
                category: 'accessibility',
                priority: 'high',
                title: 'Accessibility Improvements Required',
                actions: [
                    'Add missing alt text to images',
                    'Improve color contrast ratios',
                    'Implement proper heading hierarchy',
                    'Add keyboard navigation support'
                ],
                impact: 'Better user experience for users with disabilities and improved SEO',
                correlation: 'Multiple agents detected accessibility gaps'
            });
        }
    }

    async generateCombinedReport(duration) {
        console.log('📋 Generating combined report...');
        
        const combinedReport = {
            timestamp: this.results.timestamp,
            duration,
            summary: this.generateOverallSummary(),
            agents: this.results.agents,
            insights: this.results.insights,
            recommendations: this.results.recommendations,
            actionPlan: this.generateActionPlan()
        };

        // Write JSON report
        await fs.writeFile(
            `${this.config.outputDir}/combined-agent-report-${this.results.timestamp.split('T')[0]}.json`,
            JSON.stringify(combinedReport, null, 2)
        );

        // Write HTML report
        const htmlReport = this.generateCombinedHTMLReport(combinedReport);
        await fs.writeFile(
            `${this.config.outputDir}/combined-agent-report-${this.results.timestamp.split('T')[0]}.html`,
            htmlReport
        );

        // Write executive summary
        const executiveSummary = this.generateExecutiveSummary(combinedReport);
        await fs.writeFile(
            `${this.config.outputDir}/executive-summary-${this.results.timestamp.split('T')[0]}.md`,
            executiveSummary
        );

        console.log('\n' + '='.repeat(80));
        console.log('🎭 AGENT ORCHESTRATOR SUMMARY');
        console.log('='.repeat(80));
        console.log(this.generateConsoleSummary(combinedReport));
        console.log('='.repeat(80));
    }

    generateOverallSummary() {
        const summary = {
            agentsRun: Object.keys(this.results.agents).length,
            agentsSuccessful: Object.keys(this.results.agents).filter(agent => !this.results.agents[agent].error).length,
            totalInsights: this.results.insights ? this.results.insights.length : 0,
            totalRecommendations: this.results.recommendations ? this.results.recommendations.length : 0,
            criticalIssues: 0,
            overallHealthScore: 0
        };

        // Calculate critical issues
        if (this.results.insights) {
            summary.criticalIssues = this.results.insights.filter(insight => insight.severity === 'high').length;
        }

        // Calculate overall health score (0-100)
        let totalScore = 0;
        let scoreCount = 0;

        if (this.results.agents.developer && this.results.agents.developer.metrics) {
            totalScore += this.results.agents.developer.metrics.codeQualityScore || 0;
            scoreCount++;
        }

        if (this.results.agents.tester && this.results.agents.tester.summary) {
            totalScore += this.results.agents.tester.summary.overallScore || 0;
            scoreCount++;
        }

        if (this.results.agents.ui && Array.isArray(this.results.agents.ui)) {
            const uiAverage = this.results.agents.ui.reduce((sum, result) => sum + (result.overallScore || 0), 0) / this.results.agents.ui.length;
            totalScore += uiAverage;
            scoreCount++;
        }

        summary.overallHealthScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

        return summary;
    }

    generateActionPlan() {
        const actionPlan = {
            immediate: [], // High priority, quick fixes
            shortTerm: [], // Medium priority, 1-2 week timeline
            longTerm: [], // Low priority, strategic improvements
            ongoing: [] // Continuous improvement items
        };

        if (this.results.recommendations) {
            this.results.recommendations.forEach(rec => {
                if (rec.priority === 'high') {
                    actionPlan.immediate.push({
                        title: rec.title,
                        category: rec.category,
                        actions: rec.actions.slice(0, 2), // First 2 actions
                        timeline: '1-3 days'
                    });
                } else if (rec.category === 'performance' || rec.category === 'security') {
                    actionPlan.shortTerm.push({
                        title: rec.title,
                        category: rec.category,
                        actions: rec.actions,
                        timeline: '1-2 weeks'
                    });
                } else {
                    actionPlan.longTerm.push({
                        title: rec.title,
                        category: rec.category,
                        actions: rec.actions,
                        timeline: '1-4 weeks'
                    });
                }
            });
        }

        // Add ongoing maintenance items
        actionPlan.ongoing.push(
            {
                title: 'Regular Code Quality Monitoring',
                actions: ['Run developer agent monthly', 'Review code quality metrics', 'Address technical debt'],
                timeline: 'Monthly'
            },
            {
                title: 'Continuous Testing',
                actions: ['Run comprehensive tests after major changes', 'Monitor performance metrics', 'Update test coverage'],
                timeline: 'Per deployment'
            }
        );

        return actionPlan;
    }

    generateConsoleSummary(report) {
        const summary = report.summary;
        let output = `\n🎯 Overall Health Score: ${summary.overallHealthScore}%\n`;
        output += `🤖 Agents Run: ${summary.agentsSuccessful}/${summary.agentsRun}\n`;
        output += `🔍 Insights Generated: ${summary.totalInsights}\n`;
        output += `💡 Recommendations: ${summary.totalRecommendations}\n`;
        output += `⚠️  Critical Issues: ${summary.criticalIssues}\n\n`;

        // Show agent results
        Object.entries(this.results.agents).forEach(([agentName, result]) => {
            const status = result.error ? '🔴' : '🟢';
            let score = 'N/A';
            
            if (agentName === 'developer' && result.metrics) {
                score = `${result.metrics.codeQualityScore}%`;
            } else if (agentName === 'tester' && result.summary) {
                score = `${result.summary.overallScore}%`;
            } else if (agentName === 'ui' && Array.isArray(result)) {
                const avg = result.reduce((sum, r) => sum + (r.overallScore || 0), 0) / result.length;
                score = `${Math.round(avg)}%`;
            }
            
            output += `${status} ${agentName.charAt(0).toUpperCase() + agentName.slice(1)} Agent: ${score}\n`;
        });

        return output;
    }

    generateExecutiveSummary(report) {
        const summary = report.summary;
        const timestamp = new Date(report.timestamp).toLocaleDateString();
        
        return `# Executive Summary - Website Analysis Report

**Date:** ${timestamp}  
**Overall Health Score:** ${summary.overallHealthScore}%  
**Analysis Duration:** ${report.duration} seconds

## Key Findings

### Website Health Overview
- **Agents Successfully Executed:** ${summary.agentsSuccessful}/${summary.agentsRun}
- **Critical Issues Identified:** ${summary.criticalIssues}
- **Total Recommendations:** ${summary.totalRecommendations}

### Agent Results Summary

${Object.entries(this.results.agents).map(([agentName, result]) => {
    if (result.error) {
        return `**${agentName.charAt(0).toUpperCase() + agentName.slice(1)} Agent:** ❌ Failed - ${result.error}`;
    }
    
    let details = '';
    if (agentName === 'developer' && result.metrics) {
        details = `Code Quality Score: ${result.metrics.codeQualityScore}%, ${result.metrics.totalIssues} issues found`;
    } else if (agentName === 'tester' && result.summary) {
        details = `${result.summary.passedTests}/${result.summary.totalTests} tests passed (${result.summary.overallScore}%)`;
    } else if (agentName === 'ui' && Array.isArray(result)) {
        const avg = Math.round(result.reduce((sum, r) => sum + (r.overallScore || 0), 0) / result.length);
        details = `UI Consistency Score: ${avg}%`;
    }
    
    return `**${agentName.charAt(0).toUpperCase() + agentName.slice(1)} Agent:** ✅ ${details}`;
}).join('\n')}

## Priority Recommendations

### Immediate Actions (1-3 days)
${report.actionPlan.immediate.map(action => `- **${action.title}:** ${action.actions.join(', ')}`).join('\n')}

### Short-term Improvements (1-2 weeks)
${report.actionPlan.shortTerm.map(action => `- **${action.title}:** ${action.actions.join(', ')}`).join('\n')}

### Long-term Strategic Items (1-4 weeks)
${report.actionPlan.longTerm.map(action => `- **${action.title}:** ${action.actions.join(', ')}`).join('\n')}

## Next Steps

1. **Address Critical Issues:** Focus on the ${summary.criticalIssues} high-severity issues identified
2. **Implement Quick Wins:** Execute immediate actions to improve overall health score
3. **Plan Strategic Improvements:** Schedule long-term improvements based on business priorities
4. **Establish Monitoring:** Set up regular agent runs to track progress

## Impact Assessment

The current health score of **${summary.overallHealthScore}%** indicates ${
    summary.overallHealthScore >= 80 ? 'excellent website health with minor optimization opportunities' :
    summary.overallHealthScore >= 60 ? 'good website health with some areas for improvement' :
    'significant opportunities for improvement across multiple areas'
}.

---

*This report was generated by the Agent Orchestrator system combining Developer, Tester, and UI Testing agents.*`;
    }

    generateCombinedHTMLReport(report) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Combined Agent Report - ${report.timestamp.split('T')[0]}</title>
    <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .score { font-size: 3em; font-weight: bold; margin-bottom: 10px; }
        .score.excellent { color: #10b981; }
        .score.good { color: #f59e0b; }
        .score.poor { color: #ef4444; }
        .section { background: white; margin-bottom: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }
        .section-header { padding: 30px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
        .section-content { padding: 30px; }
        .agent-result { margin-bottom: 20px; padding: 20px; border-radius: 8px; border-left: 4px solid; }
        .agent-success { background: #f0f9ff; border-left-color: #10b981; }
        .agent-error { background: #fef2f2; border-left-color: #ef4444; }
        .insight { margin: 15px 0; padding: 15px; border-radius: 6px; }
        .insight.high { background: #fef2f2; border-left: 4px solid #ef4444; }
        .insight.medium { background: #fef3cd; border-left: 4px solid #f59e0b; }
        .insight.low { background: #eff6ff; border-left: 4px solid #3b82f6; }
        .recommendation { background: #f0f9ff; padding: 20px; margin: 15px 0; border-radius: 8px; border: 1px solid #e0f2fe; }
        .action-plan { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .action-column { background: #f8fafc; padding: 20px; border-radius: 8px; }
        .action-item { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 3px solid #667eea; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎭 Combined Agent Analysis Report</h1>
        <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
        <p>Analysis completed in ${report.duration} seconds</p>
    </div>
    
    <div class="container">
        <div class="summary">
            <div class="summary-card">
                <div class="score ${report.summary.overallHealthScore >= 80 ? 'excellent' : report.summary.overallHealthScore >= 60 ? 'good' : 'poor'}">${report.summary.overallHealthScore}%</div>
                <div>Overall Health Score</div>
            </div>
            <div class="summary-card">
                <div class="score">${report.summary.agentsSuccessful}</div>
                <div>Agents Completed</div>
            </div>
            <div class="summary-card">
                <div class="score">${report.summary.totalInsights}</div>
                <div>Insights Generated</div>
            </div>
            <div class="summary-card">
                <div class="score">${report.summary.criticalIssues}</div>
                <div>Critical Issues</div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <h2>🤖 Agent Execution Results</h2>
            </div>
            <div class="section-content">
                ${Object.entries(report.agents).map(([agentName, result]) => `
                    <div class="agent-result ${result.error ? 'agent-error' : 'agent-success'}">
                        <h3>${agentName.charAt(0).toUpperCase() + agentName.slice(1)} Agent</h3>
                        ${result.error ? 
                            `<p><strong>❌ Error:</strong> ${result.error}</p>` :
                            `<p><strong>✅ Success:</strong> Analysis completed successfully</p>`
                        }
                        ${this.generateAgentSummaryHTML(agentName, result)}
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <h2>🔍 Key Insights</h2>
            </div>
            <div class="section-content">
                ${report.insights.map(insight => `
                    <div class="insight ${insight.severity}">
                        <h4>${insight.type} (${insight.severity} priority)</h4>
                        <p><strong>Finding:</strong> ${insight.message}</p>
                        <p><strong>Recommendation:</strong> ${insight.recommendation}</p>
                        <p><strong>Source:</strong> ${insight.agent} agent</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <h2>💡 Strategic Recommendations</h2>
            </div>
            <div class="section-content">
                ${report.recommendations.map(rec => `
                    <div class="recommendation">
                        <h4>${rec.title} (${rec.priority} priority)</h4>
                        <p><strong>Category:</strong> ${rec.category}</p>
                        <p><strong>Impact:</strong> ${rec.impact}</p>
                        <ul>
                            ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                        </ul>
                        ${rec.correlation ? `<p><em>Note: ${rec.correlation}</em></p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <h2>📋 Action Plan</h2>
            </div>
            <div class="section-content">
                <div class="action-plan">
                    <div class="action-column">
                        <h3>🚨 Immediate (1-3 days)</h3>
                        ${report.actionPlan.immediate.map(action => `
                            <div class="action-item">
                                <h4>${action.title}</h4>
                                <p><strong>Timeline:</strong> ${action.timeline}</p>
                                <ul>
                                    ${action.actions.map(a => `<li>${a}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="action-column">
                        <h3>📅 Short-term (1-2 weeks)</h3>
                        ${report.actionPlan.shortTerm.map(action => `
                            <div class="action-item">
                                <h4>${action.title}</h4>
                                <p><strong>Timeline:</strong> ${action.timeline}</p>
                                <ul>
                                    ${action.actions.map(a => `<li>${a}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="action-column">
                        <h3>🎯 Long-term (1-4 weeks)</h3>
                        ${report.actionPlan.longTerm.map(action => `
                            <div class="action-item">
                                <h4>${action.title}</h4>
                                <p><strong>Timeline:</strong> ${action.timeline}</p>
                                <ul>
                                    ${action.actions.map(a => `<li>${a}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="action-column">
                        <h3>🔄 Ongoing</h3>
                        ${report.actionPlan.ongoing.map(action => `
                            <div class="action-item">
                                <h4>${action.title}</h4>
                                <p><strong>Timeline:</strong> ${action.timeline}</p>
                                <ul>
                                    ${action.actions.map(a => `<li>${a}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
    }

    generateAgentSummaryHTML(agentName, result) {
        if (result.error) return '';
        
        if (agentName === 'developer' && result.metrics) {
            return `
                <p><strong>Code Quality Score:</strong> ${result.metrics.codeQualityScore}%</p>
                <p><strong>Issues Found:</strong> ${result.metrics.totalIssues}</p>
                <p><strong>Files Analyzed:</strong> ${result.metrics.totalFiles}</p>
            `;
        } else if (agentName === 'tester' && result.summary) {
            return `
                <p><strong>Overall Score:</strong> ${result.summary.overallScore}%</p>
                <p><strong>Tests Passed:</strong> ${result.summary.passedTests}/${result.summary.totalTests}</p>
                <p><strong>Test Suites:</strong> ${result.summary.testSuiteCount}</p>
            `;
        } else if (agentName === 'ui' && Array.isArray(result)) {
            const avg = Math.round(result.reduce((sum, r) => sum + (r.overallScore || 0), 0) / result.length);
            return `
                <p><strong>UI Consistency Score:</strong> ${avg}%</p>
                <p><strong>Pages Tested:</strong> ${result.length}</p>
            `;
        }
        
        return '';
    }
}

// CLI functionality
async function main() {
    const args = process.argv.slice(2);
    
    const options = {
        config: 'orchestrator-config.json',
        agents: 'all',
        parallel: false,
        help: false
    };
    
    args.forEach(arg => {
        if (arg.startsWith('--config=')) {
            options.config = arg.split('=')[1];
        } else if (arg.startsWith('--agents=')) {
            options.agents = arg.split('=')[1];
        } else if (arg === '--parallel') {
            options.parallel = true;
        } else if (arg === '--help' || arg === '-h') {
            options.help = true;
        }
    });
    
    if (options.help) {
        showHelp();
        return;
    }
    
    try {
        // Load configuration
        let config = {
            runDeveloperAgent: true,
            runTesterAgent: true,
            runUITestingAgent: true,
            runInParallel: options.parallel
        };
        
        try {
            const configPath = path.resolve(options.config);
            const configFile = await fs.readFile(configPath, 'utf8');
            config = { ...config, ...JSON.parse(configFile) };
            console.log(`📁 Loaded config from: ${configPath}`);
        } catch (error) {
            console.log(`⚠️  Could not load config file (${options.config}), using defaults`);
        }
        
        // Parse agents selection
        if (options.agents !== 'all') {
            const selectedAgents = options.agents.split(',').map(a => a.trim());
            config.runDeveloperAgent = selectedAgents.includes('dev') || selectedAgents.includes('developer');
            config.runTesterAgent = selectedAgents.includes('test') || selectedAgents.includes('tester');
            config.runUITestingAgent = selectedAgents.includes('ui');
        }
        
        const orchestrator = new AgentOrchestrator(config);
        await orchestrator.orchestrateAgents();
        
    } catch (error) {
        console.error('\n❌ Orchestrator execution failed:', error.message);
        if (process.env.NODE_ENV === 'development') {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

function showHelp() {
    console.log(`
Agent Orchestrator - Coordinate Multiple Testing Agents

USAGE:
  node agent-orchestrator.js [OPTIONS]

OPTIONS:
  --config=FILE         Path to configuration file (default: orchestrator-config.json)
  --agents=LIST         Comma-separated list of agents to run: dev,test,ui (default: all)
  --parallel           Run agents in parallel for faster execution
  --help, -h           Show this help message

EXAMPLES:
  node agent-orchestrator.js
  node agent-orchestrator.js --agents=dev,ui --parallel
  node agent-orchestrator.js --config=custom-config.json

AGENTS:
  dev/developer        Code analysis and optimization recommendations
  test/tester         Comprehensive testing across multiple categories
  ui                  Enhanced UI consistency and accessibility testing

OUTPUT:
  Results are saved to the orchestrator-results directory:
  - combined-agent-report-YYYY-MM-DD.json (detailed JSON results)
  - combined-agent-report-YYYY-MM-DD.html (interactive HTML report)
  - executive-summary-YYYY-MM-DD.md (executive summary in Markdown)
`);
}

// Export for use as module or run directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = AgentOrchestrator;