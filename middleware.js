import { NextResponse } from "next/server";
import {jwtDecode} from "jwt-decode";
import moment from "moment";
import { parseDateString } from "@/utils";

// CORS headers configuration
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const Middleware = async (req) => {
  const { pathname } = req.nextUrl;

  // Set CORS headers for all requests
  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  let NEXT_TOKEN = "ta_access_token";
  const cookieData = req.cookies.get(NEXT_TOKEN);

  if (pathname === '/favicon.ico') {
    return response;
  }

  if (pathname.toLowerCase() === "/login") {
    if (cookieData?.value) {
      return NextResponse.redirect("https://calendar-integration-001.vercel.app");
    }
  }

  if (pathname.toLowerCase().includes("dashboardx") || pathname.toLowerCase() == "/") {
    if (cookieData?.value) {
      const decoded = jwtDecode(cookieData?.value);
      let beginningTime = moment(Date.now()).format("DD-MM-YYYY hh:mm:ss");
      let endTime = moment.unix(decoded.exp).format("DD-MM-YYYY hh:mm:ss");
      let parsedBeginningTime = parseDateString(beginningTime);
      let parsedEndTime = parseDateString(endTime);

      if (decoded && parsedBeginningTime > parsedEndTime) {
        req.cookies.delete(NEXT_TOKEN);
        return NextResponse.redirect("https://calendar-integration-001.vercel.app/login");
      } else {
        return response;
      }
    } else {
      return NextResponse.redirect("https://calendar-integration-001.vercel.app/login");
    }
  }

  return response;
};

export default Middleware;
