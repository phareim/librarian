# librarian

this is a helpful service that keeps taps on articles, books and their metadata.

## Running the service

To run this service, you'll need Docker installed.

1.  Build the Docker image:
    ```bash
    docker build -t librarian .
    ```

2.  Run the Docker container:
    ```bash
    docker run -p 3000:3000 -d librarian
    ```

The service will be available at `http://localhost:3000`.

## API

### Save a URL

-   **Endpoint:** `/save`
-   **Method:** `POST`
-   **Body:** `{ "url": "https://example.com" }`
-   **Success Response:** `{ "message": "URL saved successfully!" }`
-   **Error Response:** `{ "message": "URL is required" }`

**Example:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"url": "https://www.google.com"}' http://localhost:3000/save
```

### Read all saved URLs

-   **Endpoint:** `/read`
-   **Method:** `GET`
-   **Success Response:** An array of saved article objects.

**Example Response:**
```json
[
    {
        "title": "NAME",
        "url": "https://www.google.com",
        "dateSaved": "2023-10-27T10:00:00.000Z"
    }
]
```

**Example:**
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