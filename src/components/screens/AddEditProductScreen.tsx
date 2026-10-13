import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from '../Icons';
import { useAuth } from '../../context/AuthContext';
import { Screen } from '../../types';
import AIIntelligenceOverlay from '../AIIntelligenceOverlay';
import AIPipelineHistoryModal from '../AIPipelineHistoryModal';

const MANDATORY_ANGLES = [
  "Front Full", "Back Full", "Left Side", "Right Side", "Close-up Fabric",
  "Collar/Neckline", "Sleeve/Cuff", "Hemline/Bottom", "Brand Tag/Label", "Styling/Lifestyle"
];

export default function AddEditProductScreen({ setScreen, productId }: { setScreen: (s: Screen) => void, productId?: string }) {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Storage & manual preference check
  const [aiEnabled, setAiEnabled] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem("aiAutoFillEnabled");
    if (saved === "false") {
      setAiEnabled(false);
    }
  }, []);

  // Form States
  const [images, setImages] = useState<string[]>(Array(10).fill(''));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // AI Data & Overlay state
  const [showAIOverlay, setShowAIOverlay] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  // Editable Form fields (pre-filled by Stage 13)
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    subCategory: '',
    mrp: 0,
    currentPrice: 0,
    discount: '0%',
    stock: 10,
    description: '',
    fabric: '',
    primaryColor: '',
    pattern: '',
    fit: '',
    care: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const newImages = [...images];
        newImages[activeImageIndex] = base64;
        setImages(newImages);
        
        // Trigger AI overlay if AI auto-fill is enabled and it's the front image
        if (activeImageIndex === 0 && aiEnabled) {
          setShowAIOverlay(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIComplete = (data: any) => {
    setAiData(data);
    setSessionId(data.sessionId);
    setShowAIOverlay(false);

    // Populate editable draft state
    setFormData({
      name: data.aiSummary?.seoTitle || data.productSearch?.productName || "Garment Product",
      brand: data.productSearch?.brand || "InStore Look",
      category: data.productDetection?.category || "Apparel",
      subCategory: data.productDetection?.subCategory || "Fashion",
      mrp: data.productSearch?.mrp || 1999,
      currentPrice: data.productSearch?.currentPrice || 1499,
      discount: data.productSearch?.discount || "25%",
      stock: 10,
      description: data.aiSummary?.summary || "Premium quality garment.",
      fabric: data.materialAnalysis?.estimatedComposition || "Cotton Blend",
      primaryColor: data.visualAnalysis?.primaryColor || "Black",
      pattern: data.visualAnalysis?.pattern || "Solid",
      fit: data.visualAnalysis?.fit || "Regular",
      care: data.materialAnalysis?.careInstructions || "Machine wash cold"
    });
  };

  const handleRegenerateSection = async (section: string) => {
    try {
      const res = await fetch('/api/ai/regenerate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, currentData: formData })
      });
      const data = await res.json();
      if (data.updatedSection) {
        if (section === 'titleDescription') {
          setFormData(prev => ({
            ...prev,
            name: data.updatedSection.seoTitle || prev.name,
            description: data.updatedSection.summary || prev.description
          }));
        } else if (section === 'pricing') {
          setFormData(prev => ({
            ...prev,
            mrp: data.updatedSection.mrp || prev.mrp,
            currentPrice: data.updatedSection.currentPrice || prev.currentPrice
          }));
        }
      }
    } catch (e) {
      console.error("Regeneration failed", e);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        name: formData.name || "Untitled Garment",
        brand: formData.brand,
        category: formData.category,
        price: formData.currentPrice,
        mrp: formData.mrp,
        discount: parseFloat(formData.discount) || 0,
        stock: formData.stock,
        description: formData.description,
        images,
        premiumScore: aiData?.socialProof?.popularityScore || 88,
        aiData
      };

      const res = await fetch(productId ? `/api/products/${productId}` : '/api/products', {
        method: productId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': authUser?.id || ''
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setScreen('inventory');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const AISuggestedBadge = () => (
    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-[#0d7d6f] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full shadow-2xs">
      <Icons.Sparkles size={10} /> AI Suggested — tap to edit
    </span>
  );

  return (
    <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} className="absolute inset-0 z-[100] bg-[#F7F7FA] dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="px-5 h-14 bg-white dark:bg-slate-800 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen('inventory')} className="p-1 -ml-2 text-slate-500 hover:text-slate-700">
            <Icons.Close size={24} />
          </button>
          <h1 className="text-base font-black text-[#1A1A1A] dark:text-white">
            {aiData ? 'Stage 13 — Product Draft Review' : 'Add New Garment'}
          </h1>
        </div>

        {aiData && (
          <button 
            onClick={() => setShowAuditModal(true)} 
            className="flex items-center gap-1 text-xs font-black text-[#0d7d6f] bg-teal-50 dark:bg-teal-950/60 px-3 py-1.5 rounded-xl border border-teal-200 active:scale-95 transition-all"
          >
            <Icons.Sparkles size={14} />
            <span>AI Audit Log</span>
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-28 space-y-5">

        {/* Garment Image Upload Slot Grid */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Garment Photo Intake</h3>
          <div className="grid grid-cols-5 gap-2">
            {MANDATORY_ANGLES.map((angle, idx) => {
              const hasImg = !!images[idx];
              return (
                <button
                  key={angle}
                  onClick={() => { setActiveImageIndex(idx); fileInputRef.current?.click(); }}
                  className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-1 relative overflow-hidden transition-all ${
                    hasImg ? 'border-[#0d7d6f] bg-slate-900' : 'border-dashed border-slate-200 dark:border-slate-700 hover:border-[#0d7d6f]'
                  }`}
                >
                  {hasImg ? (
                    <img src={images[idx]} className="w-full h-full object-cover rounded-xl" alt={angle} />
                  ) : (
                    <>
                      <Icons.AddAPhoto size={18} className="text-slate-400 mb-1" />
                      <span className="text-[8px] font-bold text-slate-400 text-center leading-tight">{angle}</span>
                    </>
                  )}
                  {idx === 0 && (
                    <span className="absolute top-1 right-1 bg-[#0d7d6f] text-white text-[7px] font-black px-1 rounded-sm uppercase">AI Trigger</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload Banner if no AI data yet */}
        {!aiData && (
          <div className="bg-gradient-to-br from-[#0d7d6f] to-teal-900 p-6 rounded-3xl text-white shadow-xl text-center relative overflow-hidden">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <Icons.AutoAwesome size={32} />
            </div>
            <h2 className="text-xl font-black mb-2">Upload Front Image</h2>
            <p className="text-xs font-medium text-teal-100 mb-6 max-w-xs mx-auto">
              Our Enterprise AI pipeline will auto-fill your listing draft across 13 stages of fashion intelligence.
            </p>
            <button 
              onClick={() => { setActiveImageIndex(0); fileInputRef.current?.click(); }} 
              className="w-full h-12 bg-white text-[#0d7d6f] rounded-xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
            >
              Select Photo & Trigger AI
            </button>
            <button
              onClick={() => setAiData({})}
              className="w-full mt-3 h-10 text-xs font-black uppercase tracking-widest text-white/80 border border-white/30 rounded-xl hover:bg-white/10"
            >
              Continue Manually
            </button>
          </div>
        )}

        {/* Stage 13 Interactive Product Draft Review Screen */}
        {aiData && (
          <div className="space-y-4">
            
            {/* Section 1: Title & Description */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <AISuggestedBadge />
                <button 
                  onClick={() => handleRegenerateSection('titleDescription')}
                  className="text-xs font-black text-[#0d7d6f] flex items-center gap-1 hover:underline"
                >
                  <Icons.Refresh size={12} /> Regenerate Copy
                </button>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Product Title</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 text-sm font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[#1A1A1A] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Product Narrative Description</label>
                <textarea 
                  rows={3}
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[#1A1A1A] dark:text-white"
                />
              </div>
            </div>

            {/* Section 2: Market Positioning & Pricing */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <AISuggestedBadge />
                <button 
                  onClick={() => handleRegenerateSection('pricing')}
                  className="text-xs font-black text-[#0d7d6f] flex items-center gap-1 hover:underline"
                >
                  <Icons.Refresh size={12} /> Recalculate Band
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Estimated MRP (₹)</label>
                  <input 
                    type="number" 
                    value={formData.mrp} 
                    onChange={e => setFormData({ ...formData, mrp: Number(e.target.value) })}
                    className="w-full p-3 text-sm font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[#1A1A1A] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Suggested Sale Price (₹)</label>
                  <input 
                    type="number" 
                    value={formData.currentPrice} 
                    onChange={e => setFormData({ ...formData, currentPrice: Number(e.target.value) })}
                    className="w-full p-3 text-sm font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[#0d7d6f]"
                  />
                </div>
              </div>

              {aiData.productSearch?.priceReasoning && (
                <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-800 rounded-xl text-xs font-medium text-teal-800 dark:text-teal-200 flex gap-2 items-center">
                  <Icons.Info size={16} className="shrink-0 text-[#0d7d6f]" />
                  <span>{aiData.productSearch.priceReasoning}</span>
                </div>
              )}
            </div>

            {/* Section 3: Visual & Material Specs */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <AISuggestedBadge />

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Fabric Blend</label>
                  <input 
                    type="text" 
                    value={formData.fabric} 
                    onChange={e => setFormData({ ...formData, fabric: e.target.value })}
                    className="w-full p-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Primary Color</label>
                  <input 
                    type="text" 
                    value={formData.primaryColor} 
                    onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-full p-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Style & Occasion Tags */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Style & Occasion Tags</h3>
              <div className="flex flex-wrap gap-2">
                {aiData.aiSummary?.recommendedOccasions?.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-teal-50 text-[#0d7d6f] border border-teal-200 rounded-full text-xs font-bold">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        )}

        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />

        {/* Stage 13 Final Confirmation & Publish */}
        {aiData && (
          <div className="fixed bottom-0 inset-x-0 p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-50 flex gap-3">
            <button 
              onClick={handleSave} 
              disabled={loading} 
              className="flex-1 h-14 bg-gradient-to-r from-[#0d7d6f] to-teal-800 hover:from-[#0a6659] hover:to-teal-900 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Icons.Check size={20} strokeWidth={3} />
              {loading ? 'CONFIRMING & PUBLISHING...' : 'CONFIRM & PUBLISH DRAFT'}
            </button>
          </div>
        )}
      </main>

      {/* AI Processing Overlay */}
      <AnimatePresence>
        {showAIOverlay && (
          <AIIntelligenceOverlay 
            imageBase64={images[0]} 
            onClose={() => setShowAIOverlay(false)} 
            onComplete={handleAIComplete} 
            onSwitchToManual={() => {
              setShowAIOverlay(false);
              setAiEnabled(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* AI Pipeline History Audit Modal */}
      <AnimatePresence>
        {showAuditModal && (
          <AIPipelineHistoryModal 
            sessionId={sessionId} 
            onClose={() => setShowAuditModal(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
