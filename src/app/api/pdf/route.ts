import chromium from "@sparticuz/chromium-min";
import puppeteer, { executablePath } from "puppeteer-core";
import { PipelineVelocityReport } from "../chat/route";

const isDev = process.env.NODE_ENV === "development";

async function imageUrlToBase64(imageUrl: string) {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(
        `Failed to fetch image: ${response.status} ${response.statusText}`
      );
    }

    // Get the image as an ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();

    // Convert ArrayBuffer to Buffer and then to base64
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString("base64");

    return base64String;
  } catch (error) {
    console.error("Error fetching image:", error);
    throw error;
  }
}

const chromiumPack =
  "https://github.com/Sparticuz/chromium/releases/download/v126.0.0/chromium-v126.0.0-pack.tar";
const localChromePath =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function captureLatestPdfForDevice(updateState: string) {
  const browser = await puppeteer.launch({
    args: isDev
      ? [
          ...puppeteer.defaultArgs(),
          "--hide-scrollbars",
          "--disable-web-security",
        ]
      : chromium.args,
    // See https://www.npmjs.com/package/@sparticuz/chromium#running-locally--headlessheadful-mode for local executable path
    executablePath: isDev
      ? localChromePath
      : await chromium.executablePath(chromiumPack),
    headless: true,
  });

  console.log("browser launched");

  // TODO: setup page dimensions based on device model
  const page = await browser.newPage();

  const jsonStr = JSON.stringify(updateState);
  const base64State = btoa(jsonStr);

  const serverUrl = isDev
    ? "http://localhost:3000"
    : `https://${process.env.VERCEL_URL}`;

  const finalUrl = `${serverUrl}/latest?state=${base64State}`;
  console.log("finalUrl", finalUrl);

  // Add emulation of print media
  // await page.emulateMediaType("print");

  await page.goto(finalUrl, {
    waitUntil: "networkidle0",
  });

  // Wait for the logo to be loaded
  // await page.waitForSelector("#pdf-header img");

  console.log("browser page opened");
  const base64Logo = await imageUrlToBase64(
    `${serverUrl}/leanstack-main-logo.png`
  );

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "100px",
      right: "50px",
      bottom: "50px",
      left: "50px",
    },
    displayHeaderFooter: true,
    headerTemplate: `
    <div style="width: 100%; font-size: 10px; padding: 5mm 5mm 0; margin: 0;">
      <div style="text-align: center;">
        <img src="data:image/png;base64,${base64Logo}" style="height: 40px; margin-bottom: 10px;" />
      </div>
    </div>`,
    footerTemplate: `
    <div class="footer">
        <div class="left">© 2025 <a href="https://leanstack.me">leanstack.me</a> All rights reserved.</div>
        <div class="right">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
    </div>
     <style>
              body {
                margin: 0;
                padding: 0;
                font-family: 'Roboto', sans-serif;
                font-size: 10px;
              }
              .footer {
                width: calc(100% - 20mm);
                color: #666;
                padding: 5mm 5mm;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .left {
                flex: 0 1 auto;
                text-align: left;
              }
              .right {
                flex: 0 1 auto;
                text-align: right;
                font-size: 10px;
                font-weight: bold;
                color: #666;
                margin-left: auto;
              }
              a {
                color: #666;
              }
    </style>
    `,
  });

  console.log("browser pdf captured");

  await page.close();

  return pdf;
}

export async function POST(req: Request) {
  const { state } = await req.json();
  console.log("state", state);
  const pdf = await captureLatestPdfForDevice(state);
  return new Response(pdf);
}
