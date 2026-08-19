import React, { useState, useRef, useEffect } from "react";
import { 
  X, Minus, Plus, Maximize2, Minimize2, Download, Printer, 
  Mail, Link2, Edit, Check, ZoomIn, ZoomOut, Maximize, Eye,
  AlertTriangle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useUpdateTransaction } from "@/lib/api-hooks";

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
  onEdit: (tx: any) => void;
}

export function InvoicePreviewModal({ isOpen, onClose, transaction, onEdit }: InvoicePreviewModalProps) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sendMethod, setSendMethod] = useState<"email" | "link">("email");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const invoiceDocRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const updateTransactionMutation = useUpdateTransaction();

  useEffect(() => {
    if (transaction) {
      setLoading(true);
      setError(null);
      // Simulate/trigger loading state
      const timer = setTimeout(() => {
        setLoading(false);
        setCustomerEmail(transaction.clientName ? `${transaction.clientName.toLowerCase().replace(/\s+/g, '')}@example.com` : "");
        setPaymentLink("");
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [transaction]);

  // Handle ESC key to close modal and exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isFullscreen]);

  if (!isOpen || !transaction) return null;

  const isPdf = (url: string) => {
    if (!url) return false;
    return url.startsWith("data:application/pdf") || url.toLowerCase().includes(".pdf");
  };

  const isImage = (url: string) => {
    if (!url) return false;
    return url.startsWith("data:image/") || /\.(png|jpe?g|gif|webp|svg)/i.test(url) || url.startsWith("data:application/octet-stream");
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleZoomReset = () => setZoom(100);

  const handleGenerateLink = () => {
    setIsGeneratingLink(true);
    setTimeout(() => {
      setPaymentLink(`https://pay.thenam.com/invoice/${transaction.referenceNumber}`);
      setIsGeneratingLink(false);
      toast.success("Payment link generated successfully.");
    }, 800);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    toast.success("Payment link copied to clipboard.");
  };

  const handleMarkAsSent = () => {
    updateTransactionMutation.mutate({
      id: transaction._id,
      status: "Sent"
    }, {
      onSuccess: () => {
        toast.success("Invoice marked as sent successfully.");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to update invoice status.");
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (transaction.proofImage) {
      // Download uploaded file directly
      try {
        const link = document.createElement("a");
        link.href = transaction.proofImage;
        const extension = isPdf(transaction.proofImage) ? ".pdf" : ".png";
        link.download = `Thenam-Invoice-${transaction.referenceNumber}${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started.");
      } catch (err) {
        toast.error("Failed to download uploaded file.");
      }
      return;
    }

    // Dynamic import to prevent bundler errors if not loaded yet
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const element = document.getElementById("print-invoice-area");
      if (!element) return;

      toast.info("Generating high-quality PDF...");

      // Render the A4 element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgWidth = 210; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Thenam-Invoice-${transaction.referenceNumber}.pdf`);
      toast.success("Invoice PDF downloaded successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF invoice. Please ensure package installation completes.");
    }
  };

  // Pre-calculate invoice items & numbers
  const subtotal = transaction.amount;
  const taxRate = 0.18; // 18% GST
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  const total = subtotal; // Total is already tax-inclusive or simple
  const subtotalBeforeTax = subtotal - (cgst + sgst);

  return (
    <div 
      ref={modalContainerRef}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm select-none ${
        isFullscreen ? "p-0" : ""
      }`}
    >
      <div 
        className={`bg-background text-foreground border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen 
            ? "w-screen h-screen rounded-none" 
            : "w-full max-w-7xl h-[90vh]"
        }`}
      >
        {/* Header / Title Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-bold tracking-tight">Review Invoice</h2>
              <p className="text-xs text-muted-foreground">Invoice Reference: {transaction.referenceNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-lg"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          
          {/* Left Panel: Invoice Controls & Info */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border p-6 flex flex-col gap-6 overflow-y-auto shrink-0 bg-card/40">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Invoice Details</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Venture</span>
                  <span className="font-semibold text-primary">{transaction.venture?.name || "Thenam ERP"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{transaction.category || "General"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold">₹{transaction.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Date</span>
                  <span>{new Date(transaction.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    transaction.status === "Sent" 
                      ? "bg-blue-500/10 text-blue-500" 
                      : transaction.status === "Completed"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-amber-500/10 text-amber-500"
                  }`}>
                    {transaction.status || "Draft"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/60 pt-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Send Invoice</h3>
              
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl mb-4">
                <button
                  onClick={() => setSendMethod("email")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
                    sendMethod === "email" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" /> Email
                </button>
                <button
                  onClick={() => setSendMethod("link")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
                    sendMethod === "link" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Link2 className="h-3.5 w-3.5" /> Payment Link
                </button>
              </div>

              {sendMethod === "email" ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="cust-email" className="text-xs text-muted-foreground mb-1 block">Customer Email</Label>
                    <Input 
                      id="cust-email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="client@company.com"
                      className="rounded-xl border-border text-sm"
                    />
                  </div>
                  <Button 
                    className="w-full rounded-xl gap-2 font-medium" 
                    onClick={() => {
                      if (!customerEmail.trim()) return toast.error("Please enter email");
                      toast.success(`Invoice sent to ${customerEmail}`);
                    }}
                  >
                    Send via Email
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {!paymentLink ? (
                    <Button 
                      variant="outline" 
                      className="w-full rounded-xl border-border gap-2" 
                      onClick={handleGenerateLink}
                      disabled={isGeneratingLink}
                    >
                      {isGeneratingLink ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                        </>
                      ) : (
                        "Generate Link"
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Share Link</Label>
                      <div className="flex gap-1.5">
                        <Input 
                          readOnly 
                          value={paymentLink} 
                          className="rounded-xl border-border text-xs flex-1 h-9 bg-muted/50" 
                        />
                        <Button 
                          size="sm" 
                          className="rounded-xl px-3 h-9" 
                          onClick={handleCopyLink}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Document Viewport */}
          <div className="flex-1 flex flex-col bg-zinc-100 dark:bg-zinc-950/20 overflow-hidden relative">
            
            {/* Toolbar */}
            <div className="bg-card border-b border-border px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm shrink-0">
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground font-mono">Page 1 / 1</span>
              </div>
              
              {/* Zoom Controls */}
              <div className="flex items-center gap-1.5 bg-muted p-0.5 rounded-lg border border-border/40">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-md hover:bg-background"
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <button 
                  className="px-2 text-xs font-mono font-bold w-12 text-center" 
                  onClick={handleZoomReset}
                  title="Reset Zoom"
                >
                  {zoom}%
                </button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-md hover:bg-background"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Extra Document Tools */}
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-lg h-8 px-2.5 text-xs border-border gap-1.5"
                  onClick={handleZoomReset}
                >
                  Fit to Screen
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-lg h-8 w-8 border-border"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-lg h-8 w-8 border-border"
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Document Body (Centered & Zoomable) */}
            <div className="flex-1 overflow-auto p-8 flex justify-center items-start min-h-0">
              {loading ? (
                <div className="m-auto flex flex-col items-center gap-3 py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading invoice preview...</p>
                </div>
              ) : error ? (
                <div className="m-auto text-center p-6 border border-border rounded-2xl bg-card max-w-xs">
                  <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold mb-3">{error}</p>
                  <Button size="sm" className="rounded-xl">Retry</Button>
                </div>
              ) : transaction.proofImage ? (
                /* Document Viewer for Uploaded Invoice File */
                <div 
                  style={{
                    width: `${800 * (zoom / 100)}px`,
                    height: `${1130 * (zoom / 100)}px`,
                    transition: "width 0.1s ease, height 0.1s ease",
                    overflow: "visible"
                  }}
                  className="m-auto shadow-2xl rounded-sm overflow-hidden"
                >
                  <div 
                    className="w-[800px] h-[1130px] bg-white border border-zinc-200"
                    style={{
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: "top left"
                    }}
                  >
                    {isPdf(transaction.proofImage) ? (
                      <iframe 
                        src={transaction.proofImage} 
                        className="w-full h-full border-0"
                        title="Invoice PDF"
                      />
                    ) : isImage(transaction.proofImage) ? (
                      <div className="w-full h-full flex items-center justify-center p-2 bg-zinc-50">
                        <img 
                          src={transaction.proofImage} 
                          alt="Invoice Proof" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-zinc-500">
                        <AlertTriangle className="h-10 w-10 text-amber-500 mb-2" />
                        <p className="text-sm font-medium">Document attachment format not previewable.</p>
                        <a 
                          href={transaction.proofImage} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="mt-3 text-xs text-blue-500 hover:underline"
                        >
                          Download Attachment
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Professional A4 Generated Invoice Sheet */
                <div 
                  style={{
                    width: `${800 * (zoom / 100)}px`,
                    height: `${1130 * (zoom / 100)}px`,
                    transition: "width 0.1s ease, height 0.1s ease",
                    overflow: "visible"
                  }}
                  className="m-auto"
                >
                  <div
                    id="print-invoice-area"
                    ref={invoiceDocRef}
                    className="bg-white text-zinc-900 shadow-2xl p-14 flex flex-col justify-between select-text"
                    style={{
                      width: "800px",
                      height: "1130px",
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: "top left",
                      boxSizing: "border-box"
                    }}
                  >
                    {/* Invoice Inner Layout */}
                    <div>
                      {/* Top Branding Section */}
                      <div className="flex justify-between items-start border-b border-zinc-200 pb-8 mb-8">
                        <div className="flex items-center gap-3">
                          <img 
                            src="/logo.png" 
                            alt="Thenam Logo" 
                            className="h-12 w-12 object-contain"
                          />
                          <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-emerald-600">THENAM</h1>
                            <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Software Solutions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <h2 className="text-3xl font-light tracking-widest text-zinc-400">INVOICE</h2>
                          <p className="text-sm font-bold text-zinc-700 mt-1">#{transaction.referenceNumber}</p>
                          <div className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            transaction.status === "Sent" 
                              ? "bg-blue-100 text-blue-800" 
                              : transaction.status === "Completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {transaction.status || "Draft"}
                          </div>
                        </div>
                      </div>

                      {/* Details Meta */}
                      <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
                        <div>
                          <p className="text-xs uppercase text-zinc-400 font-bold tracking-wider mb-2">Billed To</p>
                          <p className="font-bold text-zinc-800 text-base">{transaction.clientName || "Valued Client"}</p>
                          {customerEmail && <p className="text-zinc-500 mt-1">{customerEmail}</p>}
                          <p className="text-zinc-500">Corporate Customer</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase text-zinc-400 font-bold tracking-wider mb-2">From</p>
                          <p className="font-bold text-zinc-800">Thenam Software Solutions</p>
                          <p className="text-zinc-500">Thenam HQ, Tech Park</p>
                          <p className="text-zinc-500">Coimbatore, Tamil Nadu, IN</p>
                          <p className="text-zinc-500">finance@thenam.com</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 border-y border-zinc-100 py-4 mb-8 text-sm">
                        <div>
                          <p className="text-xs text-zinc-400 font-semibold mb-1">Invoice Date</p>
                          <p className="font-semibold text-zinc-700">{new Date(transaction.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400 font-semibold mb-1">Due Date</p>
                          <p className="font-semibold text-zinc-700">
                            {new Date(new Date(transaction.date).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-zinc-400 font-semibold mb-1">Payment Method</p>
                          <p className="font-semibold text-zinc-700">{transaction.paymentMethod || "Bank Transfer"}</p>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="mb-10">
                        <table className="w-full text-sm text-left">
                          <thead>
                            <tr className="border-b border-zinc-200 text-xs font-bold uppercase text-zinc-400">
                              <th className="py-3">Description</th>
                              <th className="py-3 text-center w-16">Qty</th>
                              <th className="py-3 text-right w-28">Unit Price</th>
                              <th className="py-3 text-right w-28">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-zinc-100 text-zinc-800">
                              <td className="py-4">
                                <p className="font-bold text-zinc-800">{transaction.reason || "Software Development & Consulting Services"}</p>
                                {transaction.description && <p className="text-xs text-zinc-500 mt-1">{transaction.description}</p>}
                              </td>
                              <td className="py-4 text-center">1</td>
                              <td className="py-4 text-right">₹{subtotalBeforeTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="py-4 text-right font-semibold">₹{subtotalBeforeTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Calculations Summary */}
                      <div className="flex justify-end mb-10">
                        <div className="w-72 space-y-2 text-sm text-zinc-600">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{subtotalBeforeTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>CGST (9%)</span>
                            <span>₹{cgst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>SGST (9%)</span>
                            <span>₹{sgst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between border-t border-zinc-200 pt-3 text-base text-zinc-900 font-extrabold">
                            <span>Total Due</span>
                            <span className="text-emerald-600">₹{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Sticky Terms and Bank Info */}
                    <div className="border-t border-zinc-100 pt-6 text-xs text-zinc-400">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="font-bold uppercase tracking-wider text-zinc-500 mb-2">Payment Info</p>
                          <p className="font-medium text-zinc-600">Bank Transfer:</p>
                          <p>Account Name: Thenam Software Solutions</p>
                          <p>A/C Number: 50200012345678 (HDFC Bank)</p>
                          <p>IFSC Code: HDFC0001234</p>
                        </div>
                        <div>
                          <p className="font-bold uppercase tracking-wider text-zinc-500 mb-2">Terms & Notes</p>
                          <p>Please refer to the invoice reference number when making payments.</p>
                          <p className="mt-1">For any queries, contact billing@thenam.com.</p>
                          <p className="font-bold text-emerald-600 mt-2">Thank you for your business!</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="bg-card border-t border-border px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="rounded-xl h-10 border-border gap-2 font-medium"
                  onClick={() => onEdit(transaction)}
                >
                  <Edit className="h-4 w-4" /> Edit Invoice
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="rounded-xl h-10 border-border"
                  onClick={handleDownload}
                >
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-xl h-10 border-border"
                  onClick={handlePrint}
                >
                  Print
                </Button>
                {transaction.status !== "Sent" && transaction.status !== "Completed" && (
                  <Button 
                    className="rounded-xl h-10 gradient-emerald text-white font-medium"
                    onClick={handleMarkAsSent}
                    disabled={updateTransactionMutation.isPending}
                  >
                    {updateTransactionMutation.isPending ? "Marking..." : "Mark as Sent"}
                  </Button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Print CSS Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-invoice-area, #print-invoice-area * {
            visibility: visible !important;
          }
          #print-invoice-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            transform: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
