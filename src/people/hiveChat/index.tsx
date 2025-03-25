/* eslint-disable @typescript-eslint/typedef */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import hljs from 'highlight.js';
import { ChatMessage, Artifact, TextContent } from 'store/interface';
import { useStores } from 'store';
import { createSocketInstance } from 'config/socket';
import SidebarComponent from 'components/common/SidebarComponent.tsx';
import { SOCKET_MSG } from 'config/socket';
import styled from 'styled-components';
import { EuiLoadingSpinner } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import { chatHistoryStore } from 'store/chat.ts';
import { renderMarkdown } from '../utils/RenderMarkdown.tsx';
import { UploadModal } from '../../components/UploadModal';
import { useFeatureFlag, useBrowserTabTitle } from '../../hooks';
import VisualScreenViewer from '../widgetViews/workspace/VisualScreenViewer.tsx';
import { ModelOption } from './modelSelector.tsx';
import { ActionArtifactRenderer } from './ActionArtifactRenderer';
import ThinkingModeToggle from './ThinkingModeToggle.tsx';
import SplashScreen from './ChatSplashScreen';

interface RouteParams {
  uuid: string;
  chatId: string;
}

interface MessageBubbleProps {
  isUser: boolean;
}

interface SendButtonProps {
  disabled: boolean;
}

interface LogEntry {
  timestamp: string;
  projectId: string;
  chatId: string;
  message: string;
}

