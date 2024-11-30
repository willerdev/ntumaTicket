import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Settings, LogOut, HelpCircle, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { PendingInvites } from "@/components/PendingInvites";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Share2, MessageCircle } from "lucide-react";

const Account = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    username: "",
    phone: "",
    email: ""
  });
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile({
        ...data,
        email: user.email || ""
      });
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        username: profile.username,
        phone: profile.phone
      })
      .eq('id', user?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      setEditing(false);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/signin';
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=Join%20me%20on%20NtumaTicket!%20https://ntumaticket/apps`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <PendingInvites />

      <Card className="p-6">
        <div className="space-y-6">
          {editing ? (
            <div className="space-y-4">
              <Input
                value={profile.full_name}
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                placeholder="Full Name"
              />
              <Input
                value={profile.username}
                onChange={(e) => setProfile({...profile, username: e.target.value})}
                placeholder="Username"
              />
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                placeholder="Phone"
              />
              <Input
                value={profile.email}
                disabled
                placeholder="Email"
              />
              <div className="flex gap-2">
                <Button onClick={handleUpdate} disabled={loading} className="flex-1">
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <User size={32} className="text-muted-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold">{profile.full_name}</h2>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setEditing(true)} className="w-full">
                Edit Profile
              </Button>
            </>
          )}
        </div>
      </Card>

      <div className="border-t border-b py-2">
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start rounded-none hover:bg-gray-100" onClick={() => setShowInviteModal(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Friends
          </Button>
          <Button variant="ghost" className="w-full justify-start rounded-none hover:bg-gray-100" onClick={() => window.location.href = '/support'}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & Support
          </Button>
          <Button variant="ghost" className="w-full justify-start rounded-none hover:bg-gray-100 text-red-500" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Friends</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Share NtumaTicket with your friends!</p>
            <div className="flex gap-4">
              <Button onClick={shareToWhatsApp} className="flex-1">
                <MessageCircle className="mr-2 h-4 w-4" />
                Share on WhatsApp
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => {
                navigator.clipboard.writeText("https://ntumaticket/apps");
                toast({
                  title: "Link copied!",
                  description: "Share it with your friends"
                });
              }}>
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Account;