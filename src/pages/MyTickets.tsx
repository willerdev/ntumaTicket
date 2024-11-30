import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { QRCodeCanvas } from "qrcode.react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MyTickets = () => {
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [transferEmail, setTransferEmail] = useState("");

  // Fetch tickets from Supabase
  const { data: tickets, isLoading, error } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      // Check auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      
      if (!user) {
        console.error('No user found');
        throw new Error("User not authenticated");
      }

      // Fetch tickets
      const { data, error } = await supabase
        .from("tickets")
        .select(`*, event:events(*)`)
        .eq("user_id", user.id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched tickets:', data);
      return data;
    },
  });

  // Add error handling
  if (error) {
    return <div>Error loading tickets: {error.message}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Add empty state
  if (!tickets?.length) {
    return (
      <div className="space-y-6 page-transition">
        <h1 className="text-2xl font-bold">My Tickets</h1>
        <p>No tickets found</p>
      </div>
    );
  }

  // Add mutation for cancel ticket
  const cancelTicket = async (ticketId: string) => {
    const { error } = await supabase
      .from("tickets")
      .update({ status: "cancelled" })
      .eq("id", ticketId);

    if (error) {
      toast({ title: "Error", description: "Failed to cancel ticket" });
      return;
    }
    toast({ title: "Success", description: "Ticket cancelled successfully" });
  };

  // Add mutation for transfer ticket
  const transferTicket = async (ticketId: string, email: string) => {
    // First check if recipient exists in profiles
    const { data: recipientProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (profileError || !recipientProfile) {
      toast({ 
        title: "Error", 
        description: "Recipient must have an account to receive tickets" 
      });
      return;
    }

    // Transfer the ticket
    const { error: transferError } = await supabase
      .from("tickets")
      .update({ 
        user_id: recipientProfile.id,
        status: 'active' // Ensure ticket is active when transferred
      })
      .eq("id", ticketId);

    if (transferError) {
      toast({ title: "Error", description: "Failed to transfer ticket" });
      return;
    }
    
    setShowTransfer(false);
    setTransferEmail("");
    toast({ title: "Success", description: "Ticket transferred successfully" });
  };

  return (
    <div className="space-y-6 page-transition">
      <div>
        <h1 className="text-2xl font-bold">My Tickets</h1>
        <p className="text-muted-foreground">Manage your event tickets</p>
      </div>
      
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Tickets</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled Tickets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <div className="space-y-4">
            {tickets?.filter(t => t.status !== 'cancelled').map((ticket) => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket}
                onTransfer={() => {
                  setSelectedTicket(ticket);
                  setShowTransfer(true);
                }}
                onCancel={() => {
                  setSelectedTicket(ticket);
                  setShowCancelDialog(true);
                }}
                onShowQR={() => {
                  setSelectedTicket(ticket);
                  setShowQR(true);
                }}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="cancelled">
          <div className="space-y-4">
            {tickets?.filter(t => t.status === 'cancelled').map((ticket) => (
              <Card key={ticket.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{ticket.event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ticket.event.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-red-500">Cancelled</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.event?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            <QRCodeCanvas 
              value={selectedTicket?.qr_code || `ticket-${selectedTicket?.id}`}
              size={200}
              level="H"
              includeMargin
            />
            <p className="mt-4 text-sm text-muted-foreground">
              Scan this QR code at the venue
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Recipient Email</Label>
              <Input 
                value={transferEmail}
                onChange={(e) => setTransferEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>
            <Button 
              onClick={() => transferTicket(selectedTicket?.id, transferEmail)}
            >
              Transfer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this ticket? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep ticket</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                cancelTicket(selectedTicket?.id);
                setShowCancelDialog(false);
              }}
            >
              Yes, cancel ticket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Helper component for ticket card
const TicketCard = ({ ticket, onTransfer, onCancel, onShowQR }) => (
  <Card key={ticket.id} className="p-4 card-hover">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold">{ticket.event.title}</h3>
        <p className="text-sm text-muted-foreground">
          {new Date(ticket.event.date).toLocaleDateString()}
        </p>
        <p className="text-sm text-muted-foreground">
          Status: {ticket.status}
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onTransfer}>
          Transfer
        </Button>
        <Button size="sm" variant="destructive" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="icon" variant="outline" onClick={onShowQR}>
          <QrCode size={20} />
        </Button>
      </div>
    </div>
  </Card>
);

export default MyTickets;