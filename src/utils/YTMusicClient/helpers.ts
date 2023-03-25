import * as constants from "./constants";

export function initializeHeaders() {
  return {
    "user-agent": constants.USER_AGENT,
    accept: "*/*",
    "accept-encoding": "gzip, deflate",
    "content-type": "application/json",
    "content-encoding": "gzip",
    origin: constants.YTM_DOMAIN,
  } as const;
}

type requestFunc = (url: string, params?: Record<string, unknown>) => Promise<string>;
export async function getVisitorId(requestFunc: requestFunc) {
  const response = await requestFunc(constants.YTM_DOMAIN);
  console.log("response", response);
  const matches = response.match(/ytcfg\.set\s*\(\s*({.+?})\s*\)\s*;/g);
  // console.log("matches", matches);
  let visitorId = "";
  if (matches && matches.length > 0) {
    // console.log(matches[0]);
    const ytcfg = JSON.parse(matches[0]);
    visitorId = ytcfg?.VISITOR_DATA;
  }
  return { "X-Goog-Visitor-Id": visitorId } as const;
}

export function initializeContext() {
  return {
    context: {
      client: {
        clientName: "WEB_REMIX",
        // "YYYY-MM-DD".length = 10
        clientVersion: "1." + new Date().toISOString().slice(0, 10).replaceAll("-", "") + ".01.00",
      },
      user: {},
    },
  } as const;
}
