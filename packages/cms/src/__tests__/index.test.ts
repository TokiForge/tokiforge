import { describe, it, expect, vi } from 'vitest';
import {
  ContentfulAdapter,
  StrapiAdapter,
  SanityAdapter,
  BaseCMSAdapter,
} from '../../index';
import type { DesignTokens } from '@tokiforge/core';

const mockTokens: DesignTokens = {
  color: {
    primary: { value: '#7C3AED', type: 'color' },
    background: { value: '#FFFFFF', type: 'color' },
  },
  spacing: {
    sm: { value: '8px', type: 'dimension' },
  },
};

describe('BaseCMSAdapter', () => {
  class TestAdapter extends BaseCMSAdapter {
    async fetchTokens(): Promise<DesignTokens> {
      return mockTokens;
    }
    async pushTokens(_tokens: DesignTokens): Promise<void> {
      // no-op
    }
  }

  it('should create instance with abstract methods', () => {
    const adapter = new TestAdapter();
    expect(adapter).toBeDefined();
    expect(typeof adapter.fetchTokens).toBe('function');
    expect(typeof adapter.pushTokens).toBe('function');
    expect(typeof adapter.watchTokens).toBe('function');
  });

  it('should watch tokens and call callback on change', async () => {
    const adapter = new TestAdapter();
    const callback = vi.fn();
    const unwatch = adapter.watchTokens(callback);

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(callback).toHaveBeenCalledWith(mockTokens);

    unwatch();
  });
});

describe('ContentfulAdapter', () => {
  const config = {
    spaceId: 'test-space',
    accessToken: 'test-token',
    cmaToken: 'test-cma-token',
  };

  it('should create instance with config', () => {
    const adapter = new ContentfulAdapter(config);
    expect(adapter).toBeDefined();
    expect(typeof adapter.fetchTokens).toBe('function');
    expect(typeof adapter.pushTokens).toBe('function');
  });

  it('should use default contentTypeId and environment', () => {
    const adapter = new ContentfulAdapter(config);
    expect((adapter as any).config.contentTypeId).toBe('designTokens');
    expect((adapter as any).config.environment).toBe('master');
  });

  it('should throw on pushTokens without cmaToken', async () => {
    const adapter = new ContentfulAdapter({ spaceId: 's', accessToken: 't' });
    await expect(adapter.pushTokens(mockTokens)).rejects.toThrow('cmaToken');
  });

  it('should fetch tokens from Contentful CDN API', async () => {
    const mockResponse = {
      items: [
        {
          fields: {
            tokens: JSON.stringify(mockTokens),
          },
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const adapter = new ContentfulAdapter({ spaceId: 's', accessToken: 't' });
    const result = await adapter.fetchTokens();
    expect(result).toEqual(mockTokens);
  });

  it('should push tokens via CMA - create new entry', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

    global.fetch = fetchMock;

    const adapter = new ContentfulAdapter({ spaceId: 's', accessToken: 't', cmaToken: 'cma' });
    await expect(adapter.pushTokens(mockTokens)).resolves.toBeUndefined();
  });

  it('should push tokens via CMA - update existing entry', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [{ sys: { id: 'e1', version: 1 } }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

    global.fetch = fetchMock;

    const adapter = new ContentfulAdapter({ spaceId: 's', accessToken: 't', cmaToken: 'cma' });
    await expect(adapter.pushTokens(mockTokens)).resolves.toBeUndefined();
  });
});

describe('StrapiAdapter', () => {
  const config = { apiUrl: 'https://example.com' };

  it('should create instance with config', () => {
    const adapter = new StrapiAdapter(config);
    expect(adapter).toBeDefined();
    expect(typeof adapter.fetchTokens).toBe('function');
    expect(typeof adapter.pushTokens).toBe('function');
  });

  it('should use default contentType', () => {
    const adapter = new StrapiAdapter(config);
    expect((adapter as any).config.contentType).toBe('design-token');
  });

  it('should fetch tokens from Strapi API', async () => {
    const mockData = {
      data: [
        {
          attributes: {
            tokens: JSON.stringify(mockTokens),
          },
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const adapter = new StrapiAdapter({ apiUrl: 'https://example.com' });
    const result = await adapter.fetchTokens();
    expect(result).toEqual(mockTokens);
  });

  it('should push tokens to Strapi API', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const adapter = new StrapiAdapter({ apiUrl: 'https://example.com' });
    await expect(adapter.pushTokens(mockTokens)).resolves.toBeUndefined();
  });

  it('should include auth header when apiToken is provided', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    const adapter = new StrapiAdapter({ apiUrl: 'https://example.com', apiToken: 'secret' });
    await adapter.fetchTokens();

    const callArgs = (global.fetch as any).mock.calls[0];
    expect(callArgs[1].headers['Authorization']).toBe('Bearer secret');
  });
});

describe('SanityAdapter', () => {
  const config = {
    projectId: 'test-project',
    dataset: 'production',
    token: 'test-token',
  };

  it('should create instance with config', () => {
    const adapter = new SanityAdapter(config);
    expect(adapter).toBeDefined();
    expect(typeof adapter.fetchTokens).toBe('function');
    expect(typeof adapter.pushTokens).toBe('function');
  });

  it('should use default apiVersion', () => {
    const adapter = new SanityAdapter({ projectId: 'p', dataset: 'd' });
    expect((adapter as any).config.apiVersion).toBe('2024-01-01');
  });

  it('should fetch tokens from Sanity API', async () => {
    const mockResponse = {
      result: [
        {
          tokens: JSON.stringify(mockTokens),
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const adapter = new SanityAdapter({ projectId: 'p', dataset: 'd', token: 't' });
    const result = await adapter.fetchTokens();
    expect(result).toEqual(mockTokens);
  });

  it('should push tokens via Sanity mutation API', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ result: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

    global.fetch = fetchMock;

    const adapter = new SanityAdapter({ projectId: 'p', dataset: 'd', token: 't' });
    await expect(adapter.pushTokens(mockTokens)).resolves.toBeUndefined();
  });

  it('should push tokens via Sanity mutation API - update existing', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ result: [{ _id: 'doc1' }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

    global.fetch = fetchMock;

    const adapter = new SanityAdapter({ projectId: 'p', dataset: 'd', token: 't' });
    await expect(adapter.pushTokens(mockTokens)).resolves.toBeUndefined();
  });
});