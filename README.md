# OpenUserLab

This app uses Next.js, React, TypeScript, Prisma (PostgreSQL), and NextAuth.

- **GitHub:** <https://github.com/hsiang2/open-user-lab>
- **Live demo (Vercel):** <https://open-user-lab.vercel.app>

---

## Setup

1. Install dependencies:

    ```bash
    npm install
    ```

2. Create a `.env` file in the project root with at least:

    ```dotenv
    DATABASE_URL="<your-postgresql-connection-string>"
    NEXTAUTH_SECRET="<your-secret>"
    NEXTAUTH_URL="http://localhost:3000"
    ```

3. Generate the Prisma client:

    ```bash
    npx prisma generate
    ```

4. Create/sync the database schema:

    ```bash
    npx prisma migrate dev
    ```

5. Start the development server:

    ```bash
    npm run dev
    ```
    App will be available at: [http://localhost:3000](http://localhost:3000)

---

## Scripts

- `npm run dev` – start dev server  
- `npm run build` – build the app  
- `npm start` – run in production  
- `npm run lint` – run ESLint checks  
