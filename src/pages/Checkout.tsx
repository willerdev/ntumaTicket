import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, Loader2, Phone } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    full_name: string;
    username: string;
  }>>([]);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const handlePurchase = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to complete your purchase",
        variant: "destructive",
      });
      navigate("/signin");
      return;
    }

    setIsProcessing(true);
    try {
      // Create ticket
      const { error: ticketError } = await supabase
        .from("tickets")
        .insert([
          {
            event_id: id,
            user_id: user.id,
            status: "confirmed Not paid Yet",
            qr_code: `ticket-${Date.now()}`,
            phone_number: phoneNumber
          },
        ]);

      if (ticketError) {
        console.error("Ticket error:", ticketError);
        throw new Error("Failed to create ticket");
      }

      // Create notification
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert([
          {
            user_id: user.id,
            title: "Ticket Purchased",
            message: `You have successfully purchased a ticket for ${event?.title}`,
            link: `/my-tickets`,
            read: false,
            type: "ticket_purchase"
          }
        ]);

      if (notificationError) {
        console.error("Notification error:", notificationError);
        // Don't throw here, notification is not critical
      }

      toast({
        title: "Success",
        description: "Ticket purchased successfully",
      });
      navigate(`/my-tickets`);

    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Error",
        description: "Failed to process your purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .ilike('full_name', `%${query}%`)
        .limit(5);
      
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    }
  };

  const sendPaymentInvite = async (toUserId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('payment_invitations')
      .insert({
        ticket_id: null,
        from_user_id: user.id,
        to_user_id: toUserId,
        event_id: id
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Payment invitation sent successfully"
    });
    setShowInviteDialog(false);
  };

  if (isLoading || !event) {
    return <div className="space-y-6">
      <Skeleton className="h-10 w-20" />
      <Card className="p-6 space-y-6">
        <Skeleton className="h-8 w-1/2" />
      </Card>
    </div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        Back
      </Button>

      <Card className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">Complete your ticket purchase</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">{event.title}</span>
            <span>${Number(event.price).toFixed(2)}</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Enter mobile money number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center font-bold">
              <span>Total</span>
              <span>${Number(event.price).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowInviteDialog(true)}
          >
            Invite Someone to Pay
          </Button>
        </div>

        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Someone to Pay</DialogTitle>
            </DialogHeader>
            <Command>
              <CommandInput 
                placeholder="Search people..." 
                value={searchQuery}
                onValueChange={(value) => {
                  setSearchQuery(value);
                  searchUsers(value);
                }}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {searchResults.map((user) => (
                    <CommandItem
                      key={user.id}
                      onSelect={() => sendPaymentInvite(user.id)}
                    >
                      {user.full_name} ({user.username})
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </DialogContent>
        </Dialog>

        <Button 
          className="w-full" 
          onClick={handlePurchase}
          disabled={isProcessing || !phoneNumber}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay with Mobile Money
            </>
          )}
        </Button>
      </Card>
    </div>
  );
};

export default Checkout;