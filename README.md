# Documentation & Playground

This project is a Node.js application using Express and EJS to serve the documentation and playground.

## Directory Structure

- **views/**: EJS templates.
  - **partials/**: Reusable components (`header.ejs`, `head.ejs`).
  - `index.ejs`: Playground page.
  - `docs.ejs`: Documentation page.
- **public/**: Static assets.
  - **assets/**: CSS and JS files.
- **server.js**: Express server entry point.

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   node server.js
   ```

3. Open [http://localhost:8080](http://localhost:8080) in your browser.

## How to Edit

- **To change the Theme**: Edit `public/assets/css/variables.css`.
- **To change the Layout**: Edit `views/partials/header.ejs` or `views/partials/head.ejs`.
- **To add a new Page**: Create a new `.ejs` file in `views/` and add a route in `server.js`.
