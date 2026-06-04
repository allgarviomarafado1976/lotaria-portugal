import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2 } from "lucide-react";

export function AlertsPanel() {
  const alertsQuery = trpc.favorites.getAlerts.useQuery();
  const markAsReadMutation = trpc.favorites.markAlertAsRead.useMutation();

  const handleMarkAsRead = async (alertId: number) => {
    try {
      await markAsReadMutation.mutateAsync({ alertId });
      alertsQuery.refetch();
    } catch (error) {
      console.error("Erro ao marcar alerta como lido:", error);
    }
  };

  const alerts = alertsQuery.data || [];
  const unreadAlerts = alerts.filter((a) => a.isRead === 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h3 className="font-semibold text-lg">Alertas</h3>
          {unreadAlerts.length > 0 && (
            <Badge variant="destructive">{unreadAlerts.length}</Badge>
          )}
        </div>
      </div>

      {alertsQuery.isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Carregando alertas...</p>
          </CardContent>
        </Card>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Nenhum alerta ainda. Seus números favoritos aparecerão aqui quando forem sorteados!
            </p>
          </CardContent>
        </Card>
      ) : (
        alerts.map((alert) => (
          <Card
            key={alert.id}
            className={alert.isRead === 0 ? "border-primary/50 bg-primary/5" : ""}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold">
                      {alert.gameType === "euroMillion" ? "EuroMilhões" : "Totoloto"}
                    </p>
                    <Badge variant="outline">{alert.drawDate}</Badge>
                    {alert.isRead === 0 && (
                      <Badge variant="default">Novo</Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Números coincidentes:</p>
                      <div className="flex flex-wrap gap-2">
                        {alert.matchedNumbers.map((num: number) => (
                          <Badge key={num} variant="secondary">
                            {num}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {alert.matchedStars && alert.matchedStars.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Estrelas coincidentes:</p>
                        <div className="flex flex-wrap gap-2">
                          {alert.matchedStars.map((star: number) => (
                            <Badge key={star} variant="outline">
                              ⭐ {star}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {alert.isRead === 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(alert.id)}
                    disabled={markAsReadMutation.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
