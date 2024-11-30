import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useToast } from "./ui/use-toast";

export const PendingInvites = () => {
  const { toast } = useToast();
  
  const { data: invites, refetch } = useQuery({
    queryKey: ["payment-invites"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('payment_invitations')
        .select(`
          *,
          event:events(*),
          from_user:profiles!payment_invitations_from_user_id_fkey(full_name)
        `)
        .eq('to_user_id', user?.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      return data;
    }
  });

  const handleAccept = async (inviteId: string) => {
    // Navigate to checkout with invite context
    window.location.href = `/checkout/${invites?.find(i => i.id === inviteId)?.event_id}`;
  };

  const handleDecline = async (inviteId: string) => {
    const { error } = await supabase
      .from('payment_invitations')
      .update({ status: 'declined' })
      .eq('id', inviteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to decline invitation",
        variant: "destructive"
      });
      return;
    }

    refetch();
    toast({
      title: "Success",
      description: "Invitation declined"
    });
  };

  if (!invites?.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Payment Invitations</h2>
      {invites.map((invite) => (
        <Card key={invite.id} className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{invite.event.title}</p>
              <p className="text-sm text-muted-foreground">
                From: {invite.from_user.full_name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleAccept(invite.id)}>
                Accept
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDecline(invite.id)}
              >
                Decline
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}; 