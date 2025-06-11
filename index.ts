import express, { Request, Response } from 'express';
import { extractArticleInfo } from './ai/extract-article-info-flow';

const app = express();
const port = 3000;

// Define an interface for our Article
interface Article {
    title: string;
    url: string;
    dateSaved: Date;
    summary?: string;
    imageUrl?: string | null;
    dataAiHint?: string;
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
        const articleInfo = await extractArticleInfo({ articleUrl: url });

        const newArticle: Article = {
            title: articleInfo.title,
            url: url,
            dateSaved: new Date(),
            summary: articleInfo.summary,
            imageUrl: articleInfo.imageUrl,
            dataAiHint: articleInfo.dataAiHint,
        };

        articles.push(newArticle);
        res.status(200).send({ message: 'Article saved successfully!', article: newArticle });
    } catch (error) {
        console.error('Error extracting article info:', error);
        res.status(500).send({ message: 'Error extracting article information' });
    }
});

// Endpoint to list all saved URLs
app.get('/read', (req: Request, res: Response) => {
    res.status(200).send(articles);
});

app.listen(port, () => {
    console.log(`Librarian service listening at http://localhost:${port}`);
}); 