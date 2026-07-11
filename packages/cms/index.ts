import type { DesignTokens } from '@tokiforge/core';

/**
 * CMS integration interface
 */
export interface CMSAdapter {
  /**
   * Fetch tokens from CMS
   */
  fetchTokens(): Promise<DesignTokens>;
  
  /**
   * Push tokens to CMS
   */
  pushTokens(tokens: DesignTokens): Promise<void>;
  
  /**
   * Watch for token changes in CMS
   */
  watchTokens(callback: (tokens: DesignTokens) => void): () => void;
}

/**
 * Generic CMS adapter base class
 */
export abstract class BaseCMSAdapter implements CMSAdapter {
  abstract fetchTokens(): Promise<DesignTokens>;
  abstract pushTokens(tokens: DesignTokens): Promise<void>;
  
  watchTokens(callback: (tokens: DesignTokens) => void): () => void {
    let intervalId: NodeJS.Timeout | null = null;
    let lastTokens: DesignTokens | null = null;

    const checkForChanges = async () => {
      try {
        const currentTokens = await this.fetchTokens();
        if (JSON.stringify(currentTokens) !== JSON.stringify(lastTokens)) {
          lastTokens = currentTokens;
          callback(currentTokens);
        }
      } catch (error) {
        console.error('Error watching tokens:', error);
      }
    };

    this.fetchTokens().then(tokens => {
      lastTokens = tokens;
      callback(tokens);
    });

    intervalId = setInterval(checkForChanges, 30000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }
}

/**
 * Contentful CMS adapter
 */
export interface ContentfulConfig {
  spaceId: string;
  accessToken: string;
  cmaToken?: string;
  environment?: string;
  contentTypeId?: string; // Default: 'designTokens'
}

export class ContentfulAdapter extends BaseCMSAdapter {
  private config: ContentfulConfig;

  constructor(config: ContentfulConfig) {
    super();
    this.config = {
      contentTypeId: 'designTokens',
      environment: 'master',
      ...config,
    };
  }

  async fetchTokens(): Promise<DesignTokens> {
    const response = await fetch(
      `https://cdn.contentful.com/spaces/${this.config.spaceId}/environments/${this.config.environment}/entries?content_type=${this.config.contentTypeId}&access_token=${this.config.accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch tokens from Contentful: ${response.statusText}`);
    }

    const data = await response.json();
    
    const tokens: DesignTokens = {};
    
    for (const item of data.items) {
      if (item.fields && item.fields.tokens) {
        const entryTokens = typeof item.fields.tokens === 'string' 
          ? JSON.parse(item.fields.tokens)
          : item.fields.tokens;
        Object.assign(tokens, entryTokens);
      }
    }

    return tokens;
  }

