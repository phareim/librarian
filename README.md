# librarian

this is a helpful service that keeps taps on articles, books and their metadata.

## Local Development

For local development, you can run the service directly without Docker.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Set Environment Variable:**
    You need to provide your `GOOGLE_API_KEY`. The easiest way is to create a `.env` file in the root of the project:
    ```
    GOOGLE_API_KEY=YOUR_API_KEY_HERE
    ```
    The application will automatically load this variable. Make sure `.env` is listed in your `.gitignore` file (it should be by default with Node projects, but it's good to check).

3.  **Run the dev server:**
    ```bash
    npm run dev
    ```
    The service will be available at `http://localhost:3000`.

## Running with Docker

To run this service with Docker:

1.  Build the Docker image:
    ```bash
    npm run docker:build
    ```

2.  Run the Docker container:
    ```bash
    npm run docker:run
    ```

The service will be available at `http://localhost:3000`.

## API

### Save an Article

-   **Endpoint:** `/save`
-   **Method:** `POST`
-   **Body:** `{ "url": "https://example.com/some-article" }`
-   **Success Response:** A JSON object containing a success message and the full article object that was saved.

    *Example Response:*
    ```json
    {
        "message": "Article saved successfully!",
        "article": {
            "title": "The Title of the Article",
            "url": "https://example.com/some-article",
            "dateSaved": "2023-10-28T12:00:00.000Z",
            "summary": "A concise, AI-generated summary of the article.",
            "imageUrl": "https://example.com/image.jpg",
            "dataAiHint": "technology, programming",
            "articleContentMarkDown": "# The Title of the Article...",
            "qualityAssessment": {
                "description": "A detailed assessment of the article's quality...",
                "textQuality": 8,
                "originality": 7
            }
        }
    }
    ```

**Example cURL:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"url": "https://www.theverge.com/23940333/google-search-generative-ai-results-labs-sge"}' http://localhost:3000/save
```

### Read All Saved Articles

-   **Endpoint:** `/read`
-   **Method:** `GET`
-   **Success Response:** A JSON object containing the count of articles and an array of all saved article objects.

    *Example Response:*
     ```json
    {
        "count": 1,
        "articles": [
            {
                "title": "The Title of the Article",
                "url": "https://example.com/some-article",
                "dateSaved": "2023-10-28T12:00:00.000Z",
                "summary": "A concise, AI-generated summary of the article.",
                "imageUrl": "https://example.com/image.jpg",
                "dataAiHint": "technology, programming",
                "articleContentMarkDown": "# The Title of the Article...",
                "qualityAssessment": {
                    "description": "A detailed assessment of the article's quality...",
                    "textQuality": 8,
                    "originality": 7
                }
            }
        ]
    }
    ```

**Example cURL:**
```bash
curl http://localhost:3000/read
```

## Deploying to Google Cloud Run

This service is configured for easy deployment to Google Cloud Run.

### Prerequisites

1.  **Google Cloud SDK**: Install the [`gcloud` CLI](https://cloud.google.com/sdk/docs/install).
2.  **GCP Project**: Create a new project in the [Google Cloud Console](https://console.cloud.google.com/). Make sure billing is enabled.
3.  **Enable APIs**: Enable the Cloud Build, Cloud Run, Artifact Registry, and Secret Manager APIs for your project.
4.  **Authentication**: Authenticate your local `gcloud` CLI:
    ```bash
    gcloud auth login
    gcloud auth application-default login
    gcloud config set project YOUR_PROJECT_ID
    ```
    Replace `YOUR_PROJECT_ID` with your actual project ID.

### Storing Your API Key as a Secret

Your `GOOGLE_API_KEY` should be stored securely in Secret Manager.

1.  Create the secret:
    ```bash
    gcloud secrets create GOOGLE_API_KEY --replication-policy="automatic"
    ```
2.  Add your API key as the first version of the secret. **Replace `YOUR_API_KEY` with your actual key.**
    ```bash
    echo -n "YOUR_API_KEY" | gcloud secrets versions add GOOGLE_API_KEY --data-file=-
    ```
3.  Grant the Cloud Build service account access to the secret:
    ```bash
    PROJECT_NUMBER=$(gcloud projects describe "$(gcloud config get-value project)" --format="value(projectNumber)")
    gcloud secrets add-iam-policy-binding GOOGLE_API_KEY \
      --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
      --role="roles/secretmanager.secretAccessor"
    ```
    > **Note:** If you get a `Service account ... does not exist` error, it's because Cloud Build creates this account on your first build. Run `npm run deploy` once (it will fail), which will create the account. Then, run the `gcloud secrets add-iam-policy-binding` command again, and it will succeed.

4.  **Grant the Cloud Run service account access to the secret:**
    The Cloud Run service itself also needs permission to access the secret when it's running.
    ```bash
    PROJECT_NUMBER=$(gcloud projects describe "$(gcloud config get-value project)" --format="value(projectNumber)")
    gcloud secrets add-iam-policy-binding GOOGLE_API_KEY \
      --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
      --role="roles/secretmanager.secretAccessor"
    ```

### Create an Artifact Registry Repository

Cloud Build will store your Docker image in Artifact Registry.

```bash
gcloud artifacts repositories create librarian \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker repository for librarian service"
```

### Deploy the Service

Now you're ready to deploy!

```bash
npm run deploy
```

This command will trigger a Cloud Build job that builds your container, pushes it to the registry, and deploys it to Cloud Run. After it's done, you'll get a URL where your service is live!