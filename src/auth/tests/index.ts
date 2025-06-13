import { Logger } from '@nestjs/common'

export * from './auth.test-utils'

// Test suite configuration
export const authTestConfig = {
  timeout: 30000,
  setupTimeout: 10000,
}

// Common test patterns and utilities
export const testPatterns = {
  validEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
}

// Test data generators
export const generateTestData = {
  email: (index = 0) => `test${index}@example.com`,
  password: () => 'TestPassword123!',
  name: (prefix = 'Test') => `${prefix}User${Date.now()}`,
  uuid: () => '123e4567-e89b-12d3-a456-426614174000',
}

// Test helper functions
export const testHelpers = {
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  expectToThrowAsync: async (fn: () => Promise<any>, expectedError?: any) => {
    try {
      await fn()
      throw new Error('Expected function to throw')
    } catch (error) {
      if (expectedError) {
        expect(error).toBeInstanceOf(expectedError)
      }
      return error
    }
  },

  mockConsoleLog: () => {
    const originalLog = Logger.log
    const mockedLog = jest.fn()
    Logger.log = mockedLog
    
    return {
      restore: () => { Logger.log = originalLog },
      calls: mockedLog.mock.calls,
    }
  },

  mockConsoleError: () => {
    const originalError = Logger.error
    const mockedError = jest.fn()
    Logger.error = mockedError
    
    return {
      restore: () => { Logger.error = originalError },
      calls: mockedError.mock.calls,
    }
  },
} 