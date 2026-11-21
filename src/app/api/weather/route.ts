import { respond, errMessage } from "@/lib/apiHelpers";
import { fetchWeather } from "@/lib/sources/openMeteo";
import type { SourceInfo, WeatherData } from "@/lib/types";

const source: SourceInfo = { name: "Open-Meteo (แบบจำลองสภาพอากาศ)", url: "https://open-meteo.com", kind: "model" };

export async function GET() {
  try {
    return respond<WeatherData>(source, { status: "ok", data: await fetchWeather() });
  } catch (e) {
    return respond<WeatherData>(source, { status: "error", message: errMessage(e) });
  }
}
