// write test suite for app.ts
import request from 'supertest';
import app from '../server.ts';
import env from '../../env.ts';
import { it, describe, expect } from 'vitest';

describe('App Server', () => {
  it('should start the server and respond to a GET request', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.data.message).toBe('Server is healthy'); // Adjust based on your actual response
  });

  it('should run on the correct port', () => {
    expect(env.PORT).toBeDefined();
    expect(typeof env.PORT).toBe('number');
  });
});
