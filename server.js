const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse JSON request body
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

app.post('/fetch-definitions', async (req, res) => {
    const keyTerms = req.body.terms;

    const fetchTermDefinition = async (term) => {
        const url = `https://dictionary.apa.org/${term}`;
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        try {
            await page.goto(url, { waitUntil: 'networkidle0' });
            await page.waitForSelector('.term-definition', { timeout: 60000 });

            const result = await page.evaluate(() => {
                const element = document.querySelector('.term-definition');
                if (element) {
                    const parent = element.parentElement;
                    if (parent.tagName.toLowerCase() !== 'dd') {
                        return 'The word definition is not in the website database.';
                    } else {
                        return element.innerText.trim();
                    }
                }
                return 'Definition not found';
            });

            return result;
        } catch (error) {
            console.error(`Error fetching definition for term ${term}:`, error);
            return 'Definition not found';
        } finally {
            await browser.close();
        }
    };

    // Map terms to their definitions
    const definitions = await Promise.all(keyTerms.map(async (term) => {
        const definition = await fetchTermDefinition(term);
        return { term, definition };
    }));

    res.json(definitions);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
