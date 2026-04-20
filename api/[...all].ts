import app from "../server/_core/index";

export default async (req: any, res: any) => {
  try {
    return await app(req, res);
  } catch (error: any) {
    console.error("[Vercel Entry] Unhandled error:", error);
    res.status(500).send(`Internal Server Error: ${error.message || error}`);
  }
};