  async pushTokens(tokens: DesignTokens): Promise<void> {
    const cmaToken = this.config.cmaToken;
    if (!cmaToken) {
      throw new Error('Contentful push requires cmaToken in config for Contentful Management API access.');
    }

    const baseUrl = `https://api.contentful.com/spaces/${this.config.spaceId}/environments/${this.config.environment}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/vnd.contentful.management.v1+json',
      'Authorization': `Bearer ${cmaToken}`,
    };

    const queryUrl = `${baseUrl}/entries?content_type=${this.config.contentTypeId}&access_token=${this.config.accessToken}`;
    const queryResponse = await fetch(queryUrl, { headers });

    if (!queryResponse.ok) {
      throw new Error(`Failed to query Contentful entries: ${queryResponse.statusText}`);
    }

    const queryData = await queryResponse.json();
    const body = JSON.stringify({
      fields: {
        name: { 'en-US': 'Design Tokens' },
        tokens: { 'en-US': JSON.stringify(tokens) },
      },
    });

    if (queryData.items && queryData.items.length > 0) {
      const entryId = queryData.items[0].sys.id;
      const response = await fetch(`${baseUrl}/entries/${entryId}`, {
        method: 'PUT',
        headers: {
          ...headers,
          'X-Contentful-Version': queryData.items[0].sys.version,
        },
        body,
      });

      if (!response.ok) {
        throw new Error(`Failed to update Contentful entry: ${response.statusText}`);
      }
    } else {
      const response = await fetch(`${baseUrl}/entries`, {
        method: 'POST',
        headers: {
          ...headers,
          'X-Contentful-Content-Type': this.config.contentTypeId!,
        },
        body,
      });

      if (!response.ok) {
        throw new Error(`Failed to create Contentful entry: ${response.statusText}`);
      }
    }
  }
}

/**
 * Strapi CMS adapter
 */
export interface StrapiConfig {
  apiUrl: string;
  apiToken?: string;
  contentType?: string; // Default: 'design-token'
}

export class StrapiAdapter extends BaseCMSAdapter {
  private config: StrapiConfig;

  constructor(config: StrapiConfig) {
    super();
    this.config = {
      contentType: 'design-token',
      ...config,
    };
  }

  async fetchTokens(): Promise<DesignTokens> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiToken) {
      headers['Authorization'] = `Bearer ${this.config.apiToken}`;
    }

    const response = await fetch(
      `${this.config.apiUrl}/api/${this.config.contentType}?populate=*`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch tokens from Strapi: ${response.statusText}`);
    }

    const data = await response.json();
    
    const tokens: DesignTokens = {};
    
    if (Array.isArray(data.data)) {
      for (const item of data.data) {
        if (item.attributes && item.attributes.tokens) {
          const entryTokens = typeof item.attributes.tokens === 'string'
            ? JSON.parse(item.attributes.tokens)
            : item.attributes.tokens;
          Object.assign(tokens, entryTokens);
        }
      }
    }

    return tokens;
  }

  async pushTokens(tokens: DesignTokens): Promise<void> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiToken) {
      headers['Authorization'] = `Bearer ${this.config.apiToken}`;
    }

    const response = await fetch(
      `${this.config.apiUrl}/api/${this.config.contentType}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          data: {
            tokens: JSON.stringify(tokens),
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to push tokens to Strapi: ${response.statusText}`);
    }
  }
}

/**
 * Sanity CMS adapter
 */
export interface SanityConfig {
  projectId: string;
  dataset: string;
  token?: string;
  apiVersion?: string; // Default: '2024-01-01'
}

export class SanityAdapter extends BaseCMSAdapter {
  private config: SanityConfig;

  constructor(config: SanityConfig) {
    super();
    this.config = {
      apiVersion: '2024-01-01',
      ...config,
    };
  }

  async fetchTokens(): Promise<DesignTokens> {
    const query = `*[_type == "designToken"]`;
    const url = `https://${this.config.projectId}.api.sanity.io/v${this.config.apiVersion}/data/query/${this.config.dataset}?query=${encodeURIComponent(query)}`;

    const headers: HeadersInit = {};
    if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch tokens from Sanity: ${response.statusText}`);
    }

    const data = await response.json();
    
    const tokens: DesignTokens = {};
    
    if (Array.isArray(data.result)) {
      for (const item of data.result) {
        if (item.tokens) {
          const entryTokens = typeof item.tokens === 'string'
            ? JSON.parse(item.tokens)
            : item.tokens;
          Object.assign(tokens, entryTokens);
        }
      }
    }

    return tokens;
  }

  async pushTokens(tokens: DesignTokens): Promise<void> {
    const url = `https://${this.config.projectId}.api.sanity.io/v${this.config.apiVersion}/data/mutate/${this.config.dataset}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }

    const query = `*[_type == "designToken"]{_id}`;
    const queryUrl = `https://${this.config.projectId}.api.sanity.io/v${this.config.apiVersion}/data/query/${this.config.dataset}?query=${encodeURIComponent(query)}`;
    const queryResponse = await fetch(queryUrl, { headers });

    if (!queryResponse.ok) {
      throw new Error(`Failed to query Sanity documents: ${queryResponse.statusText}`);
    }

    const queryData = await queryResponse.json();
    const mutations: any[] = [];

    if (queryData.result && queryData.result.length > 0) {
      for (const doc of queryData.result) {
        mutations.push({
          createOrReplace: {
            _id: doc._id,
            _type: 'designToken',
            tokens: JSON.stringify(tokens),
          },
        });
      }
    } else {
      mutations.push({
        create: {
          _type: 'designToken',
          tokens: JSON.stringify(tokens),
        },
      });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ mutations }),
    });

    if (!response.ok) {
      throw new Error(`Failed to push tokens to Sanity: ${response.statusText}`);
    }
  }
}

