import { PropertyFormData, Property } from "@/components/properties/types";

export interface StoredPropertyDraft {
  draftId: string; // "new" or property._id
  propertyId: string | null;
  editingProperty: Property | null;
  formData: PropertyFormData;
  formActiveTab: string;
  name: string;
  timestamp: number;
  lastSavedAt: string;
}

const DRAFT_PREFIX = "oms_property_draft_";
const LATEST_DRAFT_KEY = "oms_property_latest_draft_id";

/**
 * Checks if the current form data has meaningful content worth saving as a draft.
 */
export const isFormDirtyOrHasContent = (
  formData: PropertyFormData,
  initialData?: PropertyFormData | null
): boolean => {
  if (!formData) return false;

  // If comparing against initial data when editing
  if (initialData) {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }

  // If creating new property, check if any meaningful field is filled
  return Boolean(
    formData.name?.trim() ||
    formData.type?.trim() ||
    formData.price?.toString().trim() ||
    formData.description?.trim() ||
    formData.address?.trim() ||
    formData.area?.trim() ||
    formData.city?.trim() ||
    formData.area_size?.toString().trim() ||
    (Array.isArray(formData.image_url) && formData.image_url.length > 0) ||
    (Array.isArray(formData.amenities_data) && formData.amenities_data.length > 0) ||
    (Array.isArray(formData.nearby_places) && formData.nearby_places.length > 0) ||
    formData.map_url?.trim() ||
    formData.media_url?.trim()
  );
};

/**
 * Saves draft to localStorage.
 */
export const saveLocalDraft = (
  draftId: string,
  data: {
    propertyId: string | null;
    editingProperty: Property | null;
    formData: PropertyFormData;
    formActiveTab: string;
    name?: string;
  }
): StoredPropertyDraft | null => {
  try {
    const key = `${DRAFT_PREFIX}${draftId || "new"}`;
    const name =
      data.name?.trim() ||
      data.formData?.name?.trim() ||
      data.editingProperty?.name ||
      "Untitled Draft";

    const draft: StoredPropertyDraft = {
      draftId: draftId || "new",
      propertyId: data.propertyId || null,
      editingProperty: data.editingProperty || null,
      formData: data.formData,
      formActiveTab: data.formActiveTab || "basic",
      name,
      timestamp: Date.now(),
      lastSavedAt: new Date().toISOString(),
    };

    localStorage.setItem(key, JSON.stringify(draft));
    localStorage.setItem(LATEST_DRAFT_KEY, draft.draftId);
    return draft;
  } catch (error) {
    console.error("Failed to save local property draft to localStorage:", error);
    return null;
  }
};

/**
 * Loads a specific local draft by its draftId.
 */
export const getLocalDraft = (
  draftId: string
): StoredPropertyDraft | null => {
  try {
    const key = `${DRAFT_PREFIX}${draftId || "new"}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as StoredPropertyDraft;
  } catch (error) {
    console.error("Failed to read local property draft:", error);
    return null;
  }
};

/**
 * Removes a specific draft from storage.
 */
export const removeLocalDraft = (draftId: string): void => {
  try {
    const key = `${DRAFT_PREFIX}${draftId || "new"}`;
    localStorage.removeItem(key);

    const latest = localStorage.getItem(LATEST_DRAFT_KEY);
    if (latest === draftId) {
      localStorage.removeItem(LATEST_DRAFT_KEY);
    }
  } catch (error) {
    console.error("Failed to remove local property draft:", error);
  }
};

/**
 * Retrieves the most recent active draft across all stored drafts.
 */
export const getLatestActiveDraft = (): StoredPropertyDraft | null => {
  try {
    const latestId = localStorage.getItem(LATEST_DRAFT_KEY);
    if (latestId) {
      const draft = getLocalDraft(latestId);
      if (draft && isFormDirtyOrHasContent(draft.formData)) {
        return draft;
      }
    }

    // Fallback: scan all keys
    let newestDraft: StoredPropertyDraft | null = null;
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey && storageKey.startsWith(DRAFT_PREFIX)) {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as StoredPropertyDraft;
            if (
              parsed &&
              isFormDirtyOrHasContent(parsed.formData) &&
              (!newestDraft || parsed.timestamp > newestDraft.timestamp)
            ) {
              newestDraft = parsed;
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
    return newestDraft;
  } catch (error) {
    console.error("Failed to find latest active draft:", error);
    return null;
  }
};

/**
 * Formats a timestamp into a friendly human-readable time (e.g. "Just now", "2m ago", "12:45 PM").
 */
export const formatDraftTime = (timestamp: number): string => {
  if (!timestamp) return "";
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);

  if (diffSec < 30) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return new Date(timestamp).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
