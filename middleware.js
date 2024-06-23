import { NextResponse } from 'next/server';
import jwtDecode from 'jwt-decode';
import moment from 'moment';
import { parseDateString } from '@/utils';
import Cors from 'cors';

// Initialize the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  origin: '*', // Allow all origins (you can restrict this to specific origins)
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
});

// Helper method to wait for a middleware to execute before continuing
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

const Middleware = async (req) => {
  try {
    // Run the CORS middleware
    await runMiddleware(req, res, cors);

    let NEXT_TOKEN = "ta_access_token";
    console.log("====", NEXT_TOKEN);
    const cookieData = req.cookies.get(NEXT_TOKEN);
    const pathName = req.nextUrl.pathname;
    console.log("--Pathname---", pathName);

    if (pathName === '/favicon.ico') {
      return NextResponse.next();
    }

    if (pathName.toLowerCase() === "/login") {
      console.log("==If===");
      if (cookieData?.value) {
        return NextResponse.redirect("https://calendar-integration-001.vercel.app");
      }
    }

    if (
      pathName.toLowerCase().includes("dashboardx") ||
      pathName.toLowerCase() == "/"
    ) {
      if (cookieData?.value) {
        const decoded = jwtDecode(cookieData?.value);
        let beginningTime = moment(Date.now()).format("DD-MM-YYYY hh:mm:ss");
        let endTime = moment.unix(decoded.exp).format("DD-MM-YYYY hh:mm:ss");
        let parsedBeginningTime = parseDateString(beginningTime);
        let parsedEndTime = parseDateString(endTime);
        if (decoded && parsedBeginningTime > parsedEndTime) {
          req.cookies.has(NEXT_TOKEN) && req.cookies.delete(NEXT_TOKEN);
          return NextResponse.redirect("https://calendar-integration-001.vercel.app/login");
        } else {
          return NextResponse.next();
        }
      } else {
        return NextResponse.redirect("https://calendar-integration-001.vercel.app/login");
      }
    }
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export default Middleware;
