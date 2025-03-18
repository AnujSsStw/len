import Image from "next/image";
import { PipelineVelocityReport } from "../api/chat/route";

export default async function Latest({
  searchParams,
}: {
  searchParams: Promise<{ state: string; header: string }>;
}) {
  const { state, header } = await searchParams;
  const base64Decoded = atob(state);
  const parsedState = JSON.parse(base64Decoded) as PipelineVelocityReport;

  // Convert arrays to comma-separated strings
  const leadSourcesStr = parsedState.lead_sources.join(", ");
  const techStackStr = parsedState.tech_stack.join(", ");

  // Convert final recommendations array to HTML list items
  const finalRecommendationsHtml = parsedState.final_recommendation
    .map((rec) => `<p>${rec}</p>`)
    .join("\n");

  const downloadPdf = async (formData: FormData) => {
    "use server";
    console.log("downloading pdf");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ state: JSON.stringify(parsedState) }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "pipeline_report.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF");
    }
  };

  return (
    <main className="bg-white">
      {
        <header
          className={`fixed top-0 left-0 right-0 flex flex-col justify-center items-center py-2.5  text-black h-[120px] w-full z-50 bg-white ${
            header ? "block" : "opacity-0"
          }`}
        >
          <div className="flex flex-col justify-between items-center max-w-[1200px] mx-auto px-5 w-full relative">
            <div className="w-full text-center">
              <div className="logo relative z-10 my-5 mx-auto inline-block">
                <a
                  href="https://leanstack.me"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/leanstack-main-logo.png"
                    alt="Leanstack.me logo"
                    className="max-h-[46px] h-auto w-auto object-contain block border-none relative z-10"
                    width={184}
                    height={46}
                  />
                </a>
              </div>
            </div>
            <div className="w-full flex justify-center">
              {header && (
                <form action={downloadPdf}>
                  <button
                    id="download-pdf-btn"
                    className="flex justify-center items-center w-10 h-10 bg-gray-200 rounded text-gray-700 text-lg transition-colors duration-200 mb-2.5 border-none cursor-pointer hover:bg-gray-300"
                    type="submit"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </button>
                </form>
              )}
            </div>
          </div>
        </header>
      }

      <main
        className={`max-w-[1200px] mx-auto mb-10 bg-white text-left ${
          header ? "mt-[120px]" : ""
        }`}
      >
        {/* Intro Section */}
        <section className="p-5 rounded-lg mb-5">
          <h1 className="text-[1.6em] font-black text-black mt-0 mb-2.5 leading-tight">
            Shorten Your Time-to-Close
          </h1>
          <p className="text-gray-700 text-base leading-relaxed mb-5">
            Thank you for completing your AI-Powered Consulting Session with
            Leanstack's Virtual Revenue Consultant, a next-generation AI advisor
            that works like a true consultant available 24/7. Unlike generic
            chatbots or custom GPTs, Leanstack.me is built from real-world
            expertise in revenue operations and demand generation, combining top
            revenue strategy with AI-powered intelligence to guide, qualify, and
            accelerate your sales pipeline.
          </p>
          <p className="text-gray-700 text-base leading-relaxed">
            This report distills your consulting session into clear Key
            Takeaways, Detailed Insights, and Final Recommendations.{" "}
            <a
              href="#"
              target="_blank"
              className="text-blue-600 font-bold no-underline hover:underline"
            >
              Create a leanstack.me account
            </a>{" "}
            and enjoy the ongoing support of the same dedicated consultant who
            will remember your session and continue to provide personalized,
            powerful revenue intelligence every step of the way.
          </p>
        </section>

        {/* Key Takeaways */}
        <section className="p-5 rounded-lg mb-5">
          <h2 className="text-blue-600 text-2xl font-bold mb-2.5">
            Key Takeaway
            <span className="relative inline-block">
              s
              <Image
                src="/msg_icon.png"
                alt="leanstack.me logo"
                width={31}
                height={31}
                className="absolute -top-1.5 left-4 z-10"
              />
            </span>
          </h2>
          <div className="mt-4">
            <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
              {parsedState.key_takeaways}
            </p>
          </div>
        </section>

        {/* Detailed Insights */}
        <section className="p-5 rounded-lg mb-5">
          <div>
            <h2 className="text-blue-600 text-2xl font-bold mb-2.5">
              Detailed Insights
            </h2>

            <h3 className="text-gray-800 text-xl font-medium mt-5 mb-2.5">
              Revenue
            </h3>
            <div className="bg-white p-5 rounded-lg">
              <p className="text-gray-700 text-base leading-relaxed">
                {parsedState.revenue_insight}
              </p>
            </div>

            <h3 className="text-gray-800 text-xl font-medium mt-5 mb-2.5">
              Lead Generation
            </h3>
            <div className="bg-white p-5 rounded-lg">
              <p className="text-gray-700 text-base leading-relaxed">
                {parsedState.lead_insight}
              </p>
            </div>

            <h3 className="text-gray-800 text-xl font-medium mt-5 mb-2.5">
              Technology Stack
            </h3>
            <div className="bg-white p-5 rounded-lg">
              <p className="text-gray-700 text-base leading-relaxed">
                {parsedState.tech_insight}
              </p>
            </div>

            <h3 className="text-gray-800 text-xl font-medium mt-5 mb-2.5">
              Pipeline Bottlenecks
            </h3>
            <div className="bg-white p-5 rounded-lg">
              <p className="text-gray-700 text-base leading-relaxed">
                {parsedState.bottleneck_insight}
              </p>
            </div>

            <h3 className="text-gray-800 text-xl font-medium mt-5 mb-2.5">
              Company Overview
            </h3>
            <div className="bg-white p-5 rounded-lg">
              <p className="text-gray-700 text-base leading-relaxed">
                {parsedState.company_insight}
              </p>
            </div>
          </div>
        </section>

        {/* Final Recommendations */}
        <section className="p-5 rounded-lg mb-7.5">
          <div>
            <h2 className="text-blue-600 text-2xl font-bold mb-2.5">
              Final Recommendation
              <span className="relative inline-block">
                s
                <Image
                  src="/msg_icon.png"
                  alt="leanstack.me logo"
                  width={31}
                  height={31}
                  className="absolute -top-1.5 left-4 z-10"
                />
              </span>
            </h2>
            <div className="bg-white p-5 rounded-lg">
              <div
                className="ml-5 pl-0"
                dangerouslySetInnerHTML={{ __html: finalRecommendationsHtml }}
              />
            </div>
          </div>
        </section>

        {/* User Responses & Benchmarks */}
        <section className="p-5">
          <h2 className="text-blue-600 text-2xl font-bold mb-2.5">
            User Responses & Industry Benchmarks
          </h2>

          <h3 className="text-gray-800 text-xl font-medium mt-5 mb-2.5">
            Company Overview
          </h3>
          <p className="text-gray-700 text-base leading-relaxed mb-5">
            <strong className="text-gray-800 mr-2">Funding Stage:</strong>{" "}
            {parsedState.funding_stage}
          </p>
          <p className="text-gray-700 text-base leading-relaxed mb-5">
            <strong className="text-gray-800 mr-2">Employee Count:</strong>{" "}
            {parsedState.employee_count}
          </p>
          <p className="text-gray-700 text-base leading-relaxed mb-5">
            <strong className="text-gray-800 mr-2">Benchmark:</strong>{" "}
            {parsedState.company_benchmark}
          </p>

          <h3 className="text-gray-800 text-xl font-medium mt-5 mb-2.5">
            Revenue Goals
          </h3>
          <p className="text-gray-700 text-base leading-relaxed mb-5">
            <strong className="text-gray-800 mr-2">
              Primary Revenue Goal:
            </strong>{" "}
            {parsedState.revenue_goal}
          </p>
          <p className="text-gray-700 text-base leading-relaxed mb-5">
            <strong className="text-gray-800 mr-2">Benchmark:</strong>{" "}
            {parsedState.revenue_benchmark}
          </p>

          <h3 className="text-gray-800 text-xl font-medium mt-5 mb-2.5">
            Lead Generation Sources
          </h3>
          <p className="text-gray-700 text-base leading-relaxed mb-5">
            <strong className="text-gray-800 mr-2">
              Lead Generation Sources:
            </strong>{" "}
            {leadSourcesStr}
          </p>
          <p className="text-gray-700 text-base leading-relaxed mb-5">
            <strong className="text-gray-800 mr-2">Benchmark:</strong>{" "}
            {parsedState.lead_benchmark}
          </p>

          <h3 className="text-gray-800 text-xl font-medium mt-5 mb-2.5">
            Technology Stack
          </h3>
          <p className="text-gray-700 text-base leading-relaxed mb-5">
            <strong className="text-gray-800 mr-2">Tech Stack:</strong>{" "}
            {techStackStr}
          </p>
          <p className="text-gray-700 text-base leading-relaxed mb-5">
            <strong className="text-gray-800 mr-2">Benchmark:</strong>{" "}
            {parsedState.tech_benchmark}
          </p>

          <h3 className="text-gray-800 text-xl font-medium mt-5 mb-2.5">
            Pipeline Bottlenecks
          </h3>
          <p className="text-gray-700 text-base leading-relaxed mb-5">
            <strong className="text-gray-800 mr-2">
              Main Pipeline Bottlenecks:
            </strong>{" "}
            {parsedState.pipeline_bottlenecks}
          </p>
          <p className="text-gray-700 text-base leading-relaxed mb-5">
            <strong className="text-gray-800 mr-2">Benchmark:</strong>{" "}
            {parsedState.bottleneck_benchmark}
          </p>

          <h3 className="text-gray-800 text-xl font-medium mt-5 mb-2.5">
            Reporting Process
          </h3>
          <p className="text-gray-700 text-base leading-relaxed mb-5">
            <strong className="text-gray-800 mr-2">Reporting Process:</strong>{" "}
            {parsedState.reporting_process}
          </p>
        </section>
      </main>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById("download-pdf-btn").addEventListener("click", async function(e) {
              e.preventDefault();
              const button = this;
              button.disabled = true;
              button.style.opacity = "0.5";

              try {
                const response = await fetch('/api/pdf', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ state: ${JSON.stringify(
                    parsedState
                  )} }),
                });

                if (!response.ok) {
                  throw new Error('Failed to generate PDF');
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'pipeline_report.pdf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              } catch (error) {
                console.error('Error downloading PDF:', error);
                alert('There was an error generating the PDF. Please try again.');
              } finally {
                button.disabled = false;
                button.style.opacity = "1";
              }
            });
          `,
        }}
      />
    </main>
  );
}
