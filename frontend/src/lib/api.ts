const BASE = import.meta.env.VITE_API_URL || '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

function json(options: RequestInit, body: unknown): RequestInit {
  return {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: JSON.stringify(body)
  };
}

export const api = {
  events: {
    create: (data: { name: string; budget?: number }) =>
      request<{ event_id: string; share_token: string; admin_token: string }>(
        '/api/events',
        json({ method: 'POST' }, data)
      ),

    get: (shareToken: string) =>
      request<any>(`/api/events/${shareToken}`),

    join: (shareToken: string, data: {
      name: string;
      alias?: string;
      expenses?: { total_amount: number; items: { name: string; amount: number }[] }[];
      admin_token?: string;
      participant_token?: string;
    }) =>
      request<{ participant_id: string; participant_token: string }>(
        `/api/events/${shareToken}/join`,
        json({ method: 'POST' }, data)
      ),

    editParticipant: (shareToken: string, participantId: string, data: {
      admin_token: string;
      alias?: string;
      expenses?: { total_amount: number; items: { name: string; amount: number }[] }[];
    }) =>
      request<{ success: boolean }>(
        `/api/events/${shareToken}/participants/${participantId}`,
        json({ method: 'PUT' }, data)
      ),

    getAdminToken: (shareToken: string, participantToken: string) =>
      request<{ admin_token: string }>(
        `/api/events/${shareToken}/admin-token`,
        { headers: { 'x-participant-token': participantToken } }
      ),

    settle: (shareToken: string) =>
      request<{ status: string; debts: any[] }>(
        `/api/events/${shareToken}/settle`,
        { method: 'POST' }
      ),

    revert: (shareToken: string) =>
      request<{ status: string }>(
        `/api/events/${shareToken}/revert`,
        { method: 'POST' }
      )
  },

  debts: {
    pay: (debtId: string) =>
      request<any>(`/api/debts/${debtId}/pay`, { method: 'POST' }),

    confirm: (debtId: string) =>
      request<any>(`/api/debts/${debtId}/confirm`, { method: 'POST' })
  },

  items: {
    toggle: (itemId: string, participantId: string) =>
      request<{ success: boolean; isConsuming: boolean }>(
        `/api/items/${itemId}/toggle`,
        json({ method: 'POST' }, { participant_id: participantId })
      )
  },

  chat: {
    send: (message: string, history: { role: 'user' | 'model'; text: string }[]) =>
      request<{ response: string }>(
        '/api/chat',
        json({ method: 'POST' }, { message, history })
      )
  }
};
