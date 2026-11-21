import { respond, errMessage, pointFromUrl } from "@/lib/apiHelpers";
import { fetchWeather } from "@/lib/sources/openMeteo";
import type { SourceInfo, WeatherData } from "@/lib/types";

const source: SourceInfo = { name: "Open-Meteo (แบบจำลองสภาพอากาศ)", url: "https://open-meteo.com", kind: "model" };

export async function GET(request: Request) {
  const { lat, lon } = pointFromUrl(request.url);
  try {
    return respond<WeatherData>(source, { status: "ok", data: await fetchWeather(lat, lon) });
  } catch (e) {
    return respond<WeatherData>(source, { status: "error", message: errMessage(e) });
  }
}
