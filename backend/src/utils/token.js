import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

export const signAuthToken = ({ id, role }) =>
  jwt.sign(
    {
      id,
      role
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  );
