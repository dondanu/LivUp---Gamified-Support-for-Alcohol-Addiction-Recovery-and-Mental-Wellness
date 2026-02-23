const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { register, login, getProfile } = require('../../src/controllers/authController');
const { query, queryOne, transaction } = require('../../src/config/database');

// Mock dependencies
jest.mock('../../src/config/database');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      queryOne.mockResolvedValueOnce({ data: null }); // No existing user
      queryOne.mockResolvedValueOnce({ data: null }); // No existing email
      bcrypt.hash.mockResolvedValue('hashedPassword');
      transaction.mockResolvedValue({ data: 1, error: null });
      queryOne.mockResolvedValueOnce({
        data: { id: 1, username: 'testuser', email: 'test@example.com', is_anonymous: false },
      });
      jwt.sign.mockReturnValue('token123');

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User registered successfully',
          token: 'token123',
        })
      );
    });

    it('should return 400 if username or password is missing', async () => {
      req.body = { email: 'test@example.com' };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Username and password are required' });
    });

    it('should return 409 if username already exists', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        username: 'existinguser',
      };

      queryOne.mockResolvedValueOnce({ data: { id: 1 } }); // Existing user

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Username already exists' });
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      req.body = {
        username: 'testuser',
        password: 'password123',
      };

      queryOne.mockResolvedValueOnce({
        data: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          password_hash: 'hashedPassword',
          is_anonymous: false,
        },
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token123');

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Login successful',
          token: 'token123',
        })
      );
    });

    it('should return 400 if username or password is missing', async () => {
      req.body = { username: 'testuser' };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Username and password are required' });
    });

    it('should return 401 if credentials are invalid', async () => {
      req.body = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      queryOne.mockResolvedValueOnce({
        data: {
          id: 1,
          username: 'testuser',
          password_hash: 'hashedPassword',
        },
      });
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      req.user = { userId: 1 };

      queryOne.mockResolvedValueOnce({
        data: { id: 1, username: 'testuser', email: 'test@example.com', is_anonymous: false },
      });
      queryOne.mockResolvedValueOnce({
        data: { id: 1, user_id: 1, total_points: 100, current_streak: 5 },
      });

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.any(Object),
          profile: expect.any(Object),
        })
      );
    });

    it('should return 404 if user not found', async () => {
      req.user = { userId: 999 };

      queryOne.mockResolvedValueOnce({ data: null });

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });
});
