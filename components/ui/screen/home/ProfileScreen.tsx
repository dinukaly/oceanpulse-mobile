import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import type { RootState } from '@/store';
import { logout } from '@/store/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { clearSession } from '@/utils/session';
import useProfile from '@/utils/useProfile';

const getInitials = (firstName: string, lastName: string) => {
  const f = firstName ? firstName.charAt(0) : '';
  const l = lastName ? lastName.charAt(0) : '';
  return `${f}${l}`.toUpperCase() || 'CR';
};

const ProfileScreen: React.FC = () => {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const profile = useProfile(userId, useIsFocused());
  const { user, loading } = profile;
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await clearSession();
      dispatch(logout());
    } catch {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  if (loading && !user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.loadingMessage}>Loading crew profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={44} color="#DC2626" />
        <Text style={styles.errorTitle}>Profile Unavailable</Text>
        <Text style={styles.errorText}>
          {profile.error || 'Could not load crew profile from maritime database.'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={profile.reload}>
          <Text style={styles.retryButtonText}>Retry Connection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Screen Reader Notices */}
        {profile.notice && (
          <View style={styles.noticeBanner}>
            <Text style={styles.noticeText} accessibilityLiveRegion="polite">
              {profile.notice}
            </Text>
          </View>
        )}

        {profile.error && !profile.editing && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{profile.error}</Text>
            <TouchableOpacity
              onPress={profile.reload}
              disabled={loading}
              accessibilityRole="button"
              style={styles.errorReloadBtn}
            >
              <Text style={styles.errorReloadText}>Reload saved profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={styles.inlineLoading}>
            <ActivityIndicator size="small" color="#0284C7" accessibilityLabel="Refreshing saved profile" />
            <Text style={styles.inlineLoadingText}>Syncing latest profile...</Text>
          </View>
        )}

        {/* User Identity & Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(user.firstName, user.lastName)}
              </Text>
            </View>
          </View>

          <Text style={styles.heroName}>
            {user.firstName} {user.lastName}
          </Text>

          <View style={styles.handleRow}>
            <Text style={styles.heroHandle}>@{user.username}</Text>
            <View style={styles.dotSeparator} />
            <Text style={styles.roleText}>Crew Skipper</Text>
          </View>

          <View style={styles.vesselPill}>
            <Ionicons name="boat" size={14} color="#0369A1" />
            <Text style={styles.vesselPillText}>
              VESSEL {user.boatId ? user.boatId.toUpperCase() : 'VERIFIED'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={profile.openEditor}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil" size={16} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Maritime Assignment Banner */}
        <View style={styles.assignmentCard}>
          <View style={styles.assignmentIconBox}>
            <Ionicons name="compass" size={24} color="#0284C7" />
          </View>
          <View style={styles.assignmentMeta}>
            <View style={styles.assignmentHeaderRow}>
              <Text style={styles.assignmentLabel}>REGISTERED SECTOR</Text>
              <View style={styles.activeHarborPill}>
                <Text style={styles.activeHarborText}>Active Harbor</Text>
              </View>
            </View>
            <Text style={styles.assignmentZone}>Southern Coast • Galle Zone</Text>
            <Text style={styles.assignmentChannel}>Assigned radio channel: VHF 16 / 08</Text>
          </View>
        </View>

        {/* Structured Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <View style={styles.detailsTitleRow}>
              <Ionicons name="id-card-outline" size={18} color="#075985" />
              <Text style={styles.detailsTitle}>Profile Details</Text>
            </View>
            <Text style={styles.verifiedTag}>VERIFIED CREW</Text>
          </View>

          {/* Email Row */}
          <View style={styles.detailRow}>
            <View style={styles.detailRowHeader}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={11} color="#64748B" />
                <Text style={styles.lockText}>Read-only</Text>
              </View>
            </View>
            <Text style={styles.fieldValue}>{user.email}</Text>
          </View>

          {/* Contact Row */}
          <View style={styles.detailRow}>
            <View style={styles.detailRowHeader}>
              <Text style={styles.fieldLabel}>Contact Number</Text>
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                <Text style={styles.checkText}>SMS Alert Ready</Text>
              </View>
            </View>
            <Text style={styles.fieldValue}>{user.contact || 'No contact number registered'}</Text>
          </View>

          {/* 2-Column Grid: Boat ID & Language */}
          <View style={styles.twoColGrid}>
            <View style={styles.gridBox}>
              <Text style={styles.fieldLabel}>Boat ID</Text>
              <View style={styles.gridValRow}>
                <Ionicons name="boat-outline" size={16} color="#0284C7" />
                <Text style={styles.gridValueBold}>{user.boatId || 'None'}</Text>
              </View>
            </View>

            <View style={styles.gridBox}>
              <Text style={styles.fieldLabel}>Language</Text>
              <View style={styles.gridValRow}>
                <Ionicons name="language" size={16} color="#0284C7" />
                <Text style={styles.gridValue}>{user.language || 'Sinhala'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Offline Cache Notice */}
        <View style={styles.cacheNoticeCard}>
          <Ionicons name="cloud-offline-outline" size={20} color="#075985" />
          <View style={styles.cacheNoticeMeta}>
            <Text style={styles.cacheNoticeTitle}>Offline Manifest Cache</Text>
            <Text style={styles.cacheNoticeText}>
              Vessel telemetry and emergency contact profiles remain cached offline during voyages beyond cellular range.
            </Text>
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color="#B91C1C" />
            <Text style={styles.logoutButtonText}>Log out</Text>
          </TouchableOpacity>
          <Text style={styles.terminalSessionText}>
            Terminal Session ID: OP-8821-LK
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profile.editing}
        onRequestClose={profile.closeEditor}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                onPress={profile.closeEditor}
                disabled={profile.saving}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {profile.error && (
              <View style={styles.modalErrorBox}>
                <Text
                  style={styles.modalErrorText}
                  accessibilityLiveRegion="polite"
                >
                  {profile.error}
                </Text>
                <TouchableOpacity
                  onPress={profile.discardAndReload}
                  disabled={profile.saving}
                  accessibilityRole="button"
                  style={styles.modalDiscardBtn}
                >
                  <Text style={styles.modalDiscardText}>
                    Discard edits and reload saved profile
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                value={profile.draft.firstName}
                maxLength={100}
                editable={!profile.saving}
                onChangeText={(text) => profile.change('firstName', text)}
                placeholder="First Name"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={profile.draft.lastName}
                maxLength={100}
                editable={!profile.saving}
                onChangeText={(text) => profile.change('lastName', text)}
                placeholder="Last Name"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Username (cannot be changed)</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={user.username}
                editable={false}
                placeholder="Username"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Email (cannot be changed here)</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={user.email}
                editable={false}
                placeholder="Email"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
              />

              <Text style={styles.inputLabel}>Contact</Text>
              <TextInput
                style={styles.input}
                value={profile.draft.contact}
                maxLength={100}
                editable={!profile.saving}
                onChangeText={(text) => profile.change('contact', text)}
                placeholder="Phone Number (e.g. +94 77 123 4567)"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Language (Sinhala or Tamil)</Text>
              <TextInput
                style={styles.input}
                value={profile.draft.language}
                maxLength={100}
                editable={!profile.saving}
                onChangeText={(text) => profile.change('language', text)}
                placeholder="Sinhala or Tamil"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Boat ID (optional)</Text>
              <TextInput
                style={styles.input}
                value={profile.draft.boatId}
                maxLength={100}
                editable={!profile.saving}
                onChangeText={(text) => profile.change('boatId', text)}
                placeholder="Boat ID (e.g. B247)"
                placeholderTextColor="#94A3B8"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={profile.closeEditor}
                disabled={profile.saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={profile.save}
                disabled={profile.saving}
              >
                <Text style={styles.saveButtonText}>
                  {profile.saving ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  loadingMessage: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
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
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  noticeBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 10,
    borderRadius: 10,
  },
  noticeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  errorBannerText: {
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
  },
  errorReloadBtn: {
    marginTop: 6,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  errorReloadText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  inlineLoadingText: {
    fontSize: 12,
    color: '#0284C7',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BAE6FD',
    marginBottom: 10,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#075985',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  heroName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  heroHandle: {
    fontSize: 13,
    color: '#64748B',
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
  },
  roleText: {
    fontSize: 13,
    color: '#0284C7',
    fontWeight: '600',
  },
  vesselPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    marginTop: 10,
  },
  vesselPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
    letterSpacing: 0.5,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#075985',
    width: '100%',
    height: 44,
    borderRadius: 12,
    marginTop: 16,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  assignmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  assignmentIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assignmentMeta: {
    flex: 1,
  },
  assignmentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignmentLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  activeHarborPill: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  activeHarborText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16A34A',
  },
  assignmentZone: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 2,
  },
  assignmentChannel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  verifiedTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  detailRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  lockText: {
    fontSize: 10,
    color: '#64748B',
  },
  checkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  checkText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16A34A',
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  twoColGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  gridBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  gridValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  gridValueBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  gridValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  cacheNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E0F2FE',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  cacheNoticeMeta: {
    flex: 1,
  },
  cacheNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#075985',
  },
  cacheNoticeText: {
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 16,
    marginTop: 2,
  },
  logoutSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    width: '100%',
    height: 44,
    borderRadius: 12,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B91C1C',
  },
  terminalSessionText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalErrorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  modalErrorText: {
    fontSize: 12,
    color: '#DC2626',
    marginBottom: 6,
  },
  modalDiscardBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  modalDiscardText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  modalBody: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  disabledInput: {
    backgroundColor: '#F1F5F9',
    color: '#94A3B8',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  saveButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#075985',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
