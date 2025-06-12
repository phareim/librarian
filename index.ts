import express, { Request, Response } from 'express';
import { extractArticleInfo } from './ai/extract-article-info-flow';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';

const app = express();
const port = 3000;
const turndownService = new TurndownService();

// Define an interface for our Article
interface Article {
    title: string;
    url: string;
    dateSaved: Date;
    summary?: string;
    imageUrl?: string | null;
    dataAiHint?: string;
    articleContentMarkDown?: string;
}

// Use express.json() to parse JSON bodies
app.use(express.json());

// In-memory store for our articles
const articles: Article[] = [];

app.get('/', (req: Request, res: Response) => {
    res.send('Hello there, homie!');
});

// Endpoint to save a URL
app.post('/save', async (req: Request, res: Response) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).send({ message: 'URL is required' });
    }

    if (articles.some(article => article.url === url)) {
        return res.status(409).send({ message: 'URL already saved' });
    }

    try {
        // Fetch the article content and extract metadata in parallel
        const [articleResponse, aiResponse] = await Promise.all([
            axios.get(url),
            extractArticleInfo({ articleUrl: url })
        ]);

        const dom = new JSDOM(articleResponse.data, { url });
        const reader = new Readability(dom.window.document);
        const readableArticle = reader.parse();

        if (!readableArticle) {
            return res.status(500).send({ message: 'Could not extract article content.' });
        }

        const articleContentMarkDown = turndownService.turndown(readableArticle.content);

        const newArticle: Article = {
            title: readableArticle.title || aiResponse.title, // Prefer Readability's title
            url: url,
            dateSaved: new Date(),
            summary: aiResponse.summary,
            imageUrl: aiResponse.imageUrl,
            dataAiHint: aiResponse.dataAiHint,
            articleContentMarkDown: articleContentMarkDown,
        };

        articles.push(newArticle);
        res.status(200).send({ message: 'Article saved successfully!', article: newArticle });
    } catch (error) {
        console.error('Error processing new article:', error);
        res.status(500).send({ message: 'Error processing or extracting article information' });
    }
});

// Endpoint to list all saved URLs
app.get('/read', (req: Request, res: Response) => {
    res.status(200).send(articles);
});

app.listen(port, () => {
    console.log(`Librarian service listening at http://localhost:${port}`);
}); 