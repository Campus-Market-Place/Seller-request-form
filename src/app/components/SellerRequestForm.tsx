// src/components/SellerRequestForm.tsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Upload,
  X,
  Store,
  Phone,
  MapPin,
  Instagram,
  Send,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { submitSellerRequest } from "../../services/sellerService";

interface Category {
  id: string;
  name: string;
  icon: string | null;
}


interface SellerRequestFormData {
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
}

export function SellerRequestForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SellerRequestFormData>();

  const [idImages, setIdImages] = useState<File[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [categories, setCategories] = useState<any[]>([]);

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await fetch("https://backend-ikou.onrender.com/api/categories");
      const data = await res.json();

      setCategories(data.data.categories);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  fetchCategories();
}, []);

  // Handle file uploads
  const handleIdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 2 - idImages.length);
      setIdImages((prev) => [...prev, ...newFiles].slice(0, 2));
    }
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProfileImage(file);
  };

  const removeIdImage = (index: number) => {
    setIdImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeProfileImage = () => {
    setProfileImage(null);
  };

  // Form submission
  const onSubmit = async (data: SellerRequestFormData) => {
    if (idImages.length !== 2) {
      alert("Please upload both front and back ID images");
      return;
    }

    setSubmitStatus("idle");

    const result = await submitSellerRequest({
      ...data,
      idImages,
      profileImage,
    });

    if (result.success) {
      setSubmitStatus("success");
      reset();
      setIdImages([]);
      setProfileImage(null);
    } else {
      setSubmitStatus("error");
      alert(result.error);
    }

    setTimeout(() => setSubmitStatus("idle"), 3000);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Store className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Seller</h1>
            <p className="text-gray-600">Fill out the form below to submit your seller request</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Shop Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Store className="w-5 h-5" /> Shop Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("shopName", { required: "Shop name is required" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your shop name"
                />
                {errors.shopName && (
                  <p className="text-red-500 text-sm mt-1">{errors.shopName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("discription", { required: "Description is required" })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Describe your shop and what you sell..."
                />
                {errors.discription && (
                  <p className="text-red-500 text-sm mt-1">{errors.discription.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("categoryId", { required: "Category is required" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Campus Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("campusLocation", { required: "Campus location is required" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="e.g., Building A, Floor 2"
                />
                {errors.campusLocation && (
                  <p className="text-red-500 text-sm mt-1">{errors.campusLocation.message}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4 pt-4 border-t">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Phone className="w-5 h-5" /> Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    {...register("mainPhone", { required: "Main phone is required" })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="+1 (555) 000-0000"
                  />
                  {errors.mainPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.mainPhone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Phone
                  </label>
                  <input
                    type="tel"
                    {...register("secondaryPhone")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4 pt-4 border-t">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Instagram className="w-5 h-5" /> Social Media
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["instagram", "telegram", "tiktok", "other"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                      {field === "telegram" && <span className="text-red-500"> *</span>}
                    </label>

                    <input
                      type="text"
                      {...register(field as keyof SellerRequestFormData, {
                        required: field === "telegram" ? "Telegram is required" : false,
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder={`@username or ${field}`}
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* ID Images */}
            <div className="space-y-4 pt-4 border-t">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5" /> ID Verification
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Images (Front & Back) <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Please upload clear images of both the front and back of your ID
                </p>

                <div className="space-y-3">
                  {idImages.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="flex-1 text-sm text-gray-700 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeIdImage(index)}
                        className="p-1 hover:bg-gray-200 rounded transition"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  ))}

                  {idImages.length < 2 && (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload ID image ({idImages.length}/2)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIdImageUpload}
                        className="hidden"
                        multiple
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Image */}
            <div className="space-y-4 pt-4 border-t">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" /> Profile Image
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Profile Image (Optional)
                </label>

                {profileImage ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                    <span className="flex-1 text-sm text-gray-700 truncate">{profileImage.name}</span>
                    <button
                      type="button"
                      onClick={removeProfileImage}
                      className="p-1 hover:bg-gray-200 rounded transition"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload profile image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="pt-4 border-t">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("agreedToRules", {
                    required: "You must agree to the rules and terms",
                  })}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I agree to the seller rules and terms of service <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.agreedToRules && (
                <p className="text-red-500 text-sm mt-1">{errors.agreedToRules.message}</p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> Submit Request
                  </>
                )}
              </button>
            </div>

            {/* Status messages */}
            {submitStatus === "success" && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  ✓ Your seller request has been submitted successfully! We'll review it soon.
                </p>
              </div>
            )}
            {submitStatus === "error" && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">✗ Failed to submit request. Please try again.</p>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Note: Connect to /api/seller-request endpoint for production
        </p>
      </div>
    </div>
  );
}