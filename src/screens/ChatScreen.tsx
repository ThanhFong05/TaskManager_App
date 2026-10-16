import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  IconButton,
  useTheme,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import { ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';
import { sendMessage, subscribeToMessages } from '../services/chatService';

interface ChatScreenProps {
  route: any;
  navigation: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { teamId, teamName } = route.params;
  const theme = useTheme();
  const { user, profile } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({
      title: teamName ? `${teamName} Chat` : 'Team Chat',
    });
  }, [navigation, teamName]);

  // Subscribe to real-time chat messages
  useEffect(() => {
    const unsub = subscribeToMessages(teamId, (chatMessages) => {
      setMessages(chatMessages);
      setLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => unsub();
  }, [teamId]);

  const handleSend = async () => {
    if (!inputText.trim() || !user || sending) return;

    const textToSend = inputText;
    setInputText('');
    setSending(true);

    try {
      const senderName =
        profile?.name || user.displayName || user.email?.split('@')[0] || 'Member';
      await sendMessage(teamId, user.uid, senderName, textToSend);
    } catch (error) {
      console.error('Error sending message:', error);
      setInputText(textToSend);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === user?.uid;

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowOther,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.bubbleMe : styles.bubbleOther,
          ]}
        >
          {!isMe && (
            <Text
              variant="labelMedium"
              style={[styles.senderName, { color: theme.colors.primary }]}
            >
              {item.senderName}
            </Text>
          )}

          <Text
            variant="bodyMedium"
            style={[
              styles.messageText,
              { color: isMe ? '#FFFFFF' : '#2B1F17' },
            ]}
          >
            {item.text}
          </Text>

          <Text
            variant="labelSmall"
            style={[
              styles.timestamp,
              {
                color: isMe
                  ? 'rgba(255, 255, 255, 0.75)'
                  : '#8C7D72',
              },
            ]}
          >
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Surface style={[styles.emptyPill, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  No messages yet. Say hi to your team!
                </Text>
              </Surface>
            </View>
          }
        />
      )}

      {/* Input bar */}
      <Surface style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]} elevation={4}>
        <TextInput
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          mode="flat"
          style={[styles.textInput, { backgroundColor: theme.colors.surface }]}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <IconButton
          icon="send"
          mode="contained"
          size={22}
          containerColor={theme.colors.primary}
          iconColor={theme.colors.onPrimary}
          disabled={!inputText.trim() || sending}
          onPress={handleSend}
          style={styles.sendButton}
        />
      </Surface>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  messageRow: {
    marginVertical: 4,
    flexDirection: 'row',
    width: '100%',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    minWidth: 76,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  bubbleMe: {
    backgroundColor: '#FF6B35',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#F2E8DC',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 2,
    fontSize: 12,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#EFE7DC',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    margin: 4,
    borderRadius: 12,
  },
});

export default ChatScreen;
