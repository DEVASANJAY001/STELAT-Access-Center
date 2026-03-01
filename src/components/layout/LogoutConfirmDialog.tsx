import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutConfirmDialogProps {
  onConfirm: () => void;
  variant?: "sidebar" | "mobile";
}

export function LogoutConfirmDialog({ onConfirm, variant = "sidebar" }: LogoutConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent h-8 text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to sign out of your account?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Sign out</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
