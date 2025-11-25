import { Request, Response, NextFunction } from 'express';
import { beforeEach, expect } from 'vitest';
import { describe, it, vi } from 'vitest';
import * as jwt from '../../utils/jwt';
import { authenticateToken } from '../auth';

describe('Auth Module', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });
  // Placeholder for future authentication tests
  it('Should return 403  when jwt token verification fails', async () => {
    mockRequest.headers = {
      authorization: 'Bearer invalidtoken',
    };
    // Here you would call the authenticateToken middleware and assert the Response
    vi.spyOn(jwt, 'verifyToken').mockRejectedValue(new Error('Invalid token'));
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await authenticateToken(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: null,
      message: 'Forbidden',
    });
    expect(mockNext).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
