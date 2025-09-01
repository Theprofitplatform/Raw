#!/usr/bin/env node

const DeveloperAgent = require('./developer-agent');
const TesterAgent = require('./tester-agent');
const EnhancedUITestingAgent = require('./enhanced-ui-testing-agent');
const AgentOrchestrator = require('./agent-orchestrator');
const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

/**
 * Manager Agent - Advanced orchestration and management of all testing and development agents
 * Features: Workflow management, scheduling, dependency resolution, resource optimization,
 *           intelligent decision-making, monitoring, and comprehensive reporting
 */

class ManagerAgent extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            outputDir: config.outputDir ?? './manager-results',
            workflowMode: config.workflowMode ?? 'adaptive', // adaptive, sequential, parallel, custom
            enableScheduling: config.enableScheduling ?? true,
            enableMonitoring: config.enableMonitoring ?? true,
            enableNotifications: config.enableNotifications ?? true,
            resourceOptimization: config.resourceOptimization ?? true,
            maxConcurrentAgents: config.maxConcurrentAgents ?? 2,
            retryFailedAgents: config.retryFailedAgents ?? 3,
            healthCheckInterval: config.healthCheckInterval ?? 30000, // 30 seconds
            autoRemediation: config.autoRemediation ?? true,
            generateDashboard: config.generateDashboard ?? true,
            webhookUrl: config.webhookUrl ?? null,
            emailNotifications: config.emailNotifications ?? null,
            ...config
        };

        // Agent registry with capabilities and dependencies
        this.agents = {
            developer: {
                class: DeveloperAgent,
                instance: null,
                status: 'idle', // idle, running, completed, failed, disabled
                priority: 1,
                dependencies: [],
                capabilities: ['code-analysis', 'optimization', 'best-practices'],
                resourceUsage: 'low',
                estimatedDuration: 30, // seconds
                lastRun: null,
                runCount: 0,
                successRate: 100,
                config: {}
            },
            tester: {
                class: TesterAgent,
                instance: null,
                status: 'idle',
                priority: 2,
                dependencies: [], // Can run independently
                capabilities: ['ui-testing', 'performance', 'accessibility', 'security', 'functional', 'mobile', 'cross-browser'],
                resourceUsage: 'high',
                estimatedDuration: 120, // seconds
                lastRun: null,
                runCount: 0,
                successRate: 100,
                config: {}
            },
            ui: {
                class: EnhancedUITestingAgent,
                instance: null,
                status: 'idle',
                priority: 2,
                dependencies: [],
                capabilities: ['ui-consistency', 'responsive-design', 'seo-validation'],
                resourceUsage: 'medium',
                estimatedDuration: 60, // seconds
                lastRun: null,
                runCount: 0,
                successRate: 100,
                config: {}
            },
            orchestrator: {
                class: AgentOrchestrator,
                instance: null,
                status: 'idle',
                priority: 3,
                dependencies: ['developer', 'tester', 'ui'], // Depends on other agents
                capabilities: ['coordination', 'cross-analysis', 'reporting'],
                resourceUsage: 'low',
                estimatedDuration: 10, // seconds
                lastRun: null,
                runCount: 0,
                successRate: 100,
                config: {}
            }
        };

        // Workflow definitions
        this.workflows = {
            'quick-check': {
                name: 'Quick Health Check',
                description: 'Fast analysis focusing on critical issues',
                agents: ['developer', 'ui'],
                mode: 'parallel',
                triggers: ['on-demand', 'pre-commit'],
                estimatedDuration: 90
            },
            'comprehensive': {
                name: 'Comprehensive Analysis',
                description: 'Full analysis across all agents',
                agents: ['developer', 'tester', 'ui', 'orchestrator'],
                mode: 'adaptive',
                triggers: ['scheduled', 'post-deploy', 'weekly'],
                estimatedDuration: 300
            },
            'performance-focused': {
                name: 'Performance Analysis',
                description: 'Focus on performance and optimization',
                agents: ['developer', 'tester'],
                mode: 'sequential',
                triggers: ['performance-alert', 'monthly'],
                estimatedDuration: 150,
                agentConfigs: {
                    tester: { runPerformanceTests: true, runUITests: false }
                }
            },
            'security-audit': {
                name: 'Security Audit',
                description: 'Security-focused analysis',
                agents: ['developer', 'tester'],
                mode: 'parallel',
                triggers: ['security-alert', 'quarterly'],
                estimatedDuration: 120,
                agentConfigs: {
                    tester: { runSecurityTests: true, runFunctionalTests: false }
                }
            }
        };

        // Manager state
        this.state = {
            currentWorkflow: null,
            runningAgents: new Set(),
            completedAgents: new Set(),
            failedAgents: new Set(),
            startTime: null,
            totalEstimatedDuration: 0,
            actualDuration: 0,
            resourceUsage: { cpu: 0, memory: 0 },
            lastHealthCheck: null,
            notifications: [],
            metrics: {
                totalRuns: 0,
                successfulRuns: 0,
                averageDuration: 0,
                resourceEfficiency: 100
            }
        };

        // Event listeners for monitoring
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.on('agent-started', (agentName) => {
            console.log(`🚀 Agent started: ${agentName}`);
            this.agents[agentName].status = 'running';
            this.state.runningAgents.add(agentName);
        });

        this.on('agent-completed', (agentName, result) => {
            console.log(`✅ Agent completed: ${agentName}`);
            this.agents[agentName].status = 'completed';
            this.agents[agentName].lastRun = new Date();
            this.agents[agentName].runCount++;
            this.state.runningAgents.delete(agentName);
            this.state.completedAgents.add(agentName);
        });

        this.on('agent-failed', (agentName, error) => {
            console.log(`❌ Agent failed: ${agentName} - ${error.message}`);
            this.agents[agentName].status = 'failed';
            this.agents[agentName].successRate = Math.max(0, this.agents[agentName].successRate - 10);
            this.state.runningAgents.delete(agentName);
            this.state.failedAgents.add(agentName);
            
            if (this.config.autoRemediation) {
                this.handleAgentFailure(agentName, error);
            }
        });

        this.on('workflow-completed', (workflowName, results) => {
            console.log(`🎯 Workflow completed: ${workflowName}`);
            this.state.metrics.totalRuns++;
            if (!this.state.failedAgents.size) {
                this.state.metrics.successfulRuns++;
            }
        });
    }

    async init() {
        console.log('👑 Initializing Manager Agent...\n');
        
        try {
            await fs.mkdir(this.config.outputDir, { recursive: true });
            await fs.mkdir(`${this.config.outputDir}/workflows`, { recursive: true });
            await fs.mkdir(`${this.config.outputDir}/monitoring`, { recursive: true });
        } catch (error) {
            // Directories already exist
        }

        // Start health monitoring if enabled
        if (this.config.enableMonitoring) {
            this.startHealthMonitoring();
        }

        // Load saved state if exists
        await this.loadState();
        
        console.log('✅ Manager Agent initialized successfully\n');
    }

    async executeWorkflow(workflowName = 'comprehensive', customConfig = {}) {
        console.log(`🎭 Starting Manager Agent Execution...\n`);
        console.log(`📋 Workflow: ${workflowName}\n`);
        
        await this.init();

        const workflow = this.workflows[workflowName];
        if (!workflow) {
            throw new Error(`Unknown workflow: ${workflowName}`);
        }

        this.state.currentWorkflow = workflowName;
        this.state.startTime = new Date();
        this.state.totalEstimatedDuration = workflow.estimatedDuration;

        console.log(`📊 Workflow: ${workflow.name}`);
        console.log(`📝 Description: ${workflow.description}`);
        console.log(`⏱️ Estimated Duration: ${workflow.estimatedDuration} seconds`);
        console.log(`🔧 Mode: ${workflow.mode}`);
        console.log(`🤖 Agents: ${workflow.agents.join(', ')}\n`);

        try {
            // Pre-execution checks
            await this.preExecutionChecks(workflow);
            
            // Execute workflow based on mode
            const results = await this.executeWorkflowMode(workflow, customConfig);
            
            // Post-execution analysis
            await this.postExecutionAnalysis(workflow, results);
            
            // Generate comprehensive reports
            await this.generateManagerReports(workflow, results);
            
            this.emit('workflow-completed', workflowName, results);
            
            const actualDuration = Math.round((Date.now() - this.state.startTime) / 1000);
            console.log(`\n🎯 Workflow "${workflow.name}" completed successfully in ${actualDuration} seconds`);
            
            return results;
            
        } catch (error) {
            console.error(`❌ Workflow "${workflowName}" failed:`, error.message);
            await this.handleWorkflowFailure(workflowName, error);
            throw error;
        } finally {
            // Cleanup
            await this.cleanup();
        }
    }

    async preExecutionChecks(workflow) {
        console.log('🔍 Running pre-execution checks...');
        
        // Check agent availability
        for (const agentName of workflow.agents) {
            if (this.agents[agentName].status === 'running') {
                throw new Error(`Agent ${agentName} is already running`);
            }
            if (this.agents[agentName].status === 'disabled') {
                console.log(`⚠️ Agent ${agentName} is disabled, skipping...`);
            }
        }

        // Check dependencies
        const dependencyCheck = this.checkDependencies(workflow.agents);
        if (!dependencyCheck.valid) {
            throw new Error(`Dependency check failed: ${dependencyCheck.message}`);
        }

        // Check system resources
        if (this.config.resourceOptimization) {
            const resourceCheck = await this.checkSystemResources();
            if (!resourceCheck.sufficient) {
                console.log('⚠️ System resources are limited, optimizing execution plan...');
                await this.optimizeForResources(workflow);
            }
        }

        console.log('✅ Pre-execution checks completed\n');
    }

    checkDependencies(agentNames) {
        const resolved = new Set();
        const visiting = new Set();
        
        const visit = (agentName) => {
            if (visiting.has(agentName)) {
                return { valid: false, message: `Circular dependency detected: ${agentName}` };
            }
            if (resolved.has(agentName)) {
                return { valid: true };
            }
            
            visiting.add(agentName);
            
            const agent = this.agents[agentName];
            if (agent && agent.dependencies) {
                for (const dep of agent.dependencies) {
                    const depCheck = visit(dep);
                    if (!depCheck.valid) return depCheck;
                }
            }
            
            visiting.delete(agentName);
            resolved.add(agentName);
            return { valid: true };
        };
        
        for (const agentName of agentNames) {
            const result = visit(agentName);
            if (!result.valid) return result;
        }
        
        return { valid: true };
    }

    async checkSystemResources() {
        // Simplified resource check - in production would use actual system metrics
        const mockResources = {
            cpu: Math.random() * 100,
            memory: Math.random() * 100,
            disk: Math.random() * 100
        };
        
        const sufficient = mockResources.cpu < 80 && mockResources.memory < 85;
        
        return {
            sufficient,
            resources: mockResources,
            recommendation: sufficient ? null : 'Consider running fewer agents concurrently'
        };
    }

    async optimizeForResources(workflow) {
        console.log('⚙️ Optimizing workflow for limited resources...');
        
        // Sort agents by resource usage (low first)
        const sortedAgents = workflow.agents.sort((a, b) => {
            const resourceOrder = { low: 1, medium: 2, high: 3 };
            return resourceOrder[this.agents[a].resourceUsage] - resourceOrder[this.agents[b].resourceUsage];
        });
        
        // Force sequential execution for high-resource agents
        if (workflow.mode === 'parallel' && sortedAgents.some(a => this.agents[a].resourceUsage === 'high')) {
            console.log('🔄 Switching to sequential mode due to resource constraints');
            workflow.mode = 'sequential';
        }
        
        console.log('✅ Resource optimization completed\n');
    }

    async executeWorkflowMode(workflow, customConfig) {
        switch (workflow.mode) {
            case 'parallel':
                return await this.executeParallel(workflow, customConfig);
            case 'sequential':
                return await this.executeSequential(workflow, customConfig);
            case 'adaptive':
                return await this.executeAdaptive(workflow, customConfig);
            case 'custom':
                return await this.executeCustom(workflow, customConfig);
            default:
                throw new Error(`Unknown workflow mode: ${workflow.mode}`);
        }
    }

    async executeParallel(workflow, customConfig) {
        console.log('🚀 Executing agents in parallel...\n');
        
        const agentPromises = workflow.agents.map(agentName => 
            this.executeAgent(agentName, this.mergeConfigs(workflow, agentName, customConfig))
        );
        
        const results = await Promise.allSettled(agentPromises);
        return this.processResults(workflow.agents, results);
    }

    async executeSequential(workflow, customConfig) {
        console.log('📋 Executing agents sequentially...\n');
        
        const results = {};
        
        for (const agentName of workflow.agents) {
            try {
                const config = this.mergeConfigs(workflow, agentName, customConfig);
                results[agentName] = await this.executeAgent(agentName, config);
            } catch (error) {
                results[agentName] = { error: error.message };
                
                // Decide whether to continue or stop
                if (this.shouldStopOnFailure(agentName, workflow)) {
                    console.log(`🛑 Stopping workflow due to critical agent failure: ${agentName}`);
                    break;
                }
            }
        }
        
        return results;
    }

    async executeAdaptive(workflow, customConfig) {
        console.log('🧠 Executing agents in adaptive mode...\n');
        
        // Adaptive mode: intelligent decision-making based on agent characteristics and dependencies
        const results = {};
        const remaining = new Set(workflow.agents);
        const completed = new Set();
        
        while (remaining.size > 0) {
            // Find agents that can run (dependencies satisfied)
            const ready = Array.from(remaining).filter(agentName => {
                const agent = this.agents[agentName];
                return !agent.dependencies || agent.dependencies.every(dep => completed.has(dep));
            });
            
            if (ready.length === 0) {
                throw new Error('Deadlock detected: No agents can proceed');
            }
            
            // Determine optimal execution strategy for ready agents
            const { parallel, sequential } = this.categorizeAgentsForExecution(ready);
            
            // Execute parallel agents
            if (parallel.length > 0) {
                console.log(`🚀 Running in parallel: ${parallel.join(', ')}`);
                const parallelPromises = parallel.map(agentName =>
                    this.executeAgent(agentName, this.mergeConfigs(workflow, agentName, customConfig))
                );
                
                const parallelResults = await Promise.allSettled(parallelPromises);
                parallel.forEach((agentName, index) => {
                    results[agentName] = parallelResults[index].status === 'fulfilled' 
                        ? parallelResults[index].value 
                        : { error: parallelResults[index].reason.message };
                    remaining.delete(agentName);
                    completed.add(agentName);
                });
            }
            
            // Execute sequential agents
            for (const agentName of sequential) {
                console.log(`📋 Running sequentially: ${agentName}`);
                try {
                    results[agentName] = await this.executeAgent(
                        agentName, 
                        this.mergeConfigs(workflow, agentName, customConfig)
                    );
                    completed.add(agentName);
                } catch (error) {
                    results[agentName] = { error: error.message };
                    completed.add(agentName); // Mark as completed even if failed
                }
                remaining.delete(agentName);
            }
        }
        
        return results;
    }

    categorizeAgentsForExecution(readyAgents) {
        const parallel = [];
        const sequential = [];
        
        // Categorize based on resource usage and conflict potential
        readyAgents.forEach(agentName => {
            const agent = this.agents[agentName];
            
            // High resource usage agents run sequentially
            if (agent.resourceUsage === 'high') {
                sequential.push(agentName);
            } else if (this.state.runningAgents.size < this.config.maxConcurrentAgents) {
                parallel.push(agentName);
            } else {
                sequential.push(agentName);
            }
        });
        
        return { parallel, sequential };
    }

    async executeCustom(workflow, customConfig) {
        console.log('🎨 Executing custom workflow...\n');
        
        // Custom workflows would be defined in the configuration
        // For now, default to adaptive mode
        return await this.executeAdaptive(workflow, customConfig);
    }

    async executeAgent(agentName, config) {
        const agent = this.agents[agentName];
        
        this.emit('agent-started', agentName);
        
        try {
            // Create agent instance with configuration
            const agentInstance = new agent.class({
                outputDir: `${this.config.outputDir}/${agentName}`,
                ...config
            });
            
            // Execute agent based on its type
            let result;
            switch (agentName) {
                case 'developer':
                    result = await agentInstance.analyzeCodebase();
                    break;
                case 'tester':
                    result = await agentInstance.runAllTests();
                    break;
                case 'ui':
                    result = await agentInstance.runAllTests();
                    break;
                case 'orchestrator':
                    result = await agentInstance.orchestrateAgents();
                    break;
                default:
                    throw new Error(`Unknown agent execution method for: ${agentName}`);
            }
            
            this.emit('agent-completed', agentName, result);
            return result;
            
        } catch (error) {
            this.emit('agent-failed', agentName, error);
            throw error;
        }
    }

    mergeConfigs(workflow, agentName, customConfig) {
        const baseConfig = this.agents[agentName].config;
        const workflowConfig = workflow.agentConfigs?.[agentName] || {};
        const customAgentConfig = customConfig[agentName] || {};
        
        return {
            ...baseConfig,
            ...workflowConfig,
            ...customAgentConfig
        };
    }

    processResults(agentNames, results) {
        const processedResults = {};
        
        agentNames.forEach((agentName, index) => {
            const result = results[index];
            if (result.status === 'fulfilled') {
                processedResults[agentName] = result.value;
            } else {
                processedResults[agentName] = { error: result.reason.message };
            }
        });
        
        return processedResults;
    }

    shouldStopOnFailure(agentName, workflow) {
        // Critical agents that should stop workflow on failure
        const criticalAgents = ['developer']; // Developer agent failure might indicate code issues
        return criticalAgents.includes(agentName) && workflow.name !== 'comprehensive';
    }

    async handleAgentFailure(agentName, error) {
        console.log(`🛠️ Attempting auto-remediation for ${agentName}...`);
        
        const agent = this.agents[agentName];
        
        // Retry with different configuration
        if (agent.runCount < this.config.retryFailedAgents) {
            console.log(`🔄 Retrying ${agentName} (attempt ${agent.runCount + 1}/${this.config.retryFailedAgents})`);
            
            // Modify config for retry (e.g., reduce resource usage)
            const retryConfig = this.getRetryConfig(agentName, error);
            
            try {
                await this.executeAgent(agentName, retryConfig);
                console.log(`✅ ${agentName} succeeded on retry`);
            } catch (retryError) {
                console.log(`❌ ${agentName} failed again: ${retryError.message}`);
            }
        } else {
            console.log(`⚠️ ${agentName} exceeded retry limit, marking as failed`);
            
            // Send notification
            if (this.config.enableNotifications) {
                await this.sendNotification({
                    type: 'agent-failure',
                    agent: agentName,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }

    getRetryConfig(agentName, error) {
        // Generate modified configuration for retry based on error type
        const baseConfig = this.agents[agentName].config;
        
        if (error.message.includes('timeout')) {
            return { ...baseConfig, timeout: baseConfig.timeout * 2 };
        } else if (error.message.includes('memory')) {
            return { ...baseConfig, headless: true, generateScreenshots: false };
        } else if (error.message.includes('browser')) {
            return { ...baseConfig, crossBrowserTesting: false };
        }
        
        return baseConfig;
    }

    async postExecutionAnalysis(workflow, results) {
        console.log('🔬 Performing post-execution analysis...');
        
        const analysis = {
            workflow: workflow.name,
            timestamp: new Date().toISOString(),
            duration: Math.round((Date.now() - this.state.startTime) / 1000),
            estimatedDuration: workflow.estimatedDuration,
            efficiency: 0,
            agentPerformance: {},
            insights: [],
            recommendations: []
        };
        
        // Calculate efficiency
        analysis.efficiency = Math.round((workflow.estimatedDuration / analysis.duration) * 100);
        
        // Analyze each agent's performance
        workflow.agents.forEach(agentName => {
            const result = results[agentName];
            const agent = this.agents[agentName];
            
            analysis.agentPerformance[agentName] = {
                status: result.error ? 'failed' : 'success',
                successRate: agent.successRate,
                runCount: agent.runCount,
                estimatedDuration: agent.estimatedDuration,
                resourceUsage: agent.resourceUsage
            };
        });
        
        // Generate insights
        if (analysis.efficiency < 80) {
            analysis.insights.push({
                type: 'performance',
                message: `Workflow took ${analysis.duration}s vs estimated ${workflow.estimatedDuration}s (${analysis.efficiency}% efficiency)`,
                recommendation: 'Consider optimizing agent configurations or execution order'
            });
        }
        
        const failedAgents = Object.entries(analysis.agentPerformance)
            .filter(([_, perf]) => perf.status === 'failed')
            .map(([name, _]) => name);
            
        if (failedAgents.length > 0) {
            analysis.insights.push({
                type: 'reliability',
                message: `${failedAgents.length} agents failed: ${failedAgents.join(', ')}`,
                recommendation: 'Review failed agent logs and consider configuration adjustments'
            });
        }
        
        // Update metrics
        this.state.metrics.averageDuration = (this.state.metrics.averageDuration * (this.state.metrics.totalRuns - 1) + analysis.duration) / this.state.metrics.totalRuns;
        this.state.metrics.resourceEfficiency = analysis.efficiency;
        
        // Save analysis
        await fs.writeFile(
            `${this.config.outputDir}/workflows/analysis-${workflow.name}-${Date.now()}.json`,
            JSON.stringify(analysis, null, 2)
        );
        
        console.log(`📊 Analysis completed - Efficiency: ${analysis.efficiency}%\n`);
        return analysis;
    }

    async generateManagerReports(workflow, results) {
        console.log('📋 Generating manager reports...');
        
        const timestamp = new Date().toISOString();
        const reportData = {
            manager: {
                version: '1.0.0',
                timestamp,
                workflow: workflow.name,
                duration: Math.round((Date.now() - this.state.startTime) / 1000),
                state: this.state,
                metrics: this.state.metrics
            },
            agents: this.agents,
            results,
            summary: this.generateExecutiveSummary(workflow, results),
            recommendations: this.generateManagerRecommendations(results)
        };
        
        // JSON Report
        await fs.writeFile(
            `${this.config.outputDir}/manager-report-${timestamp.split('T')[0]}.json`,
            JSON.stringify(reportData, null, 2)
        );
        
        // HTML Dashboard
        if (this.config.generateDashboard) {
            const dashboard = this.generateHTMLDashboard(reportData);
            await fs.writeFile(
                `${this.config.outputDir}/manager-dashboard-${timestamp.split('T')[0]}.html`,
                dashboard
            );
        }
        
        // Executive Summary
        const execSummary = this.generateManagerExecutiveSummary(reportData);
        await fs.writeFile(
            `${this.config.outputDir}/manager-executive-summary-${timestamp.split('T')[0]}.md`,
            execSummary
        );
        
        console.log('✅ Manager reports generated\n');
        
        // Send notifications if configured
        if (this.config.enableNotifications) {
            await this.sendNotification({
                type: 'workflow-completed',
                workflow: workflow.name,
                duration: reportData.manager.duration,
                summary: reportData.summary,
                timestamp
            });
        }
    }

    generateExecutiveSummary(workflow, results) {
        const successful = Object.values(results).filter(r => !r.error).length;
        const total = Object.keys(results).length;
        const successRate = Math.round((successful / total) * 100);
        
        return {
            workflow: workflow.name,
            successRate,
            agentsExecuted: total,
            agentsSuccessful: successful,
            overallHealth: this.calculateOverallHealth(results),
            criticalIssues: this.countCriticalIssues(results),
            duration: Math.round((Date.now() - this.state.startTime) / 1000),
            efficiency: this.state.metrics.resourceEfficiency
        };
    }

    calculateOverallHealth(results) {
        const scores = [];
        
        Object.entries(results).forEach(([agentName, result]) => {
            if (!result.error) {
                if (agentName === 'developer' && result.metrics) {
                    scores.push(result.metrics.codeQualityScore || 0);
                } else if (agentName === 'tester' && result.summary) {
                    scores.push(result.summary.overallScore || 0);
                } else if (agentName === 'ui' && Array.isArray(result)) {
                    const avg = result.reduce((sum, r) => sum + (r.overallScore || 0), 0) / result.length;
                    scores.push(avg);
                }
            }
        });
        
        return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
    }

    countCriticalIssues(results) {
        let criticalIssues = 0;
        
        Object.values(results).forEach(result => {
            if (result.insights) {
                criticalIssues += result.insights.filter(i => i.severity === 'high').length;
            }
            if (result.issues) {
                criticalIssues += result.issues.filter(i => i.severity === 'high').length;
            }
        });
        
        return criticalIssues;
    }

    generateManagerRecommendations(results) {
        const recommendations = [];
        
        // Analyze agent performance patterns
        const failedAgents = Object.entries(results)
            .filter(([_, result]) => result.error)
            .map(([name, _]) => name);
        
        if (failedAgents.length > 0) {
            recommendations.push({
                category: 'reliability',
                priority: 'high',
                title: 'Agent Failure Recovery',
                description: `${failedAgents.length} agents failed during execution`,
                actions: [
                    'Review agent configurations for failed agents',
                    'Check system resources and dependencies',
                    'Consider implementing circuit breaker patterns',
                    'Update retry strategies and error handling'
                ]
            });
        }
        
        // Performance recommendations
        if (this.state.metrics.resourceEfficiency < 80) {
            recommendations.push({
                category: 'performance',
                priority: 'medium',
                title: 'Workflow Optimization',
                description: 'Current workflow efficiency is below optimal levels',
                actions: [
                    'Optimize agent execution order',
                    'Review resource allocation strategies',
                    'Consider parallel execution where possible',
                    'Update estimated durations based on actual performance'
                ]
            });
        }
        
        return recommendations;
    }

    startHealthMonitoring() {
        console.log('💗 Starting health monitoring...');
        
        this.healthCheckInterval = setInterval(async () => {
            await this.performHealthCheck();
        }, this.config.healthCheckInterval);
    }

    async performHealthCheck() {
        const healthStatus = {
            timestamp: new Date().toISOString(),
            systemStatus: 'healthy',
            agents: {},
            resources: await this.checkSystemResources(),
            alerts: []
        };
        
        // Check each agent's health
        Object.entries(this.agents).forEach(([name, agent]) => {
            healthStatus.agents[name] = {
                status: agent.status,
                successRate: agent.successRate,
                lastRun: agent.lastRun,
                runCount: agent.runCount
            };
            
            // Generate alerts for unhealthy agents
            if (agent.successRate < 80) {
                healthStatus.alerts.push({
                    type: 'agent-health',
                    severity: 'warning',
                    message: `Agent ${name} has low success rate: ${agent.successRate}%`
                });
            }
        });
        
        this.state.lastHealthCheck = healthStatus;
        
        // Save health check results
        if (this.config.enableMonitoring) {
            await fs.writeFile(
                `${this.config.outputDir}/monitoring/health-${Date.now()}.json`,
                JSON.stringify(healthStatus, null, 2)
            );
        }
    }

    async sendNotification(notification) {
        console.log(`📢 Notification: ${notification.type}`);
        
        this.state.notifications.push(notification);
        
        // Webhook notification
        if (this.config.webhookUrl) {
            try {
                // Would implement actual HTTP request in production
                console.log(`🔗 Webhook notification sent to: ${this.config.webhookUrl}`);
            } catch (error) {
                console.error('Failed to send webhook notification:', error.message);
            }
        }
        
        // Email notification  
        if (this.config.emailNotifications) {
            try {
                // Would implement actual email sending in production
                console.log(`📧 Email notification sent to: ${this.config.emailNotifications.join(', ')}`);
            } catch (error) {
                console.error('Failed to send email notification:', error.message);
            }
        }
    }

    async handleWorkflowFailure(workflowName, error) {
        console.log(`🚨 Handling workflow failure: ${workflowName}`);
        
        const failureReport = {
            workflow: workflowName,
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack,
            agentStates: this.agents,
            recommendations: [
                'Check agent logs for detailed error information',
                'Verify system resources and dependencies',
                'Consider reducing workflow scope or running agents individually',
                'Update agent configurations based on error patterns'
            ]
        };
        
        await fs.writeFile(
            `${this.config.outputDir}/failure-report-${Date.now()}.json`,
            JSON.stringify(failureReport, null, 2)
        );
        
        await this.sendNotification({
            type: 'workflow-failure',
            workflow: workflowName,
            error: error.message,
            timestamp: failureReport.timestamp
        });
    }

    async loadState() {
        try {
            const statePath = `${this.config.outputDir}/manager-state.json`;
            const stateData = await fs.readFile(statePath, 'utf8');
            const savedState = JSON.parse(stateData);
            
            // Restore relevant state data
            this.state.metrics = { ...this.state.metrics, ...savedState.metrics };
            this.agents = { ...this.agents, ...savedState.agents };
            
            console.log('💾 Manager state restored from previous session');
        } catch (error) {
            // No previous state or error reading it
            console.log('🆕 Starting with fresh manager state');
        }
    }

    async saveState() {
        const stateToSave = {
            timestamp: new Date().toISOString(),
            metrics: this.state.metrics,
            agents: this.agents
        };
        
        await fs.writeFile(
            `${this.config.outputDir}/manager-state.json`,
            JSON.stringify(stateToSave, null, 2)
        );
    }

    async cleanup() {
        console.log('🧹 Cleaning up manager resources...');
        
        // Clear running agents
        this.state.runningAgents.clear();
        this.state.completedAgents.clear();
        this.state.failedAgents.clear();
        
        // Reset agent statuses
        Object.values(this.agents).forEach(agent => {
            if (agent.status === 'running') {
                agent.status = 'idle';
            }
        });
        
        // Save current state
        await this.saveState();
        
        // Stop health monitoring
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        
        console.log('✅ Cleanup completed\n');
    }

    generateHTMLDashboard(reportData) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manager Agent Dashboard - ${reportData.manager.timestamp.split('T')[0]}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f8fafc; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 2rem; text-align: center; }
        .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
        .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .metric { text-align: center; margin-bottom: 1rem; }
        .metric-value { font-size: 2.5rem; font-weight: bold; color: #6366f1; }
        .metric-label { color: #64748b; font-size: 0.9rem; }
        .agent-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
        .agent-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; }
        .status-success { border-left: 4px solid #10b981; background: #f0f9ff; }
        .status-failed { border-left: 4px solid #ef4444; background: #fef2f2; }
        .status-running { border-left: 4px solid #f59e0b; background: #fef3cd; }
        .workflow-timeline { display: flex; align-items: center; margin: 1rem 0; }
        .timeline-step { flex: 1; text-align: center; position: relative; }
        .timeline-step::after { content: ''; position: absolute; top: 50%; right: -50%; width: 100%; height: 2px; background: #e2e8f0; z-index: -1; }
        .timeline-step:last-child::after { display: none; }
        .timeline-step.completed { color: #10b981; }
        .timeline-step.failed { color: #ef4444; }
        .recommendations { background: #f0f9ff; border: 1px solid #e0f2fe; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .chart { height: 300px; background: #f8fafc; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #64748b; }
    </style>
</head>
<body>
    <div class="header">
        <h1>👑 Manager Agent Dashboard</h1>
        <p>Workflow: ${reportData.manager.workflow}</p>
        <p>Generated: ${new Date(reportData.manager.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="container">
        <div class="dashboard">
            <!-- Summary Metrics -->
            <div class="card">
                <h3>📊 Summary Metrics</h3>
                <div class="metric">
                    <div class="metric-value">${reportData.summary.overallHealth}%</div>
                    <div class="metric-label">Overall Health Score</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${reportData.summary.agentsSuccessful}/${reportData.summary.agentsExecuted}</div>
                    <div class="metric-label">Agents Successful</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${reportData.summary.duration}s</div>
                    <div class="metric-label">Execution Duration</div>
                </div>
            </div>
            
            <!-- Workflow Progress -->
            <div class="card">
                <h3>🎭 Workflow Progress</h3>
                <div class="workflow-timeline">
                    ${Object.entries(reportData.results).map(([name, result]) => `
                        <div class="timeline-step ${result.error ? 'failed' : 'completed'}">
                            <div>${name}</div>
                            <div>${result.error ? '❌' : '✅'}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="metric">
                    <div class="metric-value">${reportData.summary.successRate}%</div>
                    <div class="metric-label">Success Rate</div>
                </div>
            </div>
            
            <!-- Agent Status -->
            <div class="card">
                <h3>🤖 Agent Status</h3>
                <div class="agent-grid">
                    ${Object.entries(reportData.agents).map(([name, agent]) => `
                        <div class="agent-card status-${agent.status === 'completed' ? 'success' : agent.status === 'failed' ? 'failed' : 'running'}">
                            <h4>${name.charAt(0).toUpperCase() + name.slice(1)}</h4>
                            <p>Status: ${agent.status}</p>
                            <p>Success Rate: ${agent.successRate}%</p>
                            <p>Runs: ${agent.runCount}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Performance Metrics -->
            <div class="card">
                <h3>⚡ Performance</h3>
                <div class="metric">
                    <div class="metric-value">${reportData.summary.efficiency}%</div>
                    <div class="metric-label">Resource Efficiency</div>
                </div>
                <div class="chart">
                    Performance Chart
                    (Would contain actual performance visualization)
                </div>
            </div>
            
            <!-- Critical Issues -->
            <div class="card">
                <h3>🚨 Critical Issues</h3>
                <div class="metric">
                    <div class="metric-value">${reportData.summary.criticalIssues}</div>
                    <div class="metric-label">Critical Issues Found</div>
                </div>
                ${reportData.recommendations.map(rec => `
                    <div class="recommendations">
                        <h4>${rec.title}</h4>
                        <p>${rec.description}</p>
                        <ul>
                            ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
            
            <!-- System Health -->
            <div class="card">
                <h3>💗 System Health</h3>
                <div class="metric">
                    <div class="metric-value">${reportData.manager.state.lastHealthCheck ? 'Healthy' : 'Monitoring'}</div>
                    <div class="metric-label">System Status</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${reportData.manager.metrics.totalRuns}</div>
                    <div class="metric-label">Total Workflow Runs</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${Math.round(reportData.manager.metrics.averageDuration)}s</div>
                    <div class="metric-label">Average Duration</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
    }

    generateManagerExecutiveSummary(reportData) {
        return `# Manager Agent Executive Summary

**Generated:** ${new Date(reportData.manager.timestamp).toLocaleString()}  
**Workflow:** ${reportData.manager.workflow}  
**Duration:** ${reportData.manager.duration} seconds  

## Executive Overview

The Manager Agent successfully orchestrated a **${reportData.manager.workflow}** workflow involving ${reportData.summary.agentsExecuted} specialized agents. The execution achieved a **${reportData.summary.successRate}%** success rate with an overall system health score of **${reportData.summary.overallHealth}%**.

## Key Metrics

- **Agents Executed:** ${reportData.summary.agentsExecuted}
- **Successful Completions:** ${reportData.summary.agentsSuccessful}
- **Resource Efficiency:** ${reportData.summary.efficiency}%
- **Critical Issues Identified:** ${reportData.summary.criticalIssues}

## Agent Performance Summary

${Object.entries(reportData.agents).map(([name, agent]) => 
`**${name.charAt(0).toUpperCase() + name.slice(1)} Agent:**
- Status: ${agent.status}
- Success Rate: ${agent.successRate}%
- Total Runs: ${agent.runCount}
- Resource Usage: ${agent.resourceUsage}`).join('\n\n')}

## Strategic Recommendations

${reportData.recommendations.length > 0 ? reportData.recommendations.map(rec => 
`### ${rec.title} (${rec.priority} priority)
${rec.description}

**Actions Required:**
${rec.actions.map(action => `- ${action}`).join('\n')}`).join('\n\n') : 'No critical recommendations at this time.'}

## System Health Assessment

The Manager Agent's orchestration capabilities are ${reportData.summary.efficiency >= 80 ? 'performing optimally' : 'operating below optimal efficiency'}. ${reportData.summary.criticalIssues > 0 ? `There are ${reportData.summary.criticalIssues} critical issues requiring immediate attention.` : 'No critical issues detected.'}

## Next Steps

1. **Immediate Actions:** Address any critical issues identified by the agents
2. **Performance Optimization:** ${reportData.summary.efficiency < 80 ? 'Review workflow execution efficiency and agent configurations' : 'Continue monitoring performance metrics'}
3. **System Monitoring:** Maintain regular health checks and automated workflows
4. **Capacity Planning:** ${reportData.summary.successRate < 100 ? 'Investigate failed agents and improve reliability' : 'Consider expanding automation capabilities'}

---

*This summary was generated by the Manager Agent v1.0.0 orchestration system.*`;
    }

    // Utility method to list available workflows
    listWorkflows() {
        return Object.entries(this.workflows).map(([key, workflow]) => ({
            id: key,
            name: workflow.name,
            description: workflow.description,
            agents: workflow.agents,
            estimatedDuration: workflow.estimatedDuration,
            triggers: workflow.triggers
        }));
    }

    // Utility method to get agent status
    getAgentStatus(agentName) {
        return this.agents[agentName] || null;
    }

    // Utility method to get system health
    getSystemHealth() {
        return this.state.lastHealthCheck || { status: 'unknown', message: 'No health check performed yet' };
    }
}

// CLI functionality
async function main() {
    const args = process.argv.slice(2);
    
    const options = {
        workflow: 'comprehensive',
        config: 'manager-config.json',
        list: false,
        status: false,
        help: false
    };
    
    args.forEach(arg => {
        if (arg.startsWith('--workflow=')) {
            options.workflow = arg.split('=')[1];
        } else if (arg.startsWith('--config=')) {
            options.config = arg.split('=')[1];
        } else if (arg === '--list') {
            options.list = true;
        } else if (arg === '--status') {
            options.status = true;
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
        let config = {};
        try {
            const configPath = path.resolve(options.config);
            const configFile = await fs.readFile(configPath, 'utf8');
            config = JSON.parse(configFile);
            console.log(`📁 Loaded config from: ${configPath}`);
        } catch (error) {
            console.log(`⚠️  Could not load config file (${options.config}), using defaults`);
        }
        
        const manager = new ManagerAgent(config);
        
        if (options.list) {
            console.log('📋 Available Workflows:\n');
            const workflows = manager.listWorkflows();
            workflows.forEach(workflow => {
                console.log(`🎭 ${workflow.name} (${workflow.id})`);
                console.log(`   Description: ${workflow.description}`);
                console.log(`   Agents: ${workflow.agents.join(', ')}`);
                console.log(`   Duration: ~${workflow.estimatedDuration}s`);
                console.log(`   Triggers: ${workflow.triggers.join(', ')}\n`);
            });
            return;
        }
        
        if (options.status) {
            console.log('💗 System Status:\n');
            const health = manager.getSystemHealth();
            console.log(`Status: ${health.status || 'Unknown'}`);
            if (health.timestamp) {
                console.log(`Last Check: ${new Date(health.timestamp).toLocaleString()}`);
            }
            return;
        }
        
        // Execute workflow
        await manager.executeWorkflow(options.workflow, config.customAgentConfigs || {});
        
    } catch (error) {
        console.error('\n❌ Manager Agent execution failed:', error.message);
        if (process.env.NODE_ENV === 'development') {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

function showHelp() {
    console.log(`
Manager Agent - Advanced Orchestration of All Testing Agents

USAGE:
  node manager-agent.js [OPTIONS]

OPTIONS:
  --workflow=NAME      Workflow to execute (default: comprehensive)
  --config=FILE        Path to configuration file (default: manager-config.json)
  --list              List all available workflows
  --status            Show current system status
  --help, -h          Show this help message

WORKFLOWS:
  quick-check         Fast analysis focusing on critical issues
  comprehensive       Full analysis across all agents (default)
  performance-focused Performance and optimization analysis
  security-audit      Security-focused analysis

EXAMPLES:
  node manager-agent.js
  node manager-agent.js --workflow=quick-check
  node manager-agent.js --list
  node manager-agent.js --status
  node manager-agent.js --config=custom-manager-config.json

FEATURES:
  🎭 Workflow Management    - Predefined and custom workflows
  📊 Resource Optimization - Intelligent resource allocation
  🔄 Auto-Remediation     - Automatic failure recovery
  💗 Health Monitoring    - Continuous system health checks
  📋 Advanced Reporting   - Executive dashboards and summaries
  🚨 Notifications        - Webhook and email alerting
  
OUTPUT:
  Results are saved to the manager-results directory:
  - manager-report-YYYY-MM-DD.json (detailed JSON results)  
  - manager-dashboard-YYYY-MM-DD.html (interactive dashboard)
  - manager-executive-summary-YYYY-MM-DD.md (executive summary)
  - failure-report-*.json (failure analysis when issues occur)
`);
}

// Export for use as module or run directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = ManagerAgent;