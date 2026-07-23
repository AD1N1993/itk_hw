import { Router } from 'express';
import { TESTING_ROUTES } from '../constants/testing.paths';
import { truncateDbHandler } from './handlers/truncate-db.handler';

export const testingRouter = Router({});

testingRouter.delete(TESTING_ROUTES.ALL_DATA, truncateDbHandler);
