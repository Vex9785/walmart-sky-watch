import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, MapPin, Bell, BellOff } from 'lucide-react';
import { flightService } from '@/services/flightService';
import { notificationService } from '@/services/notificationService';
import { FlightAlert } from '@/types/flight';
import { useToast } from '@/hooks/use-toast';

export default function FlightTracker() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState<FlightAlert[]>([]);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize notifications
    notificationService.initialize();
    notificationService.requestWebNotificationPermission();
  }, []);

  const handleStartMonitoring = async () => {
    try {
      flightService.startMonitoring((alert: FlightAlert) => {
        setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
        setLastCheck(new Date());
        
        // Send notification
        notificationService.sendLocalNotification(alert);
        
        // Show toast
        toast({
          title: "Flight Alert!",
          description: `${alert.aircraft.registration} is ${alert.alertType === 'heading_to_minnesota' ? 'heading to' : 'in'} Minnesota`,
        });
      });
      
      setIsMonitoring(true);
      setLastCheck(new Date());
      
      toast({
        title: "Monitoring Started",
        description: "Now tracking Walmart aircraft heading to Minnesota",
      });
    } catch (error) {
      console.error('Error starting monitoring:', error);
      toast({
        title: "Error",
        description: "Failed to start monitoring",
        variant: "destructive",
      });
    }
  };

  const handleStopMonitoring = () => {
    flightService.stopMonitoring();
    setIsMonitoring(false);
    
    toast({
      title: "Monitoring Stopped",
      description: "Flight tracking has been disabled",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getAlertBadgeVariant = (alertType: string) => {
    return alertType === 'in_minnesota' ? 'default' : 'secondary';
  };

  const getAlertText = (alertType: string) => {
    return alertType === 'in_minnesota' ? 'In Minnesota' : 'Heading to Minnesota';
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Plane className="text-walmart-blue" />
              Walmart Flight Tracker
            </CardTitle>
            <p className="text-muted-foreground">
              Monitor Walmart Inc aircraft heading to Minnesota
            </p>
          </CardHeader>
        </Card>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="text-primary" />
              Monitoring Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Flight Monitoring</p>
                <p className="text-sm text-muted-foreground">
                  {isMonitoring 
                    ? `Active - Last check: ${lastCheck?.toLocaleTimeString() || 'Never'}`
                    : 'Inactive'
                  }
                </p>
              </div>
              {isMonitoring ? (
                <Button 
                  onClick={handleStopMonitoring}
                  variant="outline"
                  className="bg-destructive/10 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <BellOff className="w-4 h-4 mr-2" />
                  Stop Monitoring
                </Button>
              ) : (
                <Button 
                  onClick={handleStartMonitoring}
                  className="bg-walmart-blue hover:bg-walmart-blue/90"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Start Monitoring
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="text-accent" />
              Recent Alerts
              <Badge variant="outline">{alerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Plane className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No alerts yet</p>
                <p className="text-sm">Start monitoring to track Walmart flights</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-walmart-blue" />
                        <span className="font-medium">
                          {alert.aircraft.registration}
                        </span>
                        <Badge variant={getAlertBadgeVariant(alert.alertType)}>
                          {getAlertText(alert.alertType)}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatTime(alert.timestamp)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Callsign: </span>
                        <span>{alert.flight.callsign || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Aircraft: </span>
                        <span>{alert.aircraft.model}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Altitude: </span>
                        <span>{alert.flight.baro_altitude || 'N/A'} ft</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Speed: </span>
                        <span>{alert.flight.velocity || 'N/A'} m/s</span>
                      </div>
                    </div>
                    
                    {alert.flight.latitude && alert.flight.longitude && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Position: </span>
                        <span>
                          {alert.flight.latitude.toFixed(4)}, {alert.flight.longitude.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• This app monitors real-time flight data for aircraft registered to Walmart Inc</p>
            <p>• When a Walmart aircraft is detected heading to or in Minnesota, you'll receive a notification</p>
            <p>• The app checks for flights every 5 minutes while monitoring is active</p>
            <p>• For the full mobile experience, export this project and build it as an Android app</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}