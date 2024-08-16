const puppeteer = require('puppeteer');

// Array of key terms
const keyTerms = [
  'case-study', 'confounding-variable', 'control-group', 'correlation', 'critical-thinking',
  'debriefing', 'dependent-variable', 'descriptive-statistics', 'double-blind-procedure', 'effect-size',
  'experimental-group', 'experimenter-bias', 'falsifiability', 'hindsight-bias', 'illusory-correlation',
  'independent-variable', 'inferential-statistics', 'informed-consent', 'mean', 'median',
  'meta-analysis', 'mode', 'naturalistic-observation', 'operational-definitions', 'peer-reviews',
  'percentile-rank', 'placebo-effect', 'qualitative-research', 'quantitative-research', 'random-assignment',
  'random-sample', 'range', 'regression-toward-the-mean', 'replicate', 'sampling-bias',
  'self-report-bias', 'single-blind-procedure', 'skewed-distribution', 'social-desirability-bias',
  'standard-deviation', 'statistical-significance', 'validity'
];

async function fetchTermDefinition(term) {
  const url = `https://dictionary.apa.org/${term}`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0' });
    // Wait for either div or dd with class 'term-definition' to appear
    await page.waitForFunction(() => {
      return document.querySelector('div.term-definition') || document.querySelector('dd.term-definition');
    }, { timeout: 60000 });

    // Extract the definition from either div or dd
    const definition = await page.evaluate(() => {
      const divElement = document.querySelector('div.term-definition');
      const ddElement = document.querySelector('dd.term-definition');
      const element = divElement || ddElement;
      return element ? element.innerText.trim() : 'Definition not available';
    });

    return definition;
  } catch (error) {
    console.error(`Error fetching definition for term ${term}:`, error);
    return 'Definition not available';
  } finally {
    await browser.close();
  }
}

async function printDefinitions() {
  for (const term of keyTerms) {
    const definition = await fetchTermDefinition(term);
    console.log(`Term: ${term.replace(/-/g, ' ')}`);
    console.log(`Definition: ${definition}`);
    console.log(''); // Print a new line
  }
}

// Start fetching and printing definitions
printDefinitions();
