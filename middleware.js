import { NextResponse } from 'next/server';
import {jwtDecode} from 'jwt-decode'; // Correct default import
import moment from 'moment';
import { parseDateString } from '@/utils';

const Middleware = (req) => {
  const NEXT_TOKEN = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
  const cookieData = req.cookies.get(NEXT_TOKEN);
  const pathName = req.nextUrl.pathname;

  console.log("Next_Token:", NEXT_TOKEN);
  console.log("cookieData:", cookieData);
  console.log("Path Name:", pathName);

  // Handle favicon request
  if (pathName === '/favicon.ico') {
    return NextResponse.next();
  }

  // Redirect to home if user is already logged in and trying to access login
  if (pathName.toLowerCase() === '/login') {
    if (cookieData) {
      return NextResponse.redirect('http://localhost:3000');
    }
  }

  // Protect dashboard and home route
  if (pathName.toLowerCase().includes('dashboardx') || pathName.toLowerCase() === '/') {
    if (cookieData) {
      try {
        const decoded = jwtDecode(cookieData);
        const currentTime = moment().unix();
        const tokenExpirationTime = decoded.exp;

        if (tokenExpirationTime < currentTime) {
          req.cookies.delete(NEXT_TOKEN);
          return NextResponse.redirect('http://localhost:3000/login');
        } else {
          return NextResponse.next();
        }
      } catch (error) {
        console.error('Token decoding error:', error);
        req.cookies.delete(NEXT_TOKEN);
        return NextResponse.redirect('http://localhost:3000/login');
      }
    } else {
      return NextResponse.redirect('http://localhost:3000/login');
    }
  }

  return NextResponse.next();
};

export default Middleware;
