/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/typedef */
import React, { useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import { EuiLoadingSpinner } from '@elastic/eui';
import styled from 'styled-components';
import { useBountyCardStore } from 'store/bountyCard';
import { BountyCard, BountyCardStatus } from 'store/interface';
import history from 'config/history';
import { Button } from 'components/common';
import { useStores } from '../../store';
import { colors } from '../../config';
import { WorkspacePlannerHeader } from './WorkspacePlannerHeader';
import BountyCardComp from './BountyCard';

const PlannerContainer = styled.div`
  padding: 0;
  height: calc(100vh - 65px);
  background: ${colors.light.grayish.G950};
  overflow-y: auto;
  overflow-x: hidden;
`;

const ContentArea = styled.div`
  width: 90%;
  margin: 20px auto;
  background: white;
  border-radius: 8px;
  text-align: center;
  padding: 20px;
`;

const ColumnsContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  overflow-x: auto;
  background: white;
  height: calc(100vh - 200px) !important;

  &::-webkit-scrollbar {
    height: 7px;
  }

  &::-webkit-scrollbar-track {
    background: ${colors.light.grayish.G900};
  }

  &::-webkit-scrollbar-thumb {
    background: ${colors.light.grayish.G800};
    border-radius: 4px;
  }
`;

interface ColumnProps {
  hidden?: boolean;
}

const Column = styled.div<ColumnProps>`
  flex: 0 0 320px;
  border-radius: 8px;
  display: ${(props: ColumnProps) => (props.hidden ? 'none' : 'flex')};
  flex-direction: column;
  height: auto;
  min-height: 500px;
`;

const ColumnHeader = styled.div`
  padding: 1rem;
  background: ${colors.light.grayish.G800};
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid ${colors.light.grayish.G700};
  position: sticky;
  top: 0;
  color: black;
`;

const ColumnTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardCount = styled.span`
  font-size: 0.875rem;
  color: ${colors.light.grayish.G400};
`;

const ColumnContent = styled.div`
  padding: 0.5rem;
  overflow-y: scroll;
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${colors.light.grayish.G900};
  }

  &::-webkit-scrollbar-thumb {
    background: ${colors.light.grayish.G800};
    border-radius: 3px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const ErrorMessage = styled.p`
  color: ${colors.light.red1};
  padding: 1rem;
  text-align: center;
`;

const COLUMN_CONFIGS = [
  { id: 'DRAFT', title: 'Draft' },
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'IN_REVIEW', title: 'In Review' },
  { id: 'COMPLETED', title: 'Complete' },
  { id: 'PAID', title: 'Paid' }
];

const getCardStatus = (card: BountyCard) => {
  if (card.status === 'DRAFT') return 'DRAFT';
  if (!card.status) return 'TODO';
  if (card.status === 'PAID') return 'PAID';
  if (card.status === 'COMPLETED') return 'COMPLETED';
  if (card.status === 'IN_REVIEW') return 'IN_REVIEW';
  if (card.status === 'IN_PROGRESS') return 'IN_PROGRESS';
  return 'TODO';
};

