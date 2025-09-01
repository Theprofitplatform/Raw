#!/usr/bin/env node

const EnhancedUITestingAgent = require('./enhanced-ui-testing-agent');
const fs = require('fs').promises;
const path = require('path');

/**
 * CLI runner for the Enhanced UI Testing Agent
 * Usage: node run-enhanced-tests.js [--config=path] [--quick] [--headless] [--help]
 */

async function main() {
    const args = process.argv.slice(2);
    
    // Parse command line arguments
    const options = {
        config: 'test-config.json',
        quick: false,
        headless: true,
        help: false
    };
    
    args.forEach(arg => {
        if (arg.startsWith('--config=')) {
            options.config = arg.split('=')[1];
        } else if (arg === '--quick') {
            options.quick = true;
        } else if (arg === '--headless') {
            options.headless = true;
        } else if (arg === '--no-headless') {
            options.headless = false;
        } else if (arg === '--help' || arg === '-h') {
            options.help = true;
        }
    });
    
    if (options.help) {
        showHelp();
        return;
    }
    
    console.log('🚀 Enhanced UI Testing Agent');
    console.log('================================\n');
    
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
        
        // Override config with CLI options
        if (options.headless !== undefined) {
            config.headless = options.headless;
        }
        
        if (options.quick) {
            config.checkAccessibility = false;
            config.checkPerformance = false;
            config.generateScreenshots = false;
            console.log('⚡ Quick mode: Skipping accessibility, performance, and screenshots');
        }
        
        // Initialize and run tests
        const agent = new EnhancedUITestingAgent(config);
        const startTime = Date.now();
        
        console.log(`🔧 Configuration:`);
        console.log(`   - Headless: ${config.headless ? 'Yes' : 'No'}`);
        console.log(`   - Screenshots: ${config.generateScreenshots ? 'Yes' : 'No'}`);
        console.log(`   - Accessibility: ${config.checkAccessibility ? 'Yes' : 'No'}`);
        console.log(`   - Performance: ${config.checkPerformance ? 'Yes' : 'No'}`);
        console.log(`   - SEO: ${config.checkSEO ? 'Yes' : 'No'}`);
        console.log(`   - Responsive: ${config.checkResponsive ? 'Yes' : 'No'}`);
        console.log(`   - Output: ${config.outputDir || './enhanced-test-results'}\n`);
        
        const results = await agent.runAllTests();
        
        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);
        
        console.log(`\n✅ Tests completed in ${duration} seconds`);
        console.log(`📊 Results saved to: ${config.outputDir || './enhanced-test-results'}`);
        
        // Exit with error code if any tests failed significantly
        const averageScore = results.reduce((sum, r) => sum + (r.overallScore || 0), 0) / results.length;
        if (averageScore < 70) {
            console.log(`\n⚠️  Average score (${Math.round(averageScore)}%) is below 70% - consider addressing failing tests`);
            process.exit(1);
        }
        
    } catch (error) {
        console.error('\n❌ Test execution failed:', error.message);
        if (process.env.NODE_ENV === 'development') {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

function showHelp() {
    console.log(`
Enhanced UI Testing Agent

USAGE:
  node run-enhanced-tests.js [OPTIONS]

OPTIONS:
  --config=FILE      Path to configuration file (default: test-config.json)
  --quick            Run quick tests only (skip accessibility, performance, screenshots)
  --headless         Run browser in headless mode (default)
  --no-headless      Run browser with UI visible
  --help, -h         Show this help message

EXAMPLES:
  node run-enhanced-tests.js
  node run-enhanced-tests.js --quick --no-headless
  node run-enhanced-tests.js --config=custom-config.json

CONFIGURATION:
  Create a test-config.json file to customize test behavior:
  {
    "headless": false,
    "generateScreenshots": true,
    "checkAccessibility": true,
    "checkPerformance": true,
    "outputDir": "./test-results"
  }

OUTPUT:
  Test results are saved to the configured output directory:
  - test-report-YYYY-MM-DD.json (detailed JSON results)
  - test-report-YYYY-MM-DD.html (interactive HTML report)
  - Screenshots for each page (if enabled)
`);
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = main;