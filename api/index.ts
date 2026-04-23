import app from "../server/_core/index";

export default async function handler(req: any, res: any) {
  return app(req, res);
}
