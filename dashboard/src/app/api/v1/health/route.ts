import { okJson } from "@/interface/http/http";

export async function GET() {
  return okJson({
    status: "ok",
    timestamp: new Date().toISOString()
  });
}

