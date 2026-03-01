import { useState } from "react";
import { Search, Plus, Edit2, Eye, Trash2, Upload } from "lucide-react";
import { useWorkers, useDeleteWorker } from "@/hooks/useWorkers";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { WorkerForm } from "@/components/workers/WorkerForm";
import { WorkerDetails } from "@/components/workers/WorkerDetails";
import { WorkerCSVUpload } from "@/components/workers/WorkerCSVUpload";
import { cn } from "@/lib/utils";

export default function Workers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [editingWorker, setEditingWorker] = useState<string | null>(null);
  const [deletingWorker, setDeletingWorker] = useState<{ id: string; name: string } | null>(null);
  const { isAdmin } = useAuth();

  const { data: workers, isLoading } = useWorkers(searchTerm);
  const deleteWorker = useDeleteWorker();

  const handleView = (id: string) => {
    setSelectedWorkerId(id);
    setIsDetailsOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingWorker(id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingWorker(null);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-full overflow-hidden">
      {/* Premium Header */}
      <div className="flex flex-col gap-4 sticky top-0 z-40 py-2 bg-background/80 backdrop-blur-lg border-b border-border/40 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gradient">Workers</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              MANAGE YOUR WORKFORCE
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(true)} className="h-9 px-3 gap-2 rounded-xl active:scale-95">
              <Upload className="w-4 h-4" />
              <span className="text-xs font-bold">Import</span>
            </Button>
            {isAdmin && (
              <Button onClick={() => setIsFormOpen(true)} className="h-9 px-3 gap-2 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">
                <Plus className="w-4 h-4" />
                <span className="text-xs font-bold">Add</span>
              </Button>
            )}
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by name or ID..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="pl-10 h-10 rounded-xl border-border/40 bg-muted/40 focus:bg-background transition-all shadow-inner focus:shadow-md"
          />
        </div>
      </div>

      {/* Desktop Table - Enhanced Styling */}
      <div className="hidden md:block bg-card border border-border shadow-md rounded-2xl overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead className="bg-muted/30">
              <tr>
                <th className="font-bold uppercase tracking-wider text-[10px] py-4">Worker ID</th>
                <th className="font-bold uppercase tracking-wider text-[10px]">Name</th>
                <th className="hidden lg:table-cell font-bold uppercase tracking-wider text-[10px]">Department</th>
                <th className="hidden lg:table-cell font-bold uppercase tracking-wider text-[10px]">Designation</th>
                <th className="hidden xl:table-cell font-bold uppercase tracking-wider text-[10px]">Shift</th>
                <th className="font-bold uppercase tracking-wider text-[10px]">Status</th>
                <th className="font-bold uppercase tracking-wider text-[10px] text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground animate-pulse">Loading workers...</td></tr>
              ) : workers?.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground font-medium italic">No workers found.</td></tr>
              ) : (
                (workers || []).slice().sort((a, b) => (a.worker_name || "").localeCompare(b.worker_name || "")).map((worker) => (
                  <tr key={worker.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="font-bold text-sm tracking-tight py-4">{worker.worker_id}</td>
                    <td className="font-medium text-sm">{worker.worker_name}</td>
                    <td className="hidden lg:table-cell text-sm text-muted-foreground">{worker.department}</td>
                    <td className="hidden lg:table-cell text-sm text-muted-foreground">{worker.designation}</td>
                    <td className="hidden xl:table-cell">
                       <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-tighter">{worker.shift}</Badge>
                    </td>
                    <td>
                      <Badge variant="outline" className={cn(
                        "font-bold text-[10px] uppercase border-current",
                        worker.status === "Active" ? "badge-active" : "badge-inactive"
                      )}>
                        {worker.status}
                      </Badge>
                    </td>
                    <td className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary" onClick={() => handleView(worker.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {isAdmin && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-warning/10 hover:text-warning" onClick={() => handleEdit(worker.id)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive" onClick={() => setDeletingWorker({ id: worker.id, name: worker.worker_name })}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List - High Density Single Row */}
      <div className="md:hidden space-y-2 pb-24">
        {isLoading ? (
          <div className="space-y-2">
             {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-muted/40 animate-pulse rounded-xl" />)}
          </div>
        ) : workers?.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border/60">
            <p className="text-muted-foreground text-xs font-bold italic tracking-tight opacity-50">No workers found.</p>
          </div>
        ) : (
          (workers || []).slice().sort((a, b) => (a.worker_name || "").localeCompare(b.worker_name || "")).map((worker) => (
            <div 
              key={worker.id} 
              className="premium-card flex items-center justify-between p-2 pl-3 border-l-4 transition-all active:scale-[0.98] rounded-xl"
              style={{ borderLeftColor: worker.status === "Active" ? "hsl(var(--success))" : "hsl(var(--muted-foreground))" }}
              onClick={() => handleView(worker.id)}
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="font-bold text-xs tracking-tight truncate leading-tight">{worker.worker_name}</h3>
                  <Badge variant="outline" className={cn(
                    "text-[8px] font-black uppercase px-1 h-3.5 border-none",
                    worker.status === "Active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  )}>
                    {worker.status === "Active" ? "ACT" : "INA"}
                  </Badge>
                </div>
                <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tighter truncate leading-tight">
                  {worker.worker_id} · {worker.department}
                </p>
              </div>
              
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-muted/10 text-muted-foreground hover:text-primary" onClick={() => handleView(worker.id)}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  {isAdmin && (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-muted/10 text-muted-foreground hover:text-warning" onClick={() => handleEdit(worker.id)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-muted/10 text-muted-foreground hover:text-destructive" onClick={() => setDeletingWorker({ id: worker.id, name: worker.worker_name })}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
              </div>
            </div>
          ))
        )}
      </div>

      {isAdmin && (
        <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingWorker ? "Edit Worker" : "Add New Worker"}</DialogTitle>
            </DialogHeader>
            <WorkerForm workerId={editingWorker} onSuccess={handleCloseForm} />
          </DialogContent>
        </Dialog>
      )}

      {isAdmin && (
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Import Workers</DialogTitle>
            </DialogHeader>
            <WorkerCSVUpload onSuccess={() => setIsUploadOpen(false)} />
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Worker Details</DialogTitle></DialogHeader>
          {selectedWorkerId && <WorkerDetails workerId={selectedWorkerId} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingWorker} onOpenChange={(open) => !open && setDeletingWorker(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Worker</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingWorker?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deletingWorker) { deleteWorker.mutate(deletingWorker.id); setDeletingWorker(null); } }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
