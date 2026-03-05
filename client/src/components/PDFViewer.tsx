import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Download } from "lucide-react";
import "./pdf-viewer.css";

// Configure PDF.js worker - use CDN version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

interface Field {
  value: string;
  confidence?: string;
  boundingBox?: BoundingBox;
}

interface PDFViewerProps {
  url: string;
  fields?: Record<string, Field>;
  selectedField?: string | null;
  onFieldClick?: (fieldKey: string) => void;
}

const FIELD_COLORS: Record<string, string> = {
  companyName: "#fde047", // Yellow
  regNo: "#86efac", // Green
  incDate: "#93c5fd", // Blue
  address: "#fda4af", // Pink
  natureOfBusiness: "#c4b5fd", // Purple
  paidUpCapital: "#fdba74", // Orange
  netWorth: "#5eead4", // Teal
  default: "#fbbf24", // Amber
};

export default function PDFViewer({
  url,
  fields = {},
  selectedField = null,
  onFieldClick,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Debug: log the PDF URL
  useEffect(() => {
    console.log("[PDFViewer] Loading PDF from URL:", url);
  }, [url]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error("PDF load error:", error);
    setError(error.message || "Failed to load PDF");
    setLoading(false);
  }

  // Auto-scroll to selected field
  useEffect(() => {
    if (selectedField && fields[selectedField]?.boundingBox) {
      const bbox = fields[selectedField].boundingBox!;
      const pageEl = pageRefs.current.get(bbox.page);
      if (pageEl) {
        pageEl.scrollIntoView({ behavior: "smooth", block: "center" });
        setPageNumber(bbox.page);
      }
    }
  }, [selectedField, fields]);

  const renderBoundingBox = (
    fieldKey: string,
    field: Field,
    pageNum: number,
  ) => {
    const bbox = field.boundingBox;
    if (!bbox || bbox.page !== pageNum) return null;

    const color = FIELD_COLORS[fieldKey] || FIELD_COLORS.default;
    const isSelected = selectedField === fieldKey;

    return (
      <div
        key={`bbox-${fieldKey}`}
        className="absolute cursor-pointer transition-all group"
        style={{
          left: `${bbox.x}%`,
          top: `${bbox.y}%`,
          width: `${bbox.width}%`,
          height: `${bbox.height}%`,
          backgroundColor: isSelected ? `${color}80` : `${color}40`,
          border: isSelected ? `3px solid ${color}` : `2px solid ${color}60`,
          boxShadow: isSelected ? `0 0 20px ${color}80` : `0 0 8px ${color}40`,
          zIndex: isSelected ? 20 : 10,
        }}
        onClick={() => onFieldClick?.(fieldKey)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${color}60`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isSelected
            ? `${color}80`
            : `${color}40`;
        }}
      >
        {/* Tooltip on hover */}
        <div className="hidden group-hover:block absolute -top-16 left-0 bg-slate-900 text-white text-xs p-2 rounded shadow-lg z-50 min-w-[200px]">
          <div className="font-bold mb-1">{fieldKey}</div>
          <div className="text-slate-300">{field.value}</div>
          {field.confidence && (
            <div className="text-slate-400 text-[10px] mt-1">
              Confidence: {field.confidence}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Toolbar */}
      <div className="bg-slate-800 p-2 flex items-center justify-between text-white border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono">
            Page {pageNumber} of {numPages}
          </span>
          <div className="h-4 w-px bg-slate-600" />
          <span className="text-xs">{Math.round(scale * 100)}%</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 text-white hover:bg-slate-700 p-0"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 text-white hover:bg-slate-700 p-0"
            onClick={() => setScale((s) => Math.min(2.0, s + 0.1))}
            disabled={scale >= 2.0}
          >
            <ZoomIn className="w-3 h-3" />
          </Button>
          <div className="h-4 w-px bg-slate-600 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-white hover:bg-slate-700 text-xs"
            onClick={() => window.open(url, "_blank")}
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
        </div>
      </div>

      {/* PDF Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-slate-800/50 relative"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-white text-sm">Loading PDF...</p>
            </div>
          </div>
        )}

        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          className="flex flex-col items-center gap-4 p-8"
          loading={null}
          error={
            <div className="flex items-center justify-center h-full text-white p-8">
              <div className="text-center max-w-md">
                <p className="text-red-400 mb-2">Failed to load PDF</p>
                <p className="text-sm text-slate-400 mb-4">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="text-xs"
                >
                  Retry
                </Button>
              </div>
            </div>
          }
        >
          {Array.from(new Array(numPages), (el, index) => {
            const pageNum = index + 1;
            return (
              <div
                key={`page_${pageNum}`}
                ref={(el) => {
                  if (el) pageRefs.current.set(pageNum, el);
                }}
                className="relative shadow-2xl bg-white"
                style={{ marginBottom: "20px" }}
              >
                <Page
                  pageNumber={pageNum}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                />

                {/* Bounding Box Overlays */}
                <div className="absolute inset-0 pointer-events-auto">
                  {Object.entries(fields).map(([fieldKey, field]) =>
                    renderBoundingBox(fieldKey, field, pageNum),
                  )}
                </div>
              </div>
            );
          })}
        </Document>
      </div>
    </div>
  );
}
