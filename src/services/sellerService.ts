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
    idImages: File[];        // Two files
    profileImage?: File | null; // Optional
  }
  
  export async function submitSellerRequest(data: SellerRequestData) {
    const formData = new FormData();
    formData.append("shopName", data.shopName);
    formData.append("discription", data.discription);
    formData.append("campusLocation", data.campusLocation);
    formData.append("mainPhone", data.mainPhone);
    if (data.secondaryPhone) formData.append("secondaryPhone", data.secondaryPhone);
    formData.append("categoryId", data.categoryId);
    formData.append("agreedToRules", String(data.agreedToRules));
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
  
    const response = await fetch("https://backend-ikou.onrender.com/api/seller-request", {
      method: "POST",
      body: formData,
    });
  
    if (response.status === 201) {
      return { success: true };
    } else if (response.status === 400) {
      const resData = await response.json();
      return { success: false, error: "Validation error: " + JSON.stringify(resData) };
    } else if (response.status === 409) {
      return { success: false, error: "Conflict: Request already exists" };
    } else {
      return { success: false, error: "Unknown error" };
    }
  }