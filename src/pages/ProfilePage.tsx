import { motion } from "framer-motion";
import { ChevronRight, User, Mail, Calendar, Shield, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: api.auth.getProfile,
  });

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <span className="label-upper">User</span>
          <ChevronRight size={12} />
          <span className="label-upper text-foreground">Profile</span>
        </div>
        <h1 className="text-3xl font-medium tracking-tighter">My Profile</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card-surface p-8 flex flex-col items-center text-center space-y-4"
        >
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
            <User size={48} className="text-primary" />
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <Skeleton className="h-8 w-32 mx-auto" />
            ) : (
              <h2 className="text-2xl font-medium tracking-tight">{user?.name}</h2>
            )}
            <p className="text-sm text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Administrator</p>
          </div>
          <div className="w-full pt-6 space-y-3 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="text-success font-medium flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium">Inventory Manager</span>
            </div>
          </div>
        </motion.div>

        {/* Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-surface p-8 md:col-span-2 space-y-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail size={16} />
                <label className="label-upper text-[10px]">Email Address</label>
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                <p className="text-sm font-medium">{user?.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={16} />
                <label className="label-upper text-[10px]">Member Since</label>
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                <p className="text-sm font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield size={16} />
                <label className="label-upper text-[10px]">Access Level</label>
              </div>
              <p className="text-sm font-medium">Full System Access</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package size={16} />
                <label className="label-upper text-[10px]">Department</label>
              </div>
              <p className="text-sm font-medium">Logistics & Warehouse</p>
            </div>
          </div>

          <div className="pt-8 border-t border-border space-y-4">
            <h3 className="label-upper">Account Security</h3>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 text-xs font-medium rounded-md bg-secondary border border-border hover:bg-secondary/80 transition-colors btn-press">
                Change Password
              </button>
              <button className="px-4 py-2 text-xs font-medium rounded-md bg-secondary border border-border hover:bg-secondary/80 transition-colors btn-press">
                Two-Factor Authentication
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
