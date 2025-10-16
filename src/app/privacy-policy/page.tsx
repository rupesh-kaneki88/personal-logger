

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto p-8 text-gray-300">
        <h1 className="text-4xl font-bold mb-6 text-white">Privacy Policy</h1>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">1. Introduction</h2>
          <p className="mb-4">
            Welcome to Personal Logger. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our application.
          </p>
          <p>
            We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">2. Information We Collect</h2>
          <p className="mb-4">
            We collect personal information that you voluntarily provide to us when you register on the application, express an interest in obtaining information about us or our products and services, when you participate in activities on the application, or otherwise when you contact us.
          </p>
          <p className="mb-4">
            The personal information that we collect depends on the context of your interactions with us and the application, the choices you make and the products and features you use. The personal information we collect may include the following:
          </p>
          <ul className="list-disc list-inside ml-4">
            <li>Email addresses</li>
            <li>Names</li>
            <li>Log entries (content, category, duration, timestamp)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">3. How We Use Your Information</h2>
          <p className="mb-4">
            We use personal information collected via our application for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
          </p>
          <p>
            We use the information we collect or receive:
          </p>
          <ul className="list-disc list-inside ml-4">
            <li>To facilitate account creation and logon process.</li>
            <li>To manage user accounts.</li>
            <li>To deliver and facilitate delivery of services to the user.</li>
            <li>To respond to user inquiries/offer support to users.</li>
            <li>To send you marketing and promotional communications.</li>
            <li>To request feedback.</li>
            <li>To protect our Services.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">4. Sharing Your Information</h2>
          <p>
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">5. Contact Us</h2>
          <p>
            If you have questions or comments about this policy, you may email us.
          </p>
        </section>
      </main>
    </div>
  );
}

