import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const Notifications = () => {
  const navigate = useNavigate();
  
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      return data || [];
    }
  });

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : notifications?.length === 0 ? (
        <Card className="p-8 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
          <p className="text-muted-foreground">We'll notify you when something important happens</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications?.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : 'hover:bg-muted/50'
              }`}
              onClick={() => {
                markAsRead(notification.id);
                if (notification.link) {
                  navigate(notification.link);
                }
              }}
            >
              <div className="flex gap-3">
                <Bell className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                <div className="space-y-1">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications; 