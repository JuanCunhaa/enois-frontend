import { useState } from "react";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { type ConnectionRequest, networkApi, profileApi } from "@/lib/api";
import { requireAuth } from "@/lib/require-auth";
import { useAuth } from "@/lib/use-auth";
import { texts } from "@/texts";
import {
  getConnectionUiState,
  getRequestDirection,
  getRequestTargetUserId,
  type RequestDirection,
} from "@/utils/network";

import { AppContainer } from "@/components/app-container";
import {
  NetworkMatches,
  NetworkOverview,
  NetworkPendingRequests,
  type NetworkRequestViewModel,
} from "@/components/network/network-view";

export const Route = createFileRoute("/rede")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: texts.network.seoTitle }] }),
  component: NetworkPage,
});

function NetworkPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [connectionStatusByUserId, setConnectionStatusByUserId] = useState<
    Record<string, string>
  >({});

  const { data: networkUsersData } = useQuery({
    queryKey: ["network", "users"],
    queryFn: () => networkApi.listUsers(),
  });
  const { data: networkSummary } = useQuery({
    queryKey: ["network", "summary"],
    queryFn: () => networkApi.getSummary(),
  });
  const { data: connectionRequestsData } = useQuery({
    queryKey: ["network", "requests"],
    queryFn: () => networkApi.listRequests(),
    refetchInterval: 30_000,
  });

  const networkUsers = networkUsersData?.items ?? [];
  const pendingRequests = (connectionRequestsData?.items ?? []).filter(
    (request) => request.status === "PENDING",
  );
  const currentUserId = currentUser?.id ?? "";
  const requestDescriptors = pendingRequests.map((request) => {
    const direction = getRequestDirection(request, currentUserId);
    return {
      request,
      direction,
      targetUserId: getRequestTargetUserId(request, direction),
    };
  });
  const requestProfileQueries = useQueries({
    queries: requestDescriptors.map(({ targetUserId }) => ({
      queryKey: ["profile", "by-id", targetUserId],
      queryFn: () => profileApi.getById(targetUserId),
      enabled: Boolean(targetUserId),
      staleTime: 60_000,
    })),
  });

  const requestViewModelsByDirection: Record<RequestDirection, NetworkRequestViewModel[]> = {
    incoming: [],
    outgoing: [],
  };
  requestDescriptors.forEach((requestDescriptor, index) => {
    requestViewModelsByDirection[requestDescriptor.direction].push({
      ...requestDescriptor,
      user: requestProfileQueries[index]?.data,
    });
  });

  const matchViewModels = networkUsers.map((user) => ({
    user,
    connectionState: getConnectionUiState(user.connected, connectionStatusByUserId[user.id]),
  }));

  const invalidateNetworkQueries = () =>
    queryClient.invalidateQueries({ queryKey: ["network"] });

  const acceptConnectionRequestMutation = useMutation({
    mutationFn: (userId: string) => networkApi.acceptConnectionRequest(userId),
    onSuccess: invalidateNetworkQueries,
  });
  const sendConnectionRequestMutation = useMutation({
    mutationFn: (userId: string) => networkApi.sendConnectionRequest(userId),
    onSuccess: invalidateNetworkQueries,
  });
  const removeConnectionMutation = useMutation({
    mutationFn: (userId: string) => networkApi.removeConnection(userId),
    onSuccess: invalidateNetworkQueries,
  });

  const handleConnect = (userId: string) => {
    sendConnectionRequestMutation.mutate(userId);
    setConnectionStatusByUserId((currentStatusByUserId) => ({
      ...currentStatusByUserId,
      [userId]: "REQUESTED",
    }));
  };

  const handleRemove = (userId: string) => {
    removeConnectionMutation.mutate(userId);
    setConnectionStatusByUserId((currentStatusByUserId) => ({
      ...currentStatusByUserId,
      [userId]: "REMOVED",
    }));
  };

  const isConnectionMutationPending =
    sendConnectionRequestMutation.isPending || removeConnectionMutation.isPending;

  return (
    <AppContainer>
      <div className="space-y-6">
        <NetworkOverview summary={networkSummary} suggestionCount={networkUsers.length} />
        <NetworkPendingRequests
          incomingRequests={requestViewModelsByDirection.incoming}
          outgoingRequests={requestViewModelsByDirection.outgoing}
          onAccept={acceptConnectionRequestMutation.mutate}
          onCancel={removeConnectionMutation.mutate}
        />
        <NetworkMatches
          matches={matchViewModels}
          isPending={isConnectionMutationPending}
          onConnect={handleConnect}
          onRemove={handleRemove}
        />
      </div>
    </AppContainer>
  );
}
