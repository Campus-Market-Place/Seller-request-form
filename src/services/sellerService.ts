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

// --- AUTH TOKEN UTILS ---
const AUTH_DEBUG_PREFIX = "[AUTH][getToken]";

function maskToken(token: string | null): string {
  if (!token) return "<none>";
  if (token.length <= 12) return `${token.slice(0, 4)}...`;
  return `${token.slice(0, 8)}...${token.slice(-4)} (len=${token.length})`;
}

export async function authenticateTelegram(): Promise<string | null> {
  const params = new URLSearchParams(window.location.search);
  console.log(`${AUTH_DEBUG_PREFIX} start`, {
    path: window.location.pathname,
    hasTokenInUrl: params.has("token"),
    queryKeys: Array.from(params.keys()),
  });

  const token = params.get("token");

  if (!token) {
    const storedToken = localStorage.getItem("token");
    console.log(`${AUTH_DEBUG_PREFIX} no token in URL, using localStorage`, {
      hasStoredToken: Boolean(storedToken),
      storedToken: maskToken(storedToken),
    });
    return storedToken;
  }

  localStorage.setItem("token", token);
  console.log(`${AUTH_DEBUG_PREFIX} saved token to localStorage`, {
    token: maskToken(token),
  });

  params.delete("token");
  const query = params.toString();
  const newUrl = query
    ? `${window.location.pathname}?${query}${window.location.hash}`
    : `${window.location.pathname}${window.location.hash}`;

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
  const formData = new FormData();

  formData.append("shopName", data.shopName);
  formData.append("discription", data.discription);
  formData.append("campusLocation", data.campusLocation);
  formData.append("mainPhone", data.mainPhone);
  formData.append("categoryId", data.categoryId);
  formData.append("agreedToRules", data.agreedToRules ? "1" : "0");

  if (data.instagram) formData.append("instagram", data.instagram);
  if (data.telegram) formData.append("telegram", data.telegram);
  if (data.tiktok) formData.append("tiktok", data.tiktok);
  if (data.other) formData.append("other", data.other);

  data.idImages.forEach((file) => {
    formData.append("image", file);
  });

  if (data.profileImage) {
    formData.append("profileImage", data.profileImage);
  }

  // --- GET TOKEN ---
  const token = await authenticateTelegram();
  if (!token) {
    return { success: false, error: "No authentication token found." };
  }

  const response = await fetch(
    "https://backend-ikou.onrender.com/api/seller-request",
    {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`, // send token in headers
      },
    }
  );

  const resData = await response.json().catch(() => null);

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