const WorkspacePlanner = observer(() => {
  const { uuid } = useParams<{ uuid: string }>();
  const { main } = useStores();
  const [loading, setLoading] = useState(true);
  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [filterToggle, setFilterToggle] = useState(false);
  const [searchText, setSearchText] = useState('');
  const bountyCardStore = useBountyCardStore(uuid);
  const [visibleCards, setVisibleCards] = useState<{ [key: string]: number }>(
    COLUMN_CONFIGS.reduce((acc, { id }) => ({ ...acc, [id]: 4 }), {})
  );
  const [showLoadMore, setShowLoadMore] = useState<{ [key: string]: boolean }>(
    COLUMN_CONFIGS.reduce((acc, { id }) => ({ ...acc, [id]: false }), {})
  );

  const observerRefs = useRef<{ [key: string]: IntersectionObserver }>({});

  useEffect(() => {
    bountyCardStore.restoreFilterState();
  }, [bountyCardStore, filterToggle]);

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      if (!uuid) return;
      const data = await main.getUserWorkspaceByUuid(uuid);
      setWorkspaceData(data);
      bountyCardStore.loadWorkspaceBounties();
      setLoading(false);
    };
    fetchWorkspaceData();
  }, [main, uuid, bountyCardStore]);

  const loadMoreCards = (columnId: string) => {
    setVisibleCards((prev) => {
      const newCount = prev[columnId] + 4;
      if (newCount >= 20) {
        setShowLoadMore((showMore) => ({ ...showMore, [columnId]: true }));
      }
      return { ...prev, [columnId]: newCount };
    });
  };

  const attachObserver = (columnId: string, element: HTMLElement | null) => {
    if (!element || observerRefs.current[columnId]) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreCards(columnId);
        }
      },
      { root: null, rootMargin: '0px', threshold: 1 }
    );

    observer.observe(element);
    observerRefs.current[columnId] = observer;
  };

  useEffect(
    () => () => {
      Object.values(observerRefs.current).forEach((observer) => observer.disconnect());
    },
    []
  );

  if (loading) {
    return (
      <PlannerContainer>
        <LoadingContainer>
          <EuiLoadingSpinner size="xl" />
        </LoadingContainer>
      </PlannerContainer>
    );
  }

  const groupedBounties = bountyCardStore.filteredBountyCards.reduce(
    (acc: { [key: string]: BountyCard[] }, card: BountyCard) => {
      const status = getCardStatus(card);
      if (!acc[status]) acc[status] = [];
      acc[status].push(card);
      return acc;
    },
    {}
  );

  const loadAllCards = (columnId: string) => {
    setVisibleCards((prev) => ({
      ...prev,
      [columnId]: groupedBounties[columnId]?.length || 0
    }));
    setShowLoadMore((showMore) => ({ ...showMore, [columnId]: false }));
  };

  const handleCardClick = (bountyId: string, status?: BountyCardStatus, ticketGroup?: string) => {
    bountyCardStore.saveFilterState();
    if (status === 'DRAFT' && ticketGroup) {
      const ticketUrl = history.createHref({
        pathname: `/workspace/${uuid}/ticket/${ticketGroup}`,
        state: { from: `/workspace/${uuid}/planner` }
      });
      console.log('Opening ticket URL:', ticketUrl);
      window.open(ticketUrl, '_blank');
    } else {
      window.open(
        history.createHref({
          pathname: `/bounty/${bountyId}`,
          state: { from: `/workspace/${uuid}/planner` }
        }),
        '_blank'
      );
    }
  };

  const shouldShowColumn = (status: BountyCardStatus): boolean => {
    if (bountyCardStore.selectedStatuses.length === 0) {
      return true;
    }
    return bountyCardStore.selectedStatuses.includes(status);
  };

  return (
    <PlannerContainer>
      <WorkspacePlannerHeader
        workspace_uuid={uuid}
        workspaceData={workspaceData}
        filterToggle={filterToggle}
        setFilterToggle={setFilterToggle}
        searchText={searchText}
        setSearchText={setSearchText}
      />
      <ContentArea>
        <ColumnsContainer>
          {COLUMN_CONFIGS.map(({ id, title }: { id: string; title: string }) => (
            <Column key={id} hidden={!shouldShowColumn(id as BountyCardStatus)}>
              <ColumnHeader>
                <ColumnTitle>
                  {title}
                  <CardCount>({groupedBounties[id]?.length || 0})</CardCount>
                </ColumnTitle>
              </ColumnHeader>
              <ColumnContent>
                {bountyCardStore.loading ? (
                  <LoadingContainer>
                    <EuiLoadingSpinner size="m" />
                  </LoadingContainer>
                ) : bountyCardStore.error ? (
                  <ErrorMessage>{bountyCardStore.error}</ErrorMessage>
                ) : (
                  groupedBounties[id]
                    ?.slice(0, visibleCards[id])
                    .filter((card: BountyCard) =>
                      card.title.toLowerCase().includes(searchText.toLowerCase())
                    )
                    .map((card: BountyCard, _index: number) => (
                      <BountyCardComp
                        key={card.id}
                        {...card}
                        onclick={() => handleCardClick(card.id, card.status, card.ticket_group)}
                      />
                    ))
                )}
                {!showLoadMore[id] && (
                  <div ref={(el) => attachObserver(id, el)} style={{ height: '2px' }} />
                )}
                {showLoadMore[id] && <Button text="Load More" onClick={() => loadAllCards(id)} />}
              </ColumnContent>
            </Column>
          ))}
        </ColumnsContainer>
      </ContentArea>
    </PlannerContainer>
  );
});

export default WorkspacePlanner;
