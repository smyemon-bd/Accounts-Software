"use client";

export default function ExportButton({ data, filename }: { data: any[], filename: string }) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("No data to export!");
      return;
    }

    // CSV হেডার তৈরি
    const headers = Object.keys(data[0]).join(",");
    
    // CSV রো তৈরি
    const rows = data.map(obj => 
      Object.values(obj).map(value => {
        // যদি ভ্যালুতে কমা থাকে, তবে সেটাকে ডাবল কোটে মুড়ে দিতে হবে
        const strValue = String(value ?? "");
        return strValue.includes(",") ? `"${strValue}"` : strValue;
      }).join(",")
    );

    const csvContent = [headers, ...rows].join("\n");
    
    // ফাইল ডাউনলোড ট্রিগার
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // \uFEFF এক্সেলে বাংলা/ইউনিকোড সাপোর্টের জন্য
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
    >
      Export to Excel (CSV)
    </button>
  );
}