import { useQuery, useQueries } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Prefetch images
  useQueries({
    queries: events?.map((event) => ({
      queryKey: ['image', event.image_url],
      queryFn: async () => {
        const response = await fetch(event.image_url || "/placeholder.svg");
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      },
      staleTime: 1000 * 60 * 60, // Cache for 1 hour
      cacheTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    })) || [],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-48 bg-muted rounded-md"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upcoming Events</h1>
        <p className="text-muted-foreground">Discover and book amazing events</p>
      </div>
      
      <div className="grid gap-4">
        {events?.map((event) => (
          <Card key={event.id} className="overflow-hidden card-hover">
            <img 
              src={event.image_url || "/placeholder.svg"} 
              alt={event.title}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
              </div>
              
              <div className="space-y-2">
           
              
              </div>
              
              <div className="flex items-center justify-between">
                <div className="font-semibold">
                  {Number(event.price).toFixed(2)} Frw
                </div>
                <Link to={`/events/${event.id}`}>
                  <Button>View Details</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;