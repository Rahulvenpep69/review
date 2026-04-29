import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6 font-sans leading-relaxed">
      <h1 className="text-4xl font-bold mb-8 font-outfit">Privacy Policy & Data Deletion</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Data Deletion Instructions</h2>
        <p className="mb-4">
          At MEDIA360, we respect your privacy and provide easy ways to remove your data from our platform.
          If you wish to delete your account or any data associated with your Facebook/Instagram integrations, 
          please follow these steps:
        </p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Log in to your MEDIA360 account.</li>
          <li>Navigate to the <strong>Settings</strong> page.</li>
          <li>Find the integration you wish to remove (e.g., Facebook Pages) and click <strong>Disconnect</strong>.</li>
          <li>All access tokens and cached data for that platform will be immediately removed from our database.</li>
        </ol>
        <p className="mt-4">
          Alternatively, you can request full account deletion by emailing us at 
          <span className="font-bold"> support@media360.ai</span>. We will process your request within 48 hours.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
        <p>
          MEDIA360 only requests the minimum permissions necessary to display your own social media 
          comments and insights. We do not sell your data to third parties. For more details on how 
          we handle your information, please contact our support team.
        </p>
      </section>
    </div>
  );
}
