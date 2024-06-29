### **Branch-specific README.md**

Create a `README.md` in each branch with setup instructions and relevant information.

#### **`file-storage` README.md**

````markdown
# File Storage Implementation

This branch uses JSON files for data storage.

## Setup

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Create a `.env` file in the root directory:

   ```bash
   JWT_ACCESS_SECRET=your_access_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d
   ```

3. Start the server:

   ```bash
   yarn start
   ```

## API Endpoints

- `POST /api/auth/signup`: Register a new user.
- `POST /api/auth/login`: Login and get tokens.
- `POST /api/auth/refresh-token`: Refresh access token.
- `POST /api/auth/logout`: Logout user.
- `POST /api/posts`: Create a post (requires authentication).
- `GET /api/posts`: Get all posts.

## Notes

- Data is stored in `users.json` and `posts.json` files in the `data` directory.
- Images are saved in the `uploads` directory.
````
