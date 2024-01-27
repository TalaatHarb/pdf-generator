const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

app.get('/generate-pdf', async (req, res) => {
    try {
        const url = req.query.url;

        if (!url) {
            return res.status(400).json({ error: 'Missing URL parameter' });
        }

        console.log(`Generating PDF for ${url}`);
        const pdfBuffer = await generatePdfFromUrl(url);
        const base64Pdf = pdfBuffer.toString('base64');

        res.json({ pdfBase64: base64Pdf });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/download-pdf', async (req, res) => {
    try {
        const url = req.query.url;
        const fileName = req.query.name ? req.query.name : 'generated-pdf.pdf';

        if (!url) {
            return res.status(400).json({ error: 'Missing URL parameter' });
        }

        console.log(`Generating PDF for ${url}`);
        const pdfBuffer = await generatePdfFromUrl(url);

        res.setHeader('Content-Type', 'application/pdf');

        res.attachment(fileName);

        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function generatePdfFromUrl(url) {
    const startTime = +new Date();
    const browser = await puppeteer.launch({headless: 'new', args:['--no-sandbox']});
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    const pdfBuffer = await page.pdf({
        displayHeaderFooter: false,
        margin: undefined,
        scale: 1,
        landscape: false,
        printBackground: true
    });
    await browser.close();
    
    const endTime = +new Date();
    const period = (endTime - startTime) / 1000.0;
    
    console.log(`PDF generated in ${period} seconds`);

    return pdfBuffer;
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});