beforeEach(() => {
  vi.resetModules();
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function importApi() {
  return import('./api');
}

describe('apiFetch', () => {
  it('fetches from correct URL with path', async () => {
    const { apiFetch } = await importApi();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: '123' } }),
    });

    const result = await apiFetch('/cases/123');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/cases/123',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })
    );
    expect(result).toEqual({ id: '123' });
  });

  it('uses NEXT_PUBLIC_API_URL when set', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.com');
    const { apiFetch } = await importApi();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: '123' } }),
    });

    await apiFetch('/cases/123');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/cases/123',
      expect.anything()
    );
    vi.unstubAllEnvs();
  });

  it('passes custom headers', async () => {
    const { apiFetch } = await importApi();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    });

    await apiFetch('/cases', { headers: { Authorization: 'Bearer token' } });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        },
      })
    );
  });

  it('returns null for non-ok response', async () => {
    const { apiFetch } = await importApi();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });

    const result = await apiFetch('/cases/123');
    expect(result).toBeNull();
  });

  it('returns null on fetch error', async () => {
    const { apiFetch } = await importApi();
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    const result = await apiFetch('/cases/123');
    expect(result).toBeNull();
  });
});

describe('apiPost', () => {
  it('sends POST request with JSON body', async () => {
    const { apiPost } = await importApi();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: '456' } }),
    });

    const result = await apiPost('/cases', { name: 'Test', value: 42 });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/cases',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Test', value: 42 }),
      })
    );
    expect(result).toEqual({ id: '456' });
  });
});

describe('apiPatch', () => {
  it('sends PATCH request with JSON body', async () => {
    const { apiPatch } = await importApi();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { version: 'v2.0' } }),
    });

    const result = await apiPatch('/settings', { version: 'v2.0' });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/settings',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ version: 'v2.0' }),
      })
    );
    expect(result).toEqual({ version: 'v2.0' });
  });
});

describe('apiFetchAll', () => {
  it('returns array from successful response', async () => {
    const { apiFetchAll } = await importApi();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{ id: '1' }, { id: '2' }] }),
    });

    const result = await apiFetchAll('/cases');
    expect(result).toEqual([{ id: '1' }, { id: '2' }]);
  });

  it('returns empty array for non-ok response', async () => {
    const { apiFetchAll } = await importApi();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });

    const result = await apiFetchAll('/cases');
    expect(result).toEqual([]);
  });

  it('returns empty array on fetch error', async () => {
    const { apiFetchAll } = await importApi();
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    const result = await apiFetchAll('/cases');
    expect(result).toEqual([]);
  });

  it('returns empty array when data is null', async () => {
    const { apiFetchAll } = await importApi();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: null }),
    });

    const result = await apiFetchAll('/cases');
    expect(result).toEqual([]);
  });
});
