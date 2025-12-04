/**
 * @fileoverview Authorize New Players Card Component
 *
 * Displays a list of unauthorized players (those with NULL starting handicaps)
 * and allows operators to set their starting handicaps via a modal.
 *
 * Features:
 * - Auto-authorizes established players (15+ games) on load
 * - Shows remaining players who need manual authorization
 * - Modal for setting 3v3 and 5v5 starting handicaps
 * - Collapsible card to save space when not needed
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertCircle, UserCheck, ChevronDown, ChevronUp, Loader2, Eye } from 'lucide-react';
import { InfoButton } from '@/components/InfoButton';
import { logger } from '@/utils/logger';
import {
  fetchOperatorPlayers,
  updatePlayerStartingHandicaps,
  autoAuthorizeEstablishedPlayer,
} from '@/api/queries/players';

interface AuthorizeNewPlayersCardProps {
  /** The operator/organization ID to fetch players for */
  operatorId: string;
  /** Optional callback when a player is selected for viewing */
  onSelectPlayer?: (playerId: string) => void;
}

/**
 * AuthorizeNewPlayersCard Component
 *
 * A collapsible card that shows unauthorized players and allows
 * operators to set their starting handicaps.
 */
export const AuthorizeNewPlayersCard: React.FC<AuthorizeNewPlayersCardProps> = ({
  operatorId,
  onSelectPlayer,
}) => {
  const queryClient = useQueryClient();

  // UI State
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isAutoAuthorizing, setIsAutoAuthorizing] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalPlayer, setModalPlayer] = useState<{ id: string; name: string } | null>(null);
  const [modalHandicap3v3, setModalHandicap3v3] = useState<string>('0');
  const [modalHandicap5v5, setModalHandicap5v5] = useState<string>('40');

  // Fetch unauthorized players (NULL starting handicaps)
  const { data: unauthorizedPlayersData, isLoading } = useQuery({
    queryKey: ['unauthorizedPlayers', operatorId],
    queryFn: () => fetchOperatorPlayers(operatorId, { unauthorizedOnly: true }),
    enabled: !!operatorId,
  });

  const unauthorizedPlayers = unauthorizedPlayersData?.data || [];

  // Auto-authorize established players when the list loads
  useEffect(() => {
    if (!unauthorizedPlayersData?.data || unauthorizedPlayersData.data.length === 0 || isAutoAuthorizing) return;

    const playersToCheck = unauthorizedPlayersData.data;

    const autoAuthorizeAll = async () => {
      setIsAutoAuthorizing(true);
      let authorizedCount = 0;

      for (const player of playersToCheck) {
        const result = await autoAuthorizeEstablishedPlayer(player.id);
        if (result.authorized) {
          authorizedCount++;
          logger.info('Auto-authorized player', {
            playerId: player.id,
            name: `${player.first_name} ${player.last_name}`,
            totalGames: result.totalGames,
            handicap3v3: result.handicap3v3,
            handicap5v5: result.handicap5v5,
          });
        }
      }

      // If any players were auto-authorized, refresh the list
      if (authorizedCount > 0) {
        toast.success(`Auto-authorized ${authorizedCount} established player${authorizedCount !== 1 ? 's' : ''}`);
        queryClient.invalidateQueries({ queryKey: ['unauthorizedPlayers', operatorId] });
      }
      setIsAutoAuthorizing(false);
    };

    autoAuthorizeAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unauthorizedPlayersData]);

  // Update starting handicaps mutation
  const updateHandicapsMutation = useMutation({
    mutationFn: ({ playerId, h3v3, h5v5 }: { playerId: string; h3v3: number; h5v5: number }) =>
      updatePlayerStartingHandicaps(playerId, h3v3, h5v5),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unauthorizedPlayers', operatorId] });
      toast.success('Starting handicaps set successfully!');
    },
    onError: (error) => {
      logger.error('Error updating handicaps', { error: error instanceof Error ? error.message : String(error) });
      toast.error('Failed to set starting handicaps. Please try again.');
    },
  });

  // Open modal to set handicap for a player
  const handleOpenModal = (player: { id: string; first_name: string; last_name: string }) => {
    setModalPlayer({ id: player.id, name: `${player.first_name} ${player.last_name}` });
    setModalHandicap3v3('0');
    setModalHandicap5v5('40');
    setIsModalOpen(true);
  };

  // Handle saving from the modal
  const handleModalSave = () => {
    if (!modalPlayer) return;

    const h3v3 = parseFloat(modalHandicap3v3);
    const h5v5 = parseFloat(modalHandicap5v5);

    // Validate ranges
    if (isNaN(h3v3) || h3v3 < -2 || h3v3 > 2) {
      toast.error('Starting Handicap (3v3) must be between -2 and 2');
      return;
    }

    if (isNaN(h5v5) || h5v5 < 0 || h5v5 > 100) {
      toast.error('Starting Handicap (5v5) must be between 0 and 100');
      return;
    }

    updateHandicapsMutation.mutate({
      playerId: modalPlayer.id,
      h3v3,
      h5v5,
    });

    setIsModalOpen(false);
    setModalPlayer(null);
  };

  // Close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalPlayer(null);
  };

  return (
    <>
      <Card className="rounded-none lg:rounded-xl">
        <CardHeader className="p-4 lg:p-6 pb-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">Authorize New Players</CardTitle>
                  <div onClick={(e) => e.stopPropagation()}>
                    <InfoButton title="Player Authorization">
                      <p>Players become "established" after playing 15 games in the system, at which point their handicap is calculated automatically.</p>
                      <p className="mt-2">For new players with fewer than 15 games, you can set their starting handicaps here to authorize them for use in leagues that restrict lineups to established or authorized players only.</p>
                    </InfoButton>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {isLoading
                    ? 'Loading...'
                    : `${unauthorizedPlayers.length} player${unauthorizedPlayers.length !== 1 ? 's' : ''} need authorization`}
                </p>
              </div>
            </div>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </CardHeader>
        {isOpen && (
          <CardContent className="p-4 lg:p-6 pt-0">
            {isLoading || isAutoAuthorizing ? (
              <div className="flex items-center justify-center gap-2 py-4 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="text-sm">
                  {isAutoAuthorizing ? 'Checking for established players...' : 'Loading...'}
                </p>
              </div>
            ) : unauthorizedPlayers.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-4 text-green-600">
                <UserCheck className="h-5 w-5" />
                <p className="text-sm font-medium">All players are authorized!</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-3">
                  These players need their starting handicaps set. Click "Set" to authorize a player.
                </p>
                {unauthorizedPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 border-gray-200"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {player.first_name} {player.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        #{player.system_player_number?.toString().padStart(5, '0')}
                        {player.bca_member_number && ` • BCA: ${player.bca_member_number}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {onSelectPlayer && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            onSelectPlayer(player.id);
                            setIsOpen(false);
                          }}
                          title="View player details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleOpenModal(player)}
                      >
                        Set H/C
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Set Starting Handicap Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Starting Handicaps</DialogTitle>
            <DialogDescription>
              {modalPlayer
                ? `Authorize ${modalPlayer.name} by setting their starting handicaps.`
                : 'Set starting handicaps for this player.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 3v3 Handicap */}
            <div>
              <Label htmlFor="modal-handicap3v3">
                Starting Handicap (3v3)
              </Label>
              <Select
                value={modalHandicap3v3}
                onValueChange={setModalHandicap3v3}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select handicap" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-2">-2</SelectItem>
                  <SelectItem value="-1">-1</SelectItem>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">+1</SelectItem>
                  <SelectItem value="2">+2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 5v5 Handicap */}
            <div>
              <Label htmlFor="modal-handicap5v5">
                Starting Handicap (5v5)
                <span className="text-xs text-gray-500 ml-2">(0 to 100)</span>
              </Label>
              <Input
                id="modal-handicap5v5"
                type="number"
                step="1"
                min="0"
                max="100"
                value={modalHandicap5v5}
                onChange={(e) => setModalHandicap5v5(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              onClick={handleModalSave}
              disabled={updateHandicapsMutation.isPending}
            >
              {updateHandicapsMutation.isPending ? 'Saving...' : 'Set Handicaps'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuthorizeNewPlayersCard;
