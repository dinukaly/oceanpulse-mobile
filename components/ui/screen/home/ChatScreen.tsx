import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ViewToken,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import useMessages from "@/utils/useMessages";
import useMessagingActive from "@/utils/useMessagingActive";
import { Message, messageKey } from "@/utils/messaging";

type ChatScreenParams = { otherUserId: string; otherUserName?: string };

export default function ChatScreen({
  route,
  navigation,
}: {
  route: { params: ChatScreenParams };
  navigation?: any;
}) {
  const { otherUserId, otherUserName } = route.params;
  const myId = useSelector((state: RootState) => state.auth.userId);
  const active = useMessagingActive();
  const chat = useMessages(myId, otherUserId, active);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList<Message>>(null);

  const scrollForNewMessages = useRef(true);
  const latestChat = useRef(chat);
  latestChat.current = chat;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 500,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<Message>[] }) => {
      void latestChat.current.markVisible(
        viewableItems
          .filter((item) => item.isViewable)
          .map((item) => item.item.id),
      );
    },
  ).current;

  const newestId = chat.messages[chat.messages.length - 1]?.id;
  useEffect(() => {
    scrollForNewMessages.current = true;
  }, [newestId]);

  const getPeerInitials = () => {
    if (!otherUserName) return "CR";
    const parts = otherUserName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return otherUserName.slice(0, 2).toUpperCase();
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.senderId === myId;
    return (
      <View
        style={[
          styles.messageRow,
          isMine ? styles.myMessageRow : styles.theirMessageRow,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMine ? styles.myMessageBubble : styles.theirMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMine ? styles.myMessageText : styles.theirMessageText,
            ]}
          >
            {item.message}
          </Text>

          <View
            style={[
              styles.metaFooter,
              isMine ? styles.myMetaFooter : styles.theirMetaFooter,
            ]}
          >
            {item.timestamp && (
              <Text
                style={[
                  styles.timestampText,
                  isMine ? styles.myTimestampText : styles.theirTimestampText,
                ]}
              >
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            )}

            {isMine && (
              <Text style={styles.statusText}>
                {item.localStatus === "sending"
                  ? "• Sending…"
                  : item.localStatus === "failed"
                  ? "• Failed"
                  : item.read
                  ? "• Read"
                  : "• Sent"}
              </Text>
            )}
          </View>

          {item.localStatus === "failed" && (
            <View style={styles.failedActionsRow}>
              <TouchableOpacity
                onPress={() => {
                  void chat.retry(item);
                }}
                style={styles.retryBubbleBtn}
              >
                <Text style={styles.retryBubbleText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => chat.discard(messageKey(item))}
                style={styles.discardBubbleBtn}
              >
                <Text style={styles.discardBubbleText}>Discard</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {navigation?.canGoBack?.() && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              accessibilityLabel="Back to messages"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </TouchableOpacity>
          )}
          <View style={styles.peerAvatar}>
            <Text style={styles.peerAvatarText}>{getPeerInitials()}</Text>
          </View>
          <View style={styles.peerMeta}>
            <Text style={styles.peerName} numberOfLines={1}>
              {otherUserName || "Crew Member"}
            </Text>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Connected • VHF Mesh</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Screen Reader Live Region */}
      <Text style={styles.srOnly} accessibilityLiveRegion="polite">
        {active ? chat.status : "Chat paused"}
      </Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {chat.loading && chat.messages.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0284C7" />
            <Text style={styles.loadingText}>Syncing message logs...</Text>
          </View>
        ) : (
          <FlatList
            style={{ flex: 1 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            ref={flatListRef}
            data={chat.messages}
            keyExtractor={messageKey}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                {chat.error && (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{chat.error}</Text>
                    <TouchableOpacity
                      onPress={chat.refresh}
                      style={styles.retryHistoryBtn}
                    >
                      <Text style={styles.retryHistoryText}>Retry history</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {chat.messages.some(
                  (message) => message.localStatus === "failed",
                ) && (
                  <View style={styles.unconfirmedNotice}>
                    <Text style={styles.unconfirmedText}>
                      Unconfirmed messages are kept while this chat is open.
                      Discarding a local copy does not cancel a message the server
                      may have saved.
                    </Text>
                  </View>
                )}
                {chat.hasMore && (
                  <TouchableOpacity
                    onPress={() => {
                      scrollForNewMessages.current = false;
                      void chat.loadMore();
                    }}
                    disabled={chat.loadingMore}
                    style={styles.loadOlderBtn}
                  >
                    <Text style={styles.loadOlderText}>
                      {chat.loadingMore ? "Loading..." : "Load older messages"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={44} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start an encrypted maritime conversation with this crew member.
                </Text>
              </View>
            }
            onContentSizeChange={() => {
              if (scrollForNewMessages.current)
                flatListRef.current?.scrollToEnd({ animated: false });
            }}
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* Bottom Message Composer */}
        <View style={styles.composerBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            accessibilityLabel="Message"
            placeholderTextColor="#94A3B8"
            multiline
            maxLength={4000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || chat.sending) && styles.sendButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: !input.trim() || chat.sending }}
            disabled={!input.trim() || chat.sending}
            onPress={() => {
              if (chat.send(input)) {
                scrollForNewMessages.current = true;
                setInput("");
              }
            }}
          >
            <Ionicons
              name="send"
              size={18}
              color={!input.trim() || chat.sending ? "#94A3B8" : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  peerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  peerAvatarText: {
    color: "#0369A1",
    fontSize: 14,
    fontWeight: "700",
  },
  peerMeta: {
    marginLeft: 10,
    flex: 1,
  },
  peerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 1,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
  },
  onlineText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#16A34A",
  },
  srOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  container: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listHeader: {
    marginBottom: 8,
  },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: "center",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginBottom: 6,
    textAlign: "center",
  },
  retryHistoryBtn: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  retryHistoryText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  unconfirmedNotice: {
    backgroundColor: "#FEFCE8",
    borderWidth: 1,
    borderColor: "#FEF08A",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  unconfirmedText: {
    fontSize: 11,
    color: "#854D0E",
    lineHeight: 15,
  },
  loadOlderBtn: {
    alignSelf: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginVertical: 4,
  },
  loadOlderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  messageRow: {
    marginVertical: 4,
    flexDirection: "row",
  },
  myMessageRow: {
    justifyContent: "flex-end",
  },
  theirMessageRow: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  myMessageBubble: {
    backgroundColor: "#E0F2FE",
    borderBottomRightRadius: 3,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  theirMessageBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#0F172A",
  },
  theirMessageText: {
    color: "#0F172A",
  },
  metaFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  myMetaFooter: {
    justifyContent: "flex-end",
  },
  theirMetaFooter: {
    justifyContent: "flex-start",
  },
  timestampText: {
    fontSize: 10,
  },
  myTimestampText: {
    color: "#0369A1",
  },
  theirTimestampText: {
    color: "#94A3B8",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#0369A1",
  },
  failedActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
    paddingTop: 6,
  },
  retryBubbleBtn: {
    backgroundColor: "#0284C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  retryBubbleText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  discardBubbleBtn: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discardBubbleText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
  },
  composerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 90,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#075985",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#F1F5F9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748B",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
    maxWidth: 240,
  },
});
