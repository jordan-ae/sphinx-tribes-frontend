/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import {
  EuiDragDropContext,
  EuiDraggable,
  EuiDroppable,
  EuiGlobalToastList,
  EuiIcon,
  EuiLink,
  EuiLoadingSpinner
} from '@elastic/eui';
import {
  Body,
  WorkspaceBody,
  Leftheader,
  Header,
  HeaderWrap,
  DataWrap,
  DataWrap2,
  LeftSection,
  RightSection,
  VerticalGrayLine,
  HorizontalGrayLine,
  FieldWrap,
  Label,
  Data,
  OptionsWrap,
  StyledListElement,
  FeatureLink,
  StyledList,
  EditPopoverTail,
  EditPopoverContent,
  EditPopoverText,
  EditPopover,
  WorkspaceFieldWrap
} from 'pages/tickets/style';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStores } from 'store';
import { useDeleteConfirmationModal } from 'components/common';
import { Box } from '@mui/system';
import { Feature, Person, Workspace } from 'store/interface';
import MaterialIcon from '@material/react-material-icon';
import { Button, Modal } from 'components/common';
import {
  ImageContainer,
  CompanyNameAndLink,
  CompanyLabel,
  UrlButtonContainer,
  UrlButton,
  RightHeader,
  CompanyDescription
} from 'pages/tickets/workspace/workspaceHeader/WorkspaceHeaderStyles';
import githubIcon from 'pages/tickets/workspace/workspaceHeader/Icons/githubIcon.svg';
import websiteIcon from 'pages/tickets/workspace/workspaceHeader/Icons/websiteIcon.svg';
import { EuiToolTip } from '@elastic/eui';
import { useIsMobile } from 'hooks';
import styled from 'styled-components';
import { AvatarGroup } from 'components/common/AvatarGroup';
import { userHasRole } from 'helpers/helpers-extended';
import { CodeGraph, Chat } from 'store/interface';
import { useHistory } from 'react-router-dom';
import { SchematicPreview } from 'people/SchematicPreviewer';
import { PostModal } from 'people/widgetViews/postBounty/PostModal';
import { chatService } from 'services';
import { archiveIcon } from 'components/common/DeleteConfirmationModal/archiveIcon';
import avatarIcon from '../../public/static/profile_avatar.svg';
import { colors } from '../../config/colors';
import dragIcon from '../../pages/superadmin/header/icons/drag_indicator.svg';
import { useFeatureFlag } from '../../hooks/useFeatureFlag';
import AddCodeGraph from './workspace/AddCodeGraphModal';
import AddFeature from './workspace/AddFeatureModal';
import {
  ActionButton,
  RowFlex,
  ButtonWrap,
  RepoName,
  MissionRowFlex,
  FullNoBudgetWrap,
  FullNoBudgetText,
  ChatRowFlex
} from './workspace/style';
import AddRepoModal from './workspace/AddRepoModal';
import EditSchematic from './workspace/EditSchematicModal';
import ManageWorkspaceUsersModal from './workspace/ManageWorkspaceUsersModal';
import { BudgetWrapComponent } from './BudgetWrap';
import { EditableField } from './workspace/EditableField';
import { Toast } from './workspace/interface';
import TextSnippetModal from './workspace/TextSnippetModal.tsx';

const color = colors['light'];

const FeaturesWrap = styled.div`
  margin-top: 25px;
`;

const FeatureDataWrap = styled.div`
  padding: 8px 5px;
  margin-bottom: 0px;
  border: 1px solid #fefefe;
  box-shadow: 0px 1px 2px 2px #00000026;
  border-radius: 10px;
  display: flex;
  font-size: 1rem;
  font-weight: 700;
  min-width: 100%;
  flex-direction: column;
  position: relative;
  background: #ffffff;
  margin-bottom: 5px;
`;

const FeatureCount = styled.h4`
  font-size: 1.1rem;
  font-weight: 400;
  padding: 0px;
  color: #5f6368;
  margin: 0;
`;

const FeatureData = styled.div`
  min-width: calc(100% - 7%);
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  margin-left: 7%;
  color: #5f6368;
`;

export const RowWrap = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem; /* Adjust this margin as needed */
`;

const EuiLinkStyled = styled(EuiLink)<{ isMobile: boolean }>`
  border: none;
  margin-left: ${(props: any) => (props.isMobile ? 'auto' : '0')};
  margin: ${(props: any) => (props.isMobile ? '0' : '0')};
  background-color: #fff;
`;

const StatusWrap = styled.div`
  margin-left: auto;
  margin-right: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

interface StatusType {
  type: string;
}

const StatusBox = styled.div<StatusType>`
  min-width: 155px;
  min-height: 65px;
  padding: 10px 5px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  position: relative;
  background: ${(props: any) => {
    if (props.type === 'completed') {
      return '#9157F612';
    } else if (props.type === 'assigned') {
      return '#49C99812';
    } else if (props.type === 'open') {
      return '#618AFF12';
    }
  }};
  font-weight: 600;
  border: ${(props: any) => {
    if (props.type === 'completed') {
      return ' 0.5px solid #9157F6';
    } else if (props.type === 'assigned') {
      return '0.5px solid #2FB379';
    } else if (props.type === 'open') {
      return '0.5px solid #5078F2';
    }
  }};
  color: ${(props: any) => {
    if (props.type === 'completed') {
      return '#9157F6';
    } else if (props.type === 'assigned') {
      return '#2FB379';
    } else if (props.type === 'open') {
      return '#5078F2';
    }
  }};
`;

const ChatListContainer = styled.div`
  margin-top: 13px;
  height: 300px;
  overflow-y: auto;
  border: 3px solid #848484;
  border-radius: 5px;
  background-color: #ffffff;
  padding: 10px;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 20px;
`;

const LoadingText = styled.div`
  margin-top: 10px;
`;

const EmptyStateMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const ChatListItem = styled(StyledListElement)`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #ebedf1;
  transition: background-color 0.2s ease;
  position: relative;

  &:hover {
    background-color: #f5f7fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ChatItemContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const ChatTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChatTimestamp = styled.div`
  font-size: 12px;
  color: #8c9196;
  white-space: nowrap;
