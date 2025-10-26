import { describe, expect, test, beforeEach } from "vitest";
import {
  loadPanelGroupState,
  savePanelGroupState,
  getPanelGroupKey,
} from "./serialization";
import { PanelData } from "../Panel";

class MockStorage {
  private data: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }
}

describe("serialization", () => {
  let storage: MockStorage;

  beforeEach(() => {
    storage = new MockStorage();
  });

  describe("getPanelGroupKey", () => {
    test("should generate correct storage key with default prefix", () => {
      expect(getPanelGroupKey("my-group")).toBe(
        "react-resizable-panels:my-group"
      );
    });

    test("should generate correct storage key with custom prefix", () => {
      expect(getPanelGroupKey("my-group", "custom-prefix")).toBe(
        "custom-prefix:my-group"
      );
    });
  });

  describe("savePanelGroupState and loadPanelGroupState", () => {
    const createPanelData = (
      id: string,
      idIsFromProps: boolean,
      order?: number,
      minSize?: number
    ): PanelData => ({
      callbacks: {},
      constraints: { minSize },
      id,
      idIsFromProps,
      order,
    });

    test("should save and load panel state with new format (with order)", () => {
      const panels: PanelData[] = [
        createPanelData("left", true, 1, 10),
        createPanelData("right", true, 2, 10),
      ];

      const sizes = [42.7459658713, 57.2540341287];
      const panelSizesBeforeCollapse = new Map<string, number>();

      savePanelGroupState(
        "test-group",
        panels,
        panelSizesBeforeCollapse,
        sizes,
        storage
      );

      const loaded = loadPanelGroupState("test-group", panels, storage);

      expect(loaded).not.toBeNull();
      if (loaded) {
        expect(loaded.layout).toEqual(sizes);
        expect(loaded.expandToSizes).toEqual({});
      }
    });

    test("should save and load panel state with expandToSizes", () => {
      const panels: PanelData[] = [
        createPanelData("panel1", true, 1, 10),
        createPanelData("panel2", true, 2, 10),
      ];

      const sizes = [50, 50];
      const panelSizesBeforeCollapse = new Map<string, number>([
        ["panel1", 60],
        ["panel2", 40],
      ]);

      savePanelGroupState(
        "test-group",
        panels,
        panelSizesBeforeCollapse,
        sizes,
        storage
      );

      const loaded = loadPanelGroupState("test-group", panels, storage);

      expect(loaded).not.toBeNull();
      if (loaded) {
        expect(loaded.layout).toEqual(sizes);
        expect(loaded.expandToSizes).toEqual({
          panel1: 60,
          panel2: 40,
        });
      }
    });

    test("should handle old format from localStorage (number array)", () => {
      const panels: PanelData[] = [
        createPanelData("p1", false, undefined, 10),
        createPanelData("p2", false, undefined, 10),
        createPanelData("p3", false, undefined, 10),
      ];

      // Simulate old format in localStorage
      const oldFormatData = {
        '{"minSize":10},{"minSize":10},{"minSize":10}': {
          expandToSizes: {},
          layout: [20.6563247098, 35.1228707735, 44.2208045167],
        },
      };

      const storageKey = getPanelGroupKey("test-group");
      storage.setItem(storageKey, JSON.stringify(oldFormatData));

      const loaded = loadPanelGroupState("test-group", panels, storage);

      expect(loaded).not.toBeNull();
      if (loaded) {
        expect(loaded.layout).toEqual([
          20.6563247098, 35.1228707735, 44.2208045167,
        ]);
        expect(loaded.expandToSizes).toEqual({});
      }
    });

    test("should handle new format from localStorage (with order)", () => {
      const panels: PanelData[] = [
        createPanelData("left", true, 1, 10),
        createPanelData("right", true, 2, 10),
      ];

      // Simulate new format in localStorage
      const newFormatData = {
        "left,right": {
          expandToSizes: {},
          layout: [
            { order: 1, size: 42.7459658713 },
            { order: 2, size: 57.2540341287 },
          ],
        },
      };

      const storageKey = getPanelGroupKey("test-group");
      storage.setItem(storageKey, JSON.stringify(newFormatData));

      const loaded = loadPanelGroupState("test-group", panels, storage);

      expect(loaded).not.toBeNull();
      if (loaded) {
        expect(loaded.layout).toEqual([42.7459658713, 57.2540341287]);
        expect(loaded.expandToSizes).toEqual({});
      }
    });

    test("should work with panels without order (backwards compatibility)", () => {
      const panels: PanelData[] = [
        createPanelData("panel1", true, undefined, 10),
        createPanelData("panel2", true, undefined, 10),
      ];

      const sizes = [30, 70];
      const panelSizesBeforeCollapse = new Map<string, number>();

      savePanelGroupState(
        "test-group",
        panels,
        panelSizesBeforeCollapse,
        sizes,
        storage
      );

      const loaded = loadPanelGroupState("test-group", panels, storage);

      expect(loaded).not.toBeNull();
      if (loaded) {
        expect(loaded.layout).toEqual(sizes);
      }
    });

    test("should handle mixed panels (some with order, some without)", () => {
      const panels: PanelData[] = [
        createPanelData("panel1", true, 1, 10),
        createPanelData("panel2", true, undefined, 10),
        createPanelData("panel3", true, 3, 10),
      ];

      const sizes = [25, 35, 40];
      const panelSizesBeforeCollapse = new Map<string, number>();

      savePanelGroupState(
        "test-group",
        panels,
        panelSizesBeforeCollapse,
        sizes,
        storage
      );

      const loaded = loadPanelGroupState("test-group", panels, storage);

      expect(loaded).not.toBeNull();
      if (loaded) {
        expect(loaded.layout).toEqual(sizes);
      }
    });

    test("should return null for non-existent autoSaveId", () => {
      const panels: PanelData[] = [createPanelData("panel1", true, 1, 10)];

      const loaded = loadPanelGroupState("non-existent", panels, storage);

      expect(loaded).toBeNull();
    });

    test("should return null for mismatched panel configuration", () => {
      const panels1: PanelData[] = [
        createPanelData("panel1", true, 1, 10),
        createPanelData("panel2", true, 2, 10),
      ];

      savePanelGroupState("test-group", panels1, new Map(), [50, 50], storage);

      // Different panel configuration
      const panels2: PanelData[] = [
        createPanelData("panel1", true, 1, 10),
        createPanelData("panel3", true, 2, 10), // Different panel
      ];

      const loaded = loadPanelGroupState("test-group", panels2, storage);

      expect(loaded).toBeNull();
    });

    test("should handle panel order changes correctly with new format", () => {
      const panels: PanelData[] = [
        createPanelData("left", true, 1, 10),
        createPanelData("middle", true, 2, 10),
        createPanelData("right", true, 3, 10),
      ];

      const sizes = [20, 30, 50];
      savePanelGroupState("test-group", panels, new Map(), sizes, storage);

      // Reorder panels
      const reorderedPanels: PanelData[] = [
        createPanelData("right", true, 3, 10),
        createPanelData("left", true, 1, 10),
        createPanelData("middle", true, 2, 10),
      ];

      const loaded = loadPanelGroupState(
        "test-group",
        reorderedPanels,
        storage
      );

      expect(loaded).not.toBeNull();
      if (loaded) {
        // Should map to the correct order based on order property
        expect(loaded.layout).toEqual([50, 20, 30]);
      }
    });

    test("should handle invalid JSON gracefully", () => {
      const storageKey = getPanelGroupKey("test-group");
      storage.setItem(storageKey, "invalid json{");

      const panels: PanelData[] = [createPanelData("panel1", true, 1, 10)];
      const loaded = loadPanelGroupState("test-group", panels, storage);

      expect(loaded).toBeNull();
    });

    test("should handle non-object JSON gracefully", () => {
      const storageKey = getPanelGroupKey("test-group");
      storage.setItem(storageKey, JSON.stringify("string value"));

      const panels: PanelData[] = [createPanelData("panel1", true, 1, 10)];
      const loaded = loadPanelGroupState("test-group", panels, storage);

      expect(loaded).toBeNull();
    });

    test("should preserve multiple panel group states", () => {
      const panels1: PanelData[] = [
        createPanelData("group1-panel1", true, 1, 10),
        createPanelData("group1-panel2", true, 2, 10),
      ];

      const panels2: PanelData[] = [
        createPanelData("group2-panel1", true, 1, 10),
        createPanelData("group2-panel2", true, 2, 10),
      ];

      savePanelGroupState("group1", panels1, new Map(), [30, 70], storage);
      savePanelGroupState("group2", panels2, new Map(), [60, 40], storage);

      const loaded1 = loadPanelGroupState("group1", panels1, storage);
      const loaded2 = loadPanelGroupState("group2", panels2, storage);

      expect(loaded1).not.toBeNull();
      if (loaded1) {
        expect(loaded1.layout).toEqual([30, 70]);
      }

      expect(loaded2).not.toBeNull();
      if (loaded2) {
        expect(loaded2.layout).toEqual([60, 40]);
      }
    });
  });
});
