import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from '@/lib/mongodb'
import nodemailer from 'nodemailer'
import bcrypt from 'bcryptjs'

// Custom adapter to handle connection errors
const mongoDBAdapter = () => {
  return {
    ...MongoDBAdapter(clientPromise),
    // Override methods if needed to add error handling
  };
};

export const authOptions = {
  // Use the wrapped adapter with error handling
  adapter: mongoDBAdapter(),
  providers: [
    EmailProvider({      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        },
        tls: {
          rejectUnauthorized: false // Ignorer les problèmes de certificat auto-signé
        }
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier: email, url, provider: { server, from } }) {
        const { host } = new URL(url)
        const transport = nodemailer.createTransport(server)
        await transport.sendMail({
          to: email,
          from,
          subject: `Sign in to ${host}`,
          text: text({ url, host }),
          html: html({ url, host, email })
        })
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error("Please enter an email and password");
        }
        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection("users").findOne({ email: credentials.email });

        if (!user) {
          throw new Error("No user found with this email");
        }

        // Validate password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Incorrect password");
        }        // Check if email is verified
        if (!user.emailVerified) {
          console.log("Email not verified for user:", user.email);
          throw new Error("email_not_verified");
        }

        return {
          id: user._id.toString(), // Ensure id is a string
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role || 'USER', // Add role, default to 'USER'
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      profile(profile) { // Add profile function to assign role for Google users
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: profile.role || 'USER', // Default role for Google users
        };
      },
    })
  ],
  pages: {
    signIn: '/auth/signin',
    // signOut: '/auth/signout', // Optional: specify custom sign out page
    error: '/auth/verify-email', // Custom error page for email verification
    // verifyRequest: '/auth/verify-request', // Optional: (used for check email message)
    // newUser: '/auth/new-user' // Optional: New users will be directed here on first sign in (leave the property out to disable)
  },
  session: {
    strategy: "jwt",
  },  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      // For Google provider, if it's a new user and role is not set, set it.
      // The MongoDB adapter should handle creating the user with the role from the profile function.
      // If the user already exists, their role should be loaded from the DB.
      if (account?.provider === "google" && isNewUser) {
        // The profile function in GoogleProvider should have already set the role.
        // If not, we can default it here, but it's better handled in profile.
        token.role = token.role || 'USER'; 
      }
      return token;
    },
    async signIn({ user, account, profile, email, credentials }) {
      // We'll use this to pass the email to the error handler
      if (credentials && credentials.email) {
        user.email = credentials.email;
      }
      return true;
    },
    async error(error, req, res) {
      console.log("NextAuth error:", error);
      // Redirect to the verify-email page with error parameter
      if (error.message === "email_not_verified" && req?.body?.email) {
        const email = encodeURIComponent(req.body.email);
        const url = `/auth/verify-email?error=email_not_verified&email=${email}`;
        return url;
      }
      return "/auth/signin";
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

// Helper functions for email templates (can be moved to a separate file)
function html({ url, host, email }) {
  const escapedEmail = `${email.replace(/./g, '&#&;')}`;
  return `
    <body>
      <p>Sign in to ${host} as ${escapedEmail} by clicking the link below:</p>
      <p><a href="${url}">Sign in</a></p>
    </body>
  `
}

function text({ url, host }) {
  return `Sign in to ${host}\n${url}\n\n`
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
