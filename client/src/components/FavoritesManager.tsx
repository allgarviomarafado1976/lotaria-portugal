import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Star } from "lucide-react";
import { toast } from "sonner";

interface FavoritesManagerProps {
  gameType: "euroMillion" | "toto";
}

export function FavoritesManager({ gameType }: FavoritesManagerProps) {
  const [numbers, setNumbers] = useState<string>("");
  const [stars, setStars] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

  const favoritesQuery = trpc.favorites.list.useQuery();
  const addFavoriteMutation = trpc.favorites.add.useMutation();
  const deleteFavoriteMutation = trpc.favorites.delete.useMutation();

  const handleAddFavorite = async () => {
    try {
      if (!numbers.trim()) {
        toast.error("Por favor, insira os números");
        return;
      }

      const numberArray = numbers
        .split(",")
        .map((n) => parseInt(n.trim()))
        .filter((n) => !isNaN(n));

      if (numberArray.length === 0) {
        toast.error("Números inválidos");
        return;
      }

      let starsArray: number[] | undefined = undefined;
      if (gameType === "euroMillion" && stars.trim()) {
        starsArray = stars
          .split(",")
          .map((s) => parseInt(s.trim()))
          .filter((s) => !isNaN(s));
      }

      await addFavoriteMutation.mutateAsync({
        gameType,
        numbers: numberArray,
        stars: starsArray,
        name: name || undefined,
      });

      toast.success("Favorito adicionado com sucesso!");
      setNumbers("");
      setStars("");
      setName("");
      favoritesQuery.refetch();
    } catch (error) {
      toast.error("Erro ao adicionar favorito");
    }
  };

  const handleDeleteFavorite = async (favoriteId: number) => {
    try {
      await deleteFavoriteMutation.mutateAsync({ favoriteId });
      toast.success("Favorito removido");
      favoritesQuery.refetch();
    } catch (error) {
      toast.error("Erro ao remover favorito");
    }
  };

  const userFavorites = favoritesQuery.data?.filter((f) => f.gameType === gameType) || [];

  return (
    <div className="space-y-6">
      {/* Add Favorite Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Adicionar Números Favoritos
          </CardTitle>
          <CardDescription>
            Guarde seus números preferidos e receba alertas quando forem sorteados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Números {gameType === "euroMillion" ? "(1-50)" : "(1-49)"}
            </label>
            <Input
              placeholder="Ex: 7, 14, 21, 35, 42"
              value={numbers}
              onChange={(e) => setNumbers(e.target.value)}
              disabled={isAdding}
            />
          </div>

          {gameType === "euroMillion" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Estrelas (1-12)</label>
              <Input
                placeholder="Ex: 3, 8"
                value={stars}
                onChange={(e) => setStars(e.target.value)}
                disabled={isAdding}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Nome (opcional)</label>
            <Input
              placeholder="Ex: Meus números da sorte"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isAdding}
            />
          </div>

          <Button
            onClick={handleAddFavorite}
            disabled={isAdding || addFavoriteMutation.isPending}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            {addFavoriteMutation.isPending ? "Adicionando..." : "Adicionar Favorito"}
          </Button>
        </CardContent>
      </Card>

      {/* Favorites List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Seus Favoritos</h3>

        {favoritesQuery.isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Carregando favoritos...</p>
            </CardContent>
          </Card>
        ) : userFavorites.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Nenhum favorito adicionado ainda</p>
            </CardContent>
          </Card>
        ) : (
          userFavorites.map((favorite) => (
            <Card key={favorite.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {favorite.name && (
                      <p className="font-semibold mb-2">{favorite.name}</p>
                    )}
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Números:</p>
                        <div className="flex flex-wrap gap-2">
                          {favorite.numbers.map((num: number) => (
                            <Badge key={num} variant="secondary">
                              {num}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {favorite.stars && favorite.stars.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Estrelas:</p>
                          <div className="flex flex-wrap gap-2">
                            {favorite.stars.map((star: number) => (
                              <Badge key={star} variant="outline">
                                ⭐ {star}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFavorite(favorite.id)}
                    disabled={deleteFavoriteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
