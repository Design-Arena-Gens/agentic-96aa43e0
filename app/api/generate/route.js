import { NextResponse } from "next/server";

const SAMPLE_VIDEO = "https://filesamples.com/samples/video/mp4/sample_960x540.mp4";

export async function POST(req) {
  try {
    const body = await req.json();
    const prompt = String(body?.prompt || "").slice(0, 5000);
    const duration = Number(body?.duration || 10);
    const aspectRatio = String(body?.aspectRatio || "16:9");

    if (!prompt) {
      return NextResponse.json({ error: "????????? ?????? ??" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GENAI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    const model = process.env.GOOGLE_VEO_MODEL || "veo-3";

    // Fallback demo mode when API key is missing
    if (!apiKey) {
      return NextResponse.json({ mock: true, videoUrl: SAMPLE_VIDEO, model });
    }

    // Attempt Google GenAI call. SDK video endpoints may change; we conservatively
    // try a generateContent call and return demo video on failure.
    try {
      // Dynamic import to avoid bundling issues
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const client = new GoogleGenerativeAI(apiKey);
      const genModel = client.getGenerativeModel({ model });

      // Many SDKs expose a video generation entry-point; if not available,
      // this will likely throw which we catch below.
      const request = {
        contents: [
          {
            role: "user",
            parts: [
              { text: `Generate a ${duration}s cinematic video, aspect ${aspectRatio}.\nHindi brief: ${prompt}` },
            ],
          },
        ],
      };

      const result = await genModel.generateContent(request);
      // Heuristic extraction: search for a file URL in the response
      const uri = (result?.response?.candidates?.[0]?.content?.parts || []).find(
        (p) => typeof p?.fileData?.fileUri === "string"
      )?.fileData?.fileUri;

      if (uri) {
        return NextResponse.json({ mock: false, videoUrl: uri, model });
      }

      // If response did not include a URI, fall back to demo video
      return NextResponse.json({ mock: true, videoUrl: SAMPLE_VIDEO, model, note: "No file URI in response" });
    } catch (sdkErr) {
      // On any SDK or API error, serve demo video so UI remains functional
      return NextResponse.json({ mock: true, videoUrl: SAMPLE_VIDEO, model, note: "SDK/API error" });
    }
  } catch (err) {
    return NextResponse.json({ error: "?????? ??????? ???? ??? ??????" }, { status: 500 });
  }
}
