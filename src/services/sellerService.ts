// src/services/sellerService.ts
export interface SellerRequestData {
  shopName: string;
  discription: string;
  campusLocation: string;
  mainPhone: string;
  secondaryPhone?: string;
  categoryId: string;
  agreedToRules: boolean;
  instagram?: string;
  telegram?: string;
  tiktok?: string;
  other?: string;
  idImages: File[];          // Two files
  profileImage?: File | null; // Optional
}

type AgreedValueMode = "bool-string" | "numeric-string" | "html-checkbox";

// --- AUTH TOKEN UTILS ---
const AUTH_DEBUG_PREFIX = "[AUTH][getToken]";
const TOKEN_STORAGE_KEY = "telegramAuthToken";
const LEGACY_TOKEN_STORAGE_KEYS = ["token", "authToken"];

function normalizeToken(rawToken: string | null): string | null {
  if (!rawToken) return null;

  const trimmed = rawToken.trim();
  if (!trimmed) return null;

  // Some bot implementations accidentally send placeholder templates.
  if (trimmed.includes("${") && trimmed.includes("}")) return null;

  // Remove accidental wrapping quotes from bot string formatting.
  const unwrapped = trimmed.replace(/^['\"]+|['\"]+$/g, "");
  return unwrapped || null;
}

function getTokenFromHash(hash: string): string | null {
  const hashWithoutPrefix = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!hashWithoutPrefix) return null;

  // Handles: #token=abc and #/path?token=abc
  const queryCandidate = hashWithoutPrefix.includes("?")
    ? hashWithoutPrefix.split("?").slice(1).join("?")
    : hashWithoutPrefix;

  const params = new URLSearchParams(queryCandidate);
  return params.get("token");
}

function removeTokenFromHash(hash: string): string {
  const hashWithoutPrefix = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!hashWithoutPrefix) return "";

  if (!hashWithoutPrefix.includes("?")) {
    const params = new URLSearchParams(hashWithoutPrefix);
    params.delete("token");
    const query = params.toString();
    return query ? `#${query}` : "";
  }

  const [routePart, ...queryParts] = hashWithoutPrefix.split("?");
  const params = new URLSearchParams(queryParts.join("?"));
  params.delete("token");
  const query = params.toString();
  return query ? `#${routePart}?${query}` : `#${routePart}`;
}

function maskToken(token: string | null): string {
  if (!token) return "<none>";
  if (token.length <= 12) return `${token.slice(0, 4)}...`;
  return `${token.slice(0, 8)}...${token.slice(-4)} (len=${token.length})`;
}

function coerceToBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "on";
  }
  return false;
}

function agreedValueByMode(agreed: boolean, mode: AgreedValueMode): string {
  if (mode === "numeric-string") return agreed ? "1" : "0";
  if (mode === "html-checkbox") return agreed ? "on" : "off";
  return agreed ? "true" : "false";
}

function buildSellerRequestFormData(
  data: SellerRequestData,
  agreedMode: AgreedValueMode,
): FormData {
  const formData = new FormData();

  formData.append("shopName", data.shopName);
  formData.append("discription", data.discription);
  formData.append("campusLocation", data.campusLocation);
  formData.append("mainPhone", data.mainPhone);
  formData.append("categoryId", data.categoryId);

  const agreed = coerceToBoolean(data.agreedToRules);
  formData.append("agreedToRules", agreedValueByMode(agreed, agreedMode));

  if (data.instagram) formData.append("instagram", data.instagram);
  if (data.telegram) formData.append("telegram", data.telegram);
  if (data.tiktok) formData.append("tiktok", data.tiktok);
  if (data.other) formData.append("other", data.other);
  if (data.secondaryPhone) formData.append("secondaryPhone", data.secondaryPhone);

  data.idImages.forEach((file) => {
    formData.append("image", file);
  });

  if (data.profileImage) {
    formData.append("profileImage", data.profileImage);
  }

  return formData;
}

