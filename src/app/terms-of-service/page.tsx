

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto p-8 text-gray-300">
        <h1 className="text-4xl font-bold mb-6 text-white">Terms of Service</h1>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using Personal Logger (the "Service"), you agree to be bound by these Terms of Service ("Terms"), all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">2. Use License</h2>
          <p className="mb-4">
            Permission is granted to temporarily download one copy of the materials (information or software) on Personal Logger's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc list-inside ml-4">
            <li>Modify or copy the materials;</li>
            <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
            <li>Attempt to decompile or reverse engineer any software contained on Personal Logger's website;</li>
            <li>Remove any copyright or other proprietary notations from the materials; or</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>
          <p className="mt-4">
            This license shall automatically terminate if you violate any of these restrictions and may be terminated by Personal Logger at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">3. Disclaimer</h2>
          <p className="mb-4">
            The materials on Personal Logger's website are provided on an 'as is' basis. Personal Logger makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          <p>
            Further, Personal Logger does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">4. Limitations</h2>
          <p>
            In no event shall Personal Logger or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Personal Logger's website, even if Personal Logger or a Personal Logger authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">5. Modifications to Terms</h2>
          <p>
            Personal Logger may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">6. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction where Personal Logger operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>
        </section>
      </main>
    </div>
  );
}

