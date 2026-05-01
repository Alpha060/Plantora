"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home, TreePine, Sun, ArrowRight, CheckCircle2,
  Calendar, Phone, Mail, User, MapPin, Loader2, Sparkles, Sprout, ChevronRight, ChevronLeft
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const LandscapeServices = [
  {
    id: "roof-garden",
    title: "Roof Garden",
    icon: Home,
    description: "Transform your rooftop into a lush green paradise with potted arrangements, vertical gardens, and seating areas.",
    features: ["Custom design layout", "Waterproofing check", "Pot & planter selection", "Irrigation setup", "3-month maintenance"],
    startingPrice: 15000,
    image: "🏡",
  },
  {
    id: "balcony-garden",
    title: "Balcony Garden",
    icon: Sun,
    description: "Make the most of your balcony with beautiful vertical gardens, hanging planters, and cozy green corners.",
    features: ["Space-optimized design", "Vertical garden installation", "Hanging planter setup", "Low-maintenance plants", "Railing planters"],
    startingPrice: 5000,
    image: "🌿",
  },
  {
    id: "open-area",
    title: "Open Area / Backyard",
    icon: TreePine,
    description: "Design and build your dream garden with pathways, flower beds, lawns, and decorative elements.",
    features: ["Full landscape design", "Lawn installation", "Pathway design", "Flower bed creation", "Water features"],
    startingPrice: 25000,
    image: "🌳",
  },
];

const STEPS = [
  { num: 1, title: "Request", description: "Tell us about your space and requirements" },
  { num: 2, title: "Site Visit", description: "Our expert visits your location" },
  { num: 3, title: "Design", description: "We create a custom design proposal" },
  { num: 4, title: "Execute", description: "Our team brings the design to life" },
  { num: 5, title: "Enjoy", description: "Love your new green space!" },
];

const BUDGETS = ["Under ₹10,000", "₹10,000 - ₹25,000", "₹25,000 - ₹50,000", "₹50,000 - ₹1,00,000", "Above ₹1,00,000"];

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
}

