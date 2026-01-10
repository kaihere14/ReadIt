# ReadIt

## Overview

ReadIt is a full-stack application designed to streamline the creation and management of documentation, with a particular focus on generating comprehensive README files. It features a modern web interface for user interaction and a robust Node.js backend for processing and generating content. A key aspect of ReadIt's architecture is its ability to handle asynchronous tasks for README generation, leveraging a powerful queuing system and integrating advanced AI capabilities.

## Features

*   **Intuitive User Interface**: A responsive client-side application built with React and Vite, providing a seamless experience for users to manage and generate documentation.
*   **Robust Backend API**: A Node.js server handling data processing, routing, and business logic, designed for scalability and maintainability.
*   **Asynchronous README Generation**: Utilizes Redis and BullMQ for efficient background processing of README generation tasks. This ensures that resource-intensive operations do not block the main application thread, leading to a smooth user experience, especially when processing complex repositories or multiple requests.
*   **AI-Powered Content Generation**: Integrates Google Gemini API within the README generation pipeline. This enables intelligent assistance in creating relevant, structured, and high-quality documentation by analyzing repository structure, existing READMEs, and recent commit changes.
*   **GitHub Integration**: Connects with GitHub repositories to fetch project details, file structures, and commit history, enabling automated README updates based on repository activity.
*   **Modular Project Structure**: Clearly separated client and server components, along with dedicated service and utility layers, facilitate development, testing, and deployment.
*   **Repository Activity Tracking**: Tracks repository activation, webhook management, and README generation history for each integrated repository.

## Technologies Used

### Client-Side

*   **React**: A JavaScript library for building user interfaces.
*   **Vite**: A fast build tool that provides a lightning-fast development experience.
*   **CSS Modules/Custom CSS**: For styling components.

### Server-Side

*   **Node.js**: A JavaScript runtime environment for building scalable network applications.
*   **Express.js**: A minimal and flexible Node.js web application framework.
*   **Redis**: An open-source, in-memory data structure store, used as a message broker for the queuing system.
*   **BullMQ**: A robust, performant, and Redis-backed queueing system for Node.js, managing background jobs.
*   **MongoDB/Mongoose**: A NoSQL database for data persistence and an ODM (Object Data Modeling) for Node.js, used for managing user and repository data.
*   **Google Gemini API**: Leveraged for advanced AI capabilities in generating and updating README content.

## Prerequisites

Before you begin, ensure you have met the following requirements:

*   **Node.js**: Version 14 or higher (LTS recommended)
*   **npm** or **Yarn**: A package manager for JavaScript.
*   **Redis Server**: Required for the README generation functionality. While the server can run without Redis, the asynchronous job processing will not be active. You can install Redis locally or use a cloud-hosted solution.
*   **Google Gemini API Key**: A valid API key is required to use the AI-powered README generation feature. You can obtain one from the Google AI Studio.
*   **GitHub Webhook Secret**: A secret key used to secure GitHub webhooks. This will need to be configured in your server environment variables.

## Installation

To get `ReadIt` up and running on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/kaihere14/ReadIt.git
    cd ReadIt
    ```

2.  **Install Server Dependencies:**
    Navigate to the `server` directory and install the required packages.
    ```bash
    cd server
    npm install # or yarn install
    ```

3.  **Configure Server Environment Variables:**
    Create a `.env` file in the `server` directory. An example `.env` file might look like this:
    ```env
    # Server Port
    PORT=5000

    # MongoDB Connection
    MONGO_URI=mongodb://localhost:27017/readit_db

    # Redis Configuration (Required for README generation queue)
    REDIS_HOST=localhost
    REDIS_PORT=6379
    REDIS_PASSWORD=your_redis_password_if_any # Leave empty if no password

    # Google Gemini API Key (Required for AI content generation)
    GEMINI_API_KEY=your_google_gemini_api_key
    GEMINI_MODEL=gemini-1.5-flash # Or another preferred model

    # GitHub Webhook Secret (Required for GitHub webhook verification)
    GITHUB_WEBHOOK_SECRET=your_github_webhook_secret

    # GitHub OAuth Configuration (if applicable, for user login/repo access)
    # GITHUB_CLIENT_ID=...
    # GITHUB_CLIENT_SECRET=...
    # GITHUB_CALLBACK_URL=...
    ```
    *Note: The server includes robust error handling for Redis connection. If Redis is not available, the server will continue to run, but all queue-related functionalities (like README generation) will be inactive.*

4.  **Install Client Dependencies:**
    Navigate to the `client` directory and install the required packages.
    ```bash
    cd ../client
    npm install # or yarn install
    ```

5.  **Configure Client Environment Variables:**
    Create a `.env` file in the `client` directory. An example `.env` file might look like this:
    ```env
    # Base URL for the backend API
    VITE_API_BASE_URL=http://localhost:5000/api
    ```

## Usage

To start the ReadIt application:

1.  **Start the Redis Server:**
    Ensure your Redis server instance is running. If you're running it locally, you might start it via `redis-server` in your terminal.

2.  **Start the Backend Server:**
    From the `server` directory, execute:
    ```bash
    npm run dev # or npm start
    ```
    The server will typically run on `http://localhost:5000` (or your configured `PORT`). You should see console logs indicating the Redis connection status.

3.  **Start the Frontend Client:**
    From the `client` directory, execute:
    ```bash
    npm run dev
    ```
    The client application will typically open in your browser at `http://localhost:5173` (or the port Vite assigns).

Once both client and server are running, you can interact with the application through your web browser. The specific steps to trigger README generation or other features will be available through the client's user interface after authenticating and linking a GitHub repository.

## Project Structure

The repository is organized into two primary components:

*   `client/`: Contains the frontend application built with React and Vite. This directory is responsible for the user interface, user interaction, and making requests to the backend API.
*   `server/`: Houses the backend application developed with Node.js. It includes:
    *   `controllers/`: Handles incoming requests and orchestrates responses.
    *   `db/`: Database connection and configuration.
    *   `middlewares/`: Express middleware functions.
    *   `routes/`: API route definitions.
    *   `schema/`: Mongoose schemas for database models.
    *   `services/`: Contains business logic and external API integrations, such as `gemini.service.js` for AI and `github.service.js` for GitHub API interactions.
    *   `utils/`: Utility functions, including `git.worker.js` for background job processing with BullMQ and `prompt.builder.js` for AI prompt construction.

## Contributing

Contributions are welcome! If you'd like to contribute to ReadIt, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

Please ensure your code adheres to the project's coding style and includes appropriate tests.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). See the `LICENSE` file for more details.

## Contact

For any questions or inquiries, please reach out via my GitHub profile.