export async function authenticateTelegram(): Promise<string | null> {
  const params = new URLSearchParams(window.location.search);
  const searchToken = normalizeToken(params.get("token"));
  const hashToken = normalizeToken(getTokenFromHash(window.location.hash));

  console.log(`${AUTH_DEBUG_PREFIX} start`, {
    path: window.location.pathname,
    hasTokenInUrl: Boolean(searchToken || hashToken),
    queryKeys: Array.from(params.keys()),
  });

  const token = searchToken || hashToken;

  if (!token) {
    const storedToken =
      normalizeToken(localStorage.getItem(TOKEN_STORAGE_KEY)) ||
      LEGACY_TOKEN_STORAGE_KEYS.map((key) => normalizeToken(localStorage.getItem(key))).find(Boolean) ||
      null;
    console.log(`${AUTH_DEBUG_PREFIX} no token in URL, using localStorage`, {
      hasStoredToken: Boolean(storedToken),
      storedToken: maskToken(storedToken),
    });
    return storedToken;
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  console.log(`${AUTH_DEBUG_PREFIX} saved token to localStorage`, {
    token: maskToken(token),
  });

  params.delete("token");
  const query = params.toString();
  const safeHash = removeTokenFromHash(window.location.hash);
  const newUrl = query
    ? `${window.location.pathname}?${query}${safeHash}`
    : `${window.location.pathname}${safeHash}`;

  if (window.history.replaceState) {
    window.history.replaceState({}, document.title, newUrl);
    console.log(`${AUTH_DEBUG_PREFIX} removed token from URL`, {
      newUrl,
      hasTokenInNewUrl: new URLSearchParams(query).has("token"),
    });
  }

  console.log(`${AUTH_DEBUG_PREFIX} done`, { token: maskToken(token) });
  return token;
}

// --- SUBMIT SELLER REQUEST ---
export async function submitSellerRequest(data: SellerRequestData) {
  let agreedMode: AgreedValueMode = "bool-string";

  // --- GET TOKEN ---
  const token = await authenticateTelegram();
  if (!token) {
    return { success: false, error: "No authentication token found." };
  }

  const requestUrl = new URL("https://backend-ikou.onrender.com/api/seller-request");
  requestUrl.searchParams.set("token", token);

  const sendWithAuth = async (authorizationValue: string, mode: AgreedValueMode) => {
    const formData = buildSellerRequestFormData(data, mode);

    return fetch(requestUrl.toString(), {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: {
        Authorization: authorizationValue,
        token,
        "x-auth-token": token,
        Accept: "application/json",
      },
    });
  };

  let response = await sendWithAuth(`Bearer ${token}`, agreedMode);

  // Some backends expect the raw JWT without the Bearer prefix.
  if (response.status === 401) {
    response = await sendWithAuth(token, agreedMode);
  }

  let resData = await response.json().catch(() => null);

  // Backend validators can differ for multipart checkbox values.
  if (
    response.status === 400 &&
    typeof resData?.message === "string" &&
    resData.message.toLowerCase().includes("agreedtorules")
  ) {
    agreedMode = "numeric-string";
    response = await sendWithAuth(`Bearer ${token}`, agreedMode);
    if (response.status === 401) {
      response = await sendWithAuth(token, agreedMode);
    }
    resData = await response.json().catch(() => null);

    if (
      response.status === 400 &&
      typeof resData?.message === "string" &&
      resData.message.toLowerCase().includes("agreedtorules")
    ) {
      agreedMode = "html-checkbox";
      response = await sendWithAuth(`Bearer ${token}`, agreedMode);
      if (response.status === 401) {
        response = await sendWithAuth(token, agreedMode);
      }
      resData = await response.json().catch(() => null);
    }
  }

  console.log("Status:", response.status);
  console.log("Response:", resData);

  if (response.ok) {
    return { success: true };
  }

  return {
    success: false,
    error: resData?.message || `Server error ${response.status}`,
  };
}