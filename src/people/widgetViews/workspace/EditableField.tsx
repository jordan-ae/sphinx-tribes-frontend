import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { renderMarkdown } from 'people/utils/RenderMarkdown';
import { TicketTextAreaComp } from 'components/common/TicketEditor/TicketTextArea';
import { useStores } from 'store';
import { snippetStore } from 'store/snippetStore';
import { SnippetDropdown } from 'components/form/inputs/SnippetDropDown';
import {
  PreviewButtonGroup,
  SwitcherContainer,
  SwitcherButton,
  EmptyState,
  SnippetContainer,
  ActionButtonGroup,
  ActionButton
} from './style';

interface EditableFieldProps {
  value: string;
  setValue: (value: string) => void;
  isEditing: boolean;
  previewMode: 'preview' | 'edit';
  setPreviewMode: (mode: 'preview' | 'edit') => void;
  placeholder?: string;
  dataTestIdPrefix?: string;
  workspaceUUID?: string;
  onCancel: () => void;
  onUpdate: () => void;
  defaultHeight?: string;
}

const PreviewContainer = styled.div<{ height?: string }>`
  height: ${(props: { height?: string }) => props.height || ''};
  overflow-y: auto;
  background-color: white;
  padding: 1rem;
  border: 2px solid #dde1e5;
  border-radius: 0.375rem;
`;

export const EditableField: React.FC<EditableFieldProps> = ({
  value,
  setValue,
  isEditing,
  previewMode,
  setPreviewMode,
  placeholder,
  dataTestIdPrefix,
  workspaceUUID,
  onCancel,
  onUpdate,
  defaultHeight
}: EditableFieldProps) => {
  const [originalValue, setOriginalValue] = useState(value);
  const [hasChanges, setHasChanges] = useState(false);
  const { ui } = useStores();

  useEffect(() => {
    setOriginalValue(value);
  }, []);

  const handleTextChange = (newValue: string) => {
    setValue(newValue);
    setHasChanges(newValue !== originalValue);
  };

  const handleCancel = () => {
    setValue(originalValue);
    setHasChanges(false);
    onCancel?.();
    setPreviewMode('preview');
  };

  const handleUpdate = async () => {
    await onUpdate?.();
    setOriginalValue(value);
    setHasChanges(false);
    setPreviewMode('preview');
  };

  useEffect(() => {
    if (workspaceUUID) {
      snippetStore.loadSnippets(workspaceUUID);
    }
  }, [workspaceUUID]);

  const snippets = snippetStore.getAllSnippets();

  const filteredSnippets = snippets.map((p: any) => ({
    value: p.id,
    label: p.title,
    snippet: p.snippet
  }));

  const handleSnippetSelect = (snippet: string) => {
    setValue(value ? `${value}\n${snippet}` : snippet);
  };

  if (!isEditing) {
    if (!value?.trim()) {
      return <EmptyState>{`No ${placeholder?.toLowerCase() ?? 'content'} yet`}</EmptyState>;
    }
    return <PreviewContainer height={defaultHeight}>{renderMarkdown(value)}</PreviewContainer>;
  }

  return (
    <>
      <PreviewButtonGroup>
        {previewMode === 'edit' && (
          <SnippetContainer>
            <SnippetDropdown items={filteredSnippets} onSelect={handleSnippetSelect} />
          </SnippetContainer>
        )}
        <ActionButtonGroup>
          <ActionButton
            onClick={handleCancel}
            data-testid={`${dataTestIdPrefix}-cancel-btn`}
            color="cancel"
            style={{ display: hasChanges ? 'block' : 'none' }}
          >
            Cancel
          </ActionButton>
          <ActionButton
            color="primary"
            onClick={handleUpdate}
            data-testid={`${dataTestIdPrefix}-update-btn`}
            style={{ display: hasChanges ? 'block' : 'none' }}
          >
            Update
          </ActionButton>
          <SwitcherContainer>
            <SwitcherButton
              isActive={previewMode === 'preview'}
              onClick={() => setPreviewMode('preview')}
            >
              View
            </SwitcherButton>
            <SwitcherButton
              isActive={previewMode === 'edit'}
              onClick={() => setPreviewMode('edit')}
            >
              Edit
            </SwitcherButton>
          </SwitcherContainer>
        </ActionButtonGroup>
      </PreviewButtonGroup>
      {previewMode === 'edit' ? (
        <TicketTextAreaComp
          value={value}
          onChange={handleTextChange}
          placeholder={placeholder}
          ui={ui}
          data-testid={`${dataTestIdPrefix}-textarea`}
        />
      ) : (
        <PreviewContainer height={defaultHeight}>
          {value?.trim()
            ? renderMarkdown(value)
            : `No ${placeholder?.toLowerCase() ?? 'content'} yet`}
        </PreviewContainer>
      )}
    </>
  );
};
