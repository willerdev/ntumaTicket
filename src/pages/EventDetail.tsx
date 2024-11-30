import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();
      
      if (eventError) throw eventError;

      const { count: totalCount, error: ticketError } = await supabase
        .from("tickets")
        .select("*", { count: 'exact' })
        .eq("event_id", id)
        .eq("status", "confirmed");

      const { count: userTickets, error: userTicketError } = await supabase
        .from("tickets")
        .select("*", { count: 'exact' })
        .eq("event_id", id)
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

      if (ticketError || userTicketError) throw ticketError || userTicketError;

      return {
        ...eventData,
        bookedTickets: totalCount || 0,
        userTicketCount: userTickets || 0
      };
    },
  });

  const handleBookTicket = () => {
    navigate(`/checkout/${id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-20" />
        <Card className="overflow-hidden">
          <Skeleton className="w-full h-64" />
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Event not found</h2>
        <p className="text-muted-foreground mt-2">The event you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/home")} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        Back
      </Button>

      <Card className="overflow-hidden">
        <img 
          src={event.image_url || "/placeholder.svg"} 
          alt={event.title}
          className="w-full h-64 object-cover"
        />
        
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <p className="text-muted-foreground mt-2">{event.description}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground" />
              <span>
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="text-muted-foreground" />
              <span>{event.location}</span>
            </div>

            <div className="flex items-center gap-2">
           
              <span className="font-semibold">{Number(event.price).toFixed(2)} Frw</span>
            </div>
          </div>

          {event.bookedTickets >= event.max_users ? (
            <Button className="w-full" disabled>
              Sold Out
            </Button>
          ) : event.userTicketCount >= 3 ? (
            <Button className="w-full" disabled>
              Maximum booking limit reached (3 tickets)
            </Button>
          ) : (
            <Button className="w-full" onClick={handleBookTicket}>
              Book Ticket ({3 - event.userTicketCount} remaining)
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EventDetail;