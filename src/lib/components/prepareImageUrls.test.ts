/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { prepareImageUrls } from "./prepareImageUrls";
import { supabase } from "$lib/supabaseClient";

describe("prepareImageUrls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null for null or undefined path", async () => {
    expect(await prepareImageUrls(null, "avatars")).toBeNull();
    expect(await prepareImageUrls(undefined, "avatars")).toBeNull();
  });

  it("should return the path if it is already an absolute URL", async () => {
    const httpUrl = "http://example.com/image.jpg";
    const httpsUrl = "https://example.com/image.jpg";

    expect(await prepareImageUrls(httpUrl, "avatars")).toBe(httpUrl);
    expect(await prepareImageUrls(httpsUrl, "avatars")).toBe(httpsUrl);
  });

  it("should normalize path and fetch public URL from Supabase", async () => {
    const mockPublicUrl =
      "https://supabase.co/storage/v1/object/public/avatars/test.jpg";
    const mockGetPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: mockPublicUrl },
    });

    vi.mocked(supabase.storage.from).mockReturnValue({
      getPublicUrl: mockGetPublicUrl,
    } as any);

    const result = await prepareImageUrls("avatars/test.jpg", "avatars");

    expect(supabase.storage.from).toHaveBeenCalledWith("avatars");
    expect(mockGetPublicUrl).toHaveBeenCalledWith("test.jpg");
    expect(result).toBe(mockPublicUrl);
  });

  it("should remove leading slash from path", async () => {
    const mockGetPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: "https://example.com/test.jpg" },
    });

    vi.mocked(supabase.storage.from).mockReturnValue({
      getPublicUrl: mockGetPublicUrl,
    } as any);

    await prepareImageUrls("/test.jpg", "avatars");

    expect(mockGetPublicUrl).toHaveBeenCalledWith("test.jpg");
  });

  it("should remove public/ prefix from path", async () => {
    const mockGetPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: "https://example.com/test.jpg" },
    });

    vi.mocked(supabase.storage.from).mockReturnValue({
      getPublicUrl: mockGetPublicUrl,
    } as any);

    await prepareImageUrls("public/test.jpg", "avatars");

    expect(mockGetPublicUrl).toHaveBeenCalledWith("test.jpg");
  });

  it("should remove bucket prefix from path", async () => {
    const mockGetPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: "https://example.com/test.jpg" },
    });

    vi.mocked(supabase.storage.from).mockReturnValue({
      getPublicUrl: mockGetPublicUrl,
    } as any);

    await prepareImageUrls("recipes/test.jpg", "recipes");

    expect(mockGetPublicUrl).toHaveBeenCalledWith("test.jpg");
  });

  it("should return null if getPublicUrl fails", async () => {
    const mockGetPublicUrl = vi.fn().mockImplementation(() => {
      throw new Error("Storage error");
    });

    vi.mocked(supabase.storage.from).mockReturnValue({
      getPublicUrl: mockGetPublicUrl,
    } as any);

    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const result = await prepareImageUrls("test.jpg", "avatars");

    expect(result).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it("should return null if publicUrl is not available in response", async () => {
    const mockGetPublicUrl = vi.fn().mockReturnValue({
      data: null,
    });

    vi.mocked(supabase.storage.from).mockReturnValue({
      getPublicUrl: mockGetPublicUrl,
    } as any);

    const result = await prepareImageUrls("test.jpg", "avatars");

    expect(result).toBeNull();
  });
});
