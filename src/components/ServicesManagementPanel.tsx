import React, { useState, useMemo, useRef } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  GripVertical, 
  Edit2, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  Zap, 
  Clock, 
  Upload, 
  X, 
  Check, 
  Star,
  AlertCircle,
  MoreVertical,
  ChevronDown
} from "lucide-react";
import { motion, Reorder, AnimatePresence, useDragControls } from "motion/react";
import { SalonService } from "../types";

interface ServicesManagementPanelProps {
  services: SalonService[];
  onUpdate: (services: SalonService[]) => void;
  onNotify: (msg: string) => void;
}

export const ServicesManagementPanel = ({ 
  services, 
  onUpdate, 
  onNotify 
}: ServicesManagementPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [editingService, setEditingService] = useState<SalonService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => {
    const cats = new Set(services.map(s => s.category).filter(Boolean));
    return ["All", ...Array.from(cats)];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.desc || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "All" || s.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchTerm, filterCategory]);

  const handleUpdateService = (updated: SalonService) => {
    const newServices = services.map(s => s.id === updated.id ? updated : s);
    onUpdate(newServices);
    onNotify(`Updated ${updated.name}`);
  };

  const handleAddService = () => {
    const newId = `s-${Date.now()}`;
    const newServ: SalonService = {
      id: newId,
      name: "New Luxury Treatment",
      price: "1500",
      category: "Hair",
      duration: "45 min",
      desc: "Experience our premium signature treatment.",
      onlineBooking: true,
      showPrice: true,
      status: 'available',
      isFeatured: false
    };
    onUpdate([newServ, ...services]);
    setEditingService(newServ);
    setIsModalOpen(true);
    onNotify("New service template added");
  };

  const handleDeleteService = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      onUpdate(services.filter(s => s.id !== id));
      onNotify("Service removed successfully");
    }
  };

  const handleDuplicate = (source: SalonService) => {
    const clone: SalonService = {
      ...source,
      id: `s-${Date.now()}`,
      name: `${source.name} (Copy)`,
      isFeatured: false // Reset featured status for clones
    };
    onUpdate([clone, ...services]);
    onNotify("Service duplicated");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingService) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingService({ ...editingService, img: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveEditing = () => {
    if (editingService) {
      // Check featured limit (max 6)
      if (editingService.isFeatured) {
        const featuredCount = services.filter(s => s.isFeatured && s.id !== editingService.id).length;
        if (featuredCount >= 6) {
          onNotify("Limit reached: max 6 featured services allowed");
          return;
        }
      }
      
      const newServices = services.map(s => s.id === editingService.id ? editingService : s);
      onUpdate(newServices);
      setIsModalOpen(false);
      setEditingService(null);
      onNotify("Settings saved");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080808] text-white">
      {/* TOP BAR */}
      <div className="p-6 border-b border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-[#D4AF37] rounded-full" />
              Services Management
            </h2>
            <p className="text-xs text-gray-500 mt-1">Configure your treatments and their online visibility</p>
          </div>
          <button 
            onClick={handleAddService}
            className="w-full flex-shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c29e2f] text-black text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#D4AF37]/10"
          >
            <Plus className="w-4 h-4" />
            Add New Service
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#D4AF37] transition-colors" />
            <input 
              type="text" 
              placeholder="Search services by name or description..." 
              className="w-full bg-white/[0.03] border border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/[0.05] rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-white/[0.03] border border-white/10 rounded-xl p-1 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${filterCategory === cat ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN LIST */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <Reorder.Group 
          axis="y" 
          values={filteredServices} 
          onReorder={(newOrder) => onUpdate(newOrder)}
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredServices.map(serv => (
              <ServiceListItem 
                key={serv.id} 
                serv={serv} 
                onEdit={() => { setEditingService(serv); setIsModalOpen(true); }}
                onDuplicate={() => handleDuplicate(serv)}
                onDelete={() => handleDeleteService(serv.id, serv.name)}
                onToggleStatus={(status) => handleUpdateService({ ...serv, status })}
                onToggleOnline={(online) => handleUpdateService({ ...serv, onlineBooking: online })}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {filteredServices.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500 space-y-4">
            <div className="p-4 bg-white/[0.02] rounded-full border border-white/5">
              <Search className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-sm">No services found matching your criteria</p>
            <button onClick={() => { setSearchTerm(""); setFilterCategory("All"); }} className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest hover:underline">Clear all filters</button>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && editingService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* MODAL HEADER */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Edit Treatment</h3>
                  <p className="text-xs text-gray-500">Customize display settings and booking rules</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* MODAL CONTENT */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
                {/* Visual Identity */}
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37] opacity-60">Visual & Identification</h4>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-32 h-32 shrink-0 group relative cursor-pointer overflow-hidden rounded-xl bg-black border border-white/5" onClick={() => fileInputRef.current?.click()}>
                      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
                      {editingService.img ? (
                        <img src={editingService.img} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                          <Upload className="w-6 h-6 mb-2" />
                          <span className="text-[10px] uppercase font-bold text-center px-2">Upload Photo</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                      {editingService.img && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingService({...editingService, img: ''}); }}
                          className="absolute top-1 right-1 p-1 bg-black/60 rounded-lg text-white hover:bg-red-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-bold">Service Name</label>
                        <input 
                          type="text" 
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50" 
                          value={editingService.name}
                          onChange={e => setEditingService({...editingService, name: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-bold">Category</label>
                          <select 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 appearance-none"
                            value={editingService.category}
                            onChange={e => setEditingService({...editingService, category: e.target.value})}
                          >
                            {["Hair", "Beard", "Skin", "Facial", "Spa", "Tattoo", "Bridal", "Nails", "Other"].map(cat => (
                              <option key={cat} value={cat} className="bg-[#111]">{cat}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-bold">Duration</label>
                          <select 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 appearance-none"
                            value={editingService.duration}
                            onChange={e => setEditingService({...editingService, duration: e.target.value})}
                          >
                            {["15 min", "30 min", "45 min", "1 hour", "1.5 hours", "2 hours", "3 hours", "Full Day"].map(dur => (
                              <option key={dur} value={dur} className="bg-[#111]">{dur}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing & Visibility */}
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37] opacity-60">Pricing & Visibility</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">₹</div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Base Rate</label>
                          <input 
                            type="text" 
                            className="bg-transparent text-sm font-mono focus:outline-none w-24" 
                            value={editingService.price} 
                            onChange={e => setEditingService({...editingService, price: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-gray-600">Show price</span>
                        <button 
                          onClick={() => setEditingService({...editingService, showPrice: !editingService.showPrice})}
                          className={`w-10 h-5 rounded-full relative transition-colors ${editingService.showPrice ? 'bg-[#D4AF37]' : 'bg-gray-800'}`}
                        >
                          <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${editingService.showPrice ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingService.isFeatured ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/5 text-gray-600'}`}>
                          <Star className={`w-5 h-5 ${editingService.isFeatured ? 'fill-[#D4AF37]' : ''}`} />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Signature Service</label>
                          <p className="text-[10px] text-gray-600">Flash on homepage (Max 6)</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setEditingService({...editingService, isFeatured: !editingService.isFeatured})}
                        className={`w-10 h-5 rounded-full relative transition-colors ${editingService.isFeatured ? 'bg-[#D4AF37]' : 'bg-gray-800'}`}
                      >
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${editingService.isFeatured ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Booking & Status */}
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37] opacity-60">Status & Mechanics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-4">
                      {/* Availability Radios */}
                      <div className="flex p-1 bg-black border border-white/10 rounded-xl">
                        {(['available', 'unavailable', 'hidden'] as const).map(status => (
                          <button
                            key={status}
                            onClick={() => setEditingService({...editingService, status})}
                            className={`flex-1 py-2 text-[10px] uppercase font-bold rounded-lg transition-all ${editingService.status === status ? 'bg-white/[0.08] text-white' : 'text-gray-600 hover:text-gray-400'}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>

                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Zap className={`w-5 h-5 ${editingService.onlineBooking ? 'text-blue-400 fill-blue-400/20' : 'text-gray-600'}`} />
                          <span className="text-xs font-semibold">Enable Instant Booking</span>
                        </div>
                        <button 
                          onClick={() => setEditingService({...editingService, onlineBooking: !editingService.onlineBooking})}
                          className={`w-10 h-5 rounded-full relative transition-colors ${editingService.onlineBooking ? 'bg-blue-500' : 'bg-gray-800'}`}
                        >
                          <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${editingService.onlineBooking ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-2">
                       <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider">Description</label>
                       <textarea 
                        className="w-full bg-transparent text-xs text-gray-400 outline-none resize-none h-24"
                        placeholder="Detailed view of the service... (150 chars max)"
                        maxLength={150}
                        value={editingService.desc}
                        onChange={e => setEditingService({...editingService, desc: e.target.value})}
                       />
                       <div className="text-[10px] text-right font-mono text-gray-700">{editingService.desc.length}/150</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="p-6 border-t border-white/5 bg-black/40 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveEditing}
                  className="px-8 py-2 bg-[#D4AF37] hover:bg-[#c29e2f] text-black text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#D4AF37]/20"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ServiceListItemProps {
  key?: React.Key | string | number | null;
  serv: SalonService;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleStatus: (status: string) => void;
  onToggleOnline: (online: boolean) => void;
}

const ServiceListItem = ({ 
  serv, 
  onEdit, 
  onDuplicate, 
  onDelete,
  onToggleStatus,
  onToggleOnline
}: ServiceListItemProps) => {
  const controls = useDragControls();

  const statusColor = {
    available: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    unavailable: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    hidden: "text-gray-500 bg-white/5 border-white/5"
  }[serv.status || 'available'];

  return (
    <Reorder.Item
      value={serv}
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative bg-[#111] border rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 transition-all hover:bg-[#141414] ${serv.status === 'hidden' ? 'opacity-50 grayscale border-white/5' : 'border-white/10 hover:border-[#D4AF37]/30'}`}
    >
      {/* DRAG HANDLE */}
      <div 
        onPointerDown={(e) => controls.start(e)}
        className="shrink-0 p-1 cursor-grab active:cursor-grabbing text-gray-700 hover:text-[#D4AF37] transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* SERVICE IMAGE */}
      <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-black border border-white/5 relative shadow-inner">
        {serv.img ? (
          <img src={serv.img} alt={serv.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
             <span className="text-[10px] text-gray-700 font-mono">NO IMAGE</span>
          </div>
        )}
        {serv.isFeatured && (
          <div className="absolute top-1 right-1">
            <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
          </div>
        )}
      </div>

      {/* SERVICE INFO */}
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="text-[9px] uppercase tracking-wider font-mono text-[#D4AF37]/80 bg-[#D4AF37]/5 px-2 py-0.5 rounded border border-[#D4AF37]/10">{serv.category}</span>
             <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${statusColor}`}>
               {serv.status || 'available'}
             </span>
          </div>
          <h3 className="text-sm font-semibold text-white truncate max-w-[200px]">{serv.name}</h3>
          <div className="flex items-center gap-3 mt-1.5 overflow-hidden">
            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono shrink-0">
               <Clock className="w-3 h-3" />
               {serv.duration || "N/A"}
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-mono shrink-0 ${serv.showPrice === false ? 'text-gray-700 line-through' : 'text-[#D4AF37]'}`}>
               <span>₹</span>
               {serv.price}
            </div>
            {serv.onlineBooking ? (
              <Zap className="w-3 h-3 text-blue-400 fill-blue-400/20" title="Online Booking Enabled" />
            ) : (
              <Zap className="w-3 h-3 text-gray-700" title="Online Booking Disabled" />
            )}
            <p className="text-[10px] text-gray-600 truncate border-l border-white/10 pl-3">
              {serv.desc || "No description provided"}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-1 opacity-0 sm:group-hover:opacity-100 transition-opacity">
           <button 
             onClick={onDuplicate}
             className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
             title="Duplicate"
           >
             <Copy className="w-4 h-4" />
           </button>
           <button 
             onClick={onEdit}
             className="p-2 text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-all"
             title="Edit Detailed Settings"
           >
             <Edit2 className="w-4 h-4" />
           </button>
           <div className="w-px h-4 bg-white/5 mx-1" />
           <button 
             onClick={onDelete}
             className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
             title="Delete Permanently"
           >
             <Trash2 className="w-4 h-4" />
           </button>
        </div>
      </div>
    </Reorder.Item>
  );
};
