"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Store,
  FileText,
  Upload,
  Eye,
  EyeOff,
  Check,
  ChevronDown,
  Building2,
  Users,
  Package,
  Lock,
  CheckCircle,
  TrendingUp,
  ShieldCheck,
  HeadphonesIcon,
  Loader2,
} from "lucide-react";
import { useContact } from "@/hooks/use-contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { z } from "zod";

const sellerRegisterSchema = z.object({
  // Store Information
  store_name: z.string().min(3, "Store name must be at least 3 characters"),
  store_tagline: z.string().optional(),
  store_description: z.string().min(20, "Description must be at least 20 characters"),

  // Owner Information
  full_name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
  email: z.string().email("Invalid email"),
  alternate_phone: z.string().optional(),

  // Business Details
  business_type: z.string().min(1, "Select business type"),
  gst_number: z.string().optional(),
  years_in_business: z.string().optional(),
  employee_count: z.string().optional(),
  categories: z.array(z.string()).min(1, "Select at least one category"),

  // Address
  address_line1: z.string().min(5, "Address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  google_maps_link: z.string().optional(),

  // Password
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),

  // Terms
  agree_terms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type SellerRegisterFormData = z.infer<typeof sellerRegisterSchema>;

const steps = [
  { id: 1, label: "Store Information" },
  { id: 2, label: "Business Details" },
  { id: 3, label: "Documents" },
  { id: 4, label: "Review" },
];

const businessTypes = [
  "Individual/Freelancer",
  "Proprietorship",
  "Partnership",
  "Private Limited Company",
  "LLP",
  "Other",
];

const yearsOptions = ["Less than 1 year", "1-2 years", "3-5 years", "5-10 years", "10+ years"];
const employeeOptions = ["Just me", "2-5", "6-10", "11-25", "26-50", "50+"];

const productCategories = [
  "Flowers",
  "Plants",
  "Seeds & Bulbs",
  "Gardening Tools",
  "Fertilizers & Soil",
  "Pots & Planters",
  "Landscaping Services",
  "Gift Hampers",
];

const states = [
  "Jharkhand",
  "Bihar",
  "Uttar Pradesh",
  "West Bengal",
  "Odisha",
  "Other",
];

export function SellerRegisterForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    pan_card?: File;
    gst_certificate?: File;
    shop_photo?: File;
  }>({});
  const router = useRouter();
  const { contact, formatPhone } = useContact();

  const form = useForm<SellerRegisterFormData>({
    resolver: zodResolver(sellerRegisterSchema),
    defaultValues: {
      store_name: "",
      store_tagline: "",
      store_description: "",
      full_name: "",
      phone: "",
      email: "",
      alternate_phone: "",
      business_type: "",
      gst_number: "",
      years_in_business: "",
      employee_count: "",
      categories: [],
      address_line1: "",
      address_line2: "",
      city: "Daltonganj",
      state: "Jharkhand",
      pincode: "",
      google_maps_link: "",
      password: "",
      confirm_password: "",
      agree_terms: false,
    },
  });

  const handleFileUpload = (field: keyof typeof uploadedFiles, file: File | null) => {
    if (file) {
      setUploadedFiles((prev) => ({ ...prev, [field]: file }));
    }
  };

  const handleCategoryToggle = (category: string) => {
    const current = form.getValues("categories") || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    form.setValue("categories", updated, { shouldValidate: true });
  };

  const onSubmit = async (data: SellerRegisterFormData) => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            role: "seller",
          },
        },
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        toast.error("Registration failed. Please try again.");
        return;
      }

      // Generate a simple slug
      const storeSlug = data.store_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // Combine address
      const fullAddress = [data.address_line1, data.address_line2, data.city, data.state]
        .filter(Boolean)
        .join(", ");

      // Create seller profile in 'stores' table
      const { data: storeData, error: profileError } = await supabase.from("stores").insert({
        user_id: userId,
        store_name: data.store_name,
        slug: storeSlug,
        description: data.store_description,
        phone: data.phone,
        email: data.email,
        address: fullAddress,
        pin_code: data.pincode,
        gst_number: data.gst_number || null,
        metadata: {
          store_tagline: data.store_tagline,
          alternate_phone: data.alternate_phone,
          business_type: data.business_type,
          years_in_business: data.years_in_business,
          employee_count: data.employee_count,
          categories: data.categories,
          google_maps_link: data.google_maps_link,
        },
        status: "pending",
      }).select('id').single();

      if (profileError || !storeData) {
        toast.error("Failed to create store profile.");
        console.error("Profile Error:", profileError);
        return;
      }

      const storeId = storeData.id;

      // File Upload Helper
      const uploadFile = async (bucket: string, path: string, file: File) => {
        const { error } = await supabase.storage.from(bucket).upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
      };

      try {
        // Upload Documents
        const docsToInsert = [];
        if (uploadedFiles.pan_card) {
          const ext = uploadedFiles.pan_card.name.split('.').pop();
          const url = await uploadFile('seller-documents', `pan/${storeId}-${Date.now()}.${ext}`, uploadedFiles.pan_card);
          docsToInsert.push({ store_id: storeId, document_type: 'pan', document_url: url });
        }
        if (uploadedFiles.gst_certificate) {
          const ext = uploadedFiles.gst_certificate.name.split('.').pop();
          const url = await uploadFile('seller-documents', `gst/${storeId}-${Date.now()}.${ext}`, uploadedFiles.gst_certificate);
          docsToInsert.push({ store_id: storeId, document_type: 'gst', document_url: url });
        }
        if (uploadedFiles.shop_photo) {
          const ext = uploadedFiles.shop_photo.name.split('.').pop();
          const url = await uploadFile('seller-documents', `shop/${storeId}-${Date.now()}.${ext}`, uploadedFiles.shop_photo);
          docsToInsert.push({ store_id: storeId, document_type: 'shop_license', document_url: url });
        }

        if (docsToInsert.length > 0) {
          await supabase.from("seller_documents").insert(docsToInsert);
        }
      } catch (uploadError) {
        console.error("Document upload failed:", uploadError);
        // We don't block the redirect, just warn the user
        toast.warning("Profile created, but some documents failed to upload. You can re-upload them later.");
      }

      toast.success("Registration successful! Please wait for approval.");
      router.push("/seller/pending-approval");
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Store Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1A3614] flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2D5A27] flex items-center justify-center shadow-sm">
                    <Store className="w-4 h-4" />
                  </span>
                  Store Information
                </h3>
                <p className="text-[#718096] text-sm mt-1 ml-11 mb-6">Provide details about your storefront.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="store_name" className="text-sm font-medium">
                    Store Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="store_name"
                    placeholder="Enter your store name"
                    className="h-11"
                    {...form.register("store_name")}
                  />
                  {form.formState.errors.store_name && (
                    <p className="text-xs text-red-500">{form.formState.errors.store_name.message}</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="store_tagline" className="text-sm font-medium">
                    Store Tagline (Optional)
                  </Label>
                  <Input
                    id="store_tagline"
                    placeholder="e.g. Fresh Plants, Beautiful Spaces"
                    className="h-11"
                    {...form.register("store_tagline")}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="store_description" className="text-sm font-medium">
                    Store Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="store_description"
                    placeholder="Tell customers about your store, products and services..."
                    className="min-h-[100px]"
                    {...form.register("store_description")}
                  />
                  {form.formState.errors.store_description && (
                    <p className="text-xs text-red-500">{form.formState.errors.store_description.message}</p>
                  )}
                  <p className="text-xs text-[#718096] text-right">{form.watch("store_description")?.length || 0}/500</p>
                </div>
              </div>
            </div>

            {/* Owner Contact Information */}
            <div className="pt-6 border-t border-[#E2E8F0]/60 mt-8 space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1A3614] flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2D5A27] flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4" />
                  </span>
                  Owner Information
                </h3>
                <p className="text-[#718096] text-sm mt-1 ml-11 mb-6">Your primary contact details.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
                    <Input
                      id="full_name"
                      placeholder="Enter your full name"
                      className="h-11 pl-10"
                      {...form.register("full_name")}
                    />
                  </div>
                  {form.formState.errors.full_name && (
                    <p className="text-xs text-red-500">{form.formState.errors.full_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Mobile Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#718096]">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">+91</span>
                    </div>
                    <Input
                      id="phone"
                      placeholder="Enter mobile number"
                      className="h-11 pl-16"
                      maxLength={10}
                      {...form.register("phone")}
                    />
                  </div>
                  {form.formState.errors.phone && (
                    <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="h-11 pl-10"
                      {...form.register("email")}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alternate_phone" className="text-sm font-medium">
                    Alternate Mobile (Optional)
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#718096]">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">+91</span>
                    </div>
                    <Input
                      id="alternate_phone"
                      placeholder="Enter alternate number"
                      className="h-11 pl-16"
                      maxLength={10}
                      {...form.register("alternate_phone")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Business Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1A3614] flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2D5A27] flex items-center justify-center shadow-sm">
                    <Building2 className="w-4 h-4" />
                  </span>
                  Business Details
                </h3>
                <p className="text-[#718096] text-sm mt-1 ml-11 mb-6">Tell us about your business operations.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Business Type <span className="text-red-500">*</span>
                  </Label>
                  <Select onValueChange={(val) => val && form.setValue("business_type", val as string)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.business_type && (
                    <p className="text-xs text-red-500">{form.formState.errors.business_type.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gst_number" className="text-sm font-medium">
                    GST Number (Optional)
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
                    <Input
                      id="gst_number"
                      placeholder="Enter GST number"
                      className="h-11 pl-10"
                      {...form.register("gst_number")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Years in Business</Label>
                  <Select onValueChange={(val) => val && form.setValue("years_in_business", val as string)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select years" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearsOptions.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Number of Employees</Label>
                  <Select onValueChange={(val) => val && form.setValue("employee_count", val as string)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select number of employees" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium">
                    Product Categories <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {productCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleCategoryToggle(category)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          form.watch("categories")?.includes(category)
                            ? "bg-[#2D5A27] text-white border-[#2D5A27]"
                            : "bg-white text-[#4A5568] border-[#E2E8F0] hover:border-[#3B7033]"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  {form.formState.errors.categories && (
                    <p className="text-xs text-red-500">{form.formState.errors.categories.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Store Address */}
            <div className="pt-6 border-t border-[#E2E8F0]/60 mt-8 space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1A3614] flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2D5A27] flex items-center justify-center shadow-sm">
                    <MapPin className="w-4 h-4" />
                  </span>
                  Store Address
                </h3>
                <p className="text-[#718096] text-sm mt-1 ml-11 mb-6">Where is your store located?</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address_line1" className="text-sm font-medium">
                    Address Line 1 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
                    <Input
                      id="address_line1"
                      placeholder="House/Shop No, Street, Area"
                      className="h-11 pl-10"
                      {...form.register("address_line1")}
                    />
                  </div>
                  {form.formState.errors.address_line1 && (
                    <p className="text-xs text-red-500">{form.formState.errors.address_line1.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_line2" className="text-sm font-medium">
                    Address Line 2 (Optional)
                  </Label>
                  <Input
                    id="address_line2"
                    placeholder="Landmark (Optional)"
                    className="h-11"
                    {...form.register("address_line2")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="Enter city"
                    className="h-11"
                    {...form.register("city")}
                  />
                  {form.formState.errors.city && (
                    <p className="text-xs text-red-500">{form.formState.errors.city.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Select onValueChange={(val) => val && form.setValue("state", val as string)} defaultValue="Jharkhand">
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode" className="text-sm font-medium">
                    Pincode <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pincode"
                    placeholder="Enter pincode"
                    className="h-11"
                    maxLength={6}
                    {...form.register("pincode")}
                  />
                  {form.formState.errors.pincode && (
                    <p className="text-xs text-red-500">{form.formState.errors.pincode.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google_maps_link" className="text-sm font-medium">
                    Google Map Location (Optional)
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
                    <Input
                      id="google_maps_link"
                      placeholder="Paste your store location link here"
                      className="h-11 pl-10"
                      {...form.register("google_maps_link")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Documents */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1A3614] flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2D5A27] flex items-center justify-center shadow-sm">
                    <FileText className="w-4 h-4" />
                  </span>
                  Documents
                </h3>
                <p className="text-[#718096] text-sm mt-1 ml-11 mb-6">Please upload clear and valid documents.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-6 text-center hover:border-[#3B7033] transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    id="pan_card"
                    onChange={(e) => handleFileUpload("pan_card", e.target.files?.[0] || null)}
                  />
                  <label htmlFor="pan_card" className="cursor-pointer block">
                    <Upload className="w-8 h-8 mx-auto text-[#718096] mb-3" />
                    <p className="text-sm font-medium text-[#1A3614]">PAN Card*</p>
                    <p className="text-xs text-[#718096] mt-1">Upload PAN Card</p>
                    <p className="text-[10px] text-[#718096]">JPG, PNG, PDF (Max. 5MB)</p>
                    {uploadedFiles.pan_card && (
                      <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" /> {uploadedFiles.pan_card.name}
                      </p>
                    )}
                  </label>
                </div>
                <div className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-6 text-center hover:border-[#3B7033] transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    id="gst_certificate"
                    onChange={(e) => handleFileUpload("gst_certificate", e.target.files?.[0] || null)}
                  />
                  <label htmlFor="gst_certificate" className="cursor-pointer block">
                    <Upload className="w-8 h-8 mx-auto text-[#718096] mb-3" />
                    <p className="text-sm font-medium text-[#1A3614]">GST Certificate</p>
                    <p className="text-xs text-[#718096] mt-1">Upload GST Certificate</p>
                    <p className="text-[10px] text-[#718096]">JPG, PNG, PDF (Max. 5MB)</p>
                    {uploadedFiles.gst_certificate && (
                      <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" /> {uploadedFiles.gst_certificate.name}
                      </p>
                    )}
                  </label>
                </div>
                <div className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-6 text-center hover:border-[#3B7033] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="shop_photo"
                    onChange={(e) => handleFileUpload("shop_photo", e.target.files?.[0] || null)}
                  />
                  <label htmlFor="shop_photo" className="cursor-pointer block">
                    <Upload className="w-8 h-8 mx-auto text-[#718096] mb-3" />
                    <p className="text-sm font-medium text-[#1A3614]">Shop/Business Photo*</p>
                    <p className="text-xs text-[#718096] mt-1">Upload Photo</p>
                    <p className="text-[10px] text-[#718096]">JPG, PNG (Max. 5MB)</p>
                    {uploadedFiles.shop_photo && (
                      <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" /> {uploadedFiles.shop_photo.name}
                      </p>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Create Login Credentials */}
            <div className="pt-6 border-t border-[#E2E8F0]/60 mt-8 space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1A3614] flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2D5A27] flex items-center justify-center shadow-sm">
                    <Lock className="w-4 h-4" />
                  </span>
                  Create Login Credentials
                </h3>
                <p className="text-[#718096] text-sm mt-1 ml-11 mb-6">Set a strong password for your account.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className="h-11 pl-10 pr-10"
                      {...form.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-[#718096]">Password must be at least 8 characters with letters and numbers.</p>
                  {form.formState.errors.password && (
                    <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password" className="text-sm font-medium">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      className="h-11 pl-10 pr-10"
                      {...form.register("confirm_password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.formState.errors.confirm_password && (
                    <p className="text-xs text-red-500">{form.formState.errors.confirm_password.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="agree_terms"
                checked={form.watch("agree_terms")}
                onCheckedChange={(checked) => form.setValue("agree_terms", checked as boolean)}
              />
              <Label htmlFor="agree_terms" className="text-sm text-[#4A5568] cursor-pointer">
                I agree to the{" "}
                <Link href="/terms" className="text-[#2D5A27] font-medium hover:underline">Terms & Conditions</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-[#2D5A27] font-medium hover:underline">Privacy Policy</Link>
                {" "}of Plantora Daltanganj
              </Label>
            </div>
            {form.formState.errors.agree_terms && (
              <p className="text-xs text-red-500">{form.formState.errors.agree_terms.message}</p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1A3614] flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2D5A27] flex items-center justify-center shadow-sm">
                  <Eye className="w-4 h-4" />
                </span>
                Review Your Information
              </h3>
              <p className="text-[#718096] text-sm mt-1 ml-11">Please verify all details before submitting.</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-[#F9FBF8] rounded-lg p-4">
                <h4 className="font-semibold text-[#1A3614] mb-2">Store Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-[#718096]">Store Name:</span>
                  <span className="text-[#1A3614]">{form.watch("store_name")}</span>
                  <span className="text-[#718096]">Tagline:</span>
                  <span className="text-[#1A3614]">{form.watch("store_tagline") || "-"}</span>
                </div>
              </div>

              <div className="bg-[#F9FBF8] rounded-lg p-4">
                <h4 className="font-semibold text-[#1A3614] mb-2">Contact Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-[#718096]">Name:</span>
                  <span className="text-[#1A3614]">{form.watch("full_name")}</span>
                  <span className="text-[#718096]">Phone:</span>
                  <span className="text-[#1A3614]">+91 {form.watch("phone")}</span>
                  <span className="text-[#718096]">Email:</span>
                  <span className="text-[#1A3614]">{form.watch("email")}</span>
                </div>
              </div>

              <div className="bg-[#F9FBF8] rounded-lg p-4">
                <h4 className="font-semibold text-[#1A3614] mb-2">Business Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-[#718096]">Type:</span>
                  <span className="text-[#1A3614]">{form.watch("business_type")}</span>
                  <span className="text-[#718096]">Categories:</span>
                  <span className="text-[#1A3614]">{form.watch("categories")?.join(", ")}</span>
                </div>
              </div>

              <div className="bg-[#F9FBF8] rounded-lg p-4">
                <h4 className="font-semibold text-[#1A3614] mb-2">Address</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-[#718096]">Address:</span>
                  <span className="text-[#1A3614]">{form.watch("address_line1")}</span>
                  <span className="text-[#718096]">City:</span>
                  <span className="text-[#1A3614]">{form.watch("city")}</span>
                  <span className="text-[#718096]">State:</span>
                  <span className="text-[#1A3614]">{form.watch("state")}</span>
                  <span className="text-[#718096]">Pincode:</span>
                  <span className="text-[#1A3614]">{form.watch("pincode")}</span>
                </div>
              </div>

              <div className="bg-[#F9FBF8] rounded-lg p-4">
                <h4 className="font-semibold text-[#1A3614] mb-2">Documents</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-[#718096]">PAN Card:</span>
                  <span className="text-[#1A3614]">{uploadedFiles.pan_card ? "Uploaded" : "-"}</span>
                  <span className="text-[#718096]">GST Certificate:</span>
                  <span className="text-[#1A3614]">{uploadedFiles.gst_certificate ? "Uploaded" : "-"}</span>
                  <span className="text-[#718096]">Shop Photo:</span>
                  <span className="text-[#1A3614]">{uploadedFiles.shop_photo ? "Uploaded" : "-"}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto">
      {/* Desktop View - Welcome Text */}
      <div className="hidden lg:block mb-6">
        <h1 className="text-3xl font-serif font-bold text-[#1A3614] mb-2">
          Seller Registration
        </h1>
        <p className="text-[#4A5568] text-sm">
          Please fill all the details to create your seller account.
        </p>
      </div>

      {/* Premium Progress Steps */}
      <div className="relative mb-8 px-2 sm:px-4">
        {/* Continuous background line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#E2E8F0] -translate-y-1/2 rounded-full z-0 hidden sm:block" />
        
        <div className="relative z-10 flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center group flex-1 sm:flex-none">
                <div className="flex items-center w-full sm:w-auto">
                  {/* Left connector for mobile */}
                  {index !== 0 && (
                    <div className={`h-1 w-full sm:hidden ${isCompleted || isCurrent ? "bg-[#2D5A27]" : "bg-[#E2E8F0]"}`} />
                  )}
                  
                  {/* Step Circle */}
                  <div className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm ${
                    isCompleted
                      ? "bg-[#2D5A27] text-white ring-4 ring-[#E8F5E9]"
                      : isCurrent
                      ? "bg-[#1A3614] text-white ring-4 ring-[#E8F5E9] scale-110"
                      : "bg-white text-[#718096] border-2 border-[#E2E8F0]"
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : step.id}
                  </div>

                  {/* Right connector for mobile */}
                  {index !== steps.length - 1 && (
                    <div className={`h-1 w-full sm:hidden ${isCompleted ? "bg-[#2D5A27]" : "bg-[#E2E8F0]"}`} />
                  )}
                </div>
                
                {/* Step Label */}
                <span className={`absolute -bottom-6 text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-colors duration-300 ${
                  isCurrent ? "text-[#1A3614]" : isCompleted ? "text-[#2D5A27]" : "text-[#A0AEC0]"
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E2E8F0]/50 p-6 sm:p-8 mt-4">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="h-11 px-6"
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="h-11 px-6 bg-[#2D5A27] hover:bg-[#1A3614]"
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading || !form.watch("agree_terms")}
                className="h-11 px-8 bg-[#2D5A27] hover:bg-[#1A3614]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register as Seller"
                )}
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Mobile Footer */}
      <div className="lg:hidden mt-6">
        <div className="flex items-center justify-center gap-1 text-sm text-[#4A5568]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3B7033]">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>Need help? <Link href="/contact" className="text-[#3B7033] font-semibold hover:underline">Contact us</Link></span>
        </div>
        <p className="text-center text-sm text-[#718096] mt-2">{formatPhone(contact.phone)}</p>
        <p className="text-center text-xs text-[#718096] mt-4">
          Mon - Sun: 8:00 AM - 9:00 PM
        </p>
      </div>
    </div>
  );
}
