// Using fetch in Node.js (Node.js v18+)
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

// Example usage
async function main() {
  try {
    const base64String = await imageUrlToBase64(
      "http://localhost:3000/leanstack-main-logo.png"
    );
    console.log(base64String);

    // If you want the complete data URL format:
    // const contentType = 'image/jpeg'; // You may want to extract this from response headers
    // const dataUrl = `data:${contentType};base64,${base64String}`;
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
