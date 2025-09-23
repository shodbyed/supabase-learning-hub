// public routes
import { Home } from '../home/Home';
import { Login } from '../login/Login';

// private routes
import { SignUp } from '../newPlayers/SignUp';
import { WelcomePage } from '../newPlayers/WelcomePage';
import { Profile } from '../profile/Profile';

// admin routes
import { Seasons } from '../seasons/Seasons';
import { Teams } from '../teams/Teams';
import { Scheduler } from '../schedule/Scheduler';
// import { MatchUps } from '../matchUps/MatchUps';
import { Players } from '../players/Players';

// protection

//types
import { ElementType } from 'react';
import Test from '../test/Test';
import { Register } from '../login/Register';
import { ForgotPassword } from '../login/ForgotPassword';
import { VerifyEmail } from '../login/VerifyEmail';

type Route = {
  name: string;
  path: string;
  link?: boolean;
  protect?: boolean;
  Component: ElementType;
};
const protect = { protect: true };

export const publicRoutes: Route[] = [
  { name: 'Log In', path: '/login', Component: Login },
  { name: 'Register', path: '/register', Component: Register },
  {
    name: 'Forgot Password',
    path: '/forgot-password',
    Component: ForgotPassword,
  },
  { name: 'Verify Email', path: '/verify-email', Component: VerifyEmail },

  { name: 'Test', path: '/test', Component: Test },
];

export const privateRoutes: Route[] = [
  { name: 'Home', path: '/', Component: Home, link: true },
  { name: 'Sign Up', path: '/signUp', Component: SignUp, ...protect },
  {
    name: 'Welcome',
    path: '/welcome',
    Component: WelcomePage,
    link: true,
    ...protect,
  },
  {
    name: 'Profile',
    path: '/profile',
    Component: Profile,
    link: true,
    ...protect,
  },
];

export const adminRoutes: Route[] = [
  {
    name: 'Seasons',
    path: '/seasons',
    Component: Seasons,
    link: true,
    ...protect,
  },
  { name: 'Teams', path: '/teams', Component: Teams, link: true, ...protect },
  {
    name: 'Schedule',
    path: '/schedule',
    Component: Scheduler,
    link: true,
    ...protect,
  },
  /*
  {
    name: 'Match Ups',
    path: '/MatchUps',
    Component: MatchUps,
    link: true,
    ...protect,
  },
   */
  {
    name: 'Players',
    path: '/Players',
    Component: Players,
    link: true,
    ...protect,
  },
];
