import { DefaultSession } from 'next-auth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from 'next-auth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from 'next-auth/jwt';

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string;
    isResearcher: boolean;
    name: string;
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
        isResearcher: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    isResearcher: boolean;
  }
}