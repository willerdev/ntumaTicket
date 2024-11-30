type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

declare global {
  type Database = {
    public: {
      Tables: {
        notifications: {
          Row: Notification;
          Insert: Partial<Notification>;
          Update: Partial<Notification>;
        };
        // ... other tables
      };
    };
  };
} 