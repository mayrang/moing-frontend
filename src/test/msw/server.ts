import { setupServer } from 'msw/node';
import {
  authHandlers,
  searchHandlers,
  tripHandlers,
  tripDetailHandlers,
  enrollmentHandlers,
  bookmarkHandlers,
  myTripHandlers,
  commentHandlers,
  communityHandlers,
  notificationHandlers,
  myPageHandlers,
  userProfileHandlers,
} from './handlers';

export const server = setupServer(
  ...authHandlers,
  ...searchHandlers,
  ...tripHandlers,
  ...tripDetailHandlers,
  ...enrollmentHandlers,
  ...bookmarkHandlers,
  ...myTripHandlers,
  ...commentHandlers,
  ...communityHandlers,
  ...notificationHandlers,
  ...myPageHandlers,
  ...userProfileHandlers,
);
