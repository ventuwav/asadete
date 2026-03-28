import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import OpenDashboard from './OpenDashboard';
import SettledDashboard from './SettledDashboard';
import ClosedDashboard from './ClosedDashboard';

export const eventQueryKey = (shareToken: string) => ['event', shareToken];

export default function Dashboard() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const queryClient = useQueryClient();
  const [adminToken, setAdminToken] = useState<string | null>(
    localStorage.getItem(`admin_token_${shareToken}`)
  );

  const participantToken = localStorage.getItem(`asadete_${shareToken}`);

  const { data, isLoading, isError } = useQuery({
    queryKey: eventQueryKey(shareToken!),
    queryFn: () => api.events.get(shareToken!),
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: eventQueryKey(shareToken!) });

  // Auto-fetch admin token for creator on any device
  useEffect(() => {
    if (!data || !participantToken || adminToken) return;
    const currentUser = data.participants?.find((p: any) => p.participant_token === participantToken);
    if (!currentUser?.is_creator) return;
    api.events.getAdminToken(shareToken!, participantToken)
      .then(d => {
        localStorage.setItem(`admin_token_${shareToken}`, d.admin_token);
        setAdminToken(d.admin_token);
      })
      .catch(() => {});
  }, [data, participantToken, adminToken, shareToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcf8f7] flex items-center justify-center font-heading text-lg text-primary">
        Cargando la parrilla...
      </div>
    );
  }

  if (isError || !data || data.error) {
    return (
      <div className="min-h-screen bg-[#fcf8f7] flex items-center justify-center font-heading text-lg text-primary">
        Asado no encontrado.
      </div>
    );
  }

  const currentUser = data.participants.find((p: any) => p.participant_token === participantToken);

  const sharedProps = {
    shareToken: shareToken!,
    data,
    currentUser,
    adminToken,
    onRefresh: invalidate,
  };

  if (data.status === 'open') return <OpenDashboard {...sharedProps} />;
  if (data.status === 'settled') return <SettledDashboard {...sharedProps} />;
  if (data.status === 'closed') return <ClosedDashboard data={data} />;

  return null;
}
