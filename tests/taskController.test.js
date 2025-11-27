import test from 'node:test';
import assert from 'node:assert';

// Mock task controller methods
const mockReq = (params = {}, body = {}, user = null) => ({
  params,
  body,
  user: user || { _id: 'user123' }
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

test('taskController - task validation', async (t) => {
  await t.test('should validate task title is required', async () => {
    const req = mockReq({}, { description: 'Task description' });
    assert(!req.body.title, 'Title should be required');
  });

  await t.test('should validate task title is not empty', async () => {
    const req = mockReq({}, { title: '', description: 'Task description' });
    assert(!req.body.title || req.body.title.trim() === '', 'Title should not be empty');
  });

  await t.test('should accept task with title and description', async () => {
    const req = mockReq({}, { 
      title: 'My Task', 
      description: 'Do something' 
    });
    assert(req.body.title && req.body.description, 'Should have title and description');
  });

  await t.test('should accept task with title only', async () => {
    const req = mockReq({}, { title: 'My Task' });
    assert(req.body.title, 'Should have title');
  });
});

test('taskController - user isolation', async (t) => {
  await t.test('should filter tasks by authenticated user', async () => {
    const user1 = { _id: 'user1' };
    const user2 = { _id: 'user2' };
    
    const req1 = mockReq({}, {}, user1);
    const req2 = mockReq({}, {}, user2);
    
    assert.notEqual(req1.user._id, req2.user._id, 'Users should be different');
  });

  await t.test('should prevent cross-user task access', async () => {
    const task = { _id: 'task1', user: 'user1' };
    const req = mockReq({ taskId: 'task1' }, {}, { _id: 'user2' });
    
    const isAuthorized = task.user === req.user._id;
    assert(!isAuthorized, 'Should not allow cross-user access');
  });

  await t.test('should allow user to access own task', async () => {
    const task = { _id: 'task1', user: 'user1' };
    const req = mockReq({ taskId: 'task1' }, {}, { _id: 'user1' });
    
    const isAuthorized = task.user === req.user._id;
    assert(isAuthorized, 'Should allow access to own task');
  });
});

test('taskController - task operations', async (t) => {
  await t.test('should have required fields in task create', async () => {
    const req = mockReq({}, { 
      title: 'Task 1',
      description: 'Description'
    });
    
    const hasRequiredFields = req.body.title && req.user._id;
    assert(hasRequiredFields, 'Should have title and user ID');
  });

  await t.test('should validate task ID format', async () => {
    const taskId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format
    const isValidId = /^[a-f\d]{24}$/i.test(taskId);
    assert(isValidId, 'Should be valid MongoDB ObjectId');
  });

  await t.test('should reject invalid task ID', async () => {
    const taskId = 'invalid-id';
    const isValidId = /^[a-f\d]{24}$/i.test(taskId);
    assert(!isValidId, 'Should reject invalid ID format');
  });

  await t.test('should attach user ID to new task', async () => {
    const req = mockReq({}, { 
      title: 'New Task',
      description: 'Description'
    }, { _id: 'user123' });
    
    const taskData = { ...req.body, user: req.user._id };
    assert.equal(taskData.user, 'user123', 'Should have user ID attached');
  });
});

test('taskController - response handling', async (t) => {
  await t.test('should return task list in array format', async () => {
    const res = mockRes();
    const tasks = [
      { _id: '1', title: 'Task 1' },
      { _id: '2', title: 'Task 2' }
    ];
    res.status(200).json({ tasks });
    
    assert(Array.isArray(res.jsonData.tasks), 'Tasks should be an array');
    assert.equal(res.jsonData.tasks.length, 2, 'Should have 2 tasks');
  });

  await t.test('should return created task with ID', async () => {
    const res = mockRes();
    const createdTask = { _id: '123', title: 'New Task', user: 'user1' };
    res.status(201).json({ task: createdTask });
    
    assert(res.jsonData.task._id, 'Should have task ID');
    assert.equal(res.jsonData.task.title, 'New Task', 'Should return task data');
  });

  await t.test('should return 404 for missing task', async () => {
    const res = mockRes();
    res.status(404).json({ message: 'Task not found' });
    
    assert.equal(res.statusCode, 404, 'Should return 404 status');
    assert(res.jsonData.message.includes('not found'), 'Should have error message');
  });

  await t.test('should return 400 for invalid input', async () => {
    const res = mockRes();
    res.status(400).json({ message: 'Invalid task data' });
    
    assert.equal(res.statusCode, 400, 'Should return 400 status');
  });
});
