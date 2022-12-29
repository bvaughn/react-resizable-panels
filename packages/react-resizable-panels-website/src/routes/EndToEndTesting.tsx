import { urlToUrlData, urlPanelGroupToPanelGroup } from "../utils/UrlData";

// Special route that can be configured via URL parameters.

export default function EndToEndTesting() {
  const url = new URL(typeof window !== undefined ? window.location.href : "");
  const urlData = urlToUrlData(url);

  return urlData ? urlPanelGroupToPanelGroup(urlData) : <></>;
}