`;

interface BudgetHeaderProps {
  color: string;
}

const BudgetCount = styled.span<BudgetHeaderProps>`
  background: ${(p: any) => p.color};
  color: #fff;
  padding: 0.5px 5px;
  border-radius: 50%;
  font-size: 0.65rem;
  font-weight: bolder;
  display: inline-block;
  margin-left: 10px;
`;

const BudgetBountyLink = styled.span`
  cursor: pointer;
  position: absolute;
  right: 8px;
  top: 4px;
`;

const DragIcon = styled.img`
  width: 20px;
  height: 20px;
  padding: 0px;
  margin: 0;
`;

const WorkspaceMission = () => {
  const { main, ui } = useStores();
  const { uuid } = useParams<{ uuid: string }>();
  const [workspaceData, setWorkspaceData] = useState<Workspace>();
  const [loading, setLoading] = useState(true);
  const [displayMission, setDidplayMission] = useState(false);
  const [visibleFeatureStatus, setVisibleFeatureStatus] = useState<{ [key: string]: boolean }>({});
  const [visibleChatMenu, setVisibleChatMenu] = useState<{ [key: string]: boolean }>({});
  const [editMission, setEditMission] = useState(false);
  const [displaySchematic, setDidplaySchematic] = useState(false);
  const [editTactics, setEditTactics] = useState(false);
  const [displayTactics, setDidplayTactics] = useState(false);
  const [mission, setMission] = useState(workspaceData?.mission);
  const [schematicModal, setSchematicModal] = useState(false);
  const [tactics, setTactics] = useState(workspaceData?.tactics);
  const [repoName, setRepoName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentuuid, setCurrentuuid] = useState('');
  const [modalType, setModalType] = useState('add');
  const [featureModal, setFeatureModal] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [featuresCount] = useState(0);
  const [isOpenUserManage, setIsOpenUserManage] = useState<boolean>(false);
  const [users, setUsers] = useState<Person[]>([]);
  const [displayUserRepoOptions, setDisplayUserRepoOptions] = useState<Record<number, boolean>>({});
  const [codeGraphModal, setCodeGraphModal] = useState(false);
  const [codeGraph, setCodeGraph] = useState<CodeGraph[] | null>(null);
  const [codeGraphModalType, setCodeGraphModalType] = useState<'add' | 'edit'>('add');
  const [currentCodeGraphUuid, setCurrentCodeGraphUuid] = useState('');
  const [selectedCodeGraph, setSelectedCodeGraph] = useState<{
    name: string;
    url: string;
  }>();
  const history = useHistory();
  const { chat } = useStores();
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [missionPreviewMode, setMissionPreviewMode] = useState<'preview' | 'edit'>('edit');
  const [tacticsPreviewMode, setTacticsPreviewMode] = useState<'preview' | 'edit'>('edit');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [holding, setHolding] = useState(false);
  const [permissionsChecked, setPermissionsChecked] = useState<boolean>(false);
  const [isPostBountyModalOpen, setIsPostBountyModalOpen] = useState(false);
  const [isSnippetModalVisible, setSnippetModalVisible] = useState(false);

  const openSnippetModal = () => {
    setSnippetModalVisible(true);
  };

  const closeSnippetModal = () => {
    setSnippetModalVisible(false);
  };

  const { isEnabled: isPlannerEnabled, loading: isPlannerLoading } =
    useFeatureFlag('display_planner');

  const fetchCodeGraph = useCallback(async () => {
    try {
      const data = await main.getWorkspaceCodeGraph(uuid);
      setCodeGraph(data);
    } catch (error) {
      console.error(error);
    }
  }, [main, uuid]);

  useEffect(() => {
    fetchCodeGraph();
  }, [fetchCodeGraph]);

  const openCodeGraphModal = (type: 'add' | 'edit', graph?: CodeGraph) => {
    if (type === 'edit' && graph) {
      if (graph) {
        setSelectedCodeGraph({
          name: graph.name,
          url: graph.url
        });
      }
      setCurrentCodeGraphUuid(graph.uuid);
    } else {
      setCurrentCodeGraphUuid('');
    }
    setCodeGraphModalType(type);
    setCodeGraphModal(true);
  };

  const closeCodeGraphModal = () => {
    setSelectedCodeGraph({
      name: '',
      url: ''
    });
    setCurrentCodeGraphUuid('');
    setCodeGraphModal(false);
  };

  const handleDeleteCodeGraph = async () => {
    try {
      await main.deleteCodeGraph(uuid, currentCodeGraphUuid);
      closeCodeGraphModal();
      fetchCodeGraph();
    } catch (error) {
      console.error('Error deleteCodeGraph', error);
    }
  };

  const handlePostBountyClick = () => {
    setIsPostBountyModalOpen(true);
  };

  useEffect(() => {
    const loadChats = async () => {
      setIsLoadingChats(true);
      try {
        const workspaceChats = await chat.getWorkspaceChats(uuid);
        if (workspaceChats && workspaceChats.length > 0) {
          const sortedChats = workspaceChats
            .filter((chat: Chat) => chat && chat.id)
            .sort((a: Chat, b: Chat) => {
              const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
              const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
              return dateB - dateA;
            });
          setChats(sortedChats);
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        ui.setToasts([
          {
            title: 'Error',
            color: 'danger',
            text: 'Failed to load chats.'
          }
        ]);
      } finally {
        setIsLoadingChats(false);
      }
    };
    loadChats();
  }, [uuid, chat, ui]);

  const handleNewChat = async () => {
    try {
      const newChat = await chat.createChat(uuid, 'New Chat');
      if (newChat && newChat.id) {
        history.push(`/workspace/${uuid}/hivechat/${newChat.id}`);
      } else {
        ui.setToasts([
          {
            title: 'Error',
            color: 'danger',
            text: 'Failed to create new chat. Please try again.'
          }
        ]);
      }
    } catch (error) {
      ui.setToasts([
        {
          title: 'Error',
          color: 'danger',
          text: 'An error occurred while creating the chat.'
        }
      ]);
    }
  };

  const handleChatClick = (chatId: string) => {
    history.push(`/workspace/${uuid}/hivechat/${chatId}`);
  };

  const handleWorkspacePlanner = () => {
    history.push(`/workspace/${uuid}/planner`);
  };

  const handleViewBounties = () => {
    window.open(`/workspace/bounties/${uuid}`, '_target');
  };

  const handleUserRepoOptionClick = (repositoryId: number) => {
    setDisplayUserRepoOptions((prev: Record<number, boolean>) => ({
      ...prev,
      [repositoryId]: !prev[repositoryId]
    }));
  };
  const [userRoles, setUserRoles] = useState<any[]>([]);

  const isMobile = useIsMobile();

  const editWorkspaceDisabled = useMemo(() => {
    if (!ui.meInfo) return true;
    if (!workspaceData?.owner_pubkey) return false;

    const isWorkspaceAdmin = workspaceData.owner_pubkey === ui.meInfo.owner_pubkey;
    return !isWorkspaceAdmin && !userHasRole(main.bountyRoles, userRoles, 'EDIT ORGANIZATION');
  }, [workspaceData, ui.meInfo, userRoles, main.bountyRoles]);

  const getUserRoles = useCallback(
    async (user: any) => {
      const pubkey = user.owner_pubkey;
      if (uuid && pubkey) {
        const userRoles = await main.getUserRoles(uuid, pubkey);
        setUserRoles(userRoles);
      }
    },
    [uuid, main]
  );

  useEffect(() => {
    if (uuid && ui.meInfo) {
      getUserRoles(ui.meInfo).finally(() => {
        setPermissionsChecked(true);
      });
    } else {
      setPermissionsChecked(true);
    }
  }, [getUserRoles]);

  const fetchRepositories = useCallback(async () => {
    try {
      const data = await main.getRepositories(uuid);
      setRepositories(data);
    } catch (error) {
      console.error(error);
    }
  }, [main, uuid]);

  const openModal = (type: string, repository?: any) => {
    if (type === 'add') {
      setRepoName('');
      setCurrentuuid('');
      setRepoUrl('');
      setIsModalVisible(true);
      setModalType(type);
    } else if (type === 'edit') {
      setRepoName(repository.name);
      setCurrentuuid(repository.uuid);
      setRepoUrl(repository.url);
      setIsModalVisible(true);
      setModalType(type);
    }
  };

  const closeRepoModal = () => {
    setIsModalVisible(false);
  };

  const DeleteRepository = async (workspace_uuid: string, repository_uuid: string) => {
    try {
      await main.deleteRepository(workspace_uuid, repository_uuid);
      closeRepoModal();
      fetchRepositories();
    } catch (error) {
      console.error('Error deleteRepository', error);
    }
  };

  const handleDelete = () => {
    closeRepoModal();
    DeleteRepository(uuid, currentuuid);
  };

  const { openDeleteConfirmation } = useDeleteConfirmationModal();

  const deleteHandler = () => {
    openDeleteConfirmation({
      onDelete: handleDelete,
      children: (
        <Box fontSize={20} textAlign="center">
          Are you sure you want to <br />
          <Box component="span" fontWeight="500">
            Delete this Repo? h
          </Box>
        </Box>
      )
    });
  };

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  const getWorkspaceData = useCallback(async () => {
    if (!uuid) return;
    const workspaceData = await main.getUserWorkspaceByUuid(uuid);
    if (!workspaceData) return;
    setWorkspaceData(workspaceData);

    setLoading(false);
  }, [uuid, main]);

  const getWorkspaceUsers = useCallback(async () => {
    if (uuid) {
      const users = await main.getWorkspaceUsers(uuid);
      setUsers(users);
      return users;
    }
  }, [main, uuid]);

  useEffect(() => {
    getWorkspaceData();
    getWorkspaceUsers();
  }, [getWorkspaceData, getWorkspaceUsers]);

  // const getFeaturesCount = useCallback(async () => {
  //   if (!uuid) return;
  //   const featuresCount = await main.getWorkspaceFeaturesCount(uuid);
  //   if (!featuresCount) return;
  //   setFeaturesCount(featuresCount);

  //   setLoading(false);
  // }, [uuid, main]);

  // useEffect(() => {
  //   getFeaturesCount();
  // }, [getFeaturesCount]);

  const updateFeatures = (newFeatures: Feature[]) => {
    const updatedFeatures: Feature[] = [...features];
    newFeatures.forEach((newFeat: Feature) => {
      const featIndex = features.findIndex((feat: Feature) => feat.uuid === newFeat.uuid);
      if (featIndex === -1) {
        updatedFeatures.push(newFeat);
      }
    });
    setFeatures(updatedFeatures);
  };

  const getFeatures = useCallback(async () => {
    if (!uuid) return;

    setLoading(true); // Set loading to true when the fetch starts
    setHolding(true); // Set holding to true to show fetching is in progress

    let allFeatures: Feature[] = [];
    let page = 1;
    let hasMoreData = true;

    try {
      while (hasMoreData) {
        const featuresRes = await main.getWorkspaceFeatures(uuid, {
          page,
          status: 'active'
        });

        if (featuresRes && Array.isArray(featuresRes)) {
          allFeatures = [...allFeatures, ...featuresRes];
          hasMoreData = featuresRes.length > 0; // Stop fetching if no data returned
          page++;
        } else {
          hasMoreData = false; // Stop on unexpected response
        }
      }

      if (allFeatures.length > 0) {
        updateFeatures(allFeatures); // Update features with all data
      }
    } catch (error) {
      console.error('Error fetching features:', error);
    } finally {
      setLoading(false); // Reset loading state after fetch completes
      setHolding(false); // Reset holding state after fetch completes
    }
  }, [uuid, main]);

  useEffect(() => {
    getFeatures();
  }, [getFeatures]);

  const handleWebsiteButton = (websiteUrl: string) => {
    window.open(websiteUrl, '_blank');
  };

  const handleGithubButton = (githubUrl: string) => {
    window.open(githubUrl, '_blank');
  };

  const editTacticsActions = () => {
    setEditTactics(!editTactics);
    setDidplayTactics(false);
  };

  const editMissionActions = () => {
    setEditMission(!editMission);
    setDidplayMission(false);
  };

  const toggleFeatureStatus = (uuid: string) => {
    setVisibleFeatureStatus((prevState: { [key: string]: boolean }) => ({
      ...prevState,
      [uuid]: !prevState[uuid]
    }));
  };

  const toggleChatMenu = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    setVisibleChatMenu({ [chatId]: !visibleChatMenu[chatId] });
  };

  const closeAllFeatureStatus = () => {
    setVisibleFeatureStatus({});
  };

  const archiveFeatureStatus = async (uuid: string) => {
    await main.archiveFeature(uuid);
    ui.setToasts([
      {
        title: 'Archived',
        color: 'success',
        text: 'Feature is successfully archived'
      }
    ]);
    getFeatures();
    closeAllFeatureStatus();
  };

  const submitMission = async () => {
    try {
      const body = {
        mission: mission ?? '',
        owner_pubkey: ui.meInfo?.owner_pubkey ?? '',
        uuid: workspaceData?.uuid ?? ''
      };
      await main.workspaceUpdateMission(body);
      await getWorkspaceData();
      setEditMission(false);
      setToasts([
        {
          id: `${Date.now()}-mission-success`,
          title: 'Success',
          color: 'success',
          text: 'Mission updated successfully!'
        }
      ]);
    } catch (error) {
      setToasts([
        {
          id: `${Date.now()}-mission-error`,
          title: 'Error',
          color: 'danger',
          text: 'Failed to update mission'
        }
      ]);
    }
  };

  const submitTactics = async () => {
    try {
      const body = {
        tactics: tactics ?? '',
        owner_pubkey: ui.meInfo?.owner_pubkey ?? '',
        uuid: workspaceData?.uuid ?? ''
      };
      await main.workspaceUpdateTactics(body);
      await getWorkspaceData();
      setEditTactics(false);
      setToasts([
        {
          id: `${Date.now()}-tactics-success`,
          title: 'Success',
          color: 'success',
          text: 'Tactics updated successfully!'
        }
      ]);
    } catch (error) {
      setToasts([
        {
          id: `${Date.now()}-tactics-error`,
          title: 'Error',
          color: 'danger',
          text: 'Failed to update tactics'
        }
      ]);
    }
  };

  const toggleFeatureModal = () => {
    setFeatureModal(!featureModal);
  };

  const toggleSchematicModal = () => {
    setDidplaySchematic(false);
    setSchematicModal(!schematicModal);
  };

  // const loadMore = () => {
  //   const nextPage = currentPage + 1;
  //   setCurrentPage(nextPage);
  // };

  const handleReorderFeatures = async (feat: Feature, priority: number) => {
    await main.addWorkspaceFeature({
      workspace_uuid: feat.workspace_uuid,
      uuid: feat.uuid,
      priority: priority
    });
  };

  const onDragEnd = ({ source, destination }: any) => {
    if (source && destination && source.index !== destination.index) {
      const updatedFeatures = [...features];

      const [movedItem] = updatedFeatures.splice(source.index, 1);
      const dropItem = features[destination.index];

      if (destination.index !== updatedFeatures.length) {
        updatedFeatures.splice(destination.index, 0, movedItem);
      } else {
        updatedFeatures[source.index] = dropItem;
        updatedFeatures.splice(updatedFeatures.length, 1, movedItem);
      }

      setFeatures(updatedFeatures);

      // get drag feature
      const dragIndex = updatedFeatures.findIndex((feat: Feature) => feat.uuid === movedItem.uuid);
      // get drop feature
      const dropIndex = updatedFeatures.findIndex((feat: Feature) => feat.uuid === dropItem.uuid);

      // update drag and drop items indexes
      handleReorderFeatures(movedItem, dragIndex + 1);
      handleReorderFeatures(dropItem, dropIndex + 1);
    }
  };

  const avatarList = useMemo(
    () => users.map((user: Person) => ({ name: user.owner_alias, imageUrl: user.img })),
    [users]
  );

  if (loading || holding || !permissionsChecked) {
    return (
      <Body style={{ justifyContent: 'center', alignItems: 'center' }}>
        <EuiLoadingSpinner size="xl" />
      </Body>
    );
  }

  const handleArchiveChat = async (chatId: string) => {
    try {
      setIsLoadingChats(true);
      await chatService.archiveChat(chatId);

      const updatedChats = await chat.getWorkspaceChats(uuid);
      setChats(updatedChats);

      setToasts([
        {
          id: `${Date.now()}-archive-success`,
          title: 'Success',
          color: 'success',
          text: 'Chat archived successfully!'
        }
      ]);
    } catch (error) {
      setToasts([
        {
          id: `${Date.now()}-archive-error`,
          title: 'Error',
          color: 'danger',
          text: 'Failed to archive chat'
        }
      ]);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const confirmArchiveChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    openDeleteConfirmation({
      onDelete: () => handleArchiveChat(chatId),
      onCancel: () =>
        setVisibleChatMenu((prev: Record<string, boolean>) => ({
          ...prev,
          [chatId]: false
        })),
      confirmButtonText: 'Confirm',
      customIcon: archiveIcon,
      children: (
        <Box fontSize={20} textAlign="center">
          Are you sure you want to <br />
          <Box component="span" fontWeight="500">
            Archive this Chat?
          </Box>
        </Box>
      )
    });
  };

  if (editWorkspaceDisabled) {
    return (
      <FullNoBudgetWrap>
        <MaterialIcon
          icon={'lock'}
          style={{
            fontSize: 30,
            cursor: 'pointer',
            color: '#ccc'
          }}
        />
        <FullNoBudgetText>
          You have restricted permissions and you are unable to view this page. Reach out to the
          workspace admin to get them updated.
        </FullNoBudgetText>
      </FullNoBudgetWrap>
    );
  }

  const toggleManageUserModal = () => setIsOpenUserManage(!isOpenUserManage);
  const updateWorkspaceUsers = (updatedUsers: Person[]) => setUsers(updatedUsers);

  return (
    !loading &&
    !editWorkspaceDisabled && (
      <WorkspaceBody>
        <HeaderWrap>
          <Header>
            <Leftheader>
              <ImageContainer
                src={workspaceData?.img || avatarIcon}
                width="72px"
                height="72px"
                alt="workspace icon"
              />
              <CompanyNameAndLink>
                <CompanyLabel>{workspaceData?.name}</CompanyLabel>
                <UrlButtonContainer data-testid="url-button-container">
                  {workspaceData?.website !== '' ? (
                    <UrlButton onClick={() => handleWebsiteButton(workspaceData?.website ?? '')}>
                      <img src={websiteIcon} alt="" />
                      Website
                    </UrlButton>
                  ) : (
                    ''
                  )}
                  {workspaceData?.github !== '' ? (
                    <UrlButton onClick={() => handleGithubButton(workspaceData?.github ?? '')}>
                      <img src={githubIcon} alt="" />
                      Github
                    </UrlButton>
                  ) : (
                    ''
                  )}
                </UrlButtonContainer>
              </CompanyNameAndLink>
            </Leftheader>
            <RightHeader>
              <CompanyDescription>{workspaceData?.description}</CompanyDescription>
            </RightHeader>
          </Header>
        </HeaderWrap>
        <DataWrap
          style={{
            marginTop: '20px'
          }}
        >
          <LeftSection>
            <FieldWrap>
              <Label>Mission</Label>
              <Data>
                <OptionsWrap>
                  <MaterialIcon
                    icon={'more_horiz'}
                    className="MaterialIcon"
                    onClick={() => setDidplayMission(!displayMission)}
                    data-testid="mission-option-btn"
                  />
                  {displayMission && (
                    <EditPopover>
                      <EditPopoverTail />
                      <EditPopoverContent onClick={editMissionActions}>
                        <MaterialIcon icon="edit" style={{ fontSize: '20px', marginTop: '2px' }} />
                        <EditPopoverText data-testid="mission-edit-btn">Edit</EditPopoverText>
                      </EditPopoverContent>
                    </EditPopover>
                  )}
                </OptionsWrap>
                <EditableField
                  value={mission ?? workspaceData?.mission ?? ''}
                  setValue={setMission}
                  isEditing={editMission}
                  previewMode={missionPreviewMode}
                  setPreviewMode={setMissionPreviewMode}
                  placeholder="Mission"
                  dataTestIdPrefix="mission"
                />
                {editMission && (
                  <ButtonWrap>
                    <ActionButton
                      onClick={() => setEditMission(!editMission)}
                      data-testid="mission-cancel-btn"
                      color="cancel"
                    >
                      Cancel
                    </ActionButton>
                    <ActionButton
                      color="primary"
                      onClick={submitMission}
                      data-testid="mission-update-btn"
                    >
                      Update
                    </ActionButton>
                  </ButtonWrap>
                )}
              </Data>
            </FieldWrap>
            <FieldWrap>
              <Label>Tactics and Objectives</Label>
              <Data>
                <OptionsWrap>
                  <MaterialIcon
                    onClick={() => setDidplayTactics(!displayTactics)}
                    icon={'more_horiz'}
                    className="MaterialIcon"
                    data-testid="tactics-option-btn"
                  />
                  {displayTactics && (
                    <EditPopover>
                      <EditPopoverTail />
                      <EditPopoverContent onClick={editTacticsActions}>
                        <MaterialIcon icon="edit" style={{ fontSize: '20px', marginTop: '2px' }} />
                        <EditPopoverText data-testid="tactics-edit-btn">Edit</EditPopoverText>
                      </EditPopoverContent>
                    </EditPopover>
                  )}
                </OptionsWrap>
                <EditableField
                  value={tactics ?? workspaceData?.tactics ?? ''}
                  setValue={setTactics}
                  isEditing={editTactics}
                  previewMode={tacticsPreviewMode}
                  setPreviewMode={setTacticsPreviewMode}
                  placeholder="Tactics"
                  dataTestIdPrefix="tactics"
                />
                {editTactics && (
                  <ButtonWrap>
                    <ActionButton
                      data-testid="tactics-cancel-btn"
                      onClick={() => setEditTactics(!editTactics)}
                      color="cancel"
                    >
                      Cancel
                    </ActionButton>
                    <ActionButton
                      data-testid="tactics-update-btn"
                      color="primary"
                      onClick={submitTactics}
                    >
                      Update
                    </ActionButton>
                  </ButtonWrap>
                )}
              </Data>
            </FieldWrap>
            <HorizontalGrayLine />
            <FieldWrap style={{ marginTop: '20px' }}>
              <DataWrap2>
                <RowFlex>
                  <Label>Repositories</Label>
                  <Button
                    onClick={() => openModal('add')}
                    style={{
                      borderRadius: '5px',
                      margin: 0,
                      marginLeft: 'auto'
                    }}
                    dataTestId="new-repository-btn"
                    text="Add Repository"
                  />
                </RowFlex>
                <StyledList>
                  {repositories.map((repository: any) => (
                    <StyledListElement key={repository?.id}>
                      <OptionsWrap style={{ position: 'unset', display: 'contents' }}>
                        <MaterialIcon
                          icon={'more_horiz'}
                          onClick={() => handleUserRepoOptionClick(repository?.id as number)}
                          className="MaterialIcon"
                          data-testid="repository-option-btn"
                          style={{ transform: 'rotate(90deg)' }}
                        />
                        {displayUserRepoOptions[repository?.id as number] && (
                          <EditPopover>
                            <EditPopoverTail bottom="-30px" left="-27px" />
                            <EditPopoverContent
                              onClick={() => {
                                openModal('edit', repository);
                                setDisplayUserRepoOptions((prev: Record<number, boolean>) => ({
                                  ...prev,
                                  [repository?.id]: !prev[repository?.id]
                                }));
                              }}
                              bottom="-60px"
                              transform="translateX(-90%)"
                            >
                              <MaterialIcon
                                icon="edit"
                                style={{ fontSize: '20px', marginTop: '2px' }}
                              />
                              <EditPopoverText data-testid="repository-edit-btn">
                                Edit
                              </EditPopoverText>
                            </EditPopoverContent>
                          </EditPopover>
                        )}
                      </OptionsWrap>
                      <RepoName>{repository.name} : </RepoName>
                      <EuiToolTip position="top" content={repository.url}>
                        <a href={repository.url} target="_blank" rel="noreferrer">
                          {repository.url}
                        </a>
                      </EuiToolTip>
                    </StyledListElement>
                  ))}
                </StyledList>
              </DataWrap2>
            </FieldWrap>

            <FieldWrap style={{ marginTop: '20px' }}>
              <DataWrap2>
                <RowFlex>
                  <Label>Code Graph</Label>

                  <Button
                    onClick={() => openCodeGraphModal('add')}
                    style={{
                      borderRadius: '5px',
                      margin: 0,
                      marginLeft: 'auto'
                    }}
                    dataTestId="new-codegraph-btn"
                    text="Add Code Graph"
                  />
                </RowFlex>
                {codeGraph && codeGraph?.length > 0 && (
                  <StyledList>
                    {codeGraph
                      ?.slice()
                      .sort(
                        (a: CodeGraph, b: CodeGraph) =>
                          new Date(a.created as string).getTime() -
                          new Date(b.created as string).getTime()
                      )
                      .map((graph: CodeGraph) => (
                        <StyledListElement key={graph.id}>
                          <OptionsWrap style={{ position: 'unset', display: 'contents' }}>
                            <MaterialIcon
                              icon={'more_horiz'}
                              onClick={() => handleUserRepoOptionClick(graph.id as number)}
                              className="MaterialIcon"
                              data-testid={`codegraph-option-btn-${graph.id}`}
                              style={{ transform: 'rotate(90deg)' }}
                            />
                            {displayUserRepoOptions[graph.id as number] && (
                              <EditPopover>
                                <EditPopoverTail bottom="-30px" left="-27px" />
                                <EditPopoverContent
                                  onClick={() => {
                                    openCodeGraphModal('edit', graph);
                                    setDisplayUserRepoOptions((prev: Record<number, boolean>) => ({
                                      ...prev,
                                      [graph.id as number]: !prev[graph.id as number]
                                    }));
                                  }}
                                  bottom="-60px"
                                  transform="translateX(-90%)"
                                >
                                  <MaterialIcon
                                    icon="edit"
                                    style={{ fontSize: '20px', marginTop: '2px' }}
                                  />
                                  <EditPopoverText data-testid={`codegraph-edit-btn-${graph.id}`}>
                                    Edit
                                  </EditPopoverText>
                                </EditPopoverContent>
                              </EditPopover>
                            )}
                          </OptionsWrap>
                          <RepoName>{graph.name} :</RepoName>
                          <EuiToolTip position="top" content={graph.url}>
                            <a href={graph.url} target="_blank" rel="noreferrer">
                              {graph.url}
                            </a>
                          </EuiToolTip>
                        </StyledListElement>
                      ))}
                  </StyledList>
                )}
              </DataWrap2>
            </FieldWrap>
          </LeftSection>
          <VerticalGrayLine />
          <RightSection>
            <FieldWrap>
              <Label>Schematic</Label>
              <Data style={{ border: 'none', paddingLeft: '0px', padding: '5px 5px' }}>
                <SchematicPreview
                  schematicImg={workspaceData?.schematic_img || ''}
                  schematicUrl={workspaceData?.schematic_url || ''}
                />
                <RowWrap>
                  <OptionsWrap style={{ position: 'unset', display: 'contents' }}>
                    <MaterialIcon
                      icon={'more_horiz'}
                      className="MaterialIcon"
                      onClick={() => setDidplaySchematic(!displaySchematic)}
                      data-testid="schematic-option-btn"
                      style={{ transform: 'rotate(90deg)' }}
                    />
                    <EditPopover style={{ display: displaySchematic ? 'block' : 'none' }}>
                      <EditPopoverTail bottom="-30px" left="-27px" />
                      <EditPopoverContent
                        onClick={toggleSchematicModal}
                        bottom="-60px"
                        transform="translateX(-90%)"
                      >
                        <MaterialIcon icon="edit" style={{ fontSize: '20px', marginTop: '2px' }} />
                        <EditPopoverText data-testid="schematic-edit-btn">Edit</EditPopoverText>
                      </EditPopoverContent>
                    </EditPopover>
                  </OptionsWrap>
                  {workspaceData?.schematic_url ? (
                    <a
                      href={workspaceData?.schematic_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="schematic-url"
                      style={{ marginLeft: '0.5rem' }}
                    >
                      schematic
                    </a>
                  ) : (
                    <span style={{ marginLeft: '0.5rem' }}>No schematic url yet</span>
                  )}
                </RowWrap>
              </Data>
            </FieldWrap>
            <HorizontalGrayLine />
            <FieldWrap style={{ marginTop: '20px' }}>
              <RowFlex style={{ gap: '25px', marginBottom: '15px' }}>
                <Label style={{ margin: 0 }}>People</Label>
                <EuiLinkStyled isMobile={isMobile} onClick={toggleManageUserModal}>
                  Manage
                </EuiLinkStyled>
              </RowFlex>
              <AvatarGroup avatarList={avatarList} avatarSize="xl" maxGroupSize={5} />
            </FieldWrap>

            <HorizontalGrayLine />
            {uuid && isPlannerEnabled && !isPlannerLoading && (
              <WorkspaceFieldWrap>
                <Button
                  style={{
                    borderRadius: '5px',
                    margin: 0,
                    padding: '10px 20px',
                    width: '100%',
                    backgroundColor: '#4285f4',
                    color: 'white',
                    textAlign: 'center',
                    border: 'none',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                  onClick={handleWorkspacePlanner}
                  dataTestId="workspace-planner-btn"
                  text="Workspace Planner"
                />
              </WorkspaceFieldWrap>
            )}
            <WorkspaceFieldWrap>
              <Button
                style={{
                  borderRadius: '5px',
                  margin: 0,
                  padding: '10px 20px',
                  width: '100%',
                  backgroundColor: '#4285f4',
                  color: 'white',
                  textAlign: 'center',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
                onClick={handleViewBounties}
                dataTestId="workspace-planner-btn"
                text="View Bounties"
              />
            </WorkspaceFieldWrap>
            <WorkspaceFieldWrap>
              <Button
                style={{
                  borderRadius: '5px',
                  margin: 0,
                  padding: '10px 20px',
                  width: '100%',
                  backgroundColor: '#4285f4',
                  color: 'white',
                  textAlign: 'center',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
                onClick={() => openSnippetModal()}
                dataTestId="workspace-planner-btn"
                text="Manage Text snippets"
              />
            </WorkspaceFieldWrap>
            <WorkspaceFieldWrap>
              <Button
                style={{
                  borderRadius: '5px',
                  margin: 0,
                  padding: '10px 20px',
                  width: '100%',
                  backgroundColor: '#49C998',
                  color: 'white',
                  textAlign: 'center',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
                onClick={handlePostBountyClick}
                dataTestId="post-bounty-btn"
                text="Post Bounty"
              />
            </WorkspaceFieldWrap>
            <HorizontalGrayLine />
            <FieldWrap style={{ marginTop: '10px' }}>
              <Label>Talk to Hive</Label>
              <Button
                style={{
                  borderRadius: '5px',
                  margin: 0,
                  padding: '10px 20px',
                  width: '100%',
                  backgroundColor: '#4285f4',
                  color: 'white',
                  textAlign: 'center',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
                onClick={handleNewChat}
                dataTestId="new-chat-btn"
                text="New Chat"
              />
              <ChatListContainer>
                {isLoadingChats ? (
                  <LoadingContainer>
                    <EuiLoadingSpinner size="m" />
                    <LoadingText>Loading chats...</LoadingText>
                  </LoadingContainer>
                ) : chats.length > 0 ? (
                  <StyledList>
                    {chats.map((chat: Chat) => (
                      <ChatListItem key={chat.id} onClick={() => handleChatClick(chat.id)}>
                        <ChatItemContent>
                          <ChatRowFlex>
                            <ChatTitle>{chat.title || 'Untitled Chat'}</ChatTitle>
                            <ChatTimestamp>
                              {chat.updatedAt || chat.createdAt
                                ? new Date(chat.updatedAt || chat.createdAt).toLocaleString()
                                : 'No date'}
                            </ChatTimestamp>
                          </ChatRowFlex>
                          <OptionsWrap style={{ top: 'unset' }}>
                            <MaterialIcon
                              icon={'more_horiz'}
                              className="MaterialIcon"
                              onClick={(e: React.MouseEvent) => toggleChatMenu(chat.id, e)}
                              data-testid={`chat-option-btn-${chat.id}`}
                            />
                            {visibleChatMenu[chat.id] && (
                              <EditPopover>
                                <EditPopoverTail />
                                <EditPopoverContent
                                  onClick={(e: React.MouseEvent) => confirmArchiveChat(chat.id, e)}
                                >
                                  <EditPopoverText data-testid={`chat-archive-btn-${chat.id}`}>
                                    Archive
                                  </EditPopoverText>
                                </EditPopoverContent>
                              </EditPopover>
                            )}
                          </OptionsWrap>
                        </ChatItemContent>
                      </ChatListItem>
                    ))}
                  </StyledList>
                ) : (
                  <EmptyStateMessage>
                    No chats yet. Click &ldquo;New Chat&rdquo; to start a conversation.
                  </EmptyStateMessage>
                )}
              </ChatListContainer>
            </FieldWrap>
          </RightSection>
        </DataWrap>

        <DataWrap style={{ marginTop: '20px', padding: '0px' }}>
          <FieldWrap style={{ background: 'white' }}>
            <BudgetWrapComponent uuid={uuid} org={workspaceData} />
          </FieldWrap>
        </DataWrap>
        <DataWrap style={{ marginTop: '20px' }}>
          <FieldWrap style={{ marginBottom: '5rem' }}>
            <RowFlex>
              <Label>Features</Label>
              <Button
                onClick={toggleFeatureModal}
                style={{
                  borderRadius: '5px',
                  margin: 0,
                  marginLeft: 'auto'
                }}
                dataTestId="new-feature-btn"
                text="New Feature"
              />
            </RowFlex>
            <FeaturesWrap>
              <EuiDragDropContext onDragEnd={onDragEnd}>
                <EuiDroppable droppableId="features_droppable_area" spacing="m">
                  {features &&
                    features
                      // .sort((a: Feature, b: Feature) => a.priority - b.priority)
                      .map((feat: Feature, i: number) => (
                        <EuiDraggable
                          spacing="m"
                          key={feat.id}
                          index={i}
                          draggableId={feat.uuid}
                          customDragHandle
                          hasInteractiveChildren
                        >
                          {(provided: any) => (
                            <FeatureDataWrap key={i} data-testid="feature-item">
                              <MissionRowFlex>
                                <DragIcon
                                  src={dragIcon}
                                  color="transparent"
                                  className="drag-handle"
                                  paddingSize="s"
                                  {...provided.dragHandleProps}
                                  data-testid={`drag-handle-${feat.priority}`}
                                  aria-label="Drag Handle"
                                />
                                <FeatureCount>{i + 1}</FeatureCount>
                              </MissionRowFlex>
                              <FeatureData>
                                <FeatureLink
                                  href={`/feature/${feat.uuid}`}
                                  style={{ marginLeft: '1rem' }}
                                >
                                  {feat.name}
                                </FeatureLink>
                                <OptionsWrap>
                                  <MaterialIcon
                                    icon={'more_horiz'}
                                    className="MaterialIcon"
                                    onClick={() => toggleFeatureStatus(feat.uuid)}
                                    data-testid="mission-option-btn"
                                  />
                                  {visibleFeatureStatus[feat.uuid] && (
                                    <EditPopover>
                                      <EditPopoverTail />
                                      <EditPopoverContent
                                        onClick={() => archiveFeatureStatus(feat.uuid)}
                                      >
                                        <EditPopoverText data-testid="mission-edit-btn">
                                          Archive
                                        </EditPopoverText>
                                      </EditPopoverContent>
                                    </EditPopover>
                                  )}
                                </OptionsWrap>
                                <StatusWrap>
                                  <StatusBox type="completed">
                                    Completed
                                    <BudgetCount color="#9157F6">
                                      {feat.bounties_count_completed
                                        ? feat.bounties_count_completed.toLocaleString()
                                        : 0}
                                    </BudgetCount>
                                    <BudgetBountyLink>
                                      <Link target="_blank" to={''}>
                                        <EuiIcon type="popout" color="#9157F6" />
                                      </Link>
                                    </BudgetBountyLink>
                                  </StatusBox>
                                  <StatusBox type="assigned">
                                    Assigned
                                    <BudgetCount color="#2FB379">
                                      {feat.bounties_count_assigned
                                        ? feat.bounties_count_assigned.toLocaleString()
                                        : 0}
                                    </BudgetCount>
                                    <BudgetBountyLink>
                                      <Link target="_blank" to={''}>
                                        <EuiIcon type="popout" color="#2FB379" />
                                      </Link>
                                    </BudgetBountyLink>
                                  </StatusBox>
                                  <StatusBox type="open">
                                    Open
                                    <BudgetCount color="#5078F2">
                                      {feat.bounties_count_open
                                        ? feat.bounties_count_open.toLocaleString()
                                        : 0}
                                    </BudgetCount>
                                    <BudgetBountyLink>
                                      <Link target="_blank" to={''}>
                                        <EuiIcon size="m" type="popout" color="#5078F2" />
                                      </Link>
                                    </BudgetBountyLink>
                                  </StatusBox>
                                </StatusWrap>
                              </FeatureData>
                            </FeatureDataWrap>
                          )}
                        </EuiDraggable>
                      ))}
                </EuiDroppable>
              </EuiDragDropContext>
            </FeaturesWrap>
            {/* {featuresCount > features.length ? (
              <LoadMoreContainer
                color={color}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <div className="LoadMoreButton" onClick={() => loadMore()}>
                  Load More
                </div>
              </LoadMoreContainer>
            ) : null} */}
          </FieldWrap>
        </DataWrap>
        <Modal
          visible={featureModal}
          style={{
            height: '100%',
            flexDirection: 'column'
          }}
          envStyle={{
            marginTop: isMobile ? 64 : 0,
            background: color.pureWhite,
            zIndex: 20,
            maxHeight: '100%',
            borderRadius: '10px',
            minWidth: isMobile ? '100%' : '25%',
            minHeight: isMobile ? '100%' : '20%'
          }}
          overlayClick={toggleFeatureModal}
          bigCloseImage={toggleFeatureModal}
          bigCloseImageStyle={{
            top: '-18px',
            right: '-18px',
            background: '#000',
            borderRadius: '50%'
          }}
        >
          <AddFeature
            closeHandler={toggleFeatureModal}
            getFeatures={getFeatures}
            workspace_uuid={uuid}
            priority={featuresCount}
          />
        </Modal>
        <Modal
          visible={isModalVisible}
          style={{
            height: '100%',
            flexDirection: 'column'
          }}
          envStyle={{
            marginTop: isMobile ? 64 : 0,
            background: color.pureWhite,
            zIndex: 20,
            maxHeight: '100%',
            borderRadius: '10px',
            minWidth: isMobile ? '100%' : '25%',
            minHeight: isMobile ? '100%' : '20%'
          }}
          overlayClick={closeRepoModal}
          bigCloseImage={closeRepoModal}
          bigCloseImageStyle={{
            top: '-18px',
            right: '-18px',
            background: '#000',
            borderRadius: '50%'
          }}
        >
          <AddRepoModal
            closeHandler={closeRepoModal}
            getRepositories={fetchRepositories}
            workspace_uuid={uuid}
            currentUuid={currentuuid}
            modalType={modalType}
            handleDelete={deleteHandler}
            name={repoName}
            url={repoUrl}
          />
        </Modal>
        <Modal
          visible={schematicModal}
          style={{
            height: '100%',
            flexDirection: 'column'
          }}
          envStyle={{
            marginTop: isMobile ? 64 : 0,
            background: color.pureWhite,
            zIndex: 20,
            maxHeight: '100%',
            borderRadius: '10px',
            minWidth: isMobile ? '100%' : '25%',
            minHeight: isMobile ? '100%' : '20%'
          }}
          overlayClick={toggleSchematicModal}
          bigCloseImage={toggleSchematicModal}
          bigCloseImageStyle={{
            top: '-18px',
            right: '-18px',
            background: '#000',
            borderRadius: '50%'
          }}
        >
          <EditSchematic
            closeHandler={toggleSchematicModal}
            getSchematic={getWorkspaceData}
            uuid={workspaceData?.uuid}
            owner_pubkey={ui.meInfo?.owner_pubkey}
            schematic_url={workspaceData?.schematic_url ?? ''}
            schematic_img={workspaceData?.schematic_img ?? ''}
          />
        </Modal>
        <Modal
          visible={codeGraphModal}
          style={{
            height: '100%',
            flexDirection: 'column'
          }}
          envStyle={{
            marginTop: isMobile ? 64 : 0,
            background: color.pureWhite,
            zIndex: 20,
            maxHeight: '100%',
            borderRadius: '10px',
            minWidth: isMobile ? '100%' : '25%',
            minHeight: isMobile ? '100%' : '20%'
          }}
          overlayClick={closeCodeGraphModal}
          bigCloseImage={closeCodeGraphModal}
          bigCloseImageStyle={{
            top: '-18px',
            right: '-18px',
            background: '#000',
            borderRadius: '50%'
          }}
        >
          <AddCodeGraph
            closeHandler={closeCodeGraphModal}
            getCodeGraph={fetchCodeGraph}
            workspace_uuid={uuid}
            modalType={codeGraphModalType}
            currentUuid={currentCodeGraphUuid}
            handleDelete={handleDeleteCodeGraph}
            name={selectedCodeGraph?.name}
            url={selectedCodeGraph?.url}
          />
        </Modal>
        <Modal
          visible={isSnippetModalVisible}
          style={{
            height: '100%',
            flexDirection: 'column'
          }}
          envStyle={{
            marginTop: isMobile ? 64 : 0,
            background: color.pureWhite,
            zIndex: 20,
            maxHeight: '60%',
            borderRadius: '10px',
            minWidth: isMobile ? '100%' : '60%',
            minHeight: isMobile ? '100%' : '50%',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            overflowX: 'hidden'
          }}
          overlayClick={closeSnippetModal}
          bigCloseImage={closeSnippetModal}
          bigCloseImageStyle={{
            position: 'absolute',
            top: '-1%',
            right: '-1%',
            background: '#000',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          <TextSnippetModal isVisible={isSnippetModalVisible} workspaceUUID={uuid} />
        </Modal>

        {isOpenUserManage && (
          <ManageWorkspaceUsersModal
            isOpen={isOpenUserManage}
            close={() => setIsOpenUserManage(!isOpenUserManage)}
            uuid={uuid}
            org={workspaceData}
            users={users}
            updateUsers={updateWorkspaceUsers}
          />
        )}
        <EuiGlobalToastList
          toasts={toasts}
          dismissToast={() => setToasts([])}
          toastLifeTimeMs={3000}
        />
        <PostModal
          widget="bounties"
          isOpen={isPostBountyModalOpen}
          onClose={() => setIsPostBountyModalOpen(false)}
        />
      </WorkspaceBody>
    )
  );
};

export default WorkspaceMission;
