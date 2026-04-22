import { describe, it, expect, vi } from 'vitest';
import { exportToCSV } from './exportUtils';

describe('exportUtils', () => {
  describe('exportToCSV', () => {
    it('should generate a CSV string from data', () => {
      const data = [
        { id: 1, name: 'Project A', status: 'active' },
        { id: 2, name: 'Project B', status: 'completed' },
      ];
      const filename = 'test.csv';

      // Mock URL.createObjectURL and document methods
      const createObjectURLMock = vi.fn(() => 'blob:url');
      const revokeObjectURLMock = vi.fn();
      global.URL.createObjectURL = createObjectURLMock;
      global.URL.revokeObjectURL = revokeObjectURLMock;

      const appendChildMock = vi.fn();
      const removeChildMock = vi.fn();
      const clickMock = vi.fn();
      
      const anchorMock = {
        setAttribute: vi.fn(),
        style: { display: '' },
        click: clickMock,
      } as any;

      global.document.createElement = vi.fn(() => anchorMock);
      global.document.body.appendChild = appendChildMock;
      global.document.body.removeChild = removeChildMock;

      exportToCSV(data, filename);

      expect(createObjectURLMock).toHaveBeenCalled();
      expect(anchorMock.setAttribute).toHaveBeenCalledWith('download', filename);
      expect(clickMock).toHaveBeenCalled();
    });
  });
});
