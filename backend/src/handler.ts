import serverlessHttp from 'serverless-http';
import { createApp } from './app';

export const handler = serverlessHttp(createApp());
