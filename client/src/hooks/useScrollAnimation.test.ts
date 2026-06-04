import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollAnimation } from "./useScrollAnimation";

describe("useScrollAnimation", () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  it("should return a ref object", () => {
    const { result } = renderHook(() => useScrollAnimation());
    
    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty("current");
  });

  it("should create IntersectionObserver with default options", () => {
    renderHook(() => useScrollAnimation());
    
    expect(global.IntersectionObserver).toHaveBeenCalled();
    const calls = (global.IntersectionObserver as any).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
  });

  it("should accept custom threshold option", () => {
    renderHook(() => useScrollAnimation({ threshold: 0.5 }));
    
    expect(global.IntersectionObserver).toHaveBeenCalled();
  });

  it("should accept custom rootMargin option", () => {
    renderHook(() => useScrollAnimation({ rootMargin: "0px 0px -50px 0px" }));
    
    expect(global.IntersectionObserver).toHaveBeenCalled();
  });

  it("should cleanup observer on unmount", () => {
    const mockUnobserve = vi.fn();
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: mockUnobserve,
      disconnect: vi.fn(),
    }));

    const { unmount } = renderHook(() => useScrollAnimation());
    
    unmount();
    
    // Cleanup should be called
    expect(mockUnobserve).toHaveBeenCalled();
  });
});
