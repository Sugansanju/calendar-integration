import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import { parseDateString } from "@/utils";

const Middleware = (req) => {
  let NEXT_TOKEN = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
  console.log("====",NEXT_TOKEN)
  const cookieData = req.cookies.get(NEXT_TOKEN);
  const pathName = req.nextUrl.pathname;
  if (pathName === '/favicon.ico') {
    return NextResponse.next();
  }

  if (pathName.toLowerCase() === "/login") {
    if (cookieData?.value) {
      return NextResponse.redirect("http://localhost:3000");
    }
  }

  // if (
  //   pathName.toLowerCase().includes("dashboardx") ||
  //   pathName.toLowerCase() == "/"
  // ) {
  //   if (cookieData?.value) {
  //     const decoded = jwtDecode(cookieData?.value);
  //     let beginningTime = moment(Date.now()).format("DD-MM-YYYY hh:mm:ss");
  //     let endTime = moment.unix(decoded.exp).format("DD-MM-YYYY hh:mm:ss");
  //     let parsedBeginningTime = parseDateString(beginningTime);
  //     let parsedEndTime = parseDateString(endTime);
  //     if (decoded && parsedBeginningTime > parsedEndTime) {
  //       req.cookies.has(NEXT_TOKEN) && req.cookies.delete(NEXT_TOKEN);
  //       return NextResponse.redirect("http://localhost:3000" + "/login");
  //     } else {
  //       return NextResponse.next();
  //     }
  //   } else {
  //     return NextResponse.redirect("http://localhost:3000" + "/login");
  //   }
  // }
  return NextResponse.next();
};

export default Middleware;
