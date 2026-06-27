import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { QRCodeSVG } from 'qrcode.react';
export interface QrCode {
  id: string;
  name: string;
  url: string;
  type: 'Dynamic' | 'Static';
  scans: number;
  state: 'Active' | 'Paused';
  createdAt: string;
  editedAt: string;
  isFavorite?: boolean;
  isScheduled?: boolean;
  folderId?: string;
}
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Folder, 
  Filter, 
  ChevronDown, 
  List, 
  Grid, 
  ChevronLeft, 
  ChevronRight,
  QrCode as QrCodeIcon,
  MoreVertical,
  Star,
  ArrowLeft,
  X,
  Trash2,
  FolderPlus,
  Eye,
  Edit2,
  Download
} from 'lucide-react';
import './Dashboard.css';

type Tab = 'All' | 'Static' | 'Dynamic' | 'Favorites' | 'Scheduled';
type SortOption = 'Most recent' | 'Name' | 'Scans';
type ViewMode = 'list' | 'grid';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core Data State
  const [qrCodesData, setQrCodesData] = useState<QrCode[]>([]);
  const [folders, setFolders] = useState<{id: string, name: string}[]>([]);
  
  // Navigation State
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortBy, setSortBy] = useState<SortOption>('Most recent');
  const [showVisits, setShowVisits] = useState(true);
  
  // Folder Creation State
  const [folderSearch, setFolderSearch] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Modal State
  const [isAddItemsModalOpen, setIsAddItemsModalOpen] = useState(false);
  const [isBulkMoveModalOpen, setIsBulkMoveModalOpen] = useState(false);

  // Selection State
  const [selectedQrCodes, setSelectedQrCodes] = useState<string[]>([]);

  // Folder Rename State
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');

  // QR Code Modals State
  const [viewQrId, setViewQrId] = useState<string | null>(null);
  const [renameQrId, setRenameQrId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');

  // Selection Handlers
  const toggleSelection = (qrId: string) => {
    setSelectedQrCodes(prev => 
      prev.includes(qrId) ? prev.filter(id => id !== qrId) : [...prev, qrId]
    );
  };

  const handleSelectAll = (checked: boolean, pageData: QrCode[]) => {
    if (checked) {
      const pageIds = pageData.map(qr => qr.id);
      setSelectedQrCodes(prev => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = new Set(pageData.map(qr => qr.id));
      setSelectedQrCodes(prev => prev.filter(id => !pageIds.has(id)));
    }
  };

  const clearSelection = () => setSelectedQrCodes([]);

  const handleCreateFolder = async () => {
    if (newFolderName.trim() && user && db) {
      const folderName = newFolderName.trim();
      const tempId = Date.now().toString();
      setFolders([...folders, { id: tempId, name: folderName }]);
      setNewFolderName('');
      setIsCreatingFolder(false);

      try {
        const docRef = await addDoc(collection(db, 'folders'), {
          name: folderName,
          userId: user.id,
          createdAt: new Date().toISOString()
        });
        setFolders(prev => prev.map(f => f.id === tempId ? { ...f, id: docRef.id } : f));
      } catch (err) {
        console.error("Failed to create folder", err);
        setFolders(prev => prev.filter(f => f.id !== tempId));
      }
    } else if (newFolderName.trim() && !db) {
       // Demo mode
      setFolders([...folders, { id: Date.now().toString(), name: newFolderName.trim() }]);
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    setQrCodesData(prev => prev.map(qr => qr.folderId === folderId ? { ...qr, folderId: undefined } : qr));
    setFolders(prev => prev.filter(f => f.id !== folderId));
    if (selectedFolderId === folderId) setSelectedFolderId(null);

    if (db) {
       try {
         await deleteDoc(doc(db, 'folders', folderId));
         // Optional: Batch update to remove folderId from QRs
         const batch = writeBatch(db);
         qrCodesData.filter(qr => qr.folderId === folderId).forEach(qr => {
            batch.update(doc(db, 'qr_codes', qr.id), { folderId: null });
         });
         await batch.commit();
       } catch(err) {
         console.error("Failed to delete folder", err);
       }
    }
  };

  const saveRenameFolder = async (folderId: string) => {
    const newName = editFolderName.trim();
    if (newName) {
      setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: newName } : f));
      if (db) {
         try {
            await updateDoc(doc(db, 'folders', folderId), { name: newName });
         } catch(err) {
            console.error("Failed to rename folder", err);
         }
      }
    }
    setEditingFolderId(null);
  };

  const handleAddQrToFolder = async (qrId: string) => {
    if (selectedFolderId) {
      setQrCodesData(prev => prev.map(qr => qr.id === qrId ? { ...qr, folderId: selectedFolderId } : qr));
      if (db) {
         try {
            await updateDoc(doc(db, 'qr_codes', qrId), { folderId: selectedFolderId });
         } catch (err) {
            console.error("Failed to update QR folder", err);
         }
      }
    }
  };

  const handleRemoveQrFromFolder = async (qrId: string) => {
    setQrCodesData(prev => prev.map(qr => qr.id === qrId ? { ...qr, folderId: undefined } : qr));
    if (db) {
       try {
          await updateDoc(doc(db, 'qr_codes', qrId), { folderId: null });
       } catch (err) {
          console.error("Failed to remove QR from folder", err);
       }
    }
  };

  const toggleFavorite = async (qrId: string) => {
    const qr = qrCodesData.find(q => q.id === qrId);
    if (!qr) return;
    const newFav = !qr.isFavorite;
    setQrCodesData(prev => prev.map(qr => qr.id === qrId ? { ...qr, isFavorite: newFav } : qr));
    
    if (db) {
       try {
          await updateDoc(doc(db, 'qr_codes', qrId), { isFavorite: newFav });
       } catch (err) {
          console.error("Failed to update favorite", err);
       }
    }
  };

  // Bulk Handlers
  const handleBulkDelete = async () => {
    const idsToDelete = [...selectedQrCodes];
    setQrCodesData(prev => prev.filter(qr => !idsToDelete.includes(qr.id)));
    clearSelection();

    if (db) {
       try {
         const batch = writeBatch(db);
         idsToDelete.forEach(id => {
            batch.delete(doc(db, 'qr_codes', id));
         });
         await batch.commit();
       } catch(err) {
         console.error("Failed to bulk delete", err);
       }
    }
  };

  const handleBulkFavorite = async () => {
    const idsToUpdate = [...selectedQrCodes];
    const allSelectedAreFavorites = idsToUpdate.every(id => {
      const qr = qrCodesData.find(q => q.id === id);
      return qr ? qr.isFavorite : false;
    });
    
    const newFavStatus = !allSelectedAreFavorites;

    setQrCodesData(prev => prev.map(qr => {
      if (idsToUpdate.includes(qr.id)) {
        return { ...qr, isFavorite: newFavStatus };
      }
      return qr;
    }));

    if (db) {
       try {
         const batch = writeBatch(db);
         idsToUpdate.forEach(id => {
            batch.update(doc(db, 'qr_codes', id), { isFavorite: newFavStatus });
         });
         await batch.commit();
       } catch(err) {
         console.error("Failed to bulk update favorites", err);
       }
    }
  };

  const handleBulkMove = async (folderId: string | undefined) => {
    const idsToUpdate = [...selectedQrCodes];
    setQrCodesData(prev => prev.map(qr => {
      if (idsToUpdate.includes(qr.id)) {
        return { ...qr, folderId };
      }
      return qr;
    }));
    setIsBulkMoveModalOpen(false);
    clearSelection();

    if (db) {
       try {
         const batch = writeBatch(db);
         idsToUpdate.forEach(id => {
            batch.update(doc(db, 'qr_codes', id), { folderId: folderId || null });
         });
         await batch.commit();
       } catch(err) {
         console.error("Failed to bulk move", err);
       }
    }
  };

  const handleRenameQr = async (qrId: string) => {
    const newName = renameInput.trim();
    if (!newName) return;

    setQrCodesData(prev => prev.map(qr => qr.id === qrId ? { ...qr, name: newName } : qr));
    
    if (db) {
       try {
          await updateDoc(doc(db, 'qr_codes', qrId), { name: newName });
       } catch(err) {
          console.error("Failed to rename QR", err);
       }
    } else {
       const saved = JSON.parse(localStorage.getItem('demo_qrs') || '{}');
       if (saved[qrId]) {
         saved[qrId].name = newName;
         localStorage.setItem('demo_qrs', JSON.stringify(saved));
       }
    }
    setRenameQrId(null);
  };

  const handleDeleteQr = async (qrId: string) => {
    if (!window.confirm('Are you sure you want to delete this QR code?')) return;
    
    setQrCodesData(prev => prev.filter(qr => qr.id !== qrId));
    setSelectedQrCodes(prev => prev.filter(id => id !== qrId));

    if (db) {
       try {
          await deleteDoc(doc(db, 'qr_codes', qrId));
       } catch(err) {
          console.error("Failed to delete QR", err);
       }
    } else {
       const saved = JSON.parse(localStorage.getItem('demo_qrs') || '{}');
       delete saved[qrId];
       localStorage.setItem('demo_qrs', JSON.stringify(saved));
    }
  };

  // Derived Data
  const filteredData = useMemo(() => {
    let data = [...qrCodesData];
    
    // Filter by Folder
    if (selectedFolderId) {
      data = data.filter(qr => qr.folderId === selectedFolderId);
    }

    // Filter by Tab
    if (activeTab === 'Static') data = data.filter(qr => qr.type === 'Static');
    if (activeTab === 'Dynamic') data = data.filter(qr => qr.type === 'Dynamic');
    if (activeTab === 'Favorites') data = data.filter(qr => qr.isFavorite);
    if (activeTab === 'Scheduled') data = data.filter(qr => qr.isScheduled);

    // Filter by Search
    if (searchQuery) {
      data = data.filter(qr => qr.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Sort
    data.sort((a, b) => {
      if (sortBy === 'Name') return a.name.localeCompare(b.name);
      if (sortBy === 'Scans') return b.scans - a.scans;
      // Default: Most recent
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return data;
  }, [qrCodesData, activeTab, searchQuery, sortBy, selectedFolderId]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  useEffect(() => {
    const fetchQrCodes = async () => {
      if (!user) {
        setQrCodesData([]);
        return;
      }
      
      let fetchedData: QrCode[] = [];

      try {
        if (db) {
          // Fetch from live Firestore
          const q = query(collection(db, 'qr_codes'), where('userId', '==', user.id));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedData.push({
              id: doc.id,
              name: data.name || `${data.type} QR Code`,
              url: `${window.location.origin}/q/${doc.id}`,
              type: 'Dynamic',
              scans: data.scans || 0,
              state: 'Active',
              createdAt: new Date(data.createdAt).toLocaleDateString(),
              editedAt: new Date(data.createdAt).toLocaleDateString(),
              isFavorite: data.isFavorite || false,
              folderId: data.folderId || undefined,
            });
          });

          // Fetch folders from live Firestore
          const folderQuery = query(collection(db, 'folders'), where('userId', '==', user.id));
          const folderSnapshot = await getDocs(folderQuery);
          const fetchedFolders: {id: string, name: string}[] = [];
          folderSnapshot.forEach((doc) => {
            fetchedFolders.push({ id: doc.id, name: doc.data().name });
          });
          setFolders(fetchedFolders);
        } else {
          // Fetch from local demo storage
          const saved = JSON.parse(localStorage.getItem('demo_qrs') || '{}');
          Object.keys(saved).forEach(id => {
            const data = saved[id];
            if (data.userId === user.id) {
               fetchedData.push({
                  id: id,
                  name: data.name || `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} QR Code`,
                  url: `${window.location.origin}/q/${id}`,
                  type: 'Dynamic',
                  scans: data.scans || 0,
                  state: 'Active',
                  createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
                  editedAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
                  isFavorite: false,
               });
            }
          });
        }
        setQrCodesData(fetchedData);
      } catch (err) {
        console.error("Failed to fetch QR codes:", err);
      }
    };

    fetchQrCodes();
  }, [user]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const tabs: Tab[] = ['All', 'Static', 'Dynamic', 'Favorites', 'Scheduled'];
  const selectedFolder = folders.find(f => f.id === selectedFolderId);

  // Unassigned QR codes (for the modal)
  const unassignedQrCodes = qrCodesData.filter(qr => qr.folderId !== selectedFolderId);

  return (
    <div className="dashboard-container animate-fade-in">
      
      {/* Header */}
      <header className="dashboard-header" style={{ marginBottom: selectedFolderId ? 0 : undefined }}>
        {selectedFolderId ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <Button variant="outline" size="icon" onClick={() => setSelectedFolderId(null)}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-display">{selectedFolder?.name}</h1>
          </div>
        ) : (
          <h1 className="text-display">My QR codes</h1>
        )}
        <Button leftIcon={<Plus size={18} />} onClick={() => navigate('/builder')}>Create New</Button>
      </header>

      {/* Folders Section - Hide if inside a folder */}
      {!selectedFolderId && (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">My folders</h2>
          
          <div className="dashboard-search-wrapper">
            <Search className="search-icon-inline" size={16} />
            <Input 
              placeholder="Search..." 
              className="input-with-icon" 
              value={folderSearch}
              onChange={(e) => setFolderSearch(e.target.value)}
            />
          </div>

          {folders.length === 0 && !isCreatingFolder ? (
            <Card className="folder-empty-state border-dashed shadow-none">
              <div className="folder-empty-content">
                <Folder size={20} />
                <span>Here you can manage your folders</span>
                <Button variant="ghost" size="sm" className="btn-create-folder" onClick={() => setIsCreatingFolder(true)}>Create folder</Button>
              </div>
            </Card>
          ) : (
            <div className="folders-grid">
              {folders.filter(f => f.name.toLowerCase().includes(folderSearch.toLowerCase())).map(f => (
                 <Card key={f.id} className="folder-card shadow-sm border-light" onClick={() => setSelectedFolderId(f.id)}>
                    <Folder size={16} style={{ color: 'var(--text-muted)' }} /> 
                    {editingFolderId === f.id ? (
                       <Input 
                         autoFocus
                         value={editFolderName}
                         onChange={e => setEditFolderName(e.target.value)}
                         onKeyDown={e => {
                            if (e.key === 'Enter') saveRenameFolder(f.id);
                            if (e.key === 'Escape') setEditingFolderId(null);
                         }}
                         onClick={e => e.stopPropagation()}
                         style={{ height: '28px', fontSize: '14px', flex: 1, padding: '0 8px' }}
                       />
                    ) : (
                       <span className="truncate" style={{ flex: 1 }}>{f.name}</span>
                    )}

                    {editingFolderId !== f.id && (
                      <div className="dropdown-wrapper" onClick={e => e.stopPropagation()}>
                         <Button variant="ghost" size="icon" style={{color: 'var(--text-muted)', width: '24px', height: '24px'}}><MoreVertical size={16}/></Button>
                         <div className="dropdown-menu narrow">
                            <button className="dropdown-item" onClick={() => setSelectedFolderId(f.id)}>Open</button>
                            <button className="dropdown-item" onClick={() => { setEditingFolderId(f.id); setEditFolderName(f.name); }}>Rename</button>
                            <button className="dropdown-item" style={{color: 'var(--danger-color)'}} onClick={() => handleDeleteFolder(f.id)}>Delete</button>
                         </div>
                      </div>
                    )}
                 </Card>
              ))}
              {isCreatingFolder ? (
                 <Card className="folder-card shadow-sm border-light folder-create-inline" style={{ cursor: 'default', gridColumn: '1 / -1', maxWidth: '400px', padding: 'var(--space-4)' }}>
                   <div className="input-wrapper">
                     <Input 
                       autoFocus 
                       value={newFolderName} 
                       onChange={e => setNewFolderName(e.target.value)} 
                       placeholder="Enter folder name..."
                       onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); }} 
                       className="folder-name-input"
                     />
                   </div>
                   <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                     <Button onClick={handleCreateFolder}>Save</Button>
                     <Button variant="ghost" onClick={() => setIsCreatingFolder(false)}>Cancel</Button>
                   </div>
                 </Card>
              ) : (
                <Card className="folder-card shadow-none border-dashed btn-create-folder-card" onClick={() => setIsCreatingFolder(true)}>
                  <Plus size={16} /> New Folder
                </Card>
              )}
            </div>
          )}
        </section>
      )}

      {/* QR Codes Section */}
      <section className="dashboard-section">
        {selectedFolderId ? (
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h2 className="dashboard-section-title">Folder contents</h2>
             <Button variant="outline" size="sm" leftIcon={<Plus size={16}/>} onClick={() => setIsAddItemsModalOpen(true)}>Add items to folder</Button>
           </div>
        ) : (
           <h2 className="dashboard-section-title">All QR codes</h2>
        )}

        {/* Filters and Tabs Row */}
        <div className="dashboard-toolbar">
          <div className="dashboard-tabs">
            {tabs.map(tab => (
              <button 
                key={tab}
                className={`dashboard-tab ${activeTab === tab ? 'dashboard-tab-active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="toolbar-actions">
            <Button variant="outline" leftIcon={<Filter size={16} />} size="sm">Filter</Button>
            
            <div className="dropdown-wrapper">
              <Button variant="outline" rightIcon={<ChevronDown size={16} />} size="sm">
                Sort by: {sortBy}
              </Button>
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => setSortBy('Most recent')}>Most recent</button>
                <button className="dropdown-item" onClick={() => setSortBy('Name')}>Name</button>
                <button className="dropdown-item" onClick={() => setSortBy('Scans')}>Scans</button>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Toolbar Row OR Bulk Actions Toolbar */}
        {selectedQrCodes.length > 0 ? (
          <div className="dashboard-toolbar bulk-actions-toolbar animate-fade-in">
             <div className="bulk-selection-info">
               <span className="bulk-count">{selectedQrCodes.length} selected</span>
               <Button variant="ghost" size="sm" onClick={clearSelection}>Clear</Button>
             </div>
             <div className="toolbar-actions">
               <Button variant="outline" size="sm" leftIcon={<Trash2 size={16} />} onClick={handleBulkDelete}>Delete</Button>
               <Button variant="outline" size="sm" leftIcon={<Star size={16} />} onClick={handleBulkFavorite}>Favorite</Button>
               <Button variant="outline" size="sm" leftIcon={<FolderPlus size={16} />} onClick={() => setIsBulkMoveModalOpen(true)}>Move to Folder</Button>
             </div>
          </div>
        ) : (
          <div className="dashboard-toolbar secondary-toolbar animate-fade-in">
            <div className="dashboard-search-wrapper">
              <Search className="search-icon-inline" size={16} />
              <Input 
                placeholder="Search..." 
                className="input-with-icon"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="toolbar-actions">
              
              <div className="custom-switch-group">
                <div 
                  className="custom-switch" 
                  onClick={() => setShowVisits(!showVisits)}
                  style={{ backgroundColor: showVisits ? 'var(--primary-btn-bg)' : 'var(--border-color)' }}
                >
                  <div 
                    className="custom-switch-knob"
                    style={{ transform: showVisits ? 'translateX(16px)' : 'translateX(0)' }}
                  ></div>
                </div>
                <span className="switch-label">Visits</span>
              </div>

              <div className="pagination-controls">
                <span>{currentPage} of {totalPages}</span>
                <div className="pagination-buttons">
                  <button 
                    className="pagination-btn" 
                    style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16}/>
                  </button>
                  <button 
                    className="pagination-btn"
                    style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={16}/>
                  </button>
                </div>
              </div>

              <div className="dropdown-wrapper">
                <Button variant="outline" size="sm" rightIcon={<ChevronDown size={16} />} className="rows-per-page">
                  {rowsPerPage}
                </Button>
                <div className="dropdown-menu narrow">
                  {[5, 10, 20].map(n => (
                    <button key={n} className="dropdown-item" style={{ textAlign: 'center' }} onClick={() => setRowsPerPage(n)}>{n}</button>
                  ))}
                </div>
              </div>

              <div className="view-toggles">
                <button 
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={16}/>
                </button>
                <button 
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={16}/>
                </button>
              </div>
              
            </div>
          </div>
        )}

        {/* Data Display */}
        {filteredData.length === 0 ? (
          <Card className="data-table-card">
             <div className="data-table-empty">
              {selectedFolderId ? (
                <>
                  <Folder size={32} className="empty-icon" />
                  <span>This folder is empty.</span>
                  <Button 
                    variant="outline" 
                    leftIcon={<Plus size={16} />} 
                    onClick={() => setIsAddItemsModalOpen(true)}
                    style={{ marginTop: 'var(--space-2)' }}
                  >
                    Add items
                  </Button>
                </>
              ) : (
                <>
                  <QrCodeIcon size={32} className="empty-icon" />
                  <span>No QR codes found matching your criteria</span>
                </>
              )}
            </div>
          </Card>
        ) : viewMode === 'list' ? (
          <Card className="data-table-card">
            <div className="data-table-header" style={{ gridTemplateColumns: showVisits ? '40px 2fr 1fr 1fr 1fr 1fr 1fr' : '40px 2fr 1fr 1fr 1fr 1fr' }}>
              <div className="col-checkbox">
                <input 
                  type="checkbox" 
                  className="custom-checkbox" 
                  checked={paginatedData.length > 0 && paginatedData.every(qr => selectedQrCodes.includes(qr.id))}
                  onChange={(e) => handleSelectAll(e.target.checked, paginatedData)}
                />
              </div>
              <div className="col-name" style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <div style={{ width: '24px' }}></div> {/* Spacer for star */}
                <div style={{ width: '40px' }}></div> {/* Spacer for icon */}
                <div>Name</div>
              </div>
              <div className="col-type">QR Type</div>
              <div className="col-created">Created</div>
              <div className="col-edited">Edited</div>
              <div className="col-state">State</div>
              {showVisits && <div className="col-scans">Scans</div>}
              <div style={{ width: '40px' }}></div> {/* Spacer for dropdown */}
            </div>
            
            <div className="data-table-body">
              {paginatedData.map(qr => (
                <div key={qr.id} className={`data-table-row ${selectedQrCodes.includes(qr.id) ? 'selected-row' : ''}`} style={{ gridTemplateColumns: showVisits ? '40px 2fr 1fr 1fr 1fr 1fr 1fr' : '40px 2fr 1fr 1fr 1fr 1fr' }}>
                  <div className="col-checkbox">
                    <input 
                      type="checkbox" 
                      className="custom-checkbox" 
                      checked={selectedQrCodes.includes(qr.id)}
                      onChange={() => toggleSelection(qr.id)}
                    />
                  </div>
                  <div className="col-name qr-name-cell">
                    <button className="star-btn" onClick={(e) => { e.stopPropagation(); toggleFavorite(qr.id); }}>
                      <Star size={16} className={qr.isFavorite ? "star-icon" : "star-icon-inactive"} />
                    </button>
                    <div className="qr-icon-box">
                      <QrCodeIcon size={20} />
                    </div>
                    <div className="qr-name-info">
                      <span className="qr-name-title">{qr.name}</span>
                      <a href={qr.url} className="qr-name-link" target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>{qr.url}</a>
                    </div>
                  </div>
                  <div className="col-type" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{qr.type}</div>
                  <div className="col-created" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{qr.createdAt}</div>
                  <div className="col-edited" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{qr.editedAt}</div>
                  <div className="col-state">
                    <Badge variant={qr.state === 'Active' ? 'success' : 'outline'} style={{ fontSize: 'var(--text-xs)' }}>{qr.state}</Badge>
                  </div>
                  {showVisits && <div className="col-scans" style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{qr.scans.toLocaleString()}</div>}
                  <div className="dropdown-wrapper" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" style={{color: 'var(--text-muted)'}}><MoreVertical size={16} /></Button>
                    <div className="dropdown-menu narrow" style={{ right: 0, left: 'auto' }}>
                       <button className="dropdown-item" onClick={() => setViewQrId(qr.id)}><Eye size={14} style={{marginRight: '8px', display: 'inline'}}/> View</button>
                       <button className="dropdown-item" onClick={() => { setRenameQrId(qr.id); setRenameInput(qr.name); }}><Edit2 size={14} style={{marginRight: '8px', display: 'inline'}}/> Rename</button>
                       <button className="dropdown-item" onClick={() => navigate(`/builder?edit=${qr.id}`)}><Edit2 size={14} style={{marginRight: '8px', display: 'inline'}}/> Edit Content</button>
                       {selectedFolderId && <button className="dropdown-item" onClick={() => handleRemoveQrFromFolder(qr.id)}><Folder size={14} style={{marginRight: '8px', display: 'inline'}}/> Remove from folder</button>}
                       <button className="dropdown-item" style={{color: 'var(--danger-color)'}} onClick={() => handleDeleteQr(qr.id)}><Trash2 size={14} style={{marginRight: '8px', display: 'inline'}}/> Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <div className="data-grid">
            {paginatedData.map(qr => (
              <Card key={qr.id} className={`qr-grid-card shadow-sm border-light ${selectedQrCodes.includes(qr.id) ? 'selected-card' : ''}`} style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', cursor: 'pointer' }} onClick={() => toggleSelection(qr.id)}>
                <div className="qr-grid-card-header">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                    <div onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="custom-checkbox" 
                        style={{ marginTop: '8px' }}
                        checked={selectedQrCodes.includes(qr.id)}
                        onChange={() => toggleSelection(qr.id)}
                      />
                    </div>
                    <div className="qr-icon-box" style={{ width: '48px', height: '48px' }}>
                      <QrCodeIcon size={24} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                    <button className="star-btn" onClick={(e) => { e.stopPropagation(); toggleFavorite(qr.id); }}>
                      <Star size={16} className={qr.isFavorite ? "star-icon" : "star-icon-inactive"} />
                    </button>
                    <div className="dropdown-wrapper" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" style={{color: 'var(--text-muted)'}}><MoreVertical size={16} /></Button>
                      <div className="dropdown-menu narrow" style={{ right: 0, left: 'auto' }}>
                         <button className="dropdown-item" onClick={() => setViewQrId(qr.id)}><Eye size={14} style={{marginRight: '8px', display: 'inline'}}/> View</button>
                         <button className="dropdown-item" onClick={() => { setRenameQrId(qr.id); setRenameInput(qr.name); }}><Edit2 size={14} style={{marginRight: '8px', display: 'inline'}}/> Rename</button>
                         <button className="dropdown-item" onClick={() => navigate(`/builder?edit=${qr.id}`)}><Edit2 size={14} style={{marginRight: '8px', display: 'inline'}}/> Edit Content</button>
                         {selectedFolderId && <button className="dropdown-item" onClick={() => handleRemoveQrFromFolder(qr.id)}><Folder size={14} style={{marginRight: '8px', display: 'inline'}}/> Remove from folder</button>}
                         <button className="dropdown-item" style={{color: 'var(--danger-color)'}} onClick={() => handleDeleteQr(qr.id)}><Trash2 size={14} style={{marginRight: '8px', display: 'inline'}}/> Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="qr-grid-title-row">
                    <h3 className="qr-grid-title">{qr.name}</h3>
                  </div>
                  <a href={qr.url} className="qr-name-link" style={{display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>{qr.url}</a>
                </div>
                <div className="qr-grid-footer">
                  <Badge variant={qr.state === 'Active' ? 'success' : 'outline'}>{qr.state}</Badge>
                  {showVisits && <span style={{fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-muted)'}}>{qr.scans.toLocaleString()} Scans</span>}
                </div>
              </Card>
            ))}
          </div>
        )}

      </section>

      {/* Add Items Modal (Existing) */}
      {isAddItemsModalOpen && (
        <div className="modal-backdrop">
          <Card className="modal-content">
            <div className="modal-header">
              <h2>Add QR Codes to {selectedFolder?.name}</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsAddItemsModalOpen(false)}>
                <X size={20} />
              </Button>
            </div>
            <div className="modal-body">
              {unassignedQrCodes.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No unassigned QR codes available to add.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {unassignedQrCodes.map(qr => (
                    <div key={qr.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <div className="qr-icon-box" style={{ width: '32px', height: '32px' }}><QrCodeIcon size={16}/></div>
                         <span style={{ fontWeight: 500 }}>{qr.name}</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleAddQrToFolder(qr.id)}>Add to folder</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsAddItemsModalOpen(false)}>Done</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Bulk Move Modal */}
      {isBulkMoveModalOpen && (
        <div className="modal-backdrop">
          <Card className="modal-content">
            <div className="modal-header">
              <h2>Move to Folder</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsBulkMoveModalOpen(false)}>
                <X size={20} />
              </Button>
            </div>
            <div className="modal-body">
              {folders.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  You don't have any folders yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {folders.map(f => (
                    <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer' }} className="hover-bg-secondary" onClick={() => handleBulkMove(f.id)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <Folder size={20} style={{ color: 'var(--text-muted)' }} />
                         <span style={{ fontWeight: 500 }}>{f.name}</span>
                      </div>
                    </div>
                  ))}
                  {/* Option to remove from folder if currently in one */}
                  {selectedFolderId && (
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer' }} className="hover-bg-secondary" onClick={() => handleBulkMove(undefined)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <X size={20} style={{ color: 'var(--text-muted)' }} />
                         <span style={{ fontWeight: 500 }}>Remove from folder</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="outline" onClick={() => setIsBulkMoveModalOpen(false)}>Cancel</Button>
              <Button onClick={() => handleBulkMove(folders.find(f => f.name === folderSearch)?.id)}>Move</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Rename QR Modal */}
      {renameQrId && (
        <div className="modal-backdrop">
          <Card className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Rename QR Code</h2>
              <Button variant="ghost" size="icon" onClick={() => setRenameQrId(null)}>
                <X size={20} />
              </Button>
            </div>
            <div className="modal-body" style={{ marginTop: '16px' }}>
              <Input 
                autoFocus 
                value={renameInput} 
                onChange={e => setRenameInput(e.target.value)} 
                placeholder="Enter new name..."
                onKeyDown={e => { if (e.key === 'Enter') handleRenameQr(renameQrId); }}
              />
            </div>
            <div className="modal-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="ghost" onClick={() => setRenameQrId(null)}>Cancel</Button>
              <Button onClick={() => handleRenameQr(renameQrId)}>Save Name</Button>
            </div>
          </Card>
        </div>
      )}

      {/* View QR Modal */}
      {viewQrId && (
        <div className="modal-backdrop">
          <Card className="modal-content" style={{ maxWidth: '400px', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{qrCodesData.find(q => q.id === viewQrId)?.name}</h2>
              <Button variant="ghost" size="icon" onClick={() => setViewQrId(null)}>
                <X size={20} />
              </Button>
            </div>
            
            <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
                <QRCodeSVG 
                  value={qrCodesData.find(q => q.id === viewQrId)?.url || ''} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p style={{ marginTop: '24px', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>
                Scan this code to test your destination.
              </p>
            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '12px' }}>
              <Button 
                variant="outline" 
                style={{ flex: 1 }} 
                onClick={() => {
                  navigator.clipboard.writeText(qrCodesData.find(q => q.id === viewQrId)?.url || '');
                  alert('Link copied to clipboard!');
                }}
              >
                <Download size={16} style={{ marginRight: '8px' }} /> Copy Link
              </Button>
              <Button style={{ flex: 1 }} onClick={() => navigate(`/builder?edit=${viewQrId}`)}>
                <Edit2 size={16} style={{ marginRight: '8px' }} /> Edit Content
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
