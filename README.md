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
-   **Success Response:** An array of saved URLs.

**Example:**
```bash
curl http://localhost:3000/read
```