import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DirectoryUser as User } from '@/utils/contracts';
import usePagedList from '@/utils/usePagedList';
import useUnreadCounts from '@/utils/useUnreadCounts';
import useMessagingActive from '@/utils/useMessagingActive';

const AVATAR_PALETTES = [
  { bg: '#0284C7', text: '#FFFFFF', border: '#BAE6FD' }, // Sky Blue
  { bg: '#059669', text: '#FFFFFF', border: '#BBF7D0' }, // Marine Emerald
  { bg: '#7C3AED', text: '#FFFFFF', border: '#DDD6FE' }, // Violet
  { bg: '#EA580C', text: '#FFFFFF', border: '#FED7AA' }, // Amber Orange
  { bg: '#E11D48', text: '#FFFFFF', border: '#FECDD3' }, // Crimson Rose
  { bg: '#0D9488', text: '#FFFFFF', border: '#99F6E4' }, // Deep Teal
  { bg: '#4F46E5', text: '#FFFFFF', border: '#C7D2FE' }, // Indigo
  { bg: '#CA8A04', text: '#FFFFFF', border: '#FEF08A' }, // Golden Yellow
];

const getAvatarTheme = (user: User) => {
  const seed = user.userId || user.username || user.firstName || 'U';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
};

export default function UserListScreen({ navigation }: any) {
  const { items: users, loading, loadingMore, error, refresh, loadMore, hasMore } =
    usePagedList<User>('users/users', 'userId');
  const unread = useUnreadCounts(
    users.map((user) => user.userId),
    useMessagingActive(),
  );

  const handleUserSelect = (user: User) => {
    navigation.navigate('ChatScreen', {
      otherUserId: user.userId,
      otherUserName: `${user.firstName} ${user.lastName}`,
    });
  };

  const getInitials = (user: User) => {
    const first = user.firstName ? user.firstName[0].toUpperCase() : '';
    const last = user.lastName ? user.lastName[0].toUpperCase() : '';
    return first + last || user.username.slice(0, 2).toUpperCase();
  };

  const renderUser = ({ item }: { item: User }) => {
    const unreadCount = unread.counts[item.userId] || 0;
    const avatarTheme = getAvatarTheme(item);
    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleUserSelect(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.userAvatar, { backgroundColor: avatarTheme.bg, borderColor: avatarTheme.border }]}>
          <Text style={[styles.avatarText, { color: avatarTheme.text }]}>{getInitials(item)}</Text>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {`${item.firstName} ${item.lastName}`}
            </Text>
            <Text style={styles.userHandle} numberOfLines={1}>
              @{item.username}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.subtext}>Boat-to-Boat Radio</Text>
            {unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: '#DC2626' }]}>
                <Text style={styles.unreadBadgeText}>{unreadCount} NEW</Text>
              </View>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTitleRow}>
          <View style={styles.titleWithPill}>
            <Text style={styles.headerTitle}>Crew Messages</Text>
            <View style={styles.directPill}>
              <Text style={styles.directPillText}>Direct Line</Text>
            </View>
          </View>
          <View style={styles.meshStatus}>
            <View style={styles.meshDot} />
            <Text style={styles.meshText}>MESH LINKED</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Select a crew member or harbor operator to open an encrypted VHF/telemetry chat.
        </Text>
      </View>

      {/* Main List */}
      {loading && users.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Connecting to vessel directory...</Text>
        </View>
      ) : error && users.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={44} color="#DC2626" />
          <Text style={styles.errorTitle}>Directory Unavailable</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={refresh}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListFooterComponent={
            <View style={styles.footerContainer}>
              {unread.error && <Text style={styles.errorText}>{unread.error}</Text>}
              {error && <Text style={styles.errorText}>{error}</Text>}
              {hasMore && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMore}
                  disabled={loadingMore}
                  accessibilityRole="button"
                >
                  <Text style={styles.loadMoreText}>
                    {loadingMore ? 'Loading roster...' : 'Load more contacts'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Crew Found</Text>
              <Text style={styles.emptyText}>
                No other registered vessels or crew contacts are currently active on your manifest.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleWithPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  directPill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  directPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369A1',
  },
  meshStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meshDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  meshText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  separator: {
    height: 8,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  avatarText: {
    color: '#0369A1',
    fontSize: 15,
    fontWeight: '700',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    maxWidth: '55%',
  },
  userHandle: {
    fontSize: 12,
    color: '#64748B',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    paddingRight: 8,
  },
  subtext: {
    fontSize: 12,
    color: '#94A3B8',
  },
  unreadBadge: {
    backgroundColor: '#0284C7',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#075985',
    borderRadius: 10,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  footerContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  loadMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
});
