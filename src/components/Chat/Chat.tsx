import * as React from 'react';

import {
  FlatList,
  FlatListProps,
  GestureResponderHandlers,
  InteractionManager,
  LayoutAnimation,
  LayoutChangeEvent,
  Modal,
  StatusBar,
  StatusBarProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  FocusedMessageContext,
  L10nContext,
  ThemeContext,
  UrlResolverContext,
  UserContext,
  calculateChatMessages,
  initLocale,
  unwrap,
} from '../../utils';
import { Input, InputAdditionalProps, InputTopLevelProps } from '../Input';
import {
  KeyboardAccessoryView,
  useComponentSize,
} from '@flyerhq/react-native-keyboard-accessory-view';
import { Message, MessageTopLevelProps } from '../Message';
import { MessageType, Theme, User, UsernameLocation } from '../../types';

import { CircularActivityIndicator } from '../CircularActivityIndicator';
import FileViewer from 'react-native-file-viewer';
import ImageView from './ImageView';
import TypingIndicator from '../TypingIndicator/TypingIndicator';
import { Video } from '../Video';
import calendar from 'dayjs/plugin/calendar';
import dayjs from 'dayjs';
import { defaultTheme } from '../../theme';
import { l10n } from '../../l10n';
import { oneOf } from '@flyerhq/react-native-link-preview';
import styles from './styles';
import { usePrevious } from '../../hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Untestable
/* istanbul ignore next */
const animate = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
};

dayjs.extend(calendar);

export type ChatTopLevelProps = InputTopLevelProps & MessageTopLevelProps;

export interface ChatProps extends ChatTopLevelProps {
  /** Allows you to replace the default Input widget e.g. if you want to create a channel view. */
  customBottomComponent?: () => React.ReactNode;
  /** If {@link ChatProps.dateFormat}, {@link ChatProps.timeFormat} or
   * {@link ChatProps.relativeDateTime} is not enough to
   * customize date headers in your case, use this to return an arbitrary
   * string based on a `dateTime` of a particular message. Can be helpful to
   * return "Today" if `dateTime` is today. IMPORTANT: this will replace
   * all default date headers, so you must handle all cases yourself, like
   * for example today, yesterday and before. Or you can just return the same
   * date header for any message. */
  customDateHeaderText?: (dateTime: number) => string;
  /** Allows you to customize the date format. IMPORTANT: only for the date,
   * do not return time here. @see {@link ChatProps.timeFormat} to customize the time format.
   * @see {@link ChatProps.customDateHeaderText} for more customization. */
  dateFormat?: string;
  /** Disable automatic image preview on tap. */
  disableImageGallery?: boolean;
  /** Disable the send button. */
  disableSend?: boolean;
  /** Allows you to change what the user sees when there are no messages.
   * `emptyChatPlaceholder` and `emptyChatPlaceholderText` are ignored
   * in this case. */
  emptyState?: () => React.ReactNode;
  /** Use this to enable `LayoutAnimation`. Experimental on Android (same as React Native). */
  enableAnimation?: boolean;
  flatListProps?: Partial<FlatListProps<MessageType.DerivedAny[]>>;
  inputProps?: InputAdditionalProps;
  /** Used for pagination (infinite scroll) together with {@link ChatProps.onEndReached}.
   * When true, indicates that there are no more pages to load and
   * pagination will not be triggered. */
  isLastPage?: boolean;
  /** Whether or not the typing indicator should be shown. */
  isTyping?: boolean;
  /** Override the default localized copy. */
  l10nOverride?: Partial<
    Record<keyof (typeof l10n)[keyof typeof l10n], string>
  >;
  locale?: keyof typeof l10n;
  messages: MessageType.Any[];
  /** Used for pagination (infinite scroll). Called when user scrolls
   * to the very end of the list (minus `onEndReachedThreshold`).
   * See {@link ChatProps.flatListProps} to set it up. */
  onEndReached?: () => Promise<void>;
  /** Use date and time relative format (e.g.  'Today..', 'Yesterday..').
   * Using relative date time overrides dateFormat and timeFormat.
   * @see {@link ChatProps.dateFormat}
   * @see {@link ChatProps.timeFormat} */
  relativeDateTime?: boolean;
  /** Allows a level of indirection for resolving urls that access remote files (typically attachments)
   * This is useful for caching files on the device without having to know the local file path. The
   * local file path should be found given the remote url. */
  resolveUrl?: (url: string, callback: (url: string) => void) => void;
  /** Show user names for received messages. Useful for a group chat. Will be
   * shown only on text messages. */
  showUserNames?: UsernameLocation;
  /** Chat theme. Implement {@link Theme} to create your own theme or use
   * existing one, like the {@link defaultTheme}. */
  theme?: Theme;
  /**
   * Allows you to customize the time format. IMPORTANT: only for the time,
   * do not return date here. @see {@link ChatProps.dateFormat} to customize the date format.
   * @see {@link ChatProps.customDateHeaderText} for more customization.
   */
  timeFormat?: string;
  /** A list of name that may be displayed with the typing indicator. */
  typingNames?: string;
  user: User;
}

