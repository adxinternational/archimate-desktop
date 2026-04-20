import app from "../server/_core/index";

export default async (req: any, res: any) => {
  // 🔴 CORRECTION : enlever /api du path
  req.url = req.url.replace(/^\/api/, "") || "/";

  return app(req, res);
};
