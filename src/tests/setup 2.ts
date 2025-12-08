import { vi } from "vitest";

// Mock Supabase client
export const mockSupabaseClient = {
  storage: {
    from: vi.fn(() => ({
      getPublicUrl: vi.fn(),
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    textSearch: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
  })),
};

// Mock the supabaseClient module
vi.mock("$lib/supabaseClient", () => ({
  supabase: mockSupabaseClient,
}));