/** Entry component, represents the complete chat */
export const Chat = ({
  customBottomComponent,
  customDateHeaderText,
  dateFormat,
  disableImageGallery,
  disableSend,
  emptyState,
  enableAnimation,
  flatListProps,
  inputProps,
  isAttachmentUploading,
  isLastPage,
  isTyping,
  l10nOverride,
  locale = 'en',
  messages,
  onAttachmentPress,
  onEndReached,
  onInputTextChanged,
  onMessageLongPress,
  onMessagePress,
  onPreviewDataFetched,
  onSendPress,
  relativeDateTime,
  renderBubble,
  renderCustomMessage,
  renderFileMessage,
  renderImageMessage,
  renderTextMessage,
  resolveUrl = async url => {
    return url;
  },
  sendButtonVisibilityMode = 'editing',
  showUserAvatars = false,
  showUserNames = 'inside',
  theme = defaultTheme,
  timeFormat,
  typingNames,
  usePreviewData = true,
  user,
}: ChatProps) => {
  const {
    container,
    emptyComponentContainer,
    emptyComponentTitle,
    flatList,
    flatListContentContainer,
    footer,
    footerLoadingPage,
    headerIsTyping,
    videoContainer,
  } = styles({ theme });

  const { onLayout, size } = useComponentSize();
  const animationRef = React.useRef(false);
  const list = React.useRef<FlatList<MessageType.DerivedAny>>(null);
  const [isImageViewVisible, setIsImageViewVisible] = React.useState(false);
  const [isNextPageLoading, setNextPageLoading] = React.useState(false);
  const [imageViewIndex, setImageViewIndex] = React.useState(0);
  const [stackEntry, setStackEntry] = React.useState<StatusBarProps>({});
  const [initialComposerHeight, setInitialComposerHeight] = React.useState(0);
  const insets = useSafeAreaInsets();
  const [isVideoViewVisible, setIsVideoViewVisible] = React.useState(false);
  const videoMimeType = React.useRef<string>();
  const resolvedVideoUri = React.useRef<string>();

  const l10nValue = React.useMemo(
    () => ({ ...l10n[locale], ...unwrap(l10nOverride) }),
    [l10nOverride, locale],
  );

  // A single message will have focus when tapped. The focused state causes the
  // focused message and the blurred message to re-render. Messages receive `isFocused`
  // for any possible/optional state updates.
  const [focusedMessage, setFocusedMessage] = React.useState<
    string | undefined
  >(undefined);

  const { chatMessages, gallery } = calculateChatMessages(messages, user, {
    customDateHeaderText,
    dateFormat,
    relativeDateTime,
    showUserNames,
    timeFormat,
  });

  const previousChatMessages = usePrevious(chatMessages);

  React.useEffect(() => {
    if (
      chatMessages[0]?.type !== 'dateHeader' &&
      chatMessages[0]?.id !== previousChatMessages?.[0]?.id &&
      chatMessages[0]?.author?.id === user.id
    ) {
      list.current?.scrollToOffset({
        animated: true,
        offset: 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatMessages]);

  React.useEffect(() => {
    initLocale(locale);
  }, [locale]);

  // Untestable
  /* istanbul ignore next */
  if (animationRef.current && enableAnimation) {
    InteractionManager.runAfterInteractions(animate);
  }

  React.useEffect(() => {
    // Untestable
    /* istanbul ignore next */
    if (animationRef.current && enableAnimation) {
      InteractionManager.runAfterInteractions(animate);
    } else {
      animationRef.current = true;
    }
  }, [enableAnimation, messages]);

  const handleEndReached = React.useCallback(
    // Ignoring because `scroll` event for some reason doesn't trigger even basic
    // `onEndReached`, impossible to test.
    // TODO: Verify again later
    /* istanbul ignore next */
    async ({ distanceFromEnd }: { distanceFromEnd: number }) => {
      if (
        !onEndReached ||
        isLastPage ||
        distanceFromEnd <= 0 ||
        messages.length === 0 ||
        isNextPageLoading
      ) {
        return;
      }

      setNextPageLoading(true);
      await onEndReached?.();
      setNextPageLoading(false);
    },
    [isLastPage, isNextPageLoading, messages.length, onEndReached],
  );

  const handleFilePress = React.useCallback((message: MessageType.File) => {
    resolveUrl(message.uri, resolved => {
      FileViewer.open(resolved, {
        showOpenWithDialog: true,
        showAppsSuggestions: true,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImagePress = React.useCallback(
    (message: MessageType.Image) => {
      setImageViewIndex(
        gallery.findIndex(
          image => image.id === message.id && image.uri === message.uri,
        ),
      );
      setIsImageViewVisible(true);
      setStackEntry(
        StatusBar.pushStackEntry({
          barStyle: 'light-content',
          animated: true,
        }),
      );
    },
    [gallery],
  );

  const handleVideoPress = React.useCallback((message: MessageType.Video) => {
    resolveUrl(message.uri, resolved => {
      resolvedVideoUri.current = resolved;
      videoMimeType.current = message.mimeType;
      setIsVideoViewVisible(true);

      setStackEntry(
        StatusBar.pushStackEntry({
          hidden: true,
        }),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMessagePress = React.useCallback(
    (message: MessageType.Any) => {
      if (message.type === 'file') {
        handleFilePress(message);
      }
      if (message.type === 'image' && !disableImageGallery) {
        handleImagePress(message);
      }
      if (message.type === 'video') {
        handleVideoPress(message);
      }
      onMessagePress?.(message);
    },
    [
      disableImageGallery,
      handleFilePress,
      handleImagePress,
      handleVideoPress,
      onMessagePress,
    ],
  );

  // TODO: Tapping on a close button results in the next warning:
  // `An update to ImageViewing inside a test was not wrapped in act(...).`
  /* istanbul ignore next */
  const handleImageViewerClose = () => {
    setIsImageViewVisible(false);
    StatusBar.popStackEntry(stackEntry);
  };

  const handleVideoPlayerClose = () => {
    setFocusedMessage && setFocusedMessage(undefined);
    setIsVideoViewVisible(false);
    StatusBar.popStackEntry(stackEntry);
  };

  const keyExtractor = React.useCallback(
    ({ id }: MessageType.DerivedAny) => id,
    [],
  );

  const renderItem = React.useCallback(
    ({ item: message }: { item: MessageType.DerivedAny; index: number }) => {
      const messageWidth =
        showUserAvatars &&
        message.type !== 'dateHeader' &&
        message.author.id !== user.id
          ? Math.floor(Math.min(size.width * 0.72, 440))
          : Math.floor(Math.min(size.width * 0.77, 440));

      const roundBorder =
        message.type !== 'dateHeader' && message.nextMessageInGroup;
      const showAvatar =
        message.type !== 'dateHeader' && !message.nextMessageInGroup;
      const showName =
        message.type !== 'dateHeader' ? message.showName : 'none';
      const showStatus = message.type !== 'dateHeader' && message.showStatus;

      return (
        <Message
          {...{
            enableAnimation,
            isFocused: focusedMessage === message.id,
            message,
            messageWidth,
            onMessageLongPress,
            onMessagePress: handleMessagePress,
            onPreviewDataFetched,
            renderBubble,
            renderCustomMessage,
            renderFileMessage,
            renderImageMessage,
            renderTextMessage,
            roundBorder,
            showAvatar,
            showName,
            showStatus,
            showUserAvatars,
            usePreviewData,
          }}
        />
      );
    },
    [
      enableAnimation,
      focusedMessage,
      handleMessagePress,
      onMessageLongPress,
      onPreviewDataFetched,
      renderBubble,
      renderCustomMessage,
      renderFileMessage,
      renderImageMessage,
      renderTextMessage,
      showUserAvatars,
      size.width,
      usePreviewData,
      user.id,
    ],
  );

  const renderListEmptyComponent = React.useCallback(
    () => (
      <View style={emptyComponentContainer}>
        {oneOf(
          emptyState,
          <Text style={emptyComponentTitle}>
            {l10nValue.emptyChatPlaceholder}
          </Text>,
        )()}
      </View>
    ),
    [emptyComponentContainer, emptyComponentTitle, emptyState, l10nValue],
  );

  const renderListFooterComponent = React.useCallback(
    () =>
      // Impossible to test, see `handleEndReached` function
      /* istanbul ignore next */
      isNextPageLoading ? (
        <View style={footerLoadingPage}>
          <CircularActivityIndicator
            color={theme.list?.activityIndicator?.color}
            size={theme.list?.activityIndicator?.size}
          />
        </View>
      ) : (
        <View style={footer} />
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [footer, footerLoadingPage, isNextPageLoading],
  );

  const renderListHeaderComponent = React.useCallback(
    () => (
      <View style={headerIsTyping}>
        <TypingIndicator
          isTyping={isTyping || false}
          typingNames={typingNames}
          showName={showUserNames}
          theme={theme}
        />
      </View>
    ),
    [headerIsTyping, isTyping, showUserNames, theme, typingNames],
  );

  const renderScrollable = React.useCallback(
    (panHandlers?: GestureResponderHandlers) => (
      <FlatList
        automaticallyAdjustContentInsets={false}
        contentContainerStyle={[
          flatListContentContainer,
          { justifyContent: chatMessages.length !== 0 ? undefined : 'center' },
        ]}
        initialNumToRender={25}
        ListEmptyComponent={renderListEmptyComponent}
        ListFooterComponent={renderListFooterComponent}
        ListHeaderComponent={renderListHeaderComponent}
        maxToRenderPerBatch={6}
        onEndReachedThreshold={0.75}
        style={[flatList]}
        showsVerticalScrollIndicator={false}
        {...unwrap(flatListProps)}
        data={chatMessages}
        inverted
        keyboardDismissMode={'interactive'}
        keyExtractor={keyExtractor}
        onEndReached={handleEndReached}
        ref={list}
        renderItem={renderItem}
        {...panHandlers}
      />
    ),
    [
      chatMessages,
      flatList,
      flatListContentContainer,
      flatListProps,
      handleEndReached,
      keyExtractor,
      renderItem,
      renderListEmptyComponent,
      renderListFooterComponent,
      renderListHeaderComponent,
    ],
  );

  return (
    <UserContext.Provider value={user}>
      <ThemeContext.Provider value={theme}>
        <L10nContext.Provider value={l10nValue}>
          <FocusedMessageContext.Provider value={setFocusedMessage}>
            <UrlResolverContext.Provider value={resolveUrl}>
              <View style={container} onLayout={onLayout}>
                {customBottomComponent ? (
                  <>
                    <>{renderScrollable()}</>
                    <>{customBottomComponent()}</>
                  </>
                ) : (
                  <KeyboardAccessoryView
                    renderScrollable={renderScrollable}
                    contentContainerStyle={{ marginBottom: 0 }}
                    contentOffsetKeyboardClosed={
                      theme.composer?.contentOffsetKeyboardClosed || 0
                    }
                    contentOffsetKeyboardOpened={
                      initialComposerHeight -
                      insets.bottom -
                      (theme.composer?.contentOffsetKeyboardOpened || 0)
                    }
                    spaceBetweenKeyboardAndAccessoryView={
                      -(theme.composer?.tabBarHeight || 0)
                    }>
                    <Input
                      {...{
                        ...unwrap(inputProps),
                        disableSend,
                        isAttachmentUploading,
                        onAttachmentPress,
                        onSendPress,
                        onInputTextChanged,
                        renderScrollable,
                        sendButtonVisibilityMode,
                        onLayout: (event: LayoutChangeEvent) => {
                          if (initialComposerHeight === 0) {
                            setInitialComposerHeight(
                              event.nativeEvent.layout.height,
                            );
                          }
                        },
                      }}
                    />
                  </KeyboardAccessoryView>
                )}
                <ImageView
                  imageIndex={imageViewIndex}
                  images={gallery}
                  onRequestClose={handleImageViewerClose}
                  visible={isImageViewVisible}
                />
                <Modal
                  animationType={'slide'}
                  statusBarTranslucent={true}
                  hardwareAccelerated={true}
                  visible={isVideoViewVisible}>
                  <View style={[StyleSheet.absoluteFill, videoContainer]}>
                    <Video
                      mimeType={videoMimeType.current || ''}
                      uri={resolvedVideoUri.current || ''}
                      paused={false}
                      onClose={handleVideoPlayerClose}
                      onError={() =>
                        setFocusedMessage && setFocusedMessage(undefined)
                      }
                    />
                  </View>
                </Modal>
              </View>
            </UrlResolverContext.Provider>
          </FocusedMessageContext.Provider>
        </L10nContext.Provider>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
};
