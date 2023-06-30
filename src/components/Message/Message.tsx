import * as React from 'react';

import {
  FocusedMessageContext,
  ThemeContext,
  UserContext,
  excludeDerivedMessageProps,
  getUserAvatarNameColor,
  getUserName,
} from '../../utils';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import { TextMessage, TextMessageTopLevelProps } from '../TextMessage';

import { Avatar } from '../Avatar';
import { FileMessage } from '../FileMessage';
import { ImageMessage } from '../ImageMessage';
import { MessageType } from '../../types';
import { StatusIcon } from '../StatusIcon';
import { UsernameLocation } from '../../types';
import { VideoMessage } from '../VideoMessage';
import { oneOf } from '@flyerhq/react-native-link-preview';
import styles from './styles';

export interface MessageTopLevelProps extends TextMessageTopLevelProps {
  /** Called when user makes a long press on any message */
  onMessageLongPress?: (message: MessageType.Any) => void;
  /** Called when user taps on any message */
  onMessagePress?: (message: MessageType.Any) => void;
  /** Customize the default bubble using this function. `child` is a content
   * you should render inside your bubble, `message` is a current message
   * (contains `author` inside) and `nextMessageInGroup` allows you to see
   * if the message is a part of a group (messages are grouped when written
   * in quick succession by the same author) */
  renderBubble?: (payload: {
    child: React.ReactNode;
    message: MessageType.Any;
    nextMessageInGroup: boolean;
  }) => React.ReactNode;
  /** Render a custom message inside predefined bubble */
  renderCustomMessage?: (
    message: MessageType.Custom,
    messageWidth: number,
    isFocused: boolean,
  ) => React.ReactNode;
  /** Render a file message inside predefined bubble */
  renderFileMessage?: (
    message: MessageType.File,
    messageWidth: number,
    isFocused: boolean,
  ) => React.ReactNode;
  /** Render an image message inside predefined bubble */
  renderImageMessage?: (
    message: MessageType.Image,
    messageWidth: number,
    isFocused: boolean,
  ) => React.ReactNode;
  /** Render a text message inside predefined bubble */
  renderTextMessage?: (
    message: MessageType.Text,
    messageWidth: number,
    isFocused: boolean,
    showName: UsernameLocation,
  ) => React.ReactNode;
  renderVideoMessage?: (
    message: MessageType.Video,
    messageWidth: number,
    isFocused: boolean,
  ) => React.ReactNode;
  /** Show user avatars for received messages. Useful for a group chat. */
  showUserAvatars?: boolean;

  onLayout?: (event: LayoutChangeEvent) => void;
}

export interface MessageProps extends MessageTopLevelProps {
  enableAnimation?: boolean;
  isFocused: boolean;
  message: MessageType.DerivedAny;
  messageWidth: number;
  roundBorder: boolean;
  showAvatar: boolean;
  showName: UsernameLocation;
  showStatus: boolean;
}

/** Base component for all message types in the chat. Renders bubbles around
 * messages and status. Sets maximum width for a message for
 * a nice look on larger screens. */
export const Message = React.memo(
  ({
    enableAnimation,
    isFocused,
    message,
    messageWidth,
    onLayout,
    onMessagePress,
    onMessageLongPress,
    onPreviewDataFetched,
    renderBubble,
    renderCustomMessage,
    renderFileMessage,
    renderImageMessage,
    renderTextMessage,
    renderVideoMessage,
    roundBorder,
    showAvatar,
    showName,
    showStatus,
    showUserAvatars,
    usePreviewData,
  }: MessageProps) => {
    const setFocusedMessage = React.useContext(FocusedMessageContext);
    const theme = React.useContext(ThemeContext);
    const user = React.useContext(UserContext);

    const currentUserIsAuthor =
      message.type !== 'dateHeader' && user?.id === message.author.id;

    const { container, contentContainer, dateHeader, pressable, username } =
      styles({
        currentUserIsAuthor,
        message,
        messageWidth,
        roundBorder,
        showName,
        showStatus,
        theme,
      });

    if (message.type === 'dateHeader') {
      return (
        <View style={dateHeader}>
          <Text style={theme.date?.text}>{message.text}</Text>
        </View>
      );
    }

    const renderBubbleContainer = () => {
      const child = renderMessage();
      return oneOf(
        renderBubble,
        <>
          <View style={contentContainer} testID="ContentContainer">
            {child}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {showStatus && (
              <StatusIcon
                {...{
                  currentUserIsAuthor,
                  status: message.status,
                  theme,
                }}
              />
            )}
          </View>
        </>,
      )({
        child,
        message: excludeDerivedMessageProps(message),
        nextMessageInGroup: roundBorder,
      });
    };

    const renderMessage = () => {
      switch (message.type) {
        case 'custom':
          return (
            renderCustomMessage?.(
              // It's okay to cast here since we checked message type above
              // type-coverage:ignore-next-line
              excludeDerivedMessageProps(message) as MessageType.Custom,
              messageWidth,
              isFocused,
            ) ?? null
          );
        case 'file':
          return oneOf(renderFileMessage, <FileMessage message={message} />)(
            // type-coverage:ignore-next-line
            excludeDerivedMessageProps(message) as MessageType.File,
            messageWidth,
            isFocused,
          );
        case 'image':
          return oneOf(
            renderImageMessage,
            <ImageMessage
              {...{
                isFocused,
                message,
                messageWidth,
              }}
            />,
          )(
            // type-coverage:ignore-next-line
            excludeDerivedMessageProps(message) as MessageType.Image,
            messageWidth,
            isFocused,
          );
        case 'text':
          return oneOf(
            renderTextMessage,
            <TextMessage
              {...{
                enableAnimation,
                isFocused,
                message,
                messageWidth,
                onPreviewDataFetched,
                showName,
                usePreviewData,
              }}
            />,
          )(
            // type-coverage:ignore-next-line
            excludeDerivedMessageProps(message) as MessageType.Text,
            messageWidth,
            isFocused,
            showName,
          );
        case 'video':
          return oneOf(
            renderVideoMessage,
            <VideoMessage
              {...{
                isFocused,
                message,
                messageWidth,
              }}
            />,
          )(
            // type-coverage:ignore-next-line
            excludeDerivedMessageProps(message) as MessageType.Video,
            messageWidth,
            isFocused,
          );
        default:
          return null;
      }
    };

    const renderUsername = () => {
      const color = getUserAvatarNameColor(
        message.author,
        theme.avatar?.colors,
      );
      return (
        <Text numberOfLines={1} style={[{ color }, username]}>
          {getUserName(message.author)}
        </Text>
      );
    };

    return (
      <>
        <View style={container} onLayout={onLayout}>
          <Avatar
            {...{
              author: message.author,
              currentUserIsAuthor,
              showAvatar,
              showUserAvatars,
              theme,
            }}
          />
          <Pressable
            onLongPress={() =>
              onMessageLongPress?.(excludeDerivedMessageProps(message))
            }
            onPress={() => {
              onMessagePress?.(excludeDerivedMessageProps(message));
              setFocusedMessage && setFocusedMessage(message.id);
            }}
            style={pressable}>
            {renderBubbleContainer()}
          </Pressable>
        </View>
        {showName === 'outside' ? renderUsername() : null}
      </>
    );
  },
);
