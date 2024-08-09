import { Inter } from "next/font/google";
import { ClerkProvider, UserButton, SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Image from 'next/image';
import "./globals.css";
import { PHProvider } from './providers';
import dynamic from 'next/dynamic';
import { Analytics } from "@vercel/analytics/react";
import Script from 'next/script';

const PostHogPageView = dynamic(() => import('./PostHogPageView'), {
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
      <head>
          {/* Microsoft Clarity Script */}
          <Script id="clarity-script" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "nkmdsrylks");
            `}
          </Script>
        </head>
        <PHProvider>
          <body className={inter.className}>
            <Script id="vector-script" strategy="afterInteractive">
              {`
                !function(e,r){try{if(e.vector)return void console.log("Vector snippet included more than once.");var t={};t.q=t.q||[];for(var o=["load","identify","on"],n=function(e){return function(){var r=Array.prototype.slice.call(arguments);t.q.push([e,r])}},c=0;c<o.length;c++){var a=o[c];t[a]=n(a)}if(e.vector=t,!t.loaded){var i=r.createElement("script");i.type="text/javascript",i.async=!0,i.src="https://cdn.vector.co/pixel.js";var l=r.getElementsByTagName("script")[0];l.parentNode.insertBefore(i,l),t.loaded=!0}}catch(e){console.error("Error loading Vector:",e)}}(window,document);
                vector.load("152f2a86-73f4-44de-b8b0-a09b487f76f2");
              `}
            </Script>
            <PostHogPageView />
            {/* Header */}
            <nav className="bg-gray-900 p-4 shadow-md sticky top-0 z-10">
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
                    <button className="bg-purple-600 text-white px-5 py-2 rounded-full shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105 duration-300 ease-in ml-4">
                      Get Notifications Access
                    </button>
                  </a>
                  <div className="ml-4">
                    <SignedIn>
                      <UserButton />
                    </SignedIn>
                    <SignedOut>
                      <SignInButton>
                        <button className="bg-blue-600 text-white px-5 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 duration-300 ease-in ml-4">
                          Sign In
                        </button>
                      </SignInButton>
                      <SignUpButton>
                        <button className="ml-4 bg-green-600 text-white px-5 py-2 rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 duration-300 ease-in">
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
              <Analytics />
            </body>
        </PHProvider>
      </html>
    </ClerkProvider>
  );
}
