import { Button } from "@/components/ui/button";
import { QrCode, Camera, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Scan = () => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (scanning) {
      setError(null); // Reset error when starting scan
      scannerRef.current = new Html5Qrcode("reader");
      
      scannerRef.current
        .start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
              setError("Please login to scan tickets");
              setScanning(false);
              if (scannerRef.current?.isScanning) {
                scannerRef.current?.stop();
              }
              return;
            }

            const { data: ticket, error: ticketError } = await supabase
              .from("tickets")
              .select("*")
              .eq("qr_code", decodedText)
              .eq("user_id", user.id)
              .single();

            if (ticketError || !ticket) {
              setError("This ticket is not valid or doesn't belong to you");
              toast({
                title: "Invalid Ticket",
                description: "This ticket is not valid or doesn't belong to you",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Valid Ticket",
                description: "Ticket verified successfully",
              });
            }

            if (scannerRef.current?.isScanning) {
              scannerRef.current?.stop();
            }
            setScanning(false);
          },
          (error) => {
            // Ignore errors during scanning
          }
        )
        .catch((err) => {
          setError("Failed to access camera");
          setScanning(false);
        });
    }

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current?.stop().catch(console.error);
      }
    };
  }, [scanning, toast]);

  return (
    <div className="space-y-6 page-transition">
      <div>
        <h1 className="text-2xl font-bold">Scan Ticket</h1>
        <p className="text-muted-foreground">Scan or display your ticket QR code</p>
      </div>

      {scanning ? (
        <div className="space-y-4">
          <Card className="relative overflow-hidden">
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute top-2 right-2 z-10"
              onClick={() => setScanning(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div id="reader" className="w-full" />
          </Card>
          {error && (
            <div className="text-sm text-destructive text-center">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Button 
            className="w-full py-8"
            onClick={() => setScanning(true)}
          >
            <Camera className="mr-2 h-4 w-4" />
            Start Scanning
          </Button>
          {error && (
            <div className="text-sm text-destructive text-center">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Scan;