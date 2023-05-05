import * as React from 'react';

import { Attachment, MessageType } from '../../types';
import {
  AttachmentButton,
  AttachmentButtonAdditionalProps,
} from '../AttachmentButton';
import {
  FlatList,
  Image,
  LayoutChangeEvent,
  ListRenderItem,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { L10nContext, ThemeContext, UserContext, unwrap } from '../../utils';

import { CircularActivityIndicator } from '../CircularActivityIndicator';
import { SendButton } from '../SendButton';
import styles from './styles';
import { useState } from 'react';

export interface InputTopLevelProps {
  /** Disables the send button. */
  disableSend?: boolean;
  /** Whether attachment is uploading. Will replace attachment button with a
   * {@link CircularActivityIndicator}. Since we don't have libraries for
   * managing media in dependencies we have no way of knowing if
   * something is uploading so you need to set this manually. */
  isAttachmentUploading?: boolean;
  /** @see {@link AttachmentButtonProps.onPress} */
  onAttachmentPress?: () => Promise<Attachment[]>;
  /** Called when the input text is changed. */
  onInputTextChanged?: (text: string) => void;
  /** Returns the layout for the composer. */
  onLayout?: (event: LayoutChangeEvent) => void;
  /** Will be called on {@link SendButton} tap. Has {@link MessageType.PartialText} which can
   * be transformed to {@link MessageType.Text} and added to the messages list. */
  onSendPress: (message: MessageType.PartialAny[]) => void;
  /** Controls the visibility behavior of the {@link SendButton} based on the
   * `TextInput` state. Defaults to `editing`. */
  sendButtonVisibilityMode?: 'always' | 'editing';
}

export interface InputAdditionalProps {
  attachmentButtonProps?: AttachmentButtonAdditionalProps;
}

export type InputProps = InputTopLevelProps & InputAdditionalProps;

/** Bottom bar input component with a text input, attachment and
 * send buttons inside. By default hides send button when text input is empty. */
export const Input = ({
  attachmentButtonProps,
  disableSend,
  isAttachmentUploading,
  onAttachmentPress,
  onLayout,
  onSendPress,
  onInputTextChanged,
  sendButtonVisibilityMode,
}: InputProps) => {
  const l10n = React.useContext(L10nContext);
  const theme = React.useContext(ThemeContext);
  const user = React.useContext(UserContext);
  const {
    attachmentContainer,
    attachmentIcon,
    attachmentIconContainer,
    container,
    fileAttachmentContainer,
    fileAttachmentIconContainer,
    fileAttachmentName,
    input,
    inputAttachmentDivider,
    inputContainer,
    marginRight,
    removeAttachmentButton,
    removeAttachmentButtonImage,
  } = styles({
    theme,
  });

  // Use `defaultValue` if provided
  const [text, setText] = React.useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const value = text;

  const handleChangeText = (newText: string) => {
    // Track local state in case `onChangeText` is provided and `value` is not
    setText(newText);
    onInputTextChanged && onInputTextChanged(newText);
  };

  const handleAttachmentPress = async () => {
    if (!onAttachmentPress) return;
    const newAttachments = await onAttachmentPress();
    if (newAttachments.length > 0) {
      setAttachments(
        ([] as Attachment[]).concat(attachments).concat(newAttachments),
      );
    }
  };

  const handleSend = () => {
    let message: MessageType.PartialAny[] = [];

    if (attachments.length > 0) {
      message = message.concat(attachments);
      setAttachments([]);
    }

    // Impossible to test since button is not visible when value is empty.
    // Additional check for the keyboard input.
    /* istanbul ignore next */
    const trimmedValue = value.trim();
    if (trimmedValue) {
      message = message.concat({ text: trimmedValue, type: 'text' });
      setText('');

      // Android is not calling TextInput.onChangeText() on this setText call.
      // Call it manually.
      if (Platform.OS === 'android') {
        onInputTextChanged && onInputTextChanged('');
      }
    }

    onSendPress(message);
  };

  const renderRemoveAttachmentButton = (index: number) => {
    return (
      <TouchableOpacity
        style={removeAttachmentButton}
        onPress={() => {
          const updated = ([] as Attachment[]).concat(attachments);
          updated.splice(index, 1);
          setAttachments(updated);
        }}>
        <Image
          source={require('../../assets/icon-x.png')}
          style={removeAttachmentButtonImage}
        />
      </TouchableOpacity>
    );
  };

  const renderAttachedFile = (file: MessageType.PartialFile, index: number) => {
    return (
      <View>
        <View style={[attachmentContainer, fileAttachmentContainer]}>
          <View style={[attachmentIconContainer, fileAttachmentIconContainer]}>
            {theme.icons?.documentIcon?.() ?? (
              <Image
                source={require('../../assets/icon-document.png')}
                style={attachmentIcon}
              />
            )}
          </View>
          <Text style={fileAttachmentName}>{file.name}</Text>
        </View>
        {renderRemoveAttachmentButton(index)}
      </View>
    );
  };

  const renderAttachedImage = (
    image: MessageType.PartialImage,
    index: number,
  ) => {
    return (
      <View>
        <Image
          source={{ uri: image.uri }}
          style={[
            attachmentContainer,
            {
              aspectRatio:
                image.width && image.height ? image.width / image.height : 1,
            },
          ]}
        />
        {renderRemoveAttachmentButton(index)}
      </View>
    );
  };

  const renderAttachment: ListRenderItem<Attachment> = ({
    item: attachment,
    index,
  }) => {
    if (attachment.type === 'file') {
      return renderAttachedFile(attachment, index);
    } else if (attachment.type === 'image') {
      return renderAttachedImage(attachment, index);
    }
    return null;
  };

  return (
    <View style={[container, theme.composer?.container]} onLayout={onLayout}>
      {user &&
        (isAttachmentUploading ? (
          <View style={marginRight}>
            <CircularActivityIndicator
              {...{
                color: theme.composer?.activityIndicator?.color,
                size: theme.composer?.activityIndicator?.size,
              }}
            />
          </View>
        ) : (
          !!onAttachmentPress && (
            <AttachmentButton
              {...unwrap(attachmentButtonProps)}
              onPress={handleAttachmentPress}
            />
          )
        ))}
      <View style={inputContainer}>
        {attachments.length > 0 && (
          <FlatList
            data={attachments}
            renderItem={renderAttachment}
            keyExtractor={item => `${item.uri}`}
            horizontal
            contentContainerStyle={{ padding: 5 }}
            style={{ height: attachmentContainer.height + 10, flex: 1 }}
            showsHorizontalScrollIndicator={false}
          />
        )}
        <TextInput
          multiline
          placeholder={l10n.inputPlaceholder}
          placeholderTextColor={theme.composer?.placeholderTextColor}
          underlineColorAndroid="transparent"
          style={[input, attachments.length > 0 ? inputAttachmentDivider : {}]}
          onChangeText={handleChangeText}
          value={value}
        />
      </View>
      {sendButtonVisibilityMode === 'always' ||
      (sendButtonVisibilityMode === 'editing' && user && value.trim()) ? (
        <SendButton
          disabled={
            disableSend || (value.length === 0 && attachments.length === 0)
          }
          onPress={handleSend}
        />
      ) : null}
    </View>
  );
};
