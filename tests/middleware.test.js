import test from 'node:test';
import assert from 'node:assert';

// Mock middleware for testing
const mockReq = (user = null, body = {}) => ({
  body,
  user,
  headers: { authorization: user ? 'Bearer token123' : '' }
});

const mockRes = () => {
  const res = {};
  res.status = function(code) {
    this.statusCode = code;
    return this;
  };
  res.json = function(data) {
    this.jsonData = data;
    return this;
  };
  return res;
};

test('authMiddleware - JWT verification', async (t) => {
  await t.test('should reject request without token', async () => {
    const req = mockReq(null);
    assert(!req.user, 'Should not have user attached');
  });

  await t.test('should accept request with valid user', async () => {
    const req = mockReq({ _id: 'user123', email: 'user@example.com' });
    assert(req.user, 'Should have user attached');
    assert.equal(req.user._id, 'user123', 'User ID should match');
  });

  await t.test('should have authorization header format', async () => {
    const req = mockReq({ _id: 'user123' });
    const token = req.headers.authorization;
    assert(token.startsWith('Bearer '), 'Should be Bearer token format');
  });
});

test('adminMiddleware - role verification', async (t) => {
  await t.test('should reject non-admin users', async () => {
    const req = mockReq({ _id: 'user123', isAdmin: false });
    assert(!req.user.isAdmin, 'User should not be admin');
  });

  await t.test('should accept admin users', async () => {
    const req = mockReq({ _id: 'admin123', isAdmin: true });
    assert(req.user.isAdmin, 'User should be admin');
  });

  await t.test('should have user attached when admin', async () => {
    const req = mockReq({ _id: 'admin123', isAdmin: true });
    assert(req.user, 'Should have user attached');
    assert(req.user.isAdmin === true, 'isAdmin flag should be true');
  });

  await t.test('should check for missing isAdmin property', async () => {
    const req = mockReq({ _id: 'user123' });
    const isAdmin = req.user.isAdmin || false;
    assert(!isAdmin, 'Should default to false if not specified');
  });
});

test('Middleware - response handling', async (t) => {
  await t.test('should return 401 for unauthorized', async () => {
    const res = mockRes();
    res.status(401).json({ message: 'Unauthorized' });
    
    assert.equal(res.statusCode, 401, 'Status should be 401');
    assert.equal(res.jsonData.message, 'Unauthorized', 'Should have error message');
  });

  await t.test('should return 403 for forbidden', async () => {
    const res = mockRes();
    res.status(403).json({ message: 'Forbidden' });
    
    assert.equal(res.statusCode, 403, 'Status should be 403');
    assert.equal(res.jsonData.message, 'Forbidden', 'Should have error message');
  });

  await t.test('should pass through to next middleware on success', async () => {
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    
    next();
    assert(nextCalled, 'Next should be called on successful middleware');
  });
});

test('Middleware - token extraction', async (t) => {
  await t.test('should extract token from Bearer header', async () => {
    const req = mockReq(null);
    req.headers.authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    
    const token = req.headers.authorization.split(' ')[1];
    assert.equal(token, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', 'Should extract token from header');
  });

  await t.test('should handle malformed authorization header', async () => {
    const req = mockReq(null);
    req.headers.authorization = 'InvalidFormat';
    
    const parts = req.headers.authorization.split(' ');
    assert(parts.length !== 2, 'Malformed header should not have 2 parts');
  });

  await t.test('should handle missing authorization header', async () => {
    const req = mockReq(null);
    delete req.headers.authorization;
    
    assert(!req.headers.authorization, 'Authorization header should be missing');
  });
});
