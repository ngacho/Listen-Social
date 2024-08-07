import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/solid'; // Import an arrow icon for CTA

const BetaAccessPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      <div className="flex flex-1 p-6 lg:p-12">
        {/* Left Side: Paragraph Section */}
        <div className="w-full lg:w-1/2 pr-4">
          <div className="bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-700 h-full flex flex-col">
            <h1 className="text-4xl font-bold mb-6 text-gray-100">
              Join Our Beta Program
            </h1>
            <p className="text-gray-300 mb-6">
              Hi there,
              <br /><br />
              With many years of experience in growth and marketing, I&#39;ve witnessed firsthand how rapidly the landscape evolves. One question that has always intrigued me is whether we can enhance inbound marketing to enable faster growth for companies. My belief is that being part of conversations where potential buyers discuss your solution is key to driving initial revenue.
              <br /><br />
              Current social listening tools are often costly and might be out of reach for many SMB marketers. Moreover, these tools often lack certain essential features. That&#39;s where my tool comes into play.
              <br /><br />
              I&#39;m developing a tool that aims to offer a superior social listening workflow starting from a notification system. Here&#39;s what the upcoming notification system will include:
            </p>
            <div className="bg-gray-700 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Key Features:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li className="text-gray-300"><strong>Real-Time Alerts:</strong> Get instant notifications when relevant conversations arise.</li>
                <li className="text-gray-300"><strong>Customizable Filters:</strong> Tailor notifications based on specific keywords and topics.</li>
                <li className="text-gray-300"><strong>Daily Summaries:</strong> Receive daily overviews of important conversations and trends for your set keywords.</li>
              </ul>
            </div>
            <p className="text-gray-300 mt-6">
              The tool is free to use, and I&#39;m currently seeking early adopters to provide feedback. If you&#39;re interested in accessing the beta, please fill out the form below.
              <br /><br />
              Thank you for your interest and support!
            </p>
          </div>
        </div>
        {/* Right Side: Embedded Form */}
        <div className="w-full lg:w-1/2 pl-4">
          <div className="bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-700 h-full flex flex-col">
            <h2 className="text-3xl font-bold mb-6 text-gray-100">
              Request Beta Access
            </h2>
            <div className="flex-1 overflow-hidden">
              <iframe
                className="airtable-embed w-full h-full bg-gray-800 border-gray-700"
                src="https://airtable.com/embed/appyHAlwJNIuVmN5Z/paghYy47NGHh9fUkb/form"
                frameBorder="0"
                onMouseWheel=""
                style={{ backgroundColor: '#1F2937' }} // Match the dark theme
              />
            </div>
            <div className="mt-6 text-center">
              <a
                href="#"
                className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-300 ease-in"
              >
                <span className="mr-2">Join the Beta</span>
                <ArrowRightIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetaAccessPage;