const Container = styled.div<{ collapsed: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0 25px 0 35px;
  overflow: hidden;
  background: var(--Search-bar-background, #f2f3f5);
  margin-left: ${({ collapsed }: { collapsed: boolean }) => (collapsed ? '50px' : '250px')};
  transition: margin-left 0.3s ease-in-out;
`;

const ChatBodyWrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0 !important;
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const ViewerSection = styled.div<{ width: string }>`
  display: flex;
  flex-direction: column;
  padding-bottom: 30px !important;
  width: ${(props) => props.width};
  overflow: hidden;
  transition: width 0.1s ease;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 10px 8px 0;
  border-radius: 8px 8px 0 0;
`;

const ChatSection = styled.div<{ width: string }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: ${(props) => props.width};
  overflow: hidden;
  transition: width 0.1s ease;
`;

const ViewerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-radius: 8px 8px 0 0;
`;

const ChatBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 5px 0 0 !important;
  flex: 1;
  overflow: hidden;
`;

const SaveTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const Title = styled.h2`
  font-size: 1.1rem;
  font-weight: 500;
  color: #5f6368;
  margin: 0;
  flex-grow: 1;
`;

const TitleInput = styled.input`
  font-size: 1.1rem;
  font-weight: 500;
  color: #5f6368;
  border: 2px solid #e4e7eb;
  padding: 4px 8px;
  width: 400px;
  border-radius: 4px;
  background: white;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #848484;
  }

  &:focus {
    border-color: #4285f4;
    outline: none;
  }
`;

const ChatHistory = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: white;
  margin: 1px 0;
  border-radius: 8px;
  min-height: 0;
  position: relative;
`;

const SplashContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 800px;
  padding: 20px;
`;

const HiveThoughts = styled.h6`
  margin-top: 20px;
`;

const MessageBubble = styled.div<MessageBubbleProps>`
  max-width: 90%;
  margin: 12px 0;
  padding: 0 20px;
  border-radius: 16px;
  word-wrap: break-word;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  align-self: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};
  background-color: ${(props) => (props.isUser ? '#808080' : '#F2F3F5')};
  color: ${(props) => (props.isUser ? 'white' : '#202124')};
  position: relative;
  padding-right: ${(props) => (!props.isUser ? '30px' : '20px')};
`;

const InputContainer = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-radius: 0 0 8px 8px;
  position: sticky;
  bottom: 0;
  margin: 0;
`;

const TextArea = styled.textarea`
  flex-grow: 1;
  padding: 12px;
  border: 2px solid #848484;
  border-radius: 8px;
  resize: none;
  min-height: 24px;
  max-height: 150px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 0;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #4285f4;
  }

  &:focus {
    outline: none;
    border-color: #4285f4;
  }
`;

const SendButton = styled.button<{ disabled: boolean }>`
  padding: 8px 24px;
  background-color: ${(props: SendButtonProps) => (props.disabled ? '#e4e7eb' : '#4285f4')};
  color: ${(props: SendButtonProps) => (props.disabled ? '#9aa0a6' : 'white')};
  border: none;
  border-radius: 8px;
  cursor: ${(props: SendButtonProps) => (props.disabled ? 'not-allowed' : 'pointer')};
  font-weight: 500;
  align-self: center;
  height: fit-content;
  transition: background-color 0.2s;
  margin-bottom: 13px;
  margin: 0;

  &:hover:not(:disabled) {
    background-color: #3367d6;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const AttachButton = styled.button<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 8px 8px 16px;
  margin-right: 6px;
  background: transparent;
  border: 1px solid #5f6368;
  border-radius: 8px;
  color: #5f6368;
  cursor: ${(props: { disabled: boolean }) => (props.disabled ? 'not-allowed' : 'pointer')};
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  height: fit-content;
  align-self: center;
  margin-top: 1px;

  &:hover:not(:disabled) {
    background: rgba(95, 99, 104, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    border-color: #e4e7eb;
    color: #9aa0a6;
  }
`;

const AttachIcon = styled(MaterialIcon)`
  font-size: 16px;
  margin-right: 2px;
`;

const TabContainer = styled.div`
  display: flex;
  margin-left: 10px;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 10px 16px;
  border: ${({ active }) => (!active ? 'none' : '1px solid #ddd')};
  background: ${({ active }) => (active ? '#808080' : '#f9f9f9')};
  color: ${({ active }) => (active ? 'white' : '#333')};
  font-weight: 700;
  font-family: Barlow;
  font-size: 16px;
  cursor: pointer;
  transition:
    background 0.3s,
    color 0.3s;
  border-radius: 8px 8px 0 0;
  margin-right: 4px;
  min-width: 120px;
  position: relative;

  &:hover {
    background: ${({ active }) => (active ? '#808080' : '#e6e6e6')};
    color: ${({ active }) => (active ? 'white' : '#1e1f25')};
  }
`;

const UpdateIndicator = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 8px;
  height: 8px;
  background-color: #f44336;
  border-radius: 50%;
`;

const CopyButton = styled.button<{ $isUser?: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${(props) => (props.$isUser ? 'rgba(255,255,255,0.7)' : '#5f6368')};
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${(props) => (props.$isUser ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.1)')};
    color: ${(props) => (props.$isUser ? 'white' : '#202124')};
    border-radius: 50%;
  }
`;

const AddButton = styled.button`
  padding: 8px;
  margin-left: 8px;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  background-color: white;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #f5f5f5;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const DividerHandle = styled.div`
  position: absolute;
  width: 28px;
  height: 43px;
  background-color: #4285f4;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
  left: -8px;

  &::before,
  &::after,
  &::before {
    content: '';
    width: 2px;
    height: 16px;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 2px;
  }
`;

const DividerContainer = styled.div`
  width: 12px;
  margin: 0 -2px;
  background-color: transparent;
  cursor: col-resize;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  transition: all 0.2s ease;
  z-index: 10;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 100%;
    background-color: #e0e0e0;
    transition: all 0.2s ease;
  }

  &:hover::after,
  &:focus::after {
    width: 4px;
    background-color: #4285f4;
    box-shadow: 0 0 8px rgba(66, 133, 244, 0.3);
  }

  &:active::after {
    width: 4px;
    background-color: #3367d6;
  }

  &:hover ${DividerHandle}, &:focus ${DividerHandle} {
    opacity: 1;
    transform: scale(1);
  }

  &:active ${DividerHandle} {
    background-color: #3367d6;
    transform: scale(0.95);
    opacity: 1;
  }

  &:focus {
    outline: none;
  }
`;

const DragTooltip = styled.div<{ visible: boolean }>`
  position: absolute;
  top: -36px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(51, 51, 51, 0.95);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity 0.2s ease;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 101;
`;

const MentionDropdown = styled.div`
  position: fixed;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 160px;
  max-height: 216px;
  overflow-y: auto;
  padding: 6px 0;
  &.mention-dropdown, &.command-dropdown {
    display: block;
  }
`;

const MentionOption = styled.div`
  padding: 10px 16px;
  cursor: pointer;
  min-height: 36px;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #202124;
  transition: background-color 0.15s ease;
  &:hover {
    background: #f8f9fa;
  }
`;

const connectToLogWebSocket = (
  projectId: string,
  chatId: string,
  setLogs: (update: (prevLogs: LogEntry[]) => LogEntry[]) => void,
  isVerboseLoggingEnabled: boolean
) => {
  const ws = new WebSocket('wss://jobs.stakwork.com/cable?channel=ProjectLogChannel');

  ws.onopen = () => {
    const command = {
      command: 'subscribe',
      identifier: JSON.stringify({ channel: 'ProjectLogChannel', id: projectId })
    };
    ws.send(JSON.stringify(command));
  };

  ws.onmessage = (event: any) => {
    const data = JSON.parse(event.data);
    if (data.type === 'ping') return;

    if (isVerboseLoggingEnabled) {
      console.log('Hive Chat Data message', data);
    }

    const messageData = data?.message;

    if (
      messageData &&
      (messageData.type === 'on_step_start' || messageData.type === 'on_step_complete')
    ) {
      setLogs((prevLogs: LogEntry[]) => [
        ...prevLogs,
        { timestamp: new Date().toISOString(), projectId, chatId, message: messageData.message }
      ]);
    }
  };

  ws.onerror = (error: any) => console.error('WebSocket error123:', error);

  return ws;
};

const highlightCode = (code: string): string => hljs.highlightAuto(code).value;

export const HiveChatView: React.FC = observer(() => {
  const { uuid, chatId } = useParams<RouteParams>();
  const { chat, ui } = useStores();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [websocketSessionId, setWebsocketSessionId] = useState('');
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('Talk to Hive - Chat');
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [collapsed, setCollapsed] = useState(() => {
    const storedCollapsed = localStorage.getItem('sidebarCollapsed');
    return storedCollapsed ? JSON.parse(storedCollapsed) : true;
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isChainVisible, setIsChainVisible] = useState(false);
  const [lastLogLine, setLastLogLine] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBuild, setIsBuild] = useState<'Chat' | 'Build'>('Build');
  const [visualArtifact, setVisualArtifact] = useState<Artifact[]>();
  const [textArtifact, setTextArtifact] = useState<Artifact[]>();
  const [sseArtifact, setSseArtifact] = useState<Artifact[]>();
  const [codeArtifact, setCodeArtifacts] = useState<Artifact[]>();
  const [isActionSend, setIsActionSend] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const { isEnabled: isVerboseLoggingEnabled } = useFeatureFlag('verbose_logging_sw');
  const { isEnabled: isArtifactLoggingEnabled } = useFeatureFlag('log_artefact');
  const { isEnabled: isPdfUploadEnabled } = useFeatureFlag('chat_pdf');
  const [selectedModel, setSelectedModel] = useState<ModelOption>({
    label: 'Open AI - 4o',
    value: 'gpt-4o'
  });
  const [artifactTab, setArtifactTab] = useState<'visual' | 'code' | 'text' | 'logs'>('code');
  const [updatedTabs, setUpdatedTabs] = useState<Record<string, boolean>>({
    visual: false,
    code: false,
    text: false,
    logs: false
  });
  const [lastProcessedMessageId, setLastProcessedMessageId] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chatSectionWidth, setChatSectionWidth] = useState(() => {
    const storedWidth = localStorage.getItem('hiveChatSectionWidth');
    return storedWidth ? storedWidth : '30%';
  });
  const [viewerSectionWidth, setViewerSectionWidth] = useState(() => {
    const storedWidth = localStorage.getItem('hiveViewerSectionWidth');
    return storedWidth ? storedWidth : '70%';
  });
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startChatWidthRef = useRef(0);
  const startViewerWidthRef = useRef(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const dividerRef = useRef<HTMLDivElement>(null);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const mentionOptions = [
    { label: 'tribes', value: 'tribes' },
    { label: 'build', value: 'build' },
    { label: 'chat', value: 'chat' },
    { label: 'help', value: 'help' }
  ];
  const [showCommandDropdown, setShowCommandDropdown] = useState(false);
  const [commandPosition, setCommandPosition] = useState({ top: 0, left: 0 });
  const commandOptions = [
    { label: 'leaderboard', value: 'leaderboard' },
    { label: 'sats', value: 'sats' }
  ];
  useBrowserTabTitle('Hive Chat');

  if (isVerboseLoggingEnabled) {
    console.log('Hive Chat logs', logs);
  }

  const refreshChatHistory = useCallback(async () => {
    try {
      await chat.loadChatHistory(chatId);
      const selectedChat = chat.getChat(chatId);
      if (selectedChat?.title) {
        setTitle(selectedChat.title);
      }
      if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Error refreshing chat history:', error);
      ui.setToasts([
        {
          title: 'Error',
          color: 'danger',
          text: 'Failed to refresh chat history'
        }
      ]);
    }
  }, [chat, chatId, ui]);

  useEffect(() => {
    const refreshChatOnFocus = async () => {
      try {
        if (document.visibilityState === 'visible') {
          await refreshChatHistory();
        }
      } catch (error) {
        console.error('Error refreshing chat history on focus:', error);
      }
    };

    window.addEventListener('visibilitychange', refreshChatOnFocus);
    window.addEventListener('focus', refreshChatOnFocus);

    return () => {
      window.removeEventListener('visibilitychange', refreshChatOnFocus);
      window.removeEventListener('focus', refreshChatOnFocus);
    };
  }, [refreshChatHistory]);

  const updateChatTitle = async (
    chatId: string,
    uuid: string,
    newTitle: string,
    setIsUpdatingTitle: (status: boolean) => void
  ): Promise<void> => {
    if (!chatId || !uuid || !newTitle.trim()) return;

    setIsUpdatingTitle(true);
    try {
      chatHistoryStore.updateChatTitle(chatId, newTitle);
      ui.setToasts([
        {
          title: 'Success',
          text: 'Chat Title Updated'
        }
      ]);
    } catch (error) {
      console.error('Error updating chat title:', error);
      ui.setToasts([
        {
          title: 'Error',
          color: 'danger',
          text: 'Failed to update chat title'
        }
      ]);
    } finally {
      setIsUpdatingTitle(false);
    }
  };

  useEffect(() => {
    const handleCollapseChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ collapsed: boolean }>;
      setCollapsed(customEvent.detail.collapsed);
      localStorage.setItem('sidebarCollapsed', JSON.stringify(customEvent.detail.collapsed));

      if (containerRef.current) {
        containerRef.current.style.marginLeft = customEvent.detail.collapsed ? '50px' : '250px';
      }
    };

    window.addEventListener('sidebarCollapse', handleCollapseChange as EventListener);

    const sidebarEvent = new CustomEvent('sidebarCollapse', {
      detail: { collapsed }
    });
    window.dispatchEvent(sidebarEvent);

    return () => {
      window.removeEventListener('sidebarCollapse', handleCollapseChange as EventListener);
    };
  }, [collapsed]);

  const handleSendMessage = async (messageToSend?: string) => {
    const messageText = messageToSend || message;
    if (!messageText.trim() || isSending) return;

    setIsSending(true);
    try {
      let socketId = websocketSessionId;
      if (socketId === '') {
        socketId = localStorage.getItem('websocket_token') || '';
      }

      const sentMessage = await chat.sendMessage(
        chatId,
        messageText,
        selectedModel.value,
        socketId,
        uuid,
        isBuild,
        undefined,
        pdfUrl
      );

      if (sentMessage) {
        chat.addMessage(sentMessage);
        setMessage('');
        setPdfUrl('');
        setShowSplash(false);

        const textarea = document.querySelector('textarea');
        if (textarea) {
          textarea.style.height = '60px';
        }
        if (chatHistoryRef.current) {
          chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      ui.setToasts([
        {
          title: 'Error',
          color: 'danger',
          text: 'Failed to send message'
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true);
      try {
        if (chatId) {
          await chat.loadChatHistory(chatId);
          const selectedChat = chat.getChat(chatId);
          if (selectedChat?.title) {
            setTitle(selectedChat.title);
          }

          const pendingMessage = sessionStorage.getItem('pending-hivechat-message');
          if (pendingMessage) {
            sessionStorage.removeItem('pending-hivechat-message');

            setTimeout(() => {
              setMessage(pendingMessage);
              handleSendMessage(pendingMessage);
            }, 500);
          }
        }
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [chatId, chat]);

  const onTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    try {
      await updateChatTitle(chatId, uuid, title, setIsUpdatingTitle);
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Error saving title:', error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let socket = createSocketInstance();

    socket.onmessage = async (event: MessageEvent) => {
      console.log('Raw websocket message received:', event.data);

      try {
        const data = JSON.parse(event.data);
        console.log('Parsed websocket message:', data);

        if (data.msg === SOCKET_MSG.user_connect) {
          const sessionId = data.body;
          setWebsocketSessionId(sessionId);
          console.log(`Websocket Session ID: ${sessionId}`);
        } else if (data.action === 'swrun' && data.message) {
          const match = data.message.match(/\/projects\/([^/]+)/);
          if (match && match[1]) {
            const projectID = match[1];
            setProjectId(projectID);
            console.log(`Project ID: ${projectID}`);
            setIsChainVisible(true);
            setLogs([]);
            setLastLogLine('');
          }
        } else if (data.action === 'message' && data.chatMessage) {
          chat.addMessage(data.chatMessage);
          setIsChainVisible(false);
          setIsActionSend(false);

          if (data.artifacts.length === 0) {
            setLogs([]);
            setLastLogLine('');
          }
          await refreshChatHistory();
        } else if (data.action === 'process' && data.chatMessage) {
          chat.updateMessage(data.chatMessage.id, data.chatMessage);
          await refreshChatHistory();
        }
      } catch (error) {
        console.error('Error processing websocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('Socket disconnected in Hive Chat');
    };

    socket.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      ui.setToasts([
        {
          title: 'Connection Error',
          color: 'danger',
          text: 'Failed to connect to chat server'
        }
      ]);
    };
  }, [ui, refreshChatHistory, chatId, chat]);

  useEffect(() => {
    const ws = connectToLogWebSocket(projectId, chatId, setLogs, isVerboseLoggingEnabled);

    return () => {
      ws.close();
    };
  }, [projectId, chatId, isVerboseLoggingEnabled, isActionSend]);

  useEffect(() => {
    if (logs.length > 0) {
      setLastLogLine(logs[logs.length - 1]?.message || '');
    }
  }, [logs]);

  useEffect(() => {
    const loadInitialChat = async () => {
      setLoading(true);
      try {
        await refreshChatHistory();
      } catch (err) {
        console.error('Error loading initial chat:', err);
        setError('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };

    if (chatId) {
      loadInitialChat();
    }
  }, [chatId, refreshChatHistory]);

  const messages = chat.chatMessages[chatId];

  useEffect(() => {
    const logArtifacts = async () => {
      if (chatId && isArtifactLoggingEnabled) {
        const res = await chat.loadArtifactsForChat(chatId);
        console.log('Artifacts for that chat', res);
        const screenArtifacts = res?.filter(
          (artifact) =>
            artifact &&
            artifact.type === 'visual' &&
            artifact.content &&
            'visual_type' in artifact.content &&
            artifact.content.visual_type === 'screen'
        );

        if (screenArtifacts) {
          setVisualArtifact(screenArtifacts);
        }

        const codeArtifacts = res?.filter(
          (artifact) =>
            artifact &&
            artifact.type === 'text' &&
            artifact.content &&
            'text_type' in artifact.content &&
            artifact.content.text_type === 'code'
        );

        const isTextContent = (content: any): content is TextContent =>
          content && typeof content.text_type === 'string' && 'language' in content;

        codeArtifacts.forEach((artifact) => {
          if (isTextContent(artifact.content)) {
            artifact.content.content = highlightCode(artifact.content.content);
          }
        });

        if (codeArtifacts) {
          setCodeArtifacts(codeArtifacts);
        }

        const textArtifacts = res?.filter(
          (artifact) =>
            artifact &&
            artifact.type === 'text' &&
            artifact.content &&
            'text_type' in artifact.content &&
            artifact.content.text_type !== 'code'
        );

        if (textArtifacts) {
          setTextArtifact(textArtifacts);
        }

        const sseArtifacts = res?.filter(
          (artifact) =>
            artifact &&
            artifact.type === 'text' &&
            artifact.content &&
            'text_type' in artifact.content &&
            artifact.content.text_type === 'sse_logs'
        );

        if (sseArtifacts) {
          setSseArtifact(sseArtifacts);
        }
      }
    };
    logArtifacts();
  }, [chat, chatId, isArtifactLoggingEnabled, messages]);

  useEffect(() => {
    const processArtifacts = () => {
      if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }
    };

    processArtifacts();
  }, []);

  useEffect(() => {
    const checkForNewArtifacts = async () => {
      if (!chatId || !isArtifactLoggingEnabled || messages.length === 0) return;

      const latestMessage = messages[messages.length - 1];
      if (latestMessage && latestMessage.id !== lastProcessedMessageId) {
        setLastProcessedMessageId(latestMessage.id);

        const res = await chat.loadArtifactsForChat(chatId);

        if (!res) return;

        const messageArtifacts = res.filter((artifact) => artifact.message_id === latestMessage.id);

        const hasVisualUpdates = messageArtifacts.some(
          (artifact) =>
            artifact.type === 'visual' &&
            artifact.content &&
            'visual_type' in artifact.content &&
            artifact.content.visual_type === 'screen'
        );

        const hasCodeUpdates = messageArtifacts.some(
          (artifact) =>
            artifact.type === 'text' &&
            artifact.content &&
            'text_type' in artifact.content &&
            artifact.content.text_type === 'code'
        );

        const hasTextUpdates = messageArtifacts.some(
          (artifact) =>
            artifact.type === 'text' &&
            artifact.content &&
            'text_type' in artifact.content &&
            artifact.content.text_type !== 'code' &&
            artifact.content.text_type !== 'sse_logs'
        );

        const hasLogUpdates = messageArtifacts.some(
          (artifact) =>
            artifact.type === 'text' &&
            artifact.content &&
            'text_type' in artifact.content &&
            artifact.content.text_type === 'sse_logs'
        );

        setUpdatedTabs({
          visual: hasVisualUpdates,
          code: hasCodeUpdates,
          text: hasTextUpdates,
          logs: hasLogUpdates
        });
      }
    };

    checkForNewArtifacts();
  }, [chat, chatId, isArtifactLoggingEnabled, messages, lastProcessedMessageId]);

  const handleUploadComplete = (url: string) => {
    setPdfUrl(url);
    setMessage((prevMessage: string) => {
      const pdfLink = `\n[PDF Document](${url})`;
      return prevMessage + pdfLink;
    });
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const {value} = e.target;
    setMessage(value);

    const cursorPos = e.target.selectionStart;

    if (value[cursorPos - 1] === '@') {
      const rect = e.target.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      const spaceBelow = window.innerHeight - (rect.top + rect.height);
      const dropdownHeight = Math.min(mentionOptions.length * 38, 216);

      const positionAbove = spaceBelow < dropdownHeight;
      
      setMentionPosition({
        top: positionAbove 
          ? rect.top + scrollTop - dropdownHeight - 12
          : rect.top + scrollTop + 38,
        left: rect.left + 8
      });
      setShowMentionDropdown(true);
      setShowCommandDropdown(false);
    }

    else if (value[cursorPos - 1] === '/') {
      const rect = e.target.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      const spaceBelow = window.innerHeight - (rect.top + rect.height);
      const dropdownHeight = Math.min(commandOptions.length * 36, 216);

      const positionAbove = spaceBelow < dropdownHeight;
      
      setCommandPosition({
        top: positionAbove 
          ? rect.top + scrollTop - dropdownHeight - 12
          : rect.top + scrollTop + 36,
        left: rect.left + 8
      });
      setShowCommandDropdown(true);
      setShowMentionDropdown(false);
    }
    else {
      setShowMentionDropdown(false);
      setShowCommandDropdown(false);
    }

    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        setIsBuild((prev) => {
          const newMode = prev === 'Chat' ? 'Build' : 'Chat';

          setTimeout(() => {
            const buttonToFocus = document.querySelector(
              `[role="radio"][aria-checked="true"]`
            ) as HTMLElement;
            if (buttonToFocus) {
              buttonToFocus.focus();
            }
          }, 0);

          return newMode;
        });
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsBuild((prev) => (prev === 'Chat' ? 'Build' : 'Chat'));
      }
    },
    [setIsBuild]
  );

  const showArtifactView =
    (visualArtifact && visualArtifact.length > 0) ||
    (codeArtifact && codeArtifact.length > 0) ||
    (textArtifact && textArtifact.length > 0);

  const handleSplashMessage = async (msg: string) => {
    setMessage(msg);
    setIsSending(true);

    try {
      const socketId = websocketSessionId || localStorage.getItem('websocket_token') || '';

      const sentMessage = await chat.sendMessage(
        chatId,
        msg,
        selectedModel.value,
        socketId,
        uuid,
        isBuild,
        undefined,
        pdfUrl
      );

      if (sentMessage) {
        chat.addMessage(sentMessage);
        setMessage('');
        setPdfUrl('');
        const textarea = document.querySelector('textarea');
        if (textarea) {
          textarea.style.height = '60px';
        }
        if (chatHistoryRef.current) {
          chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      ui.setToasts([
        {
          title: 'Error',
          color: 'danger',
          text: 'Failed to send message'
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    // When chatId changes, ensure sidebar is collapsed
    setCollapsed(true);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(true));

    // Dispatch event to update sidebar state
    const sidebarEvent = new CustomEvent('sidebarCollapse', {
      detail: { collapsed: true }
    });
    window.dispatchEvent(sidebarEvent);
  }, [chatId]);

  const handleNewChat = async () => {
    try {
      const newChat = await chat.createChat(uuid as string, 'New Chat');
      if (newChat && newChat.id) {
        window.location.href = `/workspace/${uuid}/hivechat/${newChat.id}`;
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

  const handleTabClick = (tabName: 'visual' | 'code' | 'text' | 'logs') => {
    setArtifactTab(tabName);
    setUpdatedTabs((prev) => ({
      ...prev,
      [tabName]: false
    }));
  };

  const handleDividerMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startChatWidthRef.current = parseFloat(chatSectionWidth);
    startViewerWidthRef.current = parseFloat(viewerSectionWidth);

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    e.preventDefault();
  };

  const handleDividerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = 2;
    let newChatWidth = parseFloat(chatSectionWidth);

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        e.stopPropagation();
        newChatWidth = Math.max(20, newChatWidth - step);
        break;
      case 'ArrowRight':
        e.preventDefault();
        e.stopPropagation();
        newChatWidth = Math.min(80, newChatWidth + step);
        break;
      default:
        return;
    }

    const newViewerWidth = 100 - newChatWidth;

    setChatSectionWidth(`${newChatWidth}%`);
    setViewerSectionWidth(`${newViewerWidth}%`);

    localStorage.setItem('hiveChatSectionWidth', `${newChatWidth}%`);
    localStorage.setItem('hiveViewerSectionWidth', `${newViewerWidth}%`);
  };

  const handleDividerClick = () => {
    dividerRef.current?.focus();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const containerWidth = containerRef.current?.clientWidth || 1000;
      const deltaX = e.clientX - startXRef.current;
      const deltaPercentage = (deltaX / containerWidth) * 100;

      let newChatWidth = startChatWidthRef.current + deltaPercentage;

      newChatWidth = Math.max(20, Math.min(80, newChatWidth));
      const newViewerWidth = 100 - newChatWidth;

      setChatSectionWidth(`${newChatWidth}%`);
      setViewerSectionWidth(`${newViewerWidth}%`);
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        localStorage.setItem('hiveChatSectionWidth', chatSectionWidth);
        localStorage.setItem('hiveViewerSectionWidth', viewerSectionWidth);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [chatSectionWidth, viewerSectionWidth]);

  const handleMentionSelect = (option: string) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      const currentValue = textarea.value;
      
      const newValue = `${currentValue.slice(0, cursorPos) + option  } ${  currentValue.slice(cursorPos)}`;
      setMessage(newValue);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = cursorPos + option.length + 1;
        textarea.focus();
      }, 0);
    }
    setShowMentionDropdown(false);
  };

  const handleCommandSelect = (option: string) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      const currentValue = textarea.value;
      
      const newValue = `${currentValue.slice(0, cursorPos) + option  } ${  currentValue.slice(cursorPos)}`;
      setMessage(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = cursorPos + option.length + 1;
        textarea.focus();
      }, 0);
    }
    setShowCommandDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector('.command-dropdown, .mention-dropdown');
      
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setShowMentionDropdown(false);
        setShowCommandDropdown(false);
      }
    };

    if (showMentionDropdown || showCommandDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMentionDropdown, showCommandDropdown]);

  if (loading) {
    return (
      <Container collapsed={collapsed} ref={containerRef}>
        <LoadingContainer>
          <EuiLoadingSpinner size="l" />
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container collapsed={collapsed} ref={containerRef}>
        <Title>Error: {error}</Title>
      </Container>
    );
  }

  return (
    <>
      <SidebarComponent uuid={uuid} defaultCollapsed hamburgerTopPosition="25px" />
      <Container collapsed={collapsed} ref={containerRef}>
        <ChatBodyWrapper>
          <ChatSection width={chatSectionWidth}>
            <ChatHeader>
              <SaveTitleContainer>
                <TitleInput
                  value={title}
                  onChange={onTitleChange}
                  placeholder="Enter chat title..."
                  disabled={isUpdatingTitle}
                  style={{
                    cursor: isUpdatingTitle ? 'not-allowed' : 'text'
                  }}
                />
                {isEditingTitle && (
                  <SendButton
                    onClick={handleSaveTitle}
                    disabled={isUpdatingTitle}
                    style={{ margin: 0, padding: '8px 16px' }}
                  >
                    Save
                  </SendButton>
                )}
                <AddButton onClick={() => handleNewChat()} disabled={isUpdatingTitle}>
                  <MaterialIcon icon="add" style={{ fontSize: '16px', color: '#5f6368' }} />
                </AddButton>
              </SaveTitleContainer>

              {!showArtifactView ? (
                <ThinkingModeToggle
                  isBuild={isBuild}
                  setIsBuild={setIsBuild}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  handleKeyDown={handleKeyDown}
                />
              ) : null}
            </ChatHeader>

            <ChatBody>
              <ChatHistory ref={chatHistoryRef}>
                {showSplash && messages.length === 0 && (
                  <SplashContainer>
                    <SplashScreen
                      user={{ alias: ui.meInfo?.owner_alias || 'User' }}
                      onSendMessage={handleSplashMessage}
                    />
                  </SplashContainer>
                )}
                {messages.map((msg: ChatMessage) => (
                  <React.Fragment key={msg.id}>
                    <MessageBubble isUser={msg.role === 'user'}>
                      {renderMarkdown(msg.message, {
                        codeBlockBackground: '#282c34',
                        textColor: '#abb2bf',
                        bubbleTextColor: msg.role === 'user' ? 'white' : '',
                        borderColor: '#444',
                        codeBlockFont: 'Courier New'
                      })}
                      {msg.role !== 'user' && msg.message && msg.message.trim() !== '' && (
                        <CopyButton
                          onClick={() => {
                            navigator.clipboard.writeText(msg.message);
                            const button = document.getElementById(`copy-${msg.id}`);
                            if (button) {
                              button.textContent = 'done';
                              setTimeout(() => {
                                button.textContent = 'content_copy';
                              }, 2000);
                            }
                          }}
                        >
                          <MaterialIcon
                            id={`copy-${msg.id}`}
                            icon="content_copy"
                            style={{ fontSize: '16px' }}
                          />
                        </CopyButton>
                      )}
                    </MessageBubble>
                    <ActionArtifactRenderer
                      messageId={msg.id}
                      chatId={chatId}
                      websocketSessionId={websocketSessionId}
                      setIsActionSend={setIsActionSend}
                    />
                  </React.Fragment>
                ))}
                {(isChainVisible || isActionSend) && (
                  <MessageBubble isUser={false}>
                    <HiveThoughts>Hive - Chain of Thought</HiveThoughts>
                    <p>
                      {lastLogLine
                        ? lastLogLine
                        : `Hi ${ui.meInfo?.owner_alias}, I've got your message. Let me have a think.`}
                    </p>
                  </MessageBubble>
                )}
              </ChatHistory>
              <InputContainer>
                <TextArea
                  value={message}
                  onChange={handleMessageChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isSending}
                />
                {showMentionDropdown && (
                  <MentionDropdown 
                    className="mention-dropdown"
                    style={{ 
                      top: mentionPosition.top,
                      left: mentionPosition.left,
                      zIndex: 1000 
                    }}
                  >
                    {mentionOptions.map((option) => (
                      <MentionOption
                        key={option.value}
                        onClick={() => handleMentionSelect(option.value)}
                      >
                        {option.label}
                      </MentionOption>
                    ))}
                  </MentionDropdown>
                )}
                {showCommandDropdown && (
                  <MentionDropdown 
                    className="command-dropdown"
                    style={{ 
                      top: commandPosition.top,
                      left: commandPosition.left,
                      zIndex: 1000 
                    }}
                  >
                    {commandOptions.map((option) => (
                      <MentionOption
                        key={option.value}
                        onClick={() => handleCommandSelect(option.value)}
                      >
                        {option.label}
                      </MentionOption>
                    ))}
                  </MentionDropdown>
                )}
                {isPdfUploadEnabled && (
                  <AttachButton onClick={() => setIsUploadModalOpen(true)} disabled={isSending}>
                    Attach
                    <AttachIcon icon="attach_file" />
                  </AttachButton>
                )}
                <SendButton
                  onClick={() => handleSendMessage()}
                  disabled={!message.trim() || isSending}
                >
                  Send
                </SendButton>
                {isUploadModalOpen && (
                  <UploadModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    onUploadComplete={handleUploadComplete}
                  />
                )}
              </InputContainer>
            </ChatBody>
          </ChatSection>

          {showArtifactView && (
            <>
              <DividerContainer
                ref={dividerRef}
                onMouseDown={handleDividerMouseDown}
                onKeyDown={handleDividerKeyDown}
                onClick={handleDividerClick}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                tabIndex={0}
                role="separator"
                aria-valuenow={parseInt(chatSectionWidth)}
                aria-valuemin={20}
                aria-valuemax={80}
                aria-orientation="horizontal"
                aria-label="Resize panels"
              >
                <DragTooltip visible={showTooltip}>
                  Drag to resize • Arrow keys to adjust
                </DragTooltip>
                <DividerHandle />
              </DividerContainer>

              <ViewerSection width={viewerSectionWidth}>
                <ViewerHeader>
                  <TabContainer>
                    {sseArtifact && sseArtifact?.length > 0 && (
                      <TabButton
                        active={artifactTab === 'logs'}
                        onClick={() => handleTabClick('logs')}
                      >
                        Logs
                        {updatedTabs.logs && <UpdateIndicator />}
                      </TabButton>
                    )}
                    {codeArtifact && codeArtifact?.length > 0 && (
                      <TabButton
                        active={artifactTab === 'code'}
                        onClick={() => handleTabClick('code')}
                      >
                        Code
                        {updatedTabs.code && <UpdateIndicator />}
                      </TabButton>
                    )}
                    {visualArtifact && visualArtifact?.length > 0 && (
                      <TabButton
                        active={artifactTab === 'visual'}
                        onClick={() => handleTabClick('visual')}
                      >
                        Screen
                        {updatedTabs.visual && <UpdateIndicator />}
                      </TabButton>
                    )}
                    {textArtifact && textArtifact?.length > 0 && (
                      <TabButton
                        active={artifactTab === 'text'}
                        onClick={() => handleTabClick('text')}
                      >
                        Text
                        {updatedTabs.text && <UpdateIndicator />}
                      </TabButton>
                    )}
                  </TabContainer>

                  <ThinkingModeToggle
                    isBuild={isBuild}
                    setIsBuild={setIsBuild}
                    selectedModel={selectedModel}
                    setSelectedModel={setSelectedModel}
                    handleKeyDown={handleKeyDown}
                  />
                </ViewerHeader>

                <VisualScreenViewer
                  visualArtifact={visualArtifact ?? []}
                  codeArtifact={codeArtifact ?? []}
                  textArtifact={textArtifact ?? []}
                  sseArtifact={sseArtifact ?? []}
                  chatId={chatId}
                  activeTab={artifactTab}
                />
              </ViewerSection>
            </>
          )}
        </ChatBodyWrapper>
      </Container>
    </>
  );
});

export default HiveChatView;
