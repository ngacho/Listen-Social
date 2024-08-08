import { Inter } from "next/font/google";
import { ClerkProvider, UserButton, SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Image from 'next/image';
import dynamic from 'next/dynamic';
import "./globals.css";
import { CSPostHogProvider, PHProvider } from './providers';

// Explicitly include the .jsx extension
const PostHogPageView = dynamic(() => import('./PostHogPageView.jsx'), {
  ssr: false,
});

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Listen Social",
  description: "Reddit social listener tool",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <PHProvider>
          <CSPostHogProvider>
            <body className={inter.className}>
              <PostHogPageView /> 
              {/* Header */}
              <nav className="bg-gray-800 p-4 shadow-md sticky top-0 z-10">
                <div className="container mx-auto flex items-center justify-between">
                  <a href="/" className="flex items-center">
                    <Image 
                      src="/listen-social-favicon-color.png" 
                      alt="Listen Social Logo" 
                      width={40} 
                      height={40} 
                      className="w-10 h-auto" 
                    />
                    <h1 className="text-white text-2xl font-bold ml-2">Listen Social</h1>
                  </a>
                  <div className="flex items-center">
                    <a href="/beta-access">
                      <button className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition-colors duration-300 ease-in ml-4">
                        Get Notifications Access
                      </button>
                    </a>
                    <div className="ml-3.5">
                      <SignedIn>
                        <UserButton />
                      </SignedIn>
                      <SignedOut>
                        <SignInButton>
                          <button className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors duration-300 ease-in ml-4">
                            Sign In
                          </button>
                        </SignInButton>
                        <SignUpButton>
                          <button className="ml-4 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors duration-300 ease-in">
                            Sign Up
                          </button>
                        </SignUpButton>
                      </SignedOut>
                    </div>
                  </div>
                </div>
              </nav>
              {/* Main Content */}
              <main>
                {children}
              </main>
              {/* Footer */}
              <footer className="bg-gray-800 p-4 text-center text-gray-400 mt-4">
                <p className="text-sm">
                  Made with <span className="text-red-500">&hearts;</span> by 
                  <a 
                    href="https://www.linkedin.com/in/nik-k-l/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:underline ml-1"
                  >
                    Nik L
                  </a>
                </p>
              </footer>
            </body>
          </CSPostHogProvider>
        </PHProvider>
      </html>
    </ClerkProvider>
  );
}
