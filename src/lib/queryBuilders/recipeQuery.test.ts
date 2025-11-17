/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildRecipeQuery, transformRecipeResults } from "./recipeQuery";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("transformRecipeResults", () => {
  it("should transform results to include profileAvatar field", () => {
    const rawData = [
      {
        id: "1",
        recipename: "Test Recipe",
        profiles: {
          id: "user-1",
          username: "testuser",
          avatar_url: "https://example.com/avatar.jpg",
        },
      },
      {
        id: "2",
        recipename: "Another Recipe",
        profiles: {
          id: "user-2",
          username: "anotheruser",
          avatar_url: null,
        },
      },
    ];

    const result = transformRecipeResults(rawData);

    expect(result).toHaveLength(2);
    expect(result[0].profileAvatar).toBe("https://example.com/avatar.jpg");
    expect(result[1].profileAvatar).toBeNull();
  });

  it("should handle missing profiles data", () => {
    const rawData = [
      {
        id: "1",
        recipename: "Test Recipe",
      },
    ];

    const result = transformRecipeResults(rawData);

    expect(result[0].profileAvatar).toBeNull();
  });
});

describe("buildRecipeQuery", () => {
  let mockQuery: any;
  let mockSupabase: any;

  beforeEach(() => {
    mockQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      textSearch: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
    };

    mockSupabase = {
      from: vi.fn(() => mockQuery),
    } as unknown as SupabaseClient;

    vi.clearAllMocks();
  });

  it("should build a basic query with default options", () => {
    buildRecipeQuery(mockSupabase, {});

    expect(mockSupabase.from).toHaveBeenCalledWith("recipes");
    expect(mockQuery.select).toHaveBeenCalledWith(
      expect.stringContaining("id"),
      { count: "exact" },
    );
    expect(mockQuery.order).toHaveBeenCalledWith("recipename", {
      ascending: true,
    });
    expect(mockQuery.range).toHaveBeenCalledWith(0, 11);
  });

  it("should apply cuisine filter when provided", () => {
    buildRecipeQuery(mockSupabase, {
      cuisines: ["Italian", "Mexican"],
    });

    expect(mockQuery.in).toHaveBeenCalledWith("cuisine", [
      "Italian",
      "Mexican",
    ]);
  });

  it("should not apply cuisine filter when empty array", () => {
    buildRecipeQuery(mockSupabase, {
      cuisines: [],
    });

    expect(mockQuery.in).not.toHaveBeenCalled();
  });

  it("should apply text search with prefix matching", () => {
    buildRecipeQuery(mockSupabase, {
      searchText: "pasta carbonara",
    });

    expect(mockQuery.textSearch).toHaveBeenCalledWith(
      "search_tsv",
      "pasta:* & carbonara:*",
    );
  });

  it("should handle search text with special characters", () => {
    buildRecipeQuery(mockSupabase, {
      searchText: "pasta & carbonara!",
    });

    // Should extract only alphanumeric tokens
    expect(mockQuery.textSearch).toHaveBeenCalledWith(
      "search_tsv",
      "pasta:* & carbonara:*",
    );
  });

  it("should not apply text search for empty string", () => {
    buildRecipeQuery(mockSupabase, {
      searchText: "   ",
    });

    expect(mockQuery.textSearch).not.toHaveBeenCalled();
  });

  it("should sort by name in ascending order", () => {
    buildRecipeQuery(mockSupabase, {
      sortBy: "name",
      sortDir: "asc",
    });

    expect(mockQuery.order).toHaveBeenCalledWith("recipename", {
      ascending: true,
    });
  });

  it("should sort by name in descending order", () => {
    buildRecipeQuery(mockSupabase, {
      sortBy: "name",
      sortDir: "desc",
    });

    expect(mockQuery.order).toHaveBeenCalledWith("recipename", {
      ascending: false,
    });
  });

  it("should sort by cooking time in ascending order", () => {
    buildRecipeQuery(mockSupabase, {
      sortBy: "time",
      sortDir: "asc",
    });

    expect(mockQuery.order).toHaveBeenCalledWith("cookingtime", {
      ascending: true,
      nullsFirst: false,
    });
  });

  it("should sort by cooking time in descending order", () => {
    buildRecipeQuery(mockSupabase, {
      sortBy: "time",
      sortDir: "desc",
    });

    expect(mockQuery.order).toHaveBeenCalledWith("cookingtime", {
      ascending: false,
      nullsFirst: false,
    });
  });

  it("should apply pagination correctly for page 1", () => {
    buildRecipeQuery(mockSupabase, {
      page: 1,
      pageSize: 12,
    });

    expect(mockQuery.range).toHaveBeenCalledWith(0, 11);
  });

  it("should apply pagination correctly for page 2", () => {
    buildRecipeQuery(mockSupabase, {
      page: 2,
      pageSize: 12,
    });

    expect(mockQuery.range).toHaveBeenCalledWith(12, 23);
  });

  it("should apply pagination with custom page size", () => {
    buildRecipeQuery(mockSupabase, {
      page: 3,
      pageSize: 20,
    });

    expect(mockQuery.range).toHaveBeenCalledWith(40, 59);
  });

  it("should apply all filters together", () => {
    buildRecipeQuery(mockSupabase, {
      cuisines: ["Italian"],
      searchText: "pasta",
      sortBy: "time",
      sortDir: "desc",
      page: 2,
      pageSize: 10,
    });

    expect(mockQuery.in).toHaveBeenCalledWith("cuisine", ["Italian"]);
    expect(mockQuery.textSearch).toHaveBeenCalledWith("search_tsv", "pasta:*");
    expect(mockQuery.order).toHaveBeenCalledWith("cookingtime", {
      ascending: false,
      nullsFirst: false,
    });
    expect(mockQuery.range).toHaveBeenCalledWith(10, 19);
  });
});