export default function LandscapePage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    service_type: "", address: "", area_size: "",
    preferred_date: "", description: "", budget: "",
  });

  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  useEffect(() => {
    fetch("/api/landscape-gallery")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setGallery(data);
      })
      .catch(() => {});
  }, []);

  const handleStartConsultation = (serviceId?: string) => {
    if (serviceId) {
      setForm((f) => ({ ...f, service_type: serviceId }));
      setFormStep(2); // Skip service selection if clicked from a service card
    } else {
      setFormStep(1);
    }
    setShowForm(true);
    setTimeout(() => {
      document.getElementById("consultation-wizard")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const validateStep1 = () => form.service_type !== "";
  const validateStep2 = () => true; // Optional fields in step 2
  const validateStep3 = () => form.name !== "" && form.phone !== "" && form.address !== "";

  const handleSubmit = async () => {
    if (!validateStep3()) {
      toast.error("Please fill all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/services/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Consultation request submitted! We'll contact you soon.");
      setShowForm(false);
      setForm({ name: "", phone: "", email: "", service_type: "", address: "", area_size: "", preferred_date: "", description: "", budget: "" });
      setFormStep(1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FBF8]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-32 bg-[url('https://images.unsplash.com/photo-1558904541-efa843a96f09?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
        {/* Modern animated overlay */}
        <div className="absolute inset-0 bg-[#0a1f06]/70 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0a1f06]/40 to-[#0a1f06]"></div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 mb-8 backdrop-blur-md border border-white/20 animate-fade-in-up">
            <Sparkles className="h-4 w-4 text-emerald-300" />
            <span className="text-sm font-semibold text-emerald-50 tracking-widest uppercase">Premium Landscape Design</span>
          </div>
          
          <h1 className="mx-auto max-w-5xl font-serif text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl mb-6 leading-tight animate-fade-in-up delay-100">
            Transform Your Space Into a <span className="text-emerald-400 inline-block mt-2 font-style-italic relative">
              Green Paradise
              <svg className="absolute -bottom-4 left-0 w-full h-4 text-emerald-500/50" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0 10 Q 50 20 100 10" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-emerald-100/90 mb-10 leading-relaxed font-light animate-fade-in-up delay-200">
            Expert landscape design and execution for rooftops, balconies, and open areas in Daltonganj. We bring nature to your doorstep.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Button 
              onClick={() => handleStartConsultation()} 
              size="lg"
              className="h-16 px-10 rounded-full bg-white text-[#1A3614] hover:bg-emerald-50 text-lg font-bold shadow-2xl transition-all hover:scale-105 w-full sm:w-auto ring-4 ring-white/20"
            >
              Start Your Project
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 relative bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1A3614] mb-6">Our Services</h2>
            <div className="w-24 h-1.5 bg-emerald-500 mx-auto rounded-full mb-6"></div>
            <p className="text-[#4A5568] max-w-2xl mx-auto text-lg leading-relaxed">Choose the perfect landscaping service for your space. We handle everything from design to execution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {LandscapeServices.map((svc) => (
              <div key={svc.id} className="group relative bg-[#F9FBF8] rounded-[2rem] p-8 md:p-10 transition-all duration-500 hover:-translate-y-3 flex flex-col h-full border border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(16,185,129,0.1)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-bl-[100px] rounded-tr-[2rem] -z-10 transition-all duration-500 group-hover:bg-emerald-200/50"></div>
                
                <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center text-5xl mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                  {svc.image}
                </div>
                
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#1A3614] mb-4">{svc.title}</h3>
                <p className="text-[#4A5568] leading-relaxed mb-8 text-base">{svc.description}</p>
                
                <div className="space-y-4 mb-10 flex-1">
                  {svc.features.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[15px] text-[#2D3748] font-medium">{f}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-8 border-t border-emerald-100/80 mt-auto flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#718096] font-bold uppercase tracking-wider mb-1">Starting from</p>
                    <p className="text-2xl font-black text-[#1A3614]">₹{svc.startingPrice.toLocaleString("en-IN")}</p>
                  </div>
                  <button 
                    onClick={() => handleStartConsultation(svc.id)} 
                    className="h-14 w-14 rounded-full bg-[#1A3614] text-white flex items-center justify-center shadow-lg group-hover:bg-emerald-600 group-hover:scale-110 transition-all duration-300"
                    aria-label={`Request consultation for ${svc.title}`}
                  >
                    <ArrowRight className="h-6 w-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Consultation Wizard */}
      {showForm && (
        <section id="consultation-wizard" className="py-24 bg-[#F0F7F1]">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgb(0,0,0,0.05)] p-8 md:p-14 border border-emerald-50 relative overflow-hidden">
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Sprout className="h-48 w-48 text-emerald-800 transform rotate-12" />
              </div>

              <div className="mb-12 relative z-10 text-center">
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#1A3614] mb-4">Design Your Space</h2>
                <p className="text-[#4A5568] text-lg">Let's craft your perfect garden in three simple steps.</p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center mb-12 relative z-10">
                <div className="flex items-center w-full max-w-xl">
                  {[1, 2, 3].map((step, idx) => (
                    <div key={step} className="flex-1 flex flex-col items-center relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 z-10 ${formStep >= step ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                        {formStep > step ? <CheckCircle2 className="h-5 w-5" /> : step}
                      </div>
                      <span className={`text-xs font-bold mt-3 ${formStep >= step ? 'text-emerald-800' : 'text-emerald-400'}`}>
                        {step === 1 ? 'Service' : step === 2 ? 'Details' : 'Contact'}
                      </span>
                      {idx < 2 && (
                        <div className={`absolute top-5 left-1/2 w-full h-[2px] z-0 ${formStep > step ? 'bg-emerald-600' : 'bg-emerald-100'}`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 bg-white">
                {/* Step 1: Service Selection */}
                {formStep === 1 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <h3 className="text-xl font-bold text-[#1A3614] mb-6">What type of space are you looking to transform?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {LandscapeServices.map((s) => (
                        <div 
                          key={s.id} 
                          onClick={() => setForm({ ...form, service_type: s.id })}
                          className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200 text-center ${form.service_type === s.id ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50'}`}
                        >
                          <div className="text-4xl mb-4">{s.image}</div>
                          <h4 className="font-bold text-[#1A3614]">{s.title}</h4>
                        </div>
                      ))}
                    </div>
                    <div className="mt-10 flex justify-end">
                      <Button 
                        onClick={() => { if(validateStep1()) setFormStep(2); else toast.error("Please select a service"); }}
                        className="bg-[#1A3614] hover:bg-emerald-700 text-white h-12 px-8 rounded-full text-base"
                      >
                        Next Step <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Details */}
                {formStep === 2 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <h3 className="text-xl font-bold text-[#1A3614] mb-6">Tell us a bit more about your project</h3>
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-[#1A3614]">What is your estimated budget?</Label>
                        <div className="flex flex-wrap gap-3">
                          {BUDGETS.map((b) => (
                            <button 
                              key={b} 
                              onClick={() => setForm({ ...form, budget: b })} 
                              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border-2 ${form.budget === b ? "border-emerald-600 bg-emerald-600 text-white shadow-md" : "border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50"}`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-[#1A3614]">Approximate Area Size (Optional)</Label>
                          <Input value={form.area_size} onChange={(e) => setForm({ ...form, area_size: e.target.value })} placeholder="e.g. 200 sq ft" className="h-12 border-gray-200 focus:border-emerald-500 rounded-xl px-4 bg-gray-50/50" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-[#1A3614]">Preferred Visit Date (Optional)</Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input type="date" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} className="h-12 pl-10 border-gray-200 focus:border-emerald-500 rounded-xl bg-gray-50/50" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1A3614]">Requirements / Vision (Optional)</Label>
                        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your dream garden, favorite plants, or specific requirements..." className="min-h-[120px] border-gray-200 focus:border-emerald-500 rounded-xl p-4 resize-none bg-gray-50/50" />
                      </div>
                    </div>
                    
                    <div className="mt-10 flex justify-between">
                      <Button variant="outline" onClick={() => setFormStep(1)} className="h-12 px-6 rounded-full border-gray-200 hover:bg-gray-50 text-gray-600">
                        <ChevronLeft className="mr-2 h-5 w-5" /> Back
                      </Button>
                      <Button onClick={() => setFormStep(3)} className="bg-[#1A3614] hover:bg-emerald-700 text-white h-12 px-8 rounded-full text-base">
                        Next Step <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Contact Details */}
                {formStep === 3 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <h3 className="text-xl font-bold text-[#1A3614] mb-6">Where should we reach you?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1A3614]">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-12 pl-10 border-gray-200 focus:border-emerald-500 rounded-xl bg-gray-50/50" placeholder="John Doe" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1A3614]">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-12 pl-10 border-gray-200 focus:border-emerald-500 rounded-xl bg-gray-50/50" placeholder="+91 98765 43210" />
                        </div>
                      </div>
                      
                      <div className="md:col-span-2 space-y-2">
                        <Label className="text-sm font-semibold text-[#1A3614]">Email Address (Optional)</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-12 pl-10 border-gray-200 focus:border-emerald-500 rounded-xl bg-gray-50/50" placeholder="john@example.com" />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label className="text-sm font-semibold text-[#1A3614]">Property Address *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                          <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="min-h-[100px] pl-10 border-gray-200 focus:border-emerald-500 rounded-xl py-3 resize-none bg-gray-50/50" placeholder="Enter full address of the property..." />
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 flex justify-between">
                      <Button variant="outline" onClick={() => setFormStep(2)} className="h-12 px-6 rounded-full border-gray-200 hover:bg-gray-50 text-gray-600">
                        <ChevronLeft className="mr-2 h-5 w-5" /> Back
                      </Button>
                      <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 rounded-full font-bold shadow-lg shadow-emerald-600/20"
                      >
                        {isSubmitting ? (
                          <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Submitting...</>
                        ) : (
                          <>Book Consultation <CheckCircle2 className="ml-2 h-5 w-5" /></>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-2xl">
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1A3614] mb-4">Our Recent Work</h2>
                <div className="w-24 h-1.5 bg-emerald-500 rounded-full mb-6"></div>
                <p className="text-[#4A5568] text-lg">Browse through some of our completed landscape projects and find inspiration for your own space.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {gallery.map((img) => (
                <div key={img.id} className="group relative overflow-hidden rounded-[2rem] bg-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500">
                  <div className="aspect-4/3 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={img.image_url} 
                      alt={img.title || "Landscape project"} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    {/* Dark gradient overlay on hover */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  {img.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <p className="font-serif font-bold text-white text-xl drop-shadow-md">{img.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-24 bg-[#1A3614] text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">How It Works</h2>
            <div className="w-24 h-1.5 bg-emerald-500 mx-auto rounded-full mb-6"></div>
            <p className="text-emerald-100/80 max-w-2xl mx-auto text-lg">A simple, transparent process to bring your dream garden to life.</p>
          </div>
          
          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-12 left-10 right-10 h-0.5 bg-white/10"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-6 relative z-10">
              {STEPS.map((step, idx) => (
                <div key={step.num} className="flex flex-col items-center text-center group">
                  <div className="h-24 w-24 rounded-full bg-[#234b1a] border-4 border-[#1A3614] shadow-[0_0_0_4px_rgba(16,185,129,0.2)] flex items-center justify-center text-3xl font-black text-emerald-400 mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 relative z-10">
                    {step.num}
                  </div>
                  <h4 className="font-serif text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">{step.title}</h4>
                  <p className="text-sm text-emerald-100/70 leading-relaxed px-2 font-medium">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
