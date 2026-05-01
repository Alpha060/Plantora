import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Breadcrumbs items={[{ label: "About Us" }]} />
        <div className="mt-8 bg-white p-8 md:p-12 rounded-2xl shadow-ambient-sm border text-center">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-emerald-900 mb-6">
            About Plantora
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Plantora is Daltonganj&apos;s premier multi-vendor marketplace for fresh flowers, plants, and professional landscaping Landscape.
            We connect local nurseries and experts directly with customers to bring nature closer to home.
          </p>
        </div>
      </div>
    </div>
  );
}
