import express from 'express';
import { register } from '../controllers/register.js';
import { loginUser } from '../controllers/login.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', register);

export default